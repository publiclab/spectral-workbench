class Tag < ActiveRecord::Base

	def spectrum
		Spectrum.find self.spectrum_id
	end

	def spectra
		tags = Tag.find_all_by_name(self.name)
		spectra = []
		tags.each do |tag|
			spectra << tag.spectrum_id
		end
		Spectrum.find spectra.uniq
	end

end
