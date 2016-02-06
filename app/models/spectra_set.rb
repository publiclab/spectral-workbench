class SpectraSet < ActiveRecord::Base

  attr_accessible :title, :notes, :spectrums_string, :author, :user_id

  validates_presence_of :title, :user_id
  validates :title, length: { maximum: 60 }
  has_many :comments, :dependent => :destroy
  has_and_belongs_to_many :spectrums
  belongs_to :user

  validates :title, :format => { with: /\A[\w\ -\'\"]+\z/, message: "can contain only letters, numbers, and spaces." }

  def calibrated_spectrums
    self.spectrums.where(calibrated: true).uniq
  end

  def all_calibrated
    !self.spectrums.collect(&:calibrated).include?(false)
  end

  def some_calibrated
    self.spectrums.collect(&:calibrated).include?(true)
  end

  def contains(spectrum)
    self.spectrums.include?(spectrum)
  end

  def as_json_with_snapshots
    json = self.as_json.merge({spectra: []})
    json[:spectra] = self.snapshots(false)
    json
  end

  def as_json_with_calibrated_snapshots
    json = self.as_json.merge({spectra: []})
    json[:spectra] = self.snapshots(self.calibrated_spectrums)
    json
  end

  # latest snapshots of all spectra, if exist, in JSON
  # default to spectra themselves if not
  def snapshots(spectrums)
    spectrums = spectrums || self.spectrums
    json = []
    spectrums.each do |spectrum|
      json << spectrum.as_json(:except => [:data])
      if spectrum.snapshots.nil? || spectrum.snapshots.length == 0
        json.last[:data] = JSON.parse(spectrum.data) 
        json.last[:snapshot_id] = false
      else
        json.last[:data] = JSON.parse(spectrum.snapshots.last.data) 
        json.last[:snapshot_id] = spectrum.snapshots.last.id
      end
    end
# optimize and test this
    json
  end
 
  def match(spectrum)
    set = self.sort_set(spectrum)
    # find lowest score, return it
     set = set.sort_by {|a| a[1]}
    Spectrum.find set[0][0].to_i
  end

  def sort_set(spectrum)
    scored = {}
    self.spectrums.collect(&:id).each do |id|
      scored[id] = spectrum.compare(id) if id != self.id
    end
    scored
  end

  # notify each commenter about a new comment 
  def notify_commenters(new_comment,current_user)
    emails = []
    self.comments.each do |comment|
      if comment != new_comment && (!current_user || (comment.author != current_user.login)) && comment.author != self.author
        emails << comment.email
      end
    end
    # send for every commenter, whether they are a registered user or not...
    emails.uniq.each do |email|
      registered_commenter = User.find_by_email(email)
      if (registered_commenter)
        UserMailer.set_commenter_notification(self,new_comment,registered_commenter)
      else
        UserMailer.unregistered_set_commenter_notification(self,new_comment,email)
      end
    end
  end

end
