class ConvertSpectrumDescriptionCalibrationToTag < ActiveRecord::Migration
  def up
    Spectrum.select('id,notes,user_id').each do |spectrum|
      unless spectrum.notes.nil?
        clones = spectrum.notes.scan(/-- \(Cloned calibration from <a href='\/spectra\/show\/(\d+)'>[\w ]+<\/a>\)/)
        if clones.length > 0
          spectrum.remove_tags('calibration:')
          Tag.new({
            :spectrum_id => spectrum.id,
            :name =>        "calibration:" + clones.last.first.to_s,
            :user_id =>     spectrum.user_id
          }).save!
        end
      end
    end
  end

  def down
  end
end
