class SetsController < ApplicationController
  # create and update are protected by recaptcha

  def index
    @sets = SpectraSet.find(:all, :order => "created_at DESC")
    @comments = Comment.all :limit => 12, :order => "id DESC"
  end

  def show
    @set = SpectraSet.find params[:id]
    @spectrums = Spectrum.find(:all, :limit => 4, :order => "created_at DESC")
    @comment = Comment.new
  end

  def match
    @set = SpectraSet.find params[:id]
    if logged_in?
      @calibration = current_user.last_calibration
      @start_wavelength,@end_wavelength = @calibration.wavelength_range 
    end
    if mobile?
      render :template => "spectrums/capture.mobile.erb", :layout => "mobile" 
    else
      render :template => "spectrums/capture.html.erb"
    end
  end

  def find_match
    @spectrum = Spectrum.new_from_string(params[:data])
    @calibration = Spectrum.find params[:calibration]
    @set = SpectraSet.find params[:id]
    range = @calibration.wavelength_range
    @spectrum.scale_data(range[0],range[1])
    @match = Spectrum.find(@set.match(@spectrum))
    render :text => "Match found: <a href='/spectra/"+@match.id.to_s+"'>"+@match.title+"</a> |"
  end

  def embed
    @set = SpectraSet.find params[:id]
    render :layout => false 
  end

  def new
    if logged_in?
      @set = SpectraSet.new
      respond_to do |format|
        format.html # new.html.erb 
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
        :spectra_string => spectra.join(','),
        :author => current_user.login
      })
      if @set.save
        redirect_to :action => :show, :id => @set.id
      else
        flash[:error] = "Failed to save set."
        render :action => "new", :id => params[:id]
      end
    else
      flash[:error] = "You must be logged in to create a set."
      redirect_to "/login"
    end
  end

  def comment
    @set = SpectraSet.find(params[:id])
    @spectrums = Spectrum.find(:all, :limit => 4, :order => "created_at DESC")
    @jump_to_comment = true
    @comment = Comment.new({
	:spectra_set_id => @set.id,
	:body => params[:comment][:body],
	:author => params[:comment][:author],
	:email => params[:comment][:email]})
    @comment.author = current_user.login if logged_in?
    @comment.email = current_user.email if logged_in?
    if (logged_in? || verify_recaptcha(:model => @comment, :message => "ReCAPTCHA thinks you're not a human!")) && @comment.save
      flash[:notice] = "Comment saved."
      redirect_to "/sets/show/"+params[:id]+"#comment_"+@comment.id.to_s
    else
      render :action => "show", :id => params[:id]
    end
  end

end
