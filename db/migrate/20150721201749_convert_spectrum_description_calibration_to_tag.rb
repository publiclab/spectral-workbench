# frozen_string_literal: true

class ConvertSpectrumDescriptionCalibrationToTag < ActiveRecord::Migration[5.2]
  def up
    Spectrum.select('id,notes,user_id').each do |spectrum|
      next if spectrum.notes.nil?

      clones = spectrum.notes.scan(%r{-- \(Cloned calibration from <a href='/spectra/show/(\d+)'>[\w ]+</a>\)})
      next if clones.empty?

      spectrum.remove_tags('calibration:')
      Tag.new(
        spectrum_id: spectrum.id,
        name: 'calibration:' + clones.last.first.to_s,
        user_id: spectrum.user_id
      ).save!
    end
  end

  def down; end
end
