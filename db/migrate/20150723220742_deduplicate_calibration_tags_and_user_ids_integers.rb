class DeduplicateCalibrationTagsAndUserIdsIntegers < ActiveRecord::Migration
  def up
    change_column :tags, :user_id, :integer

    Tag.where('name LIKE (?)','calibration:%').each do |tag|
      if Tag.where(user_id: tag.user_id, name:tag.name, spectrum_id:tag.spectrum_id).length > 1
        tag.destroy
      end
    end
  end

  def down
    change_column :tags, :user_id, :string
  end
end
