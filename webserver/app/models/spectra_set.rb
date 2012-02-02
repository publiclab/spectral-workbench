class SpectraSet < ActiveRecord::Base

	validates_presence_of :title, :author, :spectra_string
	validates_length_of :title, :maximum => 60
	has_many :comments, :dependent => :destroy
	
	def spectra
		Spectrum.find(self.spectra_string.split(','))
	end

end
