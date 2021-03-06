# frozen_string_literal: true

class DeduplicateCalibrationTagsAndUserIdsIntegers < ActiveRecord::Migration[5.2]
  def up
    change_column :tags, :user_id, :integer

    Tag.where('name LIKE (?)', 'calibration:%').each do |tag|
      tag.destroy if Tag.where(user_id: tag.user_id, name: tag.name, spectrum_id: tag.spectrum_id).length > 1
    end
  end

  def down
    change_column :tags, :user_id, :string
  end
end
