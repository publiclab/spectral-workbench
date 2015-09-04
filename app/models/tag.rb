class Tag < ActiveRecord::Base

  attr_accessible :spectrum_id, :name, :user_id

  validates_presence_of :name, :on => :create, :message => "can't be blank"
  validates_presence_of :user_id, :on => :create, :message => "can't be blank"
  validates_presence_of :spectrum_id, :on => :create, :message => "can't be blank"

  validates :name, :format => {:with => /[\w\.:\-\*\+\[\]\(\)]+/, :message => "can only include letters, numbers, and dashes, or mathematical expressions"}

  belongs_to :spectrum
  belongs_to :user

  def spectra
    Spectrum.joins(:tags).where('tags.name = (?)',self.name)
  end

  # this doesn't accommodate v2.0 powertags, which can contain math syntax
  def is_powertag?
    self.name.match(/[a-zA-Z-]+:[a-zA-Z0-9-]+/)
  end

  # supplies a string of CSS classnames for this type of tag
  def colors
    colors = ""

    colors = " purple" if self.is_powertag?

    colors
  end

end
