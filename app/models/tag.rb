class Tag < ActiveRecord::Base

  # could restrict these for better security in Rails 3:
  attr_accessible :spectrum_id, :name, :user_id

  validates_presence_of :name, :on => :create, :message => "can't be blank"
  validates_presence_of :user_id, :on => :create, :message => "can't be blank"
  validates_presence_of :spectrum_id, :on => :create, :message => "can't be blank"

  belongs_to :spectrum
  belongs_to :user

  def spectra
  	tags = Tag.find_all_by_name(self.name)
  	spectra = []
  	tags.each do |tag|
  		spectra << tag.spectrum_id
  	end
  	#Spectrum.find spectra.uniq, :order => "id DESC"
  	Spectrum.all(:conditions => ["id in (?)", spectra.uniq], :order => "id DESC")
  end

end
