class SetsController < ApplicationController

  respond_to :html, :xml, :js #, :csv # not yet
  before_filter :require_login, :only => [ :update, :edit, :delete, :remove, :new, :add, :create ]
  before_filter :no_cache, :only => [ :show, :calibrated, :search ]

  def index
    @sets = SpectraSet.paginate(:order => "created_at DESC", :page => params[:page])
  end

  def show2
    redirect_to "/sets/#{params[:id]}", status: 301
  end

  def show
    @set = SpectraSet.find params[:id]

    # don't fetch the data here; but do get latest snapshot_ids
    @spectrums = Spectrum.select('DISTINCT(spectrums.id), spectrums.title, spectrums.created_at, spectrums.id, spectrums.calibrated, spectrums.user_id, like_count, snapshots.id AS snapshot_id')
                         .joins('LEFT OUTER JOIN snapshots ON snapshots.spectrum_id = spectrums.id')
                         .joins(:spectra_sets)
                         .where('spectra_sets.id = ?', @set.id)
                         .group('spectrums.id')

    respond_with(@set) do |format|
      format.html {
        @comment = Comment.new
      }
      format.xml  { render :xml => @set }
      format.json  {
        render :json => @set.as_json_with_snapshots
      }
    end
  end

  # API call for only calibrated spectra in given set
  def calibrated
    @set = SpectraSet.find params[:id]
    respond_with(@set) do |format|
      # format.html {}
      format.xml  { render :xml => @set }
      format.json  {
        render :json => @set.as_json_with_calibrated_snapshots
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
    show
    render :template => 'embed/set', :layout => 'embed'
  end

  def new
    @set = SpectraSet.new
    respond_to do |format|
      format.html {} # new.html.erb
      format.xml  { render :xml => @set }
    end
  end

  # accepts params[:id] of comma-delimited spectrum ids
  def create
    spectra = []
    params[:id].split(',').each do |s|
      if (spectrum = Spectrum.find(s))
        spectra << spectrum
      end
    end
    @set = SpectraSet.new({
      :title => params[:spectra_set][:title],
      :notes => params[:spectra_set][:notes],
      :user_id => current_user.id
    })
    if @set.save
      @set.spectrums << spectra
      redirect_to "/sets/"+@set.id.to_s
    else
      flash[:error] = "Failed to save set."
      render :action => "new", :id => params[:id]
    end
  end

  # non REST
  def search
    params[:id] = params[:q].to_s if params[:id].nil?
    @sets = SpectraSet.paginate(:conditions => ['title LIKE ? OR notes LIKE ?',"%"+params[:id]+"%", "%"+params[:id]+"%"],:limit => 100, :order => "id DESC", :page => params[:page])
    render :partial => "capture/results_sets.html.erb", :layout => false if params[:capture]
  end

  # add spectrum to set with spectrum_id and id (of set)
  def add
    @set = SpectraSet.find params[:id]
    @spectrum = Spectrum.find params[:spectrum_id]
    if @set.user_id == current_user.id || current_user.role == "admin"
      # be sure it's not already included:
      if !@set.contains(@spectrum)
        if @set.spectrums << @spectrum
          flash[:notice] = "Added spectrum to set."
        else
          flash[:error] = "Failed to add to that set."
        end
      else
        flash[:error] = "Sets may not contain a spectrum more than once."
      end
      redirect_to "/sets/#{@set.id}"
    else
      flash[:error] = "You must own that set to add to it."
      redirect_to spectrum_path(@spectrum)
    end
  end

  # Remove a spectrum with id params[:s] from the set
  def remove
    @set = SpectraSet.find params[:id]
    @spectrum = Spectrum.find params[:s]
    if @set.user_id == current_user.id || current_user.role == "admin"
      if @set.spectrums.length > 1
        @set.spectrums.delete(@spectrum)
        flash[:notice] = "Spectrum removed."
      else
        flash[:error] = "A set must have at least one spectrum."
      end
      redirect_to "/sets/#{@set.id}"
    else
      flash[:error] = "You must own the set to edit it."
      redirect_to "/sets/#{@set.id}"
    end
  end

  def delete
    @set = SpectraSet.find params[:id]
    if @set.user_id == current_user.id || current_user.role == "admin"
      if @set.delete
        flash[:notice] = "Deleted set."
        redirect_to "/sets/"
      else
        flash[:error] = "Failed to save set."
        redirect_to "/sets/edit/"+@set.id.to_s
      end
    else
      flash[:error] = "You must own the set to edit it."
      redirect_to "/sets/#{@set.id}"
    end
  end

  def edit
    @set = SpectraSet.find params[:id]
    if @set.user_id == current_user.id || current_user.role == "admin"
      @spectrums = Spectrum.find(:all, :limit => 4, :order => "created_at DESC")
    else
      flash[:error] = "You must own the set to edit it."
      redirect_to "/sets/#{@set.id}"
    end
  end

  def update
    @set = SpectraSet.find params[:id]
    if @set.user_id == current_user.id || current_user.role == "admin"
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
      flash[:error] = "You must own the set to edit it."
      redirect_to "/sets/#{@set.id}"
    end
  end

end
