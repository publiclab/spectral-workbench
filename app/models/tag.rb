class Tag < ActiveRecord::Base

  attr_accessible :spectrum_id, :name, :user_id

  validates_presence_of :name, :on => :create, :message => "can't be blank"
  validates_presence_of :user_id, :on => :create, :message => "can't be blank"
  validates_presence_of :spectrum_id, :on => :create, :message => "can't be blank"

  validates :name, :format => {:with => /[\w\.:\-\*\+\[\]\(\)]+/, :message => "can only include letters, numbers, and dashes, or mathematical expressions"}

  belongs_to :spectrum
  belongs_to :user

  before_save :scan_powertags
  before_destroy :clean_snapshots


  def scan_powertags

    if self.is_powertag?

      if self.key == 'crossSection'
        spectrum = self.spectrum
        spectrum.sample_row = self.value
        spectrum.save
      end

    end

  end

  # this should return true for any powertag that operates on the data:
  def needs_snapshot?
    self.is_powertag? && ['calibrate',
                          'subtract',
                          'transform',
                          'range',
                          'crossSection',  
                          'flip',  
                          'smooth'].include?(self.key)
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

  def has_snapshot?
    self.name.match(/#/) && self.snapshot
  end

  def add_snapshot(user, data)
    self.spectrum.add_snapshot(user, data)
    self.name = self.name + "#" + self.spectrum.snapshots.last.id.to_s
    self.save
  end

  def snapshot_id
    self.value.split('#').last.to_i
  end

  def snapshot
    Snapshot.find self.snapshot_id
  end

  def clean_snapshots
    self.snapshot.destroy if self.has_snapshot?
  end

  # supplies a string of CSS classnames for this type of tag
  def colors
    colors = ""

    colors = " purple" if self.is_powertag?

    colors
  end

end
