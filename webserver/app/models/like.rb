class Like < ActiveRecord::Base

  validates_presence_of :user_id, :spectrum_id
  belongs_to :user
  belongs_to :spectrum

end
