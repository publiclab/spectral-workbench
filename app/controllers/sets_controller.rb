class SetsController < ApplicationController
  respond_to :html, :xml, :js #, :csv # not yet

  def index
    @sets = SpectraSet.paginate(:order => "created_at DESC", :page => params[:page])
  end

  def show2
    show
  end

  def show
    @set = SpectraSet.find params[:id]
    @spectrums = Spectrum.find(:all, :limit => 4, :order => "created_at DESC")
    @comment = Comment.new
    
    respond_with(@set) do |format|
      format.html {}
      format.xml  { render :xml => @set }
      format.json  {
        json = @set.as_json
# this won't work: can't set arbitrary properties
# later comment: ? huh?
        json = json.merge({spectra: []})
        @set.spectrums.each do |spectrum|
          spectrum_json = spectrum.as_json(:except => [:data])
          spectrum_json[:data] = JSON.parse(spectrum.data)
          json[:spectra] << spectrum_json
        end
        render :json => json
      }
    end
  end

  # API call for only calibrated spectra
  def calibrated
    @set = SpectraSet.find params[:id]
    respond_with(@set) do |format|
      # format.html {}
      format.xml  { render :xml => @set }
      format.json  {
        json = @set.as_json
# this won't work: can't set arbitrary properties
# later comment: ? huh?
        json = json.merge({spectra: []})
        @set.calibrated_spectrums.each do |spectrum|
          spectrum_json = spectrum.as_json(:except => [:data])
          spectrum_json[:data] = JSON.parse(spectrum.data)
          json[:spectra] << spectrum_json
        end
        render :json => json
      }
    end
  end

  def find_match
    @spectrum = Spectrum.new_from_string(params[:data])
    @calibration = Spectrum.find params[:calibration]
    @set = SpectraSet.find params[:id]
    range = @calibration.wavelength_range
    @spectrum.scale_data(range[0],range[1])
    @match = Spectrum.find(@set.match(@spectrum))
    render :text => "Matched: <a href='/spectra/"+@match.id.to_s+"'>"+@match.title+"</a>"
  end

  def embed
    @set = SpectraSet.find params[:id]
    @width = (params[:width] || 500).to_i
    @height = (params[:height] || 200).to_i
    render :layout => false
  end

  def embed2
    @set = SpectraSet.find params[:id]
    render :template => 'embed/set', :layout => 'embed'
  end

  def add
    @set = SpectraSet.find params[:id]
    @spectrum = Spectrum.find params[:spectrum_id]
    if logged_in? && @set.author == current_user.login
      if @set.add(params[:spectrum_id])
        flash[:notice] = "Added spectrum to set."
      else
        flash[:error] = "Failed to add to that set."
      end
      redirect_to "/sets/"+@set.id.to_s
    else
      flash[:error] = "You must be logged in and own that set to add to it."
      redirect_to spectrum_path(@spectrum)
    end
  end

  def new
    if logged_in?
      @set = SpectraSet.new
      respond_to do |format|
        format.html {} # new.html.erb
        format.xml  { render :xml => @set }
      end
    else
      flash[:error] = "You must be logged in to create a set."
      redirect_to "/login"
    end
  end

  def create
    if logged_in?
      spectra = []
      params[:id].split(',').each do |s|
        if (spectrum = Spectrum.find(s))
          spectra << spectrum.id
        end
      end
      @set = SpectraSet.new({:title => params[:spectra_set][:title],
        :notes => params[:spectra_set][:notes],
        :author => current_user.login
      })
      if @set.save
        @set.spectrums << spectra
        redirect_to "/sets/"+@set.id.to_s
      else
        flash[:error] = "Failed to save set."
        render :action => "new", :id => params[:id]
      end
    else
      flash[:error] = "You must be logged in to create a set."
      redirect_to "/login"
    end
  end

  # non REST
  def search
    params[:id] = params[:q].to_s if params[:id].nil?
    @sets = SpectraSet.paginate(:conditions => ['title LIKE ? OR notes LIKE ?',"%"+params[:id]+"%", "%"+params[:id]+"%"],:limit => 100, :order => "id DESC", :page => params[:page])
    render :partial => "capture/results_sets.html.erb", :layout => false if params[:capture]
  end

  def remove
    @set = SpectraSet.find params[:id]
    if logged_in? && (@set.author == current_user.login || current_user.role == "admin")
      if @set.spectrums.length > 1
        @set.delete(params[:s])
        flash[:notice] = "Spectrum removed."
      else
        flash[:error] = "A set must have at least one spectrum."
      end
      redirect_to "/sets/"+@set.id.to_s
    else
      flash[:error] = "You must be logged in and own the set to edit it."
      redirect_to "/login"
    end
  end

  def delete
    @set = SpectraSet.find params[:id]
    if logged_in? && (@set.author == current_user.login || current_user.role == "admin")
      if @set.delete
        flash[:notice] = "Deleted set."
        redirect_to "/sets/"
      else
        flash[:error] = "Failed to save set."
        redirect_to "/sets/edit/"+@set.id.to_s
      end
    else
      flash[:error] = "You must be logged in and own the set to edit it."
      redirect_to "/login"
    end
  end

  def edit
    @set = SpectraSet.find params[:id]
    if logged_in? && (@set.author == current_user.login || current_user.role == "admin")
      @spectrums = Spectrum.find(:all, :limit => 4, :order => "created_at DESC")
    else
      flash[:error] = "You must be logged in and own the set to edit it."
      redirect_to "/login"
    end
  end

  def update
    @set = SpectraSet.find params[:id]
    if logged_in? && (@set.author == current_user.login || current_user.role == "admin")
      @set.notes = params[:notes] if params[:notes]
      @set.title = params[:title] if params[:title]
      if @set.save!
        flash[:notice] = 'Set was successfully updated.'
        redirect_to "/sets/"+@set.id.to_s
      else
        flash[:error] = "Failed to save set."
        redirect_to "/sets/edit/"+@set.id.to_s
      end
    else
      flash[:error] = "You must be logged in and own the set to edit it."
      redirect_to "/login"
    end
  end

end
