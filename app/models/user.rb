require 'digest/sha1'

class User < ActiveRecord::Base

  validates_presence_of     :login
  validates_length_of       :login,    :within => 3..40
  validates_uniqueness_of   :login
  validates_length_of       :name,     :maximum => 100

  validates_presence_of     :email
  validates_length_of       :email,    :within => 6..100 #r@a.wk
  validates_uniqueness_of   :email

  has_many :macros,       :dependent => :destroy
  has_many :spectrums,    :dependent => :destroy
  has_many :spectra_sets, :dependent => :destroy
  has_many :comments,     :dependent => :destroy

  # HACK HACK HACK -- how to do attr_accessible from here?
  # prevents a user from submitting a crafted form that bypasses activation
  # anything else you want your user to change should be added here.
  attr_accessible :login, :email, :name, :password, :password_confirmation

  def after_create
    UserMailer.google_groups_email(self)
    UserMailer.welcome_email(self)
  end

  def sets
    self.spectra_sets
  end

  def self.weekly_tallies
    # past 52 weeks of data
    weeks = {}
    (0..52).each do |week|
      weeks[52-week] = User.count :all, :select => :created_at, :conditions => {:created_at => Time.now-week.weeks..Time.now-(week-1).weeks}
    end
    weeks
  end

  def spectrum_count
    Spectrum.count(:all, :conditions => {:user_id => self.id})
  end

  def set_count
    SpectraSet.count(:all, :conditions => {:user_id => self.id})
  end

  def received_comments
    spectrums = Spectrum.find_all_by_user_id self.id, :limit => 20
    spectrum_ids = []
    spectrums.each do |spectrum|
      spectrum_ids << spectrum.id
    end
    Comment.find_all_by_spectrum_id(spectrum_ids.uniq).where("user_id != ?",self.id).limit(10).order("id DESC")
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

  # most recent;
  # by default, don't return forked calibrations
  def last_calibration 
    self.calibrations.where('tags.name NOT LIKE (?)', "forked:%")
                     .first
  end

  def calibrations
    # re-enable this optimization once we deprecate v1
    #Spectrum.select("spectrums.id, spectrums.title, spectrums.created_at, spectrums.user_id, spectrums.author, spectrums.calibrated, spectrums.photo_file_name")
    Spectrum.joins(:tags)
            .where(user_id: self.id)
            .where('tags.name = (?) OR tags.name LIKE (?)', "calibration", "linearCalibration:%")
            .order("spectrums.created_at DESC")
  end

  # find spectra by user, tagged with <name>
  def tag(name,count)
    tags = Tag.find :all, :conditions => {:user_id => self.id, :name => name}, :include => :spectrum, :limit => count, :order => "id DESC"
    spectrum_ids = tags.collect(&:spectrum_id)
    spectra = Spectrum.find spectrum_ids
    spectra.reverse ||= []
  end  

  # for API use; add regeneration later
  def token
    self.created_at.to_i.to_s.each_byte.map { |b| b.to_s(16) }.join
  end

  def self.find_by_token(token)
    t = Time.at(token.scan(/../).map { |x| x.hex.chr }.join.to_i)
    User.where("created_at > ? AND created_at < ?", t - 1.second, t + 1.second).first
  end

end
