# frozen_string_literal: true

class Snapshot < ActiveRecord::Base
  belongs_to :spectrum
  belongs_to :user
  belongs_to :tag

  validates_presence_of :user_id
  validates_presence_of :tag_id
  validates_presence_of :spectrum_id
  validates_presence_of :data

  validate :validate_json, :validate_author

  # is_latest is also used by the parent tag's before_destroy
  before_destroy do
    is_deletable?
    throw(:abort) if errors.present?
  end
  after_save :generate_processed_spectrum

  def validate_author
    if spectrum.nil?
      errors.add(:spectrum_id, 'must be a real spectrum')
    elsif user_id != spectrum.user_id
      errors.add(:user_id, 'must match user ID of spectrum')
    end
  end

  # to output the text "data" field as json, not string data
  def json
    json = as_json(except: [:data])
    json['data'] = ActiveSupport::JSON.decode(data)
    json
  end

  def validate_json
    if data.nil?
      true
    else
      begin
        !!(json = ActiveSupport::JSON.decode(data)) &&
          json['lines'].class == Array &&
          json['lines'].first.class == Hash &&
          !json['lines'].first['wavelength'].nil?
      rescue StandardError
        errors[:base] << 'data not in valid JSON format'
        false
      end
    end
  end

  def generate_processed_spectrum
    spectrum.generate_processed_spectrum
  end

  # rescind requirement of is_latest
  # but must use self.has_subsequent_depended_on_snapshots?
  def is_deletable?
    return true if is_latest? && has_no_dependent_spectra?

    errors.add(:base, 'It is not the latest and has dependent spectra')
    false
  end

  def is_latest?
    latest = spectrum.snapshots
                     .order(created_at: :desc)
                     .limit(1)
                     .last

    latest.id == id
  end

  def dependent_spectrum_ids
    Tag.where('name LIKE (?)', '%#' + id.to_s).collect(&:spectrum_id).uniq
  end

  def has_dependent_spectra?
    !dependent_spectrum_ids.empty?
  end

  # negative form used in validation
  def has_no_dependent_spectra?
    !has_dependent_spectra?
  end

  def has_subsequent_depended_on_snapshots?
    depended_on_snapshots = false
    spectrum.snapshots.where('created_at > ?', created_at).each do |snapshot|
      depended_on_snapshots ||= snapshot.has_dependent_spectra?
    end
    depended_on_snapshots
  end

  private

  def snapshot_params
    params.require(:snapshot).permit(:id, :user_id, :spectrum_id, :description, :data, :tag_id)
  end
end
