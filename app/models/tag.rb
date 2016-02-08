class Tag < ActiveRecord::Base

  attr_accessible :spectrum_id, :name, :user_id

  validates_presence_of :name, :on => :create, :message => "can't be blank"
  validates_presence_of :user_id, :on => :create, :message => "can't be blank"
  validates_presence_of :spectrum_id, :on => :create, :message => "can't be blank"

  validates :name, :format => {:with => /[\w\.:\,\-\*\+\[\]\(\)\#\$]+/, :message => "can only include letters, numbers, and dashes, or mathematical expressions"}

  validate :powertags_by_owner

  # place this before the has_one :snapshot so it runs before dependent => :destroy
  before_destroy :is_deletable?
  after_destroy :scan_powertags_destroy

  belongs_to :spectrum
  belongs_to :user
  has_one :snapshot, :dependent => :destroy

  before_save :scan_powertags
  after_save :scan_powertags_after_save


  # this should return true for any powertag that operates on the data:
  def needs_snapshot?
    self.is_powertag? && ['calibrate', # calibration clone
                          'linearCalibration', # manual calibration
                          'subtract',
                          'transform',
                          'blend',
                          'range',
                          'crossSection',  
                          'flip',  
                          'smooth'].include?(self.key)
  end

  def needs_reference?
    self.is_powertag? && ['calibrate', # calibration clone
                          'subtract',
                          'forked',
                          'blend'].include?(self.key)
  end

  def powertags_by_owner
    if self.is_powertag? && self.spectrum.user_id != self.user_id && self.user.role != "admin"
      errors[:base] << "powertags may only be made by spectrum owner or admins"
    end
  end

  def scan_powertags
    if self.is_powertag?
      spectrum = self.spectrum
      if self.key == 'crossSection'
        spectrum.sample_row = self.value # transition this to tag-based; this is just legacy compatibility
        spectrum.save
      end
      # default to latest snapshot as reference:
      self.add_reference(false) if self.needs_reference?
      # would like to create snapshot here, but must do so in TagController, 
      # as we need client-submitted data to do so
    end
  end

  def scan_powertags_after_save
    if self.is_powertag?
      if self.key == 'calibrate' || self.key == 'linearCalibration'
        spectrum.save # update spectrum.calibrated
      end
    end
  end

  def scan_powertags_destroy
    if self.is_powertag?
      if self.key == 'calibrate' || self.key == 'linearCalibration'
        spectrum.save # update spectrum.calibrated
      end
    end
  end

  # used as validation
  def is_deletable?
    if self.is_powertag? && self.needs_snapshot?
      if self.snapshot.nil?
        return true
      elsif self.snapshot.is_deletable? # includes snapshot.is_latest?
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
    self.name.split(':').last.split('$').first # $ is used in blend ops, not common
  end

  def has_reference?
    self.name.match(/#/)
  end

  def reference_id
    if self.has_reference?
      self.name.split('#').last.to_i
    else
      nil
    end
  end

  def reference
    Snapshot.where(id: self.reference_id).last
  end

  def reference_spectrum
    Spectrum.find(self.value.split('#').first) if self.needs_reference?
  end

  def dependent_spectrum_ids
    self.snapshot.nil? ? [] : self.snapshot.dependent_spectrum_ids
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

  def change_reference(snapshot_id)
    # only free, un-depended-on tags can do this
    if self.snapshot.has_no_dependent_spectra? && !self.snapshot.has_subsequent_depended_on_snapshots?
      oldName = self.name
      oldName = oldName.split('#')[0] if self.has_reference?
      snapshots = Snapshot.where(id: snapshot_id).where(spectrum_id: self.reference_spectrum.id)
      if snapshots.length > 0
        self.name = oldName + "#" + snapshot_id.to_s
      end
      self.save
    end
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
