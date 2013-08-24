class MatchController < ApplicationController

  def index
    id = params[:id]
    
    if id.nil?
      @d = "Welcome"
    else
      @d = search(id)
    end

    render :layout => "bootstrap"
  end


  def search(id)
    ## Search for the candidates here
    
    return "Results will be here"
  end

  
  def add
    id = params[:id]
    
    if id.nil?
      redirect_to "/"
    end

    @spec = ProcessedSpectrum.find_by_spectrum_id(id)

    if @spec
      @d = "Found processed spectra. So, not adding"
    else
      @d = "Processed spectra not found. Trying to add."
      @processed = ProcessedSpectrum.new(generate(id))
      @processed.save
      @d += " Added."
    end
    
    render :layout => "bootstrap"
  end

  
  def generate(id)
    spectrum = Spectrum.find(id)

    decoded = ActiveSupport::JSON.decode(spectrum.data)

    lines = decoded['lines']
    
    values = {}
    counts = {}
    types = ['a', 'r', 'g', 'b']
    
    labels = {}
    labels['a'] = 'average'
    labels['r'] = 'r'
    labels['g'] = 'g'
    labels['b'] = 'b'

    bins = (10...1500).step(10)
  
    values['spectrum_id'] = id

    bins.each do |bin|
      types.each do |type|
        values["#{type}#{bin}"] = 0
      end
      counts[bin] = 0
    end

    lines.each do |line|
      bins_to_consider = get_bins(line['wavelength'].round)
     
      bins_to_consider.each do |bin|
        types.each do |type|
          values["#{type}#{bin}"] += line[labels[type]].round
        end
        counts[bin] += 1
      end
    end

    # Time to average the values and return

    bins.each do |bin|
      if counts[bin] > 0
        types.each do |type|
          values["#{type}#{bin}"] /= counts[bin]
        end
      end
    end 

    return values
  end

  
  def get_bins(wavelength)
    base = (wavelength/10) * 10
    diff = wavelength - base
   
    if base < 10
      return [10]
    elsif base > 1490
      return [1490]
    end
    
    if diff > 6 # This is in the next bin
      return [base + 10]
    elsif diff < 4 # This is in this bin
      return [base]
    else # This is in both the present and next bin
      return [base, base + 10]
    end

  end

end
