class AddSpectrumCalibrated < ActiveRecord::Migration[5.2]
  def up
    add_column :spectrums, :calibrated, :boolean, null: false, default: false
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
