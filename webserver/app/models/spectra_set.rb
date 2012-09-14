class SpectraSet < ActiveRecord::Base

	validates_presence_of :title, :author#, :spectra_string
	validates_length_of :title, :maximum => 60
	has_many :comments, :dependent => :destroy
	
	def spectra
		Spectrum.find(self.spectra_string.split(','))
	end

	def match(spectrum)
		set = self.sort_set(spectrum)
		# find lowest score, return it
 		set = set.sort_by {|a| a[1]}
		Spectrum.find set[0][0].to_i
	end

	def sort_set(spectrum)
		scored = {}
		self.spectra_string.split(',').each do |id|
			scored[id] = spectrum.compare(id) if id != self.id
		end
		scored
	end

	def add(spectrum_id)
		if Spectrum.find(spectrum_id.to_i)
			self.spectra_string = [self.spectra_string,spectrum_id].uniq.join(',') 
			self.save
		else
			false
		end
	end

end
