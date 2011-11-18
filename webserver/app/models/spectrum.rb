class Spectrum < ActiveRecord::Base

	validates_presence_of :title, :on => :create, :message => "can't be blank"
	validates_presence_of :author, :on => :create, :message => "can't be blank"
	validates_presence_of :photo, :on => :create, :message => "can't be blank"

	validates_format_of     :title,
                            	:with => /[a-zA-Z0-9_-]/,  
                            	:message => " must not include spaces and must be alphanumeric, as it'll be used in the URL of your spectrum, like: http://site.org/spectra/your-spectrum-name. You may use dashes and underscores.",
                            	:on => :create
	validates_length_of :title, :maximum=>30

	has_many :comments, :dependent => :destroy
	
	# Paperclip
	has_attached_file :photo,
	  :styles => {
	    :thumb=> "300x100!",
	    :large =>   "800x200!" }

	has_attached_file :baseline,
	  :styles => {
	    :thumb=> "300x100!",
	    :large =>   "800x200!" }
end
