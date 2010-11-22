class Spectrum < ActiveRecord::Base

	validates_presence_of :title, :on => :create, :message => "can't be blank"
	validates_presence_of :author, :on => :create, :message => "can't be blank"
	validates_presence_of :photo, :on => :create, :message => "can't be blank"
	# validates_presence_of :data, :on => :create, :message => "can't be blank"
	
	# Paperclip
	has_attached_file :photo,
	  :styles => {
	    :thumb=> "100x100#",
	    :large =>   "400x400>" }

end
