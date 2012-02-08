class Spectrum < ActiveRecord::Base

	validates_presence_of :title, :on => :create, :message => "can't be blank"
	validates_presence_of :author, :on => :create, :message => "can't be blank"
	validates_presence_of :photo, :on => :create, :message => "can't be blank"
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

    # save it internally
    s = "{name:'"+self.title+"',lines: ["
    s += pixels.join(',')
    s += "]}"
    self.data = s
    s
  end

  # {wavelength:null,average:0,r:0,g:0,b:0}
  def scale_data(start_w,end_w)
    d = ActiveSupport::JSON.decode(self.data)
    i = 0 
    d['lines'].each do |line|
      line['wavelength'] = (start_w + i*((end_w-start_w)*1.00/d['lines'].length))
      i += 1
    end
    self.data = ActiveSupport::JSON.encode(d)
    self
  end

  def calibrate(x1,wavelength1,x2,wavelength2)
    d = ActiveSupport::JSON.decode(self.data)
    i = 0 
    stepsize = ((wavelength2.to_f-wavelength1.to_f)*1.00/(x2.to_f-x1.to_f))
    startwavelength = wavelength1.to_f-(stepsize*x1.to_f)
    d['lines'].each do |line|
      line['wavelength'] = startwavelength + i*stepsize
      i += 1
    end
    self.reverse if (wavelength1 < wavelength2 && x1 > x2) || (wavelength1 > wavelength2 && x1 < x2)
    self.data = ActiveSupport::JSON.encode(d)
    self
  end

  # clones calibration from another spectrum (preferably taken from the same device)
  def clone(clone_id)
    clone_source = Spectrum.find clone_id 
    d = ActiveSupport::JSON.decode(self.data)
    cd = ActiveSupport::JSON.decode(clone_source.data)
    i = 0 
    # assume linear:
    stepsize = (cd['lines'][10]['wavelength'].to_f-cd['lines'][0]['wavelength'].to_f)/10.00
    d['lines'].each do |line|
      if cd['lines'][i]
        line['wavelength'] = cd['lines'][i]['wavelength'] 
      else
        line['wavelength'] = cd['lines'][0]['wavelength'].to_f+(i*stepsize)
      end
      i += 1
    end
    self.data = ActiveSupport::JSON.encode(d)
    self.notes = self.notes+" -- (Cloned calibration from <a href='/spectra/show/"+clone_id+"'>"+clone_source.title+"</a>)"
    self
  end

  # horizontally flips image to match reversed spectrum
  # this needs to re-save all the Paperclip versions too... it only works for the original image now
  def reverse
    require 'rubygems'
    require 'RMagick'

    image = Magick::ImageList.new("public"+self.photo.url)
    image.flop!
    image.write("public"+self.photo.url)
  end

end
