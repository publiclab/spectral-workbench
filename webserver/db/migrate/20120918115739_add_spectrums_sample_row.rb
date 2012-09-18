class AddSpectrumsSampleRow < ActiveRecord::Migration
  def self.up
      add_column :spectrums, :sample_row, :integer, :default => 1, :null => false
  end

  def self.down
      remove_column :spectrums, :sample_row
  end
end
