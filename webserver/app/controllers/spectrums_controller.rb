require 'will_paginate/array'
class SpectrumsController < ApplicationController
  protect_from_forgery :only => [:clone, :extract, :calibrate]
  # http://api.rubyonrails.org/classes/ActionController/RequestForgeryProtection/ClassMethods.html
  # create and update are protected by recaptcha

  # GET /spectrums
  # GET /spectrums.xml
  def index
    @spectrums = Spectrum.find(:all,:order => "created_at DESC", :conditions => ["author != 'anonymous'"])
    @spectrums = @spectrums.paginate :page => params[:page], :per_page => 24

    @anon_spectrums = Spectrum.find(:all,:order => "created_at DESC", :conditions => {:author => "anonymous"})
    @anon_spectrums = @anon_spectrums.paginate :page => params[:page], :per_page => 4
    @sets = SpectraSet.find(:all,:limit => 4,:order => "created_at DESC")
    @comments = Comment.all :limit => 12, :order => "id DESC"

    respond_to do |format|
      format.html { 
	if mobile?
          render :template => "spectrums/index.mobile.erb", :layout => "mobile" 
	else
	  render 'spectrums/index' 
	end
      } # show.html.erb
      format.xml  { render :xml => @spectrums }
    end
  end

  def anonymous
    @spectrums = Spectrum.find(:all,:order => "created_at DESC", :conditions => {:author => "anonymous"})
    @spectrums = @spectrums.paginate :page => params[:page], :per_page => 24
    render :template => "spectrums/search.html.erb"
  end

  # GET /spectrums/1
  # GET /spectrums/1.xml
  # GET /spectrums/1.json
  def show
    @spectrum = Spectrum.find(params[:id])
    # eventually move this to "create" once they're all fixed:
    @spectrum.correct_reversed_image
    if @spectrum.data == "" || @spectrum.data.nil?
      @spectrum.extract_data 
      @spectrum.save 
    end
    @comment = Comment.new

    @spectrums = Spectrum.find(:all, :limit => 4, :order => "created_at DESC", :conditions => ["id != ?",@spectrum.id])

    respond_to do |format|
      format.html { 
	if mobile?
          render :template => "spectrums/show.mobile.erb", :layout => "mobile" 
	else
	  render 'spectrums/show' 
	end
      } # show.html.erb
      format.xml  { render :xml => @spectrum }
      format.csv  { render :template => "spectrums/show.csv.erb" }
      format.json  { render :json => @spectrum }
    end
  end

  def analyze
    @spectrum = Spectrum.find(params[:id])
    @spectrums = Spectrum.find(:all, :limit => 4, :order => "created_at DESC", :conditions => ["id != ?",@spectrum.id])
    @comment = Comment.new
    render :layout => "bootstrap"
  end

  # non REST
  def embed
    @spectrum = Spectrum.find(params[:id])
    @width = (params[:width] || 500).to_i
    @height = (params[:height] || 300).to_i
    render :layout => false 
  end

  # non REST
  def author
    @spectrums = Spectrum.find_all_by_author(params[:id])
    @spectrums = @spectrums.paginate :page => params[:page], :per_page => 24
    render "spectrums/search"
  end

  # non REST
  def compare
    @spectrum = Spectrum.find(params[:id])
    @spectrums = Spectrum.find(:all, :conditions => ['id != ? AND (title LIKE ? OR notes LIKE ?)',@spectrum.id,"%"+params[:q]+"%", "%"+params[:q]+"%"],:limit => 20,:order => "created_at DESC")
    render :partial => "compare", :layout => false
  end

  # non REST
  def search
    params[:id] = params[:q].to_s if params[:id].nil?
    @spectrums = Spectrum.find(:all, :conditions => ['title LIKE ? OR notes LIKE ?',"%"+params[:id]+"%", "%"+params[:id]+"%"],:limit => 100, :order => "id DESC")
    @spectrums = @spectrums.paginate :page => params[:page], :per_page => 24
    render :partial => "capture/results.html.erb", :layout => false if params[:capture]
  end

  # non REST
  def recent
    @spectrums = Spectrum.find(:all, :limit => 10, :order => "id DESC")
    render :partial => "capture/results.html.erb", :layout => false if params[:capture]
  end

  # non REST
  def detail
    @spectrum = Spectrum.find(params[:id])

    respond_to do |format|
      format.html # details.html.erb
    end
  end

  # GET /spectrums/new
  # GET /spectrums/new.xml
  def new
    if logged_in?
    @spectrum = Spectrum.new

    respond_to do |format|
      format.html # new.html.erb 
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
  # ?spectrum[title]=TITLE&spectrum[author]=anonymous&client=VERSION&uniq_id=UNIQID&startWavelength=STARTW&endWavelength=ENDW;
  def create
    if params[:client] || logged_in?
      client = params[:client] || "0"
      uniq_id = params[:uniq_id] || "0"
      client_code = client+"::"+uniq_id
      puts client_code
      user_id = current_user.id if logged_in?
      user_id ||= "0"
      author = current_user.login if logged_in?
      author ||= "anonymous"

      if params[:photo]
        @spectrum = Spectrum.new({:title => params[:spectrum][:title],
				  :author => author,
				  :user_id => user_id,
				  :notes => params[:spectrum][:notes],
				  :photo => params[:photo]})
        @spectrum.client_code = client_code if params[:client] || params[:uniq_id]
      elsif params[:dataurl]
        @spectrum = Spectrum.new({:title => params[:spectrum][:title],
				  :author => author,
				  :notes => params[:spectrum][:notes],
				  :user_id => user_id})
	@spectrum.image_from_dataurl(params[:dataurl])
      else
        @spectrum = Spectrum.new({:title => params[:spectrum][:title],
				  :author => author,
				  :user_id => user_id,
				  :notes => params[:spectrum][:notes],
				  :photo => params[:spectrum][:photo]})
      end

      respond_to do |format|
        if (params[:client] || (APP_CONFIG["local"] || logged_in?)) && @spectrum.save!
          if (params[:client]) # java client
	    if params[:photo]
              @spectrum = Spectrum.find @spectrum.id
              @spectrum.extract_data
              @spectrum.scale_data(params[:endWavelength],params[:startWavelength]) if (params[:endWavelength] && params[:startWavelength])
              @spectrum.save!
            end
          if logged_in?
            format.html { render :text => @spectrum.id }
          else
            format.html { render :text => @spectrum.id.to_s+"?login=true&client_code="+client+"::"+uniq_id} # <== here, also offer a unique code or pass client_id so that we can persist login
          end
        else
          if params[:tags]
            @spectrum.tag(params[:tags],current_user.id)
          end
          if params[:spectrum][:calibration_id] && !params[:is_calibration] && params[:spectrum][:calibration_id] != "calibration"
            @spectrum.extract_data
            @spectrum.clone(params[:spectrum][:calibration_id]) 
          end
          if params[:geotag]
            @spectrum.lat = params[:lat]
            @spectrum.lon = params[:lon]
          end
          @spectrum.save!

          flash[:notice] = 'Spectrum was successfully created.'
          format.html { 
		redirect_to :action => :show, :id => @spectrum.id
	  }
          format.xml  { render :xml => @spectrum, :status => :created, :location => @spectrum }
        end
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @spectrum.errors, :status => :unprocessable_entity }
      end
    end
    else
      # possibly, we don't have to redirect - we could prompt for login at the moment of save...
      flash[:notice] = "You must first log in to upload spectra."
      redirect_to "/login"
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
    @spectrum.title = params[:spectrum][:title]
    @spectrum.notes = params[:spectrum][:notes]

    respond_to do |format|
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

    respond_to do |format|
      format.html { redirect_to(spectrums_url) }
      format.xml  { head :ok }
    end
    else
      flash[:error] = "You must be an admin to destroy comments."
      redirect_to "/login"
    end
  end

  def comment
    @spectrum = Spectrum.find(params[:id])
    @spectrums = Spectrum.find(:all, :limit => 4, :order => "created_at DESC", :conditions => ["id != ?",@spectrum.id])
    @jump_to_comment = true
    @comment = Comment.new({
	:spectrum_id => @spectrum.id,
	:body => params[:comment][:body],
	:author => params[:comment][:author],
	:email => params[:comment][:email]})
    @comment.author = current_user.login if logged_in?
    @comment.email = current_user.email if logged_in?
    if (logged_in? || APP_CONFIG["local"] || verify_recaptcha(:model => @comment, :message => "ReCAPTCHA thinks you're not a human!")) && @comment.save
      flash[:notice] = "Comment saved."
      redirect_to "/spectra/"+params[:id]+"#comment_"+@comment.id.to_s
    else
      render :action => "show", :id => params[:id]
    end
  end

  # non REST
  #def calibrate(x1,wavelength1,x2,wavelength2)
  def calibrate
    @spectrum = Spectrum.find(params[:id])
    if logged_in? && @spectrum.user_id == current_user.id
      if request.post?
        @spectrum.calibrate(params[:x1],params[:w1],params[:x2],params[:w2]).save
        @spectrum.save
        tag = @spectrum.tag('calibration',current_user.id)
      end
      redirect_to "/spectra/show/"+@spectrum.id.to_s
    else
      flash[:error] = "You must be logged in and own this spectrum to calibrate."
      redirect_back
    end
  end

  # non REST
  def extract
    @spectrum = Spectrum.find(params[:id])
    if logged_in? && @spectrum.user_id == current_user.id
    if request.post?
      @spectrum.extract_data
      @spectrum.save
    end
    redirect_to "/spectra/show/"+@spectrum.id.to_s
    else
      flash[:error] = "You must be logged in and own this spectrum to re-extract values."
      redirect_back
    end
  end

  # non REST
  def clone
    @spectrum = Spectrum.find(params[:id])
    if logged_in? && @spectrum.user_id == current_user.id
    if request.post?
      @spectrum.clone(params[:clone_id])
      @spectrum.save
    end
    redirect_to "/spectra/show/"+@spectrum.id.to_s
    else
      flash[:error] = "You must be logged in and own this spectrum to clone calibrations."
      redirect_to "/login"
    end
  end

  def all
    @spectrums = Spectrum.find(:all)
    respond_to do |format|
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
    render :layout => false
    response.headers["Content-Type"] = "application/xml; charset=utf-8"
  end

  def plots_rss
    @spectrums = Spectrum.find(:all,:order => "created_at DESC",:limit => 12, :conditions => ["author != ?","anonymous"])
    render :layout => false
    response.headers["Content-Type"] = "application/xml; charset=utf-8"
  end

  def capture
    if logged_in?
      @calibration = current_user.last_calibration
      @calibration = Spectrum.find(params[:calibration_id]) if params[:calibration_id]
      @start_wavelength,@end_wavelength = @calibration.wavelength_range 
    end
    if params[:old]
      render :template => "spectrums/capture-old.html.erb"
    elsif mobile?
      render :template => "spectrums/capture.mobile.erb", :layout => "mobile"
    else
      render :template => "spectrums/capture.html.erb", :layout => "capture"
    end
  end

  def match
    @spectrum = Spectrum.find params[:id]
    render :text => @spectrum.find_match_in_set(params[:set]).to_json
  end

  def setsamplerow
    @spectrum = Spectrum.find params[:id]
    if logged_in? && (@spectrum.user_id == current_user.id || current_user.role == "admin")
      @spectrum.sample_row = params[:row].to_i
      @spectrum.extract_data
      @spectrum.save
    else
      flash[:error] = "You must be logged in and own this spectrum to set the sample row."
    end
    redirect_to "/spectra/show/"+@spectrum.id.to_s
  end

  def print
    @spectrum = Spectrum.find params[:id]
    render :layout => false
  end

end
