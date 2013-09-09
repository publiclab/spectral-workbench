class MatchController < ApplicationController

  def index
    id = params[:id]
    
    if id.nil? # No need to search anything
      @message = "Welcome for the searching interface"
    else
      @spectrum = ProcessedSpectrum.find_by_spectrum_id(id)
      if @spectrum # Found a soectrum with specified id.
        
        if params[:c] # Flag to check if the rendering is for comparing or displaying
	      @c = 1
        end
        
        @spectra = @spectrum.closest_match(params[:fit].to_i,20)
        render :partial => "match_results", :layout => false
        
        return # Cannot render two times. So return
      
      else # Didnt find a spectrum with specified id
        @message = "Not found"
      
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
    
    @processed_spectra = ProcessedSpectrum.find_by_spectrum_id(id)
    if @processed_spectra.nil? || @processed_spectra == ""
      @spectra = @spectrum
    else
      @spectra = @processed_spectra.closest_match(@range,20)
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

end
