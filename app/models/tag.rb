class Tag < ActiveRecord::Base

  attr_accessible :spectrum_id, :name, :user_id

  validates_presence_of :name, :on => :create, :message => "can't be blank"
  validates_presence_of :user_id, :on => :create, :message => "can't be blank"
  validates_presence_of :spectrum_id, :on => :create, :message => "can't be blank"

  validates :name, :format => {:with => /[\w\.:\-\*\+\[\]\(\)\#\$]+/, :message => "can only include letters, numbers, and dashes, or mathematical expressions"}

  validate :powertags_by_owner

  # place this before the has_one :snapshot so it runs before dependent => :destroy
  before_destroy :validate_destroyable

  belongs_to :spectrum
  belongs_to :user
  has_one :snapshot, :dependent => :destroy

  before_save :scan_powertags


  def powertags_by_owner
    if self.is_powertag? && self.spectrum.user_id != self.user_id && self.user.role != "admin"
      errors[:base] << "powertags may only be made by spectrum owner or admins"
    end
  end

  def scan_powertags
    if self.is_powertag?
      if self.key == 'crossSection'
        spectrum = self.spectrum
        spectrum.sample_row = self.value
        spectrum.save
      end
      # default to latest snapshot as reference:
      self.add_reference(false) if self.generate_reference?
      # would like to generate snapshot here, but must do so in TagController, 
      # as we need client-submitted data to do so
    end

  end

  def validate_destroyable
    if self.is_powertag? && self.generate_snapshot?
      if self.snapshot.nil?
        return true
      elsif self.snapshot.is_latest? && !self.snapshot.has_dependent_spectra?
        return true
      else
        return false
      end
    else
      return true
    end
  end

  # dangerous to call unmodified -- high load!
  def spectra
    Spectrum.select("spectrums.id, spectrums.title, spectrums.created_at, spectrums.user_id, spectrums.author, spectrums.calibrated")
            .joins(:tags)
            .where('tags.name = (?)', self.name)
            .order("spectrums.id DESC")
  end

  # this doesn't accommodate v2.0 powertags, which can contain math syntax
  def is_powertag?
    self.name.match(/[a-zA-Z-]+:[a-zA-Z0-9-]+/)
  end

  def key
    self.name.split(':').first
  end

  def value
    self.name.split(':').last
  end

  def generate_reference?
    self.is_powertag? && ['calibration',
                          'subtract',
                          'transform'].include?(self.key)
  end

  def has_reference?
    self.name.match(/#/)
  end

  def reference_id
    if self.has_reference?
      self.value.split('#').last.to_i
    else
      nil
    end
  end

  def reference
    Snapshot.where(id: self.reference_id).last
  end

  # Refer to an existing snapshot with an operation; 
  # defaults to latest snapshot of the spectrum.
  # If there are no snapshots, it does not add # to the name,
  # and simply references the original data. 
  # Will only run if reference does not already exist.
  # Also: if reference is to self, this runs before snapshotting, so
  # it will not reference its own snapshot, but the previous one. 
  def add_reference(snapshot_id)
    unless self.has_reference?
      spectrum = Spectrum.find(self.value)
      if spectrum.snapshots && spectrum.snapshots.length > 0
        snapshot_id ||= spectrum.snapshots.last.id
        self.name = self.name + "#" + snapshot_id.to_s
      end
    end
  end

  # this should return true for any powertag that operates on the data:
  def generate_snapshot?
    self.is_powertag? && ['calibrate', # calibration clone
                          'linearCalibration', # manual calibration
                          'subtract',
                          'transform',
                          'range',
                          'crossSection',  
                          'flip',  
                          'smooth'].include?(self.key)
  end

  # save a snapshot of the spectrum after having applied this operation
  def create_snapshot(data)
    self.spectrum.add_snapshot(self, data)
  end

  # supplies a string of CSS classnames for this type of tag
  def colors
    colors = ""
    colors = " purple" if self.is_powertag?
    colors
  end

end
