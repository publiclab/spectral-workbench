require 'will_paginate/array'
class SpectrumsController < ApplicationController
  respond_to :html, :xml, :js, :csv
  protect_from_forgery :only => [:clone, :extract, :calibrate, :save]
  # http://api.rubyonrails.org/classes/ActionController/RequestForgeryProtection/ClassMethods.html

  def stats
  end

  # GET /spectrums
  # GET /spectrums.xml
  def index
    if logged_in?
      redirect_to "/dashboard"
    else
      @spectrums = Spectrum.paginate(:order => "created_at DESC", :conditions => ["author != 'anonymous'"], :page => params[:page])

#      @anon_spectrums = Spectrum.find(:all,:order => "created_at DESC", :conditions => {:author => "anonymous"})
#      @anon_spectrums = @anon_spectrums.paginate :page => params[:page], :per_page => 4
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

  def show
    @spectrum = Spectrum.find(params[:id])
    if @spectrum.data == "" || @spectrum.data.nil?
      @spectrum.extract_data
      @spectrum.save
    end
    if logged_in?
      @spectra = Spectrum.find(:all, :limit => 12, :order => "created_at DESC", :conditions => ["id != ? AND author = ?",@spectrum.id,current_user.login])
    else
      @spectra = Spectrum.find(:all, :limit => 12, :order => "created_at DESC", :conditions => ["id != ?",@spectrum.id])
    end
    @sets = @spectrum.sets
    @user_sets = current_user.sets if logged_in?
    @macros = Macro.find :all, :conditions => {:macro_type => "analyze"}
    @calibrations = current_user.calibrations if logged_in?
    @comment = Comment.new
    #respond_with(@spectrum) do |format|
    respond_with(@spectrum) do |format|
      format.html {}
      format.xml  { render :xml => @spectrum }
      format.csv  {
        if params[:raw]
          render :template => "spectrums/raw.csv.erb"
        else
          render :template => "spectrums/show.csv.erb" # formatted for SpectraOnline.com
        end
      }
      format.json  {
        render :json => @spectrum
      }
    end
  end

  def anonymous
    @spectrums = Spectrum.paginate(:order => "created_at DESC", :conditions => {:author => "anonymous"}, :page => params[:page])
    render :template => "spectrums/search"
  end

  # non REST
  def embed
    @spectrum = Spectrum.find(params[:id])
    @width = (params[:width] || 500).to_i
    @height = (params[:height] || 300).to_i
    render :layout => false
  end

  # non REST
  def search
    params[:id] = params[:q].to_s if params[:id].nil?
    @spectrums = Spectrum.where('title LIKE ? OR notes LIKE ?',"%"+params[:id]+"%", "%"+params[:id]+"%").order("id DESC").paginate(:page => params[:page], :per_page => 24)
    if params[:capture]
      render :partial => "capture/results", :layout => false
    else
      @sets = SpectraSet.where('title LIKE ? OR notes LIKE ?',"%"+params[:id]+"%", "%"+params[:id]+"%").order("id DESC").paginate(:page => params[:set_page])
    end
  end

  # non REST
  def recent
    @spectrums = Spectrum.find(:all, :limit => 10, :order => "id DESC")
    render :partial => "capture/results", :layout => false if params[:capture]
  end

  # non REST
  def detail
    @spectrum = Spectrum.find(params[:id])

    respond_with(@spectrum) do |format|
      format.html # details.html.erb
    end
  end

  # GET /spectrums/new
  # GET /spectrums/new.xml
  def new
    if logged_in?
    @spectrum = Spectrum.new

    respond_with(@spectrum) do |format|
      format.html {}
      format.xml  { render :xml => @spectrum }
    end
    else
      flash[:error] = "You must be logged in to upload a new spectrum."
      redirect_to "/login"
    end
  end

  # GET /spectrums/1/edit
  def edit
    @spectrum = Spectrum.find(params[:id])
    if (params[:login] && params[:client_code]) || (logged_in? && (@spectrum.author == "anonymous" || @spectrum.user_id == current_user.id || current_user.role == "admin"))
    else
      flash[:error] = "You must be logged in and own this spectrum to edit."
      redirect_to "/login"
    end
  end

  # POST /spectrums
  # POST /spectrums.xml
  # ?spectrum[title]=TITLE&spectrum[author]=anonymous&startWavelength=STARTW&endWavelength=ENDW;
  # replacing this with capture/save
  def create
    if logged_in?
      client = params[:client] || "0"
      uniq_id = params[:uniq_id] || "0"
      client_code = client+"::"+uniq_id
      user_id = current_user.id if logged_in?
      user_id ||= "0"
      author = current_user.login if logged_in?
      author ||= "anonymous"

      if params[:dataurl] # mediastream webclient
        @spectrum = Spectrum.new({:title => params[:spectrum][:title],
          :author => author,
          :video_row => params[:spectrum][:video_row],
          :notes => params[:spectrum][:notes]})
        @spectrum.user_id = user_id
        @spectrum.image_from_dataurl(params[:dataurl])
      else # upload form at /upload
        @spectrum = Spectrum.new({:title => params[:spectrum][:title],
          :author => author,
          :user_id => user_id,
          :notes => params[:spectrum][:notes],
          :photo => params[:spectrum][:photo]})
      end

      if @spectrum.save
        respond_with(@spectrum) do |format|
          if (APP_CONFIG["local"] || logged_in?)
            if mobile? || ios?
              @spectrum.save
              @spectrum = Spectrum.find @spectrum.id
              @spectrum.rotate if params[:vertical] == "on"
              @spectrum.sample_row = @spectrum.find_brightest_row
              #@spectrum.tag("mobile",current_user.id)
            end
            @spectrum.tag("iOS",current_user.id) if ios?
            @spectrum.tag(params[:tags],current_user.id) if params[:tags]
            @spectrum.tag("upload",current_user.id) if params[:upload]
            @spectrum.tag(params[:device],current_user.id) if params[:device] && params[:device] != "none"
            if params[:spectrum][:calibration_id] && !params[:is_calibration] && params[:spectrum][:calibration_id] != "calibration" && params[:spectrum][:calibration_id] != "undefined"
              @spectrum.extract_data
              @spectrum.clone(params[:spectrum][:calibration_id])
            end
            if params[:geotag]
              @spectrum.lat = params[:lat]
              @spectrum.lon = params[:lon]
            end
            @spectrum.reversed = true if params[:spectrum][:reversed] == "true"
            if @spectrum.save!
              flash[:notice] = 'Spectrum was successfully created.'
              format.html {
                redirect_to spectrum_path(@spectrum)
              }
              format.xml  { render :xml => @spectrum, :status => :created, :location => @spectrum }
            else
              render "spectrums/new-errors"
            end
          else
            format.html { render :action => "new" }
            format.xml  { render :xml => @spectrum.errors, :status => :unprocessable_entity }
          end
        end
      else
        render "spectrums/new-errors"
      end
    else
      # possibly, we don't have to redirect - we could prompt for login at the moment of save...
      flash[:notice] = "You must first log in to upload spectra."
      redirect_to "/login"
    end
  end

  # used to upload numerical spectrum data
  def upload
    if logged_in?
      @spectrum = Spectrum.new({:title => params[:spectrum][:title],
        :author => author,
        :user_id => user_id,
        :notes => params[:spectrum][:notes],
        :data => params[:data],
        :photo => params[:photo]})
      if @spectrum.save!
        @spectrum.tag(params[:tags],current_user.id) if params[:tags]
        redirect_to spectrum_path(@spectrum)
      else
        flash[:error] = "There was a problem uploading."
        redirect_to "/spectrum/upload/"
      end
    else
      render :text => "You must be logged in and own the spectrum to edit it."
    end
  end

  # only ajax/POST accessible for now:
  def save
    @spectrum = Spectrum.find(params[:id])
    if logged_in? && (@spectrum.user_id == current_user.id || current_user.role == "admin")
      @spectrum.data = params[:data]
      @spectrum.tag(params[:tags],current_user.id) if params[:tags]
      render :text => @spectrum.save
    else
      render :text => "You must be logged in and own the spectrum to edit it."
    end
  end

  # PUT /spectrums/1
  # PUT /spectrums/1.xml
  def update
    @spectrum = Spectrum.find(params[:id])
    if logged_in? && (@spectrum.user_id == current_user.id || @spectrum.author == "anonymous")#(current_user.role == "admin")
      if @spectrum.author == "anonymous"
        @spectrum.author = current_user.login
        @spectrum.user_id = current_user.id
      end
      @spectrum.title = params[:spectrum][:title] unless params[:spectrum][:title].nil?
      @spectrum.notes = params[:spectrum][:notes] unless params[:spectrum][:notes].nil?

      respond_with(@spectrum) do |format|
        if @spectrum.save
          flash[:notice] = 'Spectrum was successfully updated.'
          format.html { redirect_to(@spectrum) }
          format.xml  { head :ok }
        else
          format.html { render :action => "edit" }
          format.xml  { render :xml => @spectrum.errors, :status => :unprocessable_entity }
        end
      end
    else
      flash[:error] = "You must be logged in to edit a spectrum."
      redirect_to "/login"
    end
  end

  # DELETE /spectrums/1
  # DELETE /spectrums/1.xml
  def destroy
    @spectrum = Spectrum.find(params[:id])
    if logged_in? && (current_user.role == "admin" || current_user.id == @spectrum.user_id)
      @spectrum.destroy
      flash[:notice] = "Spectrum deleted."

      respond_with(@spectrum) do |format|
        format.html { redirect_to('/') }
        format.xml  { head :ok }
      end
    else
      flash[:error] = "You must be an admin to destroy comments."
      redirect_to "/login"
    end
  end

  # non REST
  #def calibrate(x1,wavelength1,x2,wavelength2)
  def calibrate
    @spectrum = Spectrum.find(params[:id])
    if logged_in? && @spectrum.user_id == current_user.id || current_user.role == "admin"
      if true#request.post?
        @spectrum.calibrate(params[:x1],params[:w1],params[:x2],params[:w2])
        @spectrum.save
        tag = @spectrum.tag('calibration',current_user.id)
      end
      flash[:notice] = "Great, calibrated! <b>Next steps:</b> sign up on <a href='http://publiclab.org/wiki/spectrometer'>the mailing list</a>, or browse/contribute to <a href='http://publiclab.org'>Public Lab website</a>"
      redirect_to spectrum_path(@spectrum)
    else
      flash[:error] = "You must be logged in and own this spectrum to calibrate."
      redirect_to spectrum_path(@spectrum)
    end
  end

  # non REST
  def extract
    @spectrum = Spectrum.find(params[:id])
    if logged_in? && @spectrum.user_id == current_user.id || current_user.role == "admin"
    if request.post?
      @spectrum.extract_data
      @spectrum.save
    end
    redirect_to spectrum_path(@spectrum)
    else
      flash[:error] = "You must be logged in and own this spectrum to re-extract values."
      redirect_to spectrum_path(@spectrum)
    end
  end

  # non REST
  def clone
    @spectrum = Spectrum.find(params[:id])
    if logged_in? && @spectrum.user_id == current_user.id || current_user.role == "admin"
      if request.post?
        @spectrum.clone(params[:clone_id])
        @spectrum.save
      end
      redirect_to spectrum_path(@spectrum)
    else
      flash[:error] = "You must be logged in and own this spectrum to clone calibrations."
      redirect_to "/login"
    end
  end

  def all
    @spectrums = Spectrum.find(:all)
    respond_with(@spectrums) do |format|
      format.xml  { render :xml => @spectrums }
      format.json  { render :json => @spectrums }
    end
  end

  def assign
    if current_user.role == "admin"
      if params[:claim] == "true"
        # assign each spectrum the current user's id
        @user = User.find_by_login(params[:id])
        @spectrums = Spectrum.find_all_by_author(params[:author])
        @spectrums.each do |spectrum|
          spectrum.user_id = @user.id
          spectrum.author = @user.login
          spectrum.save
        end
        flash[:notice] = "Assigned "+@spectrums.length.to_s+" spectra to "+@user.login
        redirect_to "/"
      else
        @spectrums = Spectrum.find_all_by_author(params[:author])
      end
    else
      flash[:error] = "You must be logged in and be an admin to assign spectra."
      redirect_to "/login"
    end
  end

  def rss
    if params[:author]
      @spectrums = Spectrum.find_all_by_author(params[:author],:order => "created_at DESC",:limit => 12)
    else
      @spectrums = Spectrum.find(:all,:order => "created_at DESC",:limit => 12)
    end
    respond_to do |format|
      format.xml
    end
    #render :layout => false
    #response.headers["Content-Type"] = "application/xml; charset=utf-8"
  end

  def plots_rss
    @spectrums = Spectrum.find(:all,:order => "created_at DESC",:limit => 12, :conditions => ["author != ?","anonymous"])
    render :layout => false
    response.headers["Content-Type"] = "application/xml; charset=utf-8"
  end

  def match
    @spectrum = Spectrum.find params[:id]
    render :text => @spectrum.find_match_in_set(params[:set]).to_json
  end

  def setsamplerow
    require 'rubygems'
    require 'RMagick'
    @spectrum = Spectrum.find params[:id]
    if logged_in? && (@spectrum.user_id == current_user.id || current_user.role == "admin")
      image = Magick::ImageList.new("public"+(@spectrum.photo.url.split('?')[0]).gsub('%20',' '))
      @spectrum.sample_row = (params[:row].to_f*image.rows)
      @spectrum.extract_data
      @spectrum.save
    else
      flash[:error] = "You must be logged in and own this spectrum to set the sample row."
    end
    redirect_to spectrum_path(@spectrum)
  end

  def find_brightest_row
    @spectrum = Spectrum.find params[:id]
    if logged_in? && (@spectrum.user_id == current_user.id || current_user.role == "admin")
      @spectrum.sample_row = @spectrum.find_brightest_row
      @spectrum.extract_data
      @spectrum.clone(@spectrum.id) # recover calibration
      @spectrum.save
    else
      flash[:error] = "You must be logged in and own this spectrum to do this."
    end
    redirect_to spectrum_path(@spectrum)
  end

  def rotate
    @spectrum = Spectrum.find params[:id]
    if logged_in? && (@spectrum.user_id == current_user.id || current_user.role == "admin")
      @spectrum.rotate
      @spectrum.extract_data
      @spectrum.clone(@spectrum.id)
      @spectrum.save
    else
      flash[:error] = "You must be logged in and own this spectrum to do this."
    end
    redirect_to spectrum_path(@spectrum)
  end

  # Just reverses the image, not the data.
  def reverse
    @spectrum = Spectrum.find params[:id]
    if logged_in? && (@spectrum.user_id == current_user.id || current_user.role == "admin")
      @spectrum.reverse
      @spectrum.save
    else
      flash[:error] = "You must be logged in and own this spectrum to do this."
    end
    redirect_to spectrum_path(@spectrum)
  end

  def clone_search
    @spectrum = Spectrum.find(params[:id])
    @calibrations = Spectrum.find(:all, :conditions => ['id != ? AND (title LIKE ? OR notes LIKE ? OR author LIKE ?)',@spectrum.id,"%#{params[:q]}%", "%#{params[:q]}%","%#{params[:q]}%"],:limit => 20,:order => "created_at DESC")
    render :partial => "spectrums/show/clone_results", :layout => false
  end

  def compare_search
    @spectrum = Spectrum.find(params[:id])
    @spectra = Spectrum.find(:all, :conditions => ['id != ? AND (title LIKE ? OR notes LIKE ? OR author LIKE ?)',@spectrum.id,"%"+params[:q]+"%", "%"+params[:q]+"%","%"+params[:q]+"%"],:limit => 20,:order => "created_at DESC")
    render :partial => "spectrums/show/compare_search", :layout => false
  end

  def set_search
    @spectrum = Spectrum.find(params[:id])
    @user_sets = SpectraSet.find(:all, :conditions => ['author = ? AND (title LIKE ? OR notes LIKE ?)',current_user.login,"%#{params[:q]}%", "%#{params[:q]}%"],:limit => 20,:order => "created_at DESC")
    render :partial => "spectrums/show/set_results", :layout => false
  end

end
