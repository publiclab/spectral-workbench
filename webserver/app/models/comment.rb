class Comment < ActiveRecord::Base

	belongs_to :spectrum
	validates_presence_of :author, :email, :body

end
