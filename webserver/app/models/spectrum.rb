class Spectrum < ActiveRecord::Base

	validates_presence_of :title, :on => :create, :message => "can't be blank"
	validates_presence_of :author, :on => :create, :message => "can't be blank"
	validates_presence_of :photo, :on => :create, :message => "can't be blank"

	validates_format_of     :title,
                            	:with => /[a-zA-Z0-9_-]/,  
                            	:message => " must not include spaces and must be alphanumeric, as it'll be used in the URL of your spectrum, like: http://site.org/spectra/your-spectrum-name. You may use dashes and underscores.",
                            	:on => :create
	validates_length_of :title, :maximum=>60

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

  # extracts serialized data from the top row of the stored image
  def extract_data
    require 'rubygems'
    require 'RMagick'
    pixels = []

    image   = Magick::ImageList.new("public"+self.photo.url)
    row = image.export_pixels(0, 1, image.columns, 1, "RGB");
    (0..(row.length/3-1)).each do |p|
      r = row[p*3]/255
      g = row[p*3+1]/255
      b = row[p*3+2]/255
      pixels << '{wavelength:null,average:'+((r+g+b)/3).to_s+',r:'+r.to_s+',g:'+g.to_s+',b:'+b.to_s+'}'
    end

    puts pixels
    # save it internally
    s = "{name:'"+self.title+"',lines: ["
    s += pixels.join(',')
    s += "]}"
    self.data = s
    self.save
    s
  end

end
