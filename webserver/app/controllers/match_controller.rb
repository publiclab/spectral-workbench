class MatchController < ApplicationController

  skip_before_filter :verify_authenticity_token

  def index
    id = params[:id]
    
    if id.nil? # No need to search anything
      flash[:error] = "ID is required for matching"
      redirect_to "/dashboard/"
      return
      
    else
      @proc_spectrum = ProcessedSpectrum.find_by_spectrum_id(id)
      
      if @proc_spectrum # Found a spectrum with specified id.
        @spectra = @proc_spectrum.closest_match(params[:fit].to_i, 20)
        @spectrum = Spectrum.find(id)
        
        if params[:c] # Flag to check if the rendering is for comparing or displaying
	      render :partial => "match_results", :layout => false
	      return
	    else
	      render :partial => "list_results", :layout => false
	      return
        end
      
      else # Didnt find a spectrum with specified id
        flash[:error] = "A spectrum with the specified ID is not found"
        redirect_to "/dashboard/"
        return
      end
    end

    render :layout => "bootstrap"
  end


  def search
    id = params[:id]
    range = params[:fit]
    
    if range.nil? || range == "" || (range != '0' && range.to_i == 0)
      range = 100
    end
    
    @range = range.to_i
    
    if @range < 0 || @range > 150
      @range = 100
      @err = "The fit input must be between 0 and 150"
    end
    
    @spectrum = Spectrum.find(id)
    
    if @spectrum.data == "" || @spectrum.data.nil?
      @spectrum.extract_data 
      @spectrum.save 
    end

    if !@spectrum.calibrated
      flash[:error] = "The spectrum is not calibrated. If you are the author of this spectrum please calibrate it first"
      redirect_to "/analyze/spectrum/" + id.to_s
      return
    end
    
    proc_nil = false
    
    @processed_spectra = ProcessedSpectrum.find_by_spectrum_id(id)
    if @processed_spectra.nil? || @processed_spectra == ""
      @spectra = [@spectrum]
      proc_nil = true
    else
      @spectra = @processed_spectra.closest_match(@range, 20)
    end
    
    # Some spectrums have many matches with range of 100. Some have very few.
    # So why stop just at 100? Something dynamic would be good, though takes some extra time
    # Implementing a sort of binary search for best spectra matching.
    
    # Time to make our matches more meaningful.

    range_visits = [@range] # To check the ranges visited

    # This loop will take 10 iterations at maximum.
    while !proc_nil and (@spectra.size < 2 or @spectra.size > 6)
      if @spectra.size > 6 # Need to reduce the range
       	@range = @range - 10
      else
	@range = @range + 10
      end
      
      if range_visits.member?(@range) or @range < 10 or @range > 150
        break
      end
      
      range_visits.push(@range)
      @spectra = @processed_spectra.closest_match(@range, 20)
    end
    
    @sets = @spectrum.sets
    @macros = Macro.find :all, :conditions => {:macro_type => "analyze"}
    @calibrations = current_user.calibrations if logged_in?
    @comment = Comment.new
    
    respond_to do |format|
      format.html { render :layout => "bootstrap" }
      format.xml  { render :xml => @spectrum }
      format.csv  { 
        if params[:raw]
          render :template => "spectrums/raw.csv.erb" 
        else
          render :template => "spectrums/show.csv.erb" # formatted for SpectraOnline.com 
        end
      }
      format.json  { render :json => @spectrum }
    end
  end
  
  def livesearch
    d = ActiveSupport::JSON.decode("{" + params[:data] + "}")
    bins = (10...640).step(10)
    types = ['a', 'r', 'g', 'b']
    range = 50
    ids = []

    matches = ProcessedSpectrum.find(:all, :conditions => [get_conditions(d, bins, types, range)])

    range_visits = [range] # To check the ranges visited

    # This loop will take 8 iterations at maximum.
    while matches.size <1 or matches.size>5
      if matches.size > 5 # Need to reduce the range
       	range = range - 10
      else
	range = range + 10
      end
      
      if range_visits.member?(range) or range < 0 or range > 80
        break
      end
      
      range_visits.push(range)
      matches = ProcessedSpectrum.find(:all, :conditions => [get_conditions(d, bins, types, range)])
    end
     
    matches.each do |match|
      ids += ["id = #{match.spectrum_id}"]
    end

    if ids == [] # This means that we have not found even a single match
      @error = "Sorry, No Matches found!"
    else
      id_string = ids.join(" OR ")
      @spectra = Spectrum.find(:all, :order => "created_at DESC", :conditions => [id_string], :limit => 2)
    end

    render :partial => "livesearch", :layout => false
  end

  def get_conditions(d, bins, types, range)
    conditions = []
    bins.each do |bin|
      types.each do |type|
        bin_string = "#{type}#{bin}"

        low = d[bin_string].to_i - range
        high = d[bin_string].to_i + range
        conditions += ["#{bin_string} BETWEEN #{low} AND #{high}"]
      end
    end

    return conditions.join(" AND ")
  end

end
