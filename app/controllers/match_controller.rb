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
  end


  def search
    id = params[:id]
    range = params[:fit]
    range ||= 100

    @range = range.to_i

    if @range < 0 || @range > 150
      @range = 100
      @err = "The fit input must be between 0 and 150"
    end

    @spectrum = Spectrum.find(id)

    if !@spectrum.calibrated
      flash[:error] = "The spectrum is not calibrated. If you are the author of this spectrum please calibrate it first"
      redirect_to spectrum_path(id.to_s)
      return
    end

    @spectra = @spectrum.find_similar(@range)
                        .paginate(:page => params[:page],:per_page => 24)

    @sets = @spectrum.sets
    @macros = Macro.find :all, :conditions => {:macro_type => "analyze"}
    @calibrations = current_user.calibrations if logged_in?
    @comment = Comment.new

    respond_to do |format|
      format.html { render partial: "macros/spectra", locals: { spectrums: @spectra } if params[:toolPane] }
      format.xml  { render :xml => @spectra }
      format.csv  {
        render :text => SpectrumsHelper.show_csv(@spectrum)
      }
      format.json  { render :json => @spectra.map { |s| s.json } } # actually flatten in the json of each spectrum; kind of messy
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
