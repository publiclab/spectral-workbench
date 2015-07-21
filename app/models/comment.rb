class Comment < ActiveRecord::Base
  attr_accessible :spectrum_id, :body, :author, :email, :spectra_set_id, :user_id

  belongs_to :user
  validates_presence_of :user_id, :body

  def spectra_set
    self.set
  end

  def set
    SpectraSet.find self.spectra_set_id
  end

  def spectrum
    Spectrum.find self.spectrum_id
  end

  def has_set?
    self.spectra_set_id != 0 && !self.spectra_set_id.nil?
  end

  def has_spectrum?
    self.spectrum_id != 0 && !self.spectrum_id.nil?
  end

  def has_user?
    self.user_id != 0 && !self.user_id.nil?
  end

  def can_delete(user)
    (self.has_set? && self.set.author == user.login) || (self.has_spectrum? && self.spectrum.author == user.login) || self.author == user.login || user.role == "admin"
  end

end
