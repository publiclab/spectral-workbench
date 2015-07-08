require "csv"
module SpectrumsHelper
  def self.show_csv spectrum
    data = ActiveSupport::JSON.decode(spectrum.clean_json)["lines"]
    CSV.generate do |csv|
      csv << %w(Wavelength Average Red Green Blue)
      data.each do |datum|
        w = datum['wavelenth'].to_s[0..6]
        w = 0 if w == ""
        a = datum['average'].to_s[0..3]
        r = datum['r']
        g = datum['g']
        b = datum['b']
        csv << [w, a, r, g, b]
      end
    end
  end
end
