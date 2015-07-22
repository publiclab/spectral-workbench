class AddSpectrumCalibrated < ActiveRecord::Migration
  def up
    add_column :spectrums, :calibrated, :boolean, :default => false, :null => false
    count = Spectrum.count
    Spectrum.select('id').each do |spectrum|
      Spectrum.find(spectrum.id).save
      puts "finished ~#{spectrum.id} of #{count}"if spectrum.id%100
    end
  end

  def self.down
    remove_column :spectrums, :calibrated
  end
end
