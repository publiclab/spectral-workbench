class Tag < ActiveRecord::Base
	validates_presence_of :name, :on => :create, :message => "can't be blank"
	validates_presence_of :user_id, :on => :create, :message => "can't be blank"
	validates_presence_of :spectrum_id, :on => :create, :message => "can't be blank"

	def spectrum
		Spectrum.find self.spectrum_id
	end

	def spectra
		tags = Tag.find_all_by_name(self.name)
		spectra = []
		tags.each do |tag|
			spectra << tag.spectrum_id
		end
		Spectrum.find spectra.uniq, :order => "id DESC"
	end

end
