class Snapshot < ActiveRecord::Base

  belongs_to :spectrum
  belongs_to :user

  attr_accessible :id, :user_id, :spectrum_id, :description, :data

  validates_presence_of :user_id
  validates_presence_of :spectrum_id
  #validates_presence_of :data



end
