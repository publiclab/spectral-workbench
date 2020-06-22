class AddSpectrumsSampleRow < ActiveRecord::Migration[5.2]
  def self.up
      add_column :spectrums, :sample_row, :integer, null: false, default: 1
  end

  def self.down
      remove_column :spectrums, :sample_row
  end
end
