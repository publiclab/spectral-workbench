class AddPhotoPosition < ActiveRecord::Migration[5.2]
  def self.up
    add_column :spectrums, :photo_position, :string, :default => 'false' # x,y,scale,rotation,amplification
  end

  def self.down
    remove_column :spectrums, :photo_position
  end
end
