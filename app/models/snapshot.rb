class Snapshot < ActiveRecord::Base

  belongs_to :spectrum
  belongs_to :user

  attr_accessible :id, :user_id, :spectrum_id, :description, :data

  validates_presence_of :user_id
  validates_presence_of :spectrum_id
  validates_presence_of :data

  validate :validate_json


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

end
