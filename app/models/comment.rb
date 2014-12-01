class Comment < ActiveRecord::Base

  attr_accessible :spectrum_id, :body, :author, :email
  validates_presence_of :author, :email, :body

  def set
    if self.spectra_set_id == 0
      false
    else
      SpectraSet.find self.spectra_set_id
    end
  end

  def spectrum
    if self.spectrum_id == 0 || self.spectrum_id.nil?
      false
    else
      Spectrum.find self.spectrum_id
    end
  end

  def can_delete(user)
    (self.set && self.set.author == user.login) || (self.spectrum && self.spectrum.author == user.login) || self.author == user.login || user.role == "admin"
  end

end
