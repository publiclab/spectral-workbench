class AddBaselineAndControlPoints < ActiveRecord::Migration[5.2]
  def self.up
      add_column :spectrums, :baseline_position, :string, :default => 'false' # x,y,scale,rotation,amplification
      # attachment (paperclip) - optional
      add_column :spectrums, :baseline_file_name, :string
      add_column :spectrums, :baseline_content_type, :string
      add_column :spectrums, :baseline_file_size, :string
      # pixel positions indicating blue start, blue-green boundary, green-red boundary, and red-infrared boundary
      add_column :spectrums, :control_points, :string
      add_column :spectrums, :slice_data_url, :string
  end

  def self.down
      remove_column :spectrums, :baseline_position
      # attachment (paperclip)
      remove_column :spectrums, :baseline_file_name
      remove_column :spectrums, :baseline_content_type
      remove_column :spectrums, :baseline_file_size
      remove_column :spectrums, :control_points
      remove_column :spectrums, :slice_data_url
  end
end
