class AddSpectrumReversal < ActiveRecord::Migration
  def self.up
    add_column :spectrums, :reversed, :boolean, :default => false, :null => false
  end

  def self.down
    remove_column :spectrums, :reversed
  end
end
