class Snapshot < ActiveRecord::Base

  belongs_to :spectrum
  belongs_to :user
  belongs_to :tag

  attr_accessible :id, :user_id, :spectrum_id, :description, :data, :tag_id

  validates_presence_of :user_id
  validates_presence_of :tag_id
  validates_presence_of :spectrum_id
  validates_presence_of :data

  validate :validate_json, :validate_author

  # is_latest is also used by the parent tag's before_destroy
  before_destroy :is_latest?, :has_no_dependent_spectra?
  after_save :generate_processed_spectrum

  def validate_author
    if self.spectrum.nil?
      errors.add(:spectrum_id, "must be a real spectrum")
    elsif self.user_id != self.spectrum.user_id
      errors.add(:user_id, "must match user ID of spectrum")
    end
  end

  # to output the text "data" field as json, not string data
  def json
    json = self.as_json(:except => [:data])
    json['data'] = ActiveSupport::JSON.decode(self.data)
    json
  end

  def validate_json
    if self.data.nil?
      true
    else
      begin
        !!(json = ActiveSupport::JSON.decode(self.data)) &&
          json['lines'].class == Array &&
          json['lines'].first.class == Hash &&
          !json['lines'].first['wavelength'].nil?
      rescue
        errors[:base] << "data not in valid JSON format"
        false
      end
    end
  end

  def generate_processed_spectrum
    self.spectrum.generate_processed_spectrum
  end

  # rescind requirement of is_latest
  # but must use self.has_subsequent_depended_on_snapshots?
  def is_deletable?
    self.is_latest? && self.has_no_dependent_spectra?
  end

  def is_latest?
    latest = self.spectrum.snapshots
                 .order('created_at DESC')
                 .limit(1)
                 .last
    latest.id == self.id
  end

  def dependent_spectrum_ids
    Tag.where('name LIKE (?)', '%#' + self.id.to_s).collect(&:spectrum_id).uniq
  end

  def has_dependent_spectra?
    self.dependent_spectrum_ids.length > 0
  end

  # negative form used in validation
  def has_no_dependent_spectra?
    !self.has_dependent_spectra?
  end

  def has_subsequent_depended_on_snapshots?
    depended_on_snapshots = false
    self.spectrum.snapshots.where('created_at > ?', self.created_at).each do |snapshot|
      depended_on_snapshots = depended_on_snapshots || snapshot.has_dependent_spectra?
    end
    depended_on_snapshots
  end

end
