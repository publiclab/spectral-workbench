# frozen_string_literal: true

class Tag < ActiveRecord::Base
  validates_presence_of :name, on: :create, message: "can't be blank"
  validates_presence_of :user_id, on: :create, message: "can't be blank"
  validates_presence_of :spectrum_id, on: :create, message: "can't be blank"

  validates :name, format: { with: /[\w\.:\,\-\*\+\[\]\(\)\#\$]+/, message: 'can only include letters, numbers, and dashes, or mathematical expressions' }

  validate :powertags_by_owner

  # place this before the has_one :snapshot so it runs before dependent => :destroy
  before_destroy do
    is_deletable?
    throw(:abort) if errors.present?
  end
  after_destroy :scan_powertags_destroy

  belongs_to :spectrum
  belongs_to :user
  has_one :snapshot, dependent: :destroy

  before_save :scan_powertags
  after_save :scan_powertags_after_save

  # this should return true for any powertag that operates on the data:
  def needs_snapshot?
    is_powertag? && ['calibrate', # calibration clone
                     'linearCalibration', # manual calibration
                     'subtract',
                     'transform',
                     'blend',
                     'range',
                     'crossSection',
                     'flip',
                     'smooth'].include?(key)
  end

  def needs_reference?
    is_powertag? && ['calibrate', # calibration clone
                     'subtract',
                     'forked',
                     'blend'].include?(key)
  end

  def powertags_by_owner
    errors[:base] << 'powertags may only be made by spectrum owner or admins' if is_powertag? && spectrum.user_id != user_id && user.role != 'admin'
  end

  def scan_powertags
    if is_powertag?
      spectrum = self.spectrum
      if key == 'crossSection'
        spectrum.sample_row = value # transition this to tag-based; this is just legacy compatibility
        spectrum.save
      end
      # default to latest snapshot as reference:
      add_reference(false) if needs_reference?
      # would like to create snapshot here, but must do so in TagController,
      # as we need client-submitted data to do so
    end
  end

  def scan_powertags_after_save
    if is_powertag?
      if key == 'calibrate' || key == 'linearCalibration'
        spectrum.save # update spectrum.calibrated
      end
    end
  end

  def scan_powertags_destroy
    if is_powertag?
      if key == 'calibrate' || key == 'linearCalibration'
        spectrum.save # update spectrum.calibrated
      end
    end
  end

  # used as validation
  def is_deletable?
    if is_powertag? && needs_snapshot?
      if snapshot.nil?
        true
      elsif snapshot.is_deletable? # includes snapshot.is_latest?
        true
      else
        errors.add :base, 'Powertags/operations may not be deleted if other data relies upon it.'
        false
      end
    else
      true
    end
  end

  # dangerous to call unmodified -- high load!
  def spectra
    Spectrum.select('spectrums.id, spectrums.title, spectrums.created_at, spectrums.user_id, spectrums.author, spectrums.calibrated')
            .joins(:tags)
            .where('tags.name = (?)', name)
            .order('spectrums.id DESC')
  end

  # this doesn't accommodate v2.0 powertags, which can contain math syntax
  def is_powertag?
    name.match(/[a-zA-Z-]+:[a-zA-Z0-9-]+/)
  end

  def key
    name.split(':').first
  end

  def value
    name.split(':').last.split('$').first # $ is used in blend ops, not common
  end

  def has_reference?
    name.match(/#/)
  end

  def reference_id
    name.split('#').last.to_i if has_reference?
  end

  def reference
    Snapshot.where(id: reference_id).last
  end

  def reference_spectrum
    Spectrum.find(value.split('#').first) if needs_reference?
  end

  def dependent_spectrum_ids
    snapshot.nil? ? [] : snapshot.dependent_spectrum_ids
  end

  # Refer to an existing snapshot with an operation;
  # defaults to latest snapshot of the spectrum.
  # If there are no snapshots, it does not add # to the name,
  # and simply references the original data.
  # Will only run if reference does not already exist.
  # Also: if reference is to self, this runs before snapshotting, so
  # it will not reference its own snapshot, but the previous one.
  def add_reference(snapshot_id)
    unless has_reference?
      spectrum = Spectrum.find(value)
      if spectrum.snapshots && !spectrum.snapshots.empty?
        snapshot_id ||= spectrum.snapshots.last.id
        self.name = name + '#' + snapshot_id.to_s
      end
    end
  end

  def change_reference(snapshot_id)
    # only free, un-depended-on tags can do this
    if snapshot.has_no_dependent_spectra? && !snapshot.has_subsequent_depended_on_snapshots?
      old_name = name
      old_name = old_name.split('#')[0] if has_reference?
      snapshots = Snapshot.where(id: snapshot_id).where(spectrum_id: reference_spectrum.id)
      self.name = old_name + '#' + snapshot_id.to_s unless snapshots.empty?
      save
    end
  end

  # save a snapshot of the spectrum after having applied this operation
  def create_snapshot(data)
    spectrum.add_snapshot(self, data)
  end

  # supplies a string of CSS classnames for this type of tag
  def colors
    colors = ''
    colors = ' purple' if is_powertag?
    colors
  end

  private

  def tag_params
    params.require(:tag).permit(:spectrum_id, :name, :user_id)
  end
end
