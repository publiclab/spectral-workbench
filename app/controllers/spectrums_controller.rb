require 'will_paginate/array'
class SpectrumsController < ApplicationController
  respond_to :html, :xml, :js, :csv, :json
  # expand this:
  protect_from_forgery :only => [:clone_calibration, :extract, :calibrate, :save]
  # http://api.rubyonrails.org/classes/ActionController/RequestForgeryProtection/ClassMethods.html
  before_filter :require_login,     :only => [ :new, :edit, :upload, :save, :update, :destroy, :calibrate, :extract, :clone_calibration, :fork, :setsamplerow, :find_brightest_row, :rotate, :reverse, :choose ]
  # switch to -- :except => [ :index, :stats, :show, :show2, :anonymous, :embed, :embed2, :search, :recent, :all, :rss, :plots_rss, :match, :clone_search, :compare_search, :set_search
  before_filter :no_cache, :only => [ :show, :latest, :latest_snapshot_id, :embed, :embed2 ]

  def stats
  end

  # GET /spectrums
  # GET /spectrums.xml
  def index
    if logged_in?
      redirect_to "/dashboard"
    else
      @spectrums = Spectrum.select("title, created_at, id, user_id, author, photo_file_name, like_count, photo_content_type")
                           .order('created_at DESC')
                           .where('user_id != 0')
                           .paginate(:page => params[:page], :per_page => 24)

      @sets = SpectraSet.find(:all,:limit => 4,:order => "created_at DESC")
      @comments = Comment.all :limit => 12, :order => "id DESC"

      respond_with(@spectrums) do |format|
        format.html {
          render :template => "spectrums/index"
        } # show.html.erb
        format.xml  { render :xml => @spectrums }
      end
    end
  end

  # Returns a list of spectrums by tag, name, or id
  # in a partial for use in macros and tools.
  # ..can we merge this with search?
  def choose

    params[:id] = params[:id].to_s

    if params[:id] == "calibration" # special case; include linearCalibration too
      comparison = "LIKE 'linearCalibration' OR tags.name LIKE"
    else
      # add wildcards
      comparison = "LIKE"
    end
    params[:id] += "%"

    # user's own spectra
    params[:author] = current_user.login if logged_in? && params[:own] == 'true'

    # must re-craft this query to search spectra with no tags:
    @spectrums = Spectrum.order('spectrums.id DESC')
                         .select("DISTINCT(spectrums.id), spectrums.title, spectrums.created_at, spectrums.user_id, spectrums.author, spectrums.calibrated")
                         .joins("LEFT OUTER JOIN tags ON tags.spectrum_id = spectrums.id")
                         .joins("JOIN users ON users.id = spectrums.user_id")
                         .paginate(:page => params[:page],:per_page => 6)

    # exclude self:
    @spectrums = @spectrums.where('spectrums.id != ?', params[:not]) if params[:not]

    if params[:id] != "all" && !params[:id].nil?
      @spectrums = @spectrums.where("tags.name #{comparison} (?) OR spectrums.title #{comparison} (?) OR spectrums.id = ? OR users.login = ?", 
                                    params[:id], params[:id], params[:id].to_i, params[:id])
      
      @spectrums = @spectrums.where(user_id: User.find_by_login(params[:author]).id) if params[:author]
    end

    respond_with(@spectrums) do |format|
      format.html { render partial: "macros/spectra", locals: { spectrums: @spectrums } }
      format.xml  { render :xml => @spectrums }
      format.json  { render :json => @spectrums }
    end
  end

  def show2
    redirect_to spectrum_path(params[:id]), status: 301
  end

  # eventually start selecting everything but spectrum.data, as show2 
  # doesn't use this to fetch data, but makes a 2nd call. 
  # However, format.json does use it!
  def show
    @spectrum = Spectrum.find(params[:id])
    respond_with(@spectrum) do |format|
      format.html {
        # temporary routing until we deprecate 1.0 paths to /legacy
        if params[:v] != '1'
          render template: 'spectrums/show2'
        else
          if logged_in?
            @spectra = Spectrum.find(:all, :limit => 12, :order => "created_at DESC", :conditions => ["id != ? AND author = ?",@spectrum.id,current_user.login])
          else
            @spectra = Spectrum.find(:all, :limit => 12, :order => "created_at DESC", :conditions => ["id != ?",@spectrum.id])
          end
          @sets = @spectrum.sets
          @user_sets = SpectraSet.where(author: current_user.login).limit(20).order("created_at DESC") if logged_in?
          @macros = Macro.find :all, :conditions => {:macro_type => "analyze"}
          @calibrations = current_user.calibrations.select { |s| s.id != @spectrum.id } if logged_in?
          @comment = Comment.new
        end
      }
      format.xml  { render :xml => @spectrum }
      format.csv  {
        render :text => SpectrumsHelper.show_csv(@spectrum)
      }
      format.json  {
        render :json => @spectrum.json
      }
    end
  end

  # used when referencing a snapshot
  def latest_snapshot_id
    spectrum = Spectrum.select(:id).find(params[:id])
    if spectrum.snapshots.count > 0
      snap = Snapshot.where(spectrum_id: spectrum.id)
                     .select('spectrum_id, created_at, id')
                     .order("created_at DESC")
                     .limit(1)
      render :text => spectrum.latest_snapshot.id
    else
      render :text => false
    end
  end

  def latest
    spectrum = Spectrum.find(params[:id])
    if spectrum.snapshots.count > 0
      @snapshot = spectrum.latest_snapshot
      is_snapshot = true
    else
      @snapshot = spectrum
      is_snapshot = false
    end
    respond_with(@snapshot) do |format|
      format.xml  { render :xml => @snapshot }
      format.csv  {
        render :text => SpectrumsHelper.show_csv_snapshot(@snapshot) if is_snapshot
        render :text => SpectrumsHelper.show_csv(@snapshot)          if !is_snapshot
      }
      format.json  {
        render :json => @snapshot.json
      }
    end
  end

  def anonymous
    @spectrums = Spectrum.paginate(:order => "created_at DESC", :conditions => {:author => "anonymous"}, :page => params[:page])
    render :template => "spectrums/search"
  end

  def embed
    @spectrum = Spectrum.find(params[:id])
    @width = (params[:width] || 500).to_i
    @height = (params[:height] || 300).to_i
    render :layout => false
  end

  def embed2
    @spectrum = Spectrum.find(params[:id])
    render :template => 'embed/spectrum', :layout => 'embed'
  end

  def search
    params[:id] = params[:q].to_s if params[:id].nil?
    @spectrums = Spectrum.where('title LIKE ? OR author LIKE ?',"%#{params[:id]}%", "%#{params[:id]}%").order("id DESC").paginate(:page => params[:page], :per_page => 24)
    if params[:capture]
      render :partial => "capture/results", :layout => false
    else
      @sets = SpectraSet.where('title LIKE ? OR author LIKE ?',"%#{params[:id]}%", "%#{params[:id]}%").order("id DESC").paginate(:page => params[:set_page])
    end
  end

  def recent
    @spectrums = Spectrum.find(:all, :limit => 10, :order => "id DESC")
    render :partial => "capture/results", :layout => false if params[:capture]
  end

  # GET /spectrums/new
  # GET /spectrums/new.xml
  def new
    @spectrum = Spectrum.new
 
    respond_with(@spectrum) do |format|
      format.html {}
      format.xml  { render :xml => @spectrum }
    end
  end

  # GET /spectrums/1/edit
  def edit
    @spectrum = Spectrum.find(params[:id])
    require_ownership(@spectrum)
  end

  # POST /spectrums
  # POST /spectrums.xml
  # POST /spectrums.json
  # ?spectrum[title]=TITLE&spectrum[author]=anonymous&startWavelength=STARTW&endWavelength=ENDW;
  # replacing this with capture/save soon
  def create
    if logged_in? || params[:token] && User.find_by_token(params[:token])

      user = current_user || User.find_by_token(params[:token])
      params[:spectrum][:json] = params[:spectrum][:data] if (params[:spectrum] && params[:spectrum][:data])

      @spectrum = Spectrum.new({
        :title => params[:spectrum][:title],
        :author => user.login,
        :user_id => user.id,
        :notes => params[:spectrum][:notes]
      })
 
      if params[:dataurl] # mediastream webclient
        @spectrum.image_from_dataurl(params[:dataurl])
      # upload json; CSV is converted to JSON before upload in upload.js
      elsif params[:spectrum][:data_type] == "csv" || params[:spectrum][:data_type] == "json" || params[:format] == 'json'
        lines = params[:spectrum][:json]
        @spectrum.data = '{ "lines": ' + lines.to_s + " }"
      elsif params[:spectrum][:data_type] == "image" # upload form at /upload
        @spectrum.photo = params[:spectrum][:photo]
      end
 
      if @spectrum.save
 
        respond_with(@spectrum) do |format|
 
          if (APP_CONFIG["local"] || logged_in? || User.find_by_token(params[:token]))
 
            if mobile? || ios?
              @spectrum.save
              @spectrum = Spectrum.find @spectrum.id
              @spectrum.sample_row = @spectrum.find_brightest_row
              #@spectrum.tag("mobile", user.id)
            end
 
            if params[:spectrum][:json] == "" && params[:vertical]
              @spectrum.rotate 
            end
 
            @spectrum.tag("iOS", user.id) if ios?
 
            @spectrum.tag("json", user.id) if params[:spectrum][:data_type] == "json"
            @spectrum.tag("csv", user.id) if params[:spectrum][:data_type] == "csv"
 
            params[:tags].to_s.split(',').each do |tag|
              @spectrum.tag(tag, user.id)
            end
  
            if params[:upload]
              @spectrum.tag("upload", user.id) 
            end
 
            @spectrum.tag(params[:device], user.id) if params[:device] && params[:device] != "none"
            @spectrum.tag("video_row:#{params[:video_row]}", user.id) if params[:video_row]
            #@spectrum.tag("sample_row:#{params[:video_row]}", user.id) if params[:video_row]
 
            @spectrum.extract_data if !params[:spectrum][:json] || params[:spectrum][:json].empty?
 
            if params[:spectrum][:calibration_id] && !params[:is_calibration] && params[:spectrum][:calibration_id] != "calibration" && params[:spectrum][:calibration_id] != "undefined"
              #@spectrum.clone_calibration(params[:spectrum][:calibration_id])
              # instead, append params[:spectrum][:calibration_id] to "#addTag=calibrate:#{params[:spectrum][:calibration_id].to_i}"
              calibration_param = "#addTag=calibrate:#{params[:spectrum][:calibration_id].to_i}"
            else
              calibration_param = ''
            end
 
            if params[:geotag]
              @spectrum.lat = params[:lat]
              @spectrum.lon = params[:lon]
            end
 
            @spectrum.reversed = true if params[:spectrum][:reversed] == "true"
 
            if @spectrum.save!
              flash[:notice] = 'Spectrum was successfully created.'
              format.html  { redirect_to spectrum_path(@spectrum) + calibration_param }
              format.xml   { render :xml => @spectrum, :status => :created, :location => @spectrum }
              format.json  { render :text => spectrum_path(@spectrum), :status => :created, :location => @spectrum }
            else
              render "spectrums/new"
            end
 
          else
 
            format.html  { render :action => "new" }
            format.xml   { render :xml => @spectrum.errors, :status => :unprocessable_entity }
            format.json  { render :json => @spectrum.errors, :status => :unprocessable_entity }
 
          end
 
        end
 
      else

        respond_to do |format|
          format.html  { render :action => "new" }
          format.xml   { render :xml => @spectrum.errors, :status => :unprocessable_entity }
          format.json  { render :json => @spectrum.errors, :status => :unprocessable_entity }
        end

      end

    else
      respond_to do |format|
        if request.xhr?
          format.json  { 
            render :text => 'Token required for unauthenticated API usage.'
          }
        else
          format.html { 
            flash[:error] = "You must be logged in to upload data."
            redirect_to "/"
          }
        end
      end
    end
  end

  # used to upload numerical spectrum data as a new spectrum (untested, no image??)
  def upload
    @spectrum = Spectrum.new({:title => params[:spectrum][:title],
      :author => author,
      :user_id => user_id,
      :notes => params[:spectrum][:notes],
      :data => params[:data],
      :photo => params[:photo]})
    @spectrum.save!
    params[:tags].to_s.split(',').each do |tag|
      @spectrum.tag(tag, current_user.id)
    end
    redirect_to spectrum_path(@spectrum)
  end

  # only ajax/POST accessible for now:
  def save
    @spectrum = Spectrum.find(params[:id])
    require_ownership(@spectrum)
    @spectrum.data = params[:data]
    params[:tags].to_s.split(',').each do |tag|
      @spectrum.tag(tag, current_user.id)
    end
    render :text => @spectrum.save
  end

  # PUT /spectrums/1
  # PUT /spectrums/1.xml
  def update
    @spectrum = Spectrum.find(params[:id])
    require_ownership(@spectrum)

    @spectrum.title = params[:spectrum][:title] unless params[:spectrum][:title].nil?
    @spectrum.notes = params[:spectrum][:notes] unless params[:spectrum][:notes].nil?
    @spectrum.data  = params[:spectrum][:data] unless params[:spectrum][:data].nil?

    # clean this up
    respond_to do |format|
      if @spectrum.save
        if request.xhr?
          format.json  { render :json => @spectrum }
        else
          flash[:notice] = 'Spectrum was successfully updated.'
          format.html { redirect_to(@spectrum) }
          format.xml  { head :ok }
        end
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @spectrum.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /spectrums/1
  # DELETE /spectrums/1.xml
  def destroy
    @spectrum = Spectrum.find(params[:id])
    if require_ownership(@spectrum)
      if @spectrum.destroy
        flash[:notice] = "Spectrum deleted."
        respond_with(@spectrum) do |format|
          format.html { redirect_to('/') }
          format.xml  { head :ok }
        end
      else
        flash[:error] = "Spectrum could not be deleted." # this is not displaying, not sure why
        redirect_to spectrum_path(@spectrum)
      end
    end
  end

  # Start doing this client side!
  def calibrate
    @spectrum = Spectrum.find(params[:id])
    require_ownership(@spectrum)
    @spectrum.calibrate(params[:x1], params[:w1], params[:x2], params[:w2])
    @spectrum.save
    @spectrum.tag('calibration', current_user.id)

    flash[:notice] = "Great, calibrated! <b>Next steps:</b> sign up on <a href='//publiclab.org/wiki/spectrometer'>the mailing list</a>, or browse/contribute to <a href='//publiclab.org'>Public Lab website</a>"
    redirect_to spectrum_path(@spectrum)
  end

  # Start doing this client side!
  def extract
    @spectrum = Spectrum.find(params[:id])
    require_ownership(@spectrum)
    @spectrum.extract_data
    @spectrum.save
    flash[:warning] = "Now, recalibrate, since you've <a href='//publiclab.org/wiki/spectral-workbench-calibration#Cross+section'>set a new cross-section</a>."
    redirect_to spectrum_path(@spectrum)
  end

  def fork 
    @spectrum = Spectrum.find(params[:id])
    @new = @spectrum.fork(current_user)
    flash[:notice] = "You successfully forked <a href='#{spectrum_path(@spectrum)}'>Spectrum ##{@spectrum.id}</a>"
    redirect_to spectrum_path(@new)
  end

  # Copy calibration from an existing calibrated spectrum.
  # Start doing this client side!
  def clone_calibration
    @spectrum = Spectrum.find(params[:id])
    @calibration_clone_source = Spectrum.find(params[:clone_id])
    require_ownership(@spectrum)
    @spectrum.clone_calibration(@calibration_clone_source.id)
    @spectrum.save
    @spectrum.remove_powertags('calibration')
    @spectrum.tag("calibrate:#{@calibration_clone_source.id}", current_user.id)
    
    respond_with(@spectrums) do |format|
      format.html {
        flash[:notice] = 'Spectrum was successfully calibrated.'
        redirect_to spectrum_path(@spectrum)
      }
      format.json  { render :json => @spectrum }
    end
  end

  def all
    @spectrums = Spectrum.find(:all).paginate(:page => params[:page])
    respond_with(@spectrums) do |format|
      format.xml  { render :xml => @spectrums }
      format.json  { render :json => @spectrums }
    end
  end

  def rss
    if params[:author]
      @spectrums = Spectrum.find_all_by_author(params[:author],:order => "created_at DESC",:limit => 12).paginate(:page => params[:page])
    else
      @spectrums = Spectrum.find(:all,:order => "created_at DESC",:limit => 12).paginate(:page => params[:page])
    end
    respond_to do |format|
      format.xml
    end
  end

  def plots_rss
    @spectrums = Spectrum.find(:all,:order => "created_at DESC",:limit => 12, :conditions => ["author != ?","anonymous"]).paginate(:page => params[:page])
    render :layout => false
    response.headers["Content-Type"] = "application/xml; charset=utf-8"
  end

  def match
    @spectrum = Spectrum.find params[:id]
    render :text => @spectrum.find_match_in_set(params[:set]).to_json
  end

  # Start doing this client side!
  def setsamplerow
    require 'rubygems'
    require 'RMagick'
    @spectrum = Spectrum.find params[:id]
    require_ownership(@spectrum)
    image = Magick::ImageList.new("public"+(@spectrum.photo.url.split('?')[0]).gsub('%20',' '))
    @spectrum.sample_row = (params[:row].to_f*image.rows)
    @spectrum.extract_data
    @spectrum.save
    flash[:warning] = "If this spectrum image is not perfectly vertical, you may need to recalibrate after <a href='//publiclab.org/wiki/spectral-workbench-calibration#Cross+section'>setting a new cross-section</a>."
    redirect_to spectrum_path(@spectrum)
  end

  # Start doing this client side!
  def find_brightest_row
    @spectrum = Spectrum.find params[:id]
    require_ownership(@spectrum)
    @spectrum.sample_row = @spectrum.find_brightest_row
    @spectrum.extract_data
    @spectrum.clone_calibration(@spectrum.id) # recover calibration
    @spectrum.save
    flash[:warning] = "If this spectrum image is not perfectly vertical, you may need to recalibrate after <a href='//publiclab.org/wiki/spectral-workbench-calibration#Cross+section'>setting a new cross-section</a>."
    redirect_to spectrum_path(@spectrum)
  end

  # rotates the image and re-extracts it
  def rotate
    @spectrum = Spectrum.find params[:id]
    require_ownership(@spectrum)
    @spectrum.rotate
    @spectrum.extract_data
    @spectrum.clone_calibration(@spectrum.id)
    @spectrum.save
    redirect_to spectrum_path(@spectrum)
  end

  # Just reverses the image, not the data.
  def reverse
    @spectrum = Spectrum.find params[:id]
    require_ownership(@spectrum)
    @spectrum.reversed = !@spectrum.reversed
    @spectrum.toggle_tag('reversed', current_user.id)
    @spectrum.reverse
    @spectrum.save
    redirect_to spectrum_path(@spectrum)
  end

  # search for calibrations to clone from
  def clone_search
    @spectrum = Spectrum.find(params[:id])
    @calibrations = Spectrum.where(calibrated: true)
                            .where('id != ?',@spectrum.id)
                            .where('title LIKE ? OR notes LIKE ? OR author LIKE ?)',"%#{params[:q]}%", "%#{params[:q]}%","%#{params[:q]}%")
                            .limit(20)
                            .order("created_at DESC")
    render :partial => "spectrums/show/clone_results", :layout => false
  end

  def compare_search
    @spectrum = Spectrum.find(params[:id])
    @spectra = Spectrum.where(calibrated: true)
                            .where('id != ?',@spectrum.id)
                            .where('title LIKE ? OR notes LIKE ? OR author LIKE ?)',"%#{params[:q]}%", "%#{params[:q]}%","%#{params[:q]}%")
                            .limit(20)
                            .order("created_at DESC")
    render :partial => "spectrums/show/compare_search", :layout => false
  end

  def set_search
    @spectrum = Spectrum.find(params[:id])
    @user_sets = SpectraSet.where('author = ? AND (title LIKE ? OR notes LIKE ?)',current_user.login,"%#{params[:q]}%", "%#{params[:q]}%")
                           .limit(20)
                           .order('created_at DESC')
    @user_sets = current_user.sets if logged_in?
    render :partial => "spectrums/show/set_results", :layout => false
  end

end
