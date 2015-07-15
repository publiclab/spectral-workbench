class AddSpectrumCalibrated < ActiveRecord::Migration
  def up
    add_column :spectrums, :calibrated, :boolean, :default => false, :null => false
    Spectrum.all.each do |spectrum|
      spectrum.save
    end
  end

  def self.down
    remove_column :spectrums, :calibrated
  end
end
