class Comment < ActiveRecord::Base

	validates_presence_of :author, :email, :body

	def set
		if self.set_id == 0
			false
		else
			Set.find self.set_id
		end
	end

	def spectrum
		if self.spectrum_id == 0 || self.spectrum_id.nil?
			false
		else
			Spectrum.find self.spectrum_id
		end
	end

end
