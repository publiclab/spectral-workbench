class Tag < ActiveRecord::Base

  attr_accessible :spectrum_id, :name, :user_id

  validates_presence_of :name, :on => :create, :message => "can't be blank"
  validates_presence_of :user_id, :on => :create, :message => "can't be blank"
  validates_presence_of :spectrum_id, :on => :create, :message => "can't be blank"

  belongs_to :spectrum
  belongs_to :user

  def spectra
    Spectrum.joins(:tags).where('tags.name = (?)',self.name)
  end

end
