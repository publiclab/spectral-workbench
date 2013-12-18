require 'digest/sha1'

class User < ActiveRecord::Base
  include Authentication
#  include Authentication::ByPassword
  include Authentication::ByCookieToken

  validates_presence_of     :login
  validates_length_of       :login,    :within => 3..40
  validates_uniqueness_of   :login
  validates_format_of       :login,    :with => Authentication.login_regex, :message => Authentication.bad_login_message

  validates_format_of       :name,     :with => Authentication.name_regex,  :message => Authentication.bad_name_message, :allow_nil => true
  validates_length_of       :name,     :maximum => 100

  validates_presence_of     :email
  validates_length_of       :email,    :within => 6..100 #r@a.wk
  validates_uniqueness_of   :email
  validates_format_of       :email,    :with => Authentication.email_regex, :message => Authentication.bad_email_message

  has_many :macros  

  # HACK HACK HACK -- how to do attr_accessible from here?
  # prevents a user from submitting a crafted form that bypasses activation
  # anything else you want your user to change should be added here.
  attr_accessible :login, :email, :name, :password, :password_confirmation

  def after_create
    UserMailer.deliver_google_groups_email(@user)
    UserMailer.deliver_welcome_email(@user)
  end

  def self.weekly_tallies
    # past 52 weeks of data
    weeks = {}
    (0..52).each do |week|
      weeks[52-week] = User.count :all, :select => :created_at, :conditions => {:created_at => Time.now-week.weeks..Time.now-(week-1).weeks}
    end
    weeks
  end

  def spectra(count)
    count ||= 20
    Spectrum.find_all_by_user_id(self.id,:order => "created_at DESC",:limit => count)
  end

  def spectrum_count
    Spectrum.count(:all, :conditions => {:user_id => self.id})
  end

  def sets
    SpectraSet.find_all_by_author(self.login)
  end

  def set_count
    SpectraSet.count(:all, :conditions => {:author => self.login})
  end

  def comments
    Comment.find_all_by_author(self.login)
  end

  def received_comments
    spectrums = Spectrum.find_all_by_user_id self.id, :limit => 20
    spectrum_ids = []
    spectrums.each do |spectrum|
      spectrum_ids << spectrum.id
    end
    Comment.find_all_by_spectrum_id(spectrum_ids.uniq, :conditions => ["author != ?",self.login], :limit => 10, :order => "id DESC")
  end

  # Authenticates a user by their login name and unencrypted password.  Returns the user or nil.
  #
  # uff.  this is really an authorization, not authentication routine.  
  # We really need a Dispatch Chain here or something.
  # This will also let us return a human error message.
  #
  def self.authenticate(login, password)
    return nil if login.blank? || password.blank?
    u = find_by_login(login.downcase) # need to get the salt
    u && u.authenticated?(password) ? u : nil
  end

  def login=(value)
    write_attribute :login, (value ? value.downcase : nil)
  end

  def email=(value)
    write_attribute :email, (value ? value.downcase : nil)
  end

  def last_calibration 
    self.tag('calibration',20).first
  end

  def calibrations
    self.tag('calibration',20)
  end

  # find spectra by user, tagged with <name>
  def tag(name,count)
    tags = Tag.find :all, :conditions => {:user_id => self.id, :name => name}, :include => :spectrum, :limit => count, :order => "id DESC"
    spectrum_ids = tags.collect(&:spectrum_id)
    spectra = Spectrum.find spectrum_ids
    spectra.reverse ||= []
  end  

end
