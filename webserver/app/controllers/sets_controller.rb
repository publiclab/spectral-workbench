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

  def new
    @set = SpectraSet.new

    respond_to do |format|
      format.html # new.html.erb 
      format.xml  { render :xml => @set }
    end
  end

  def create
    spectra = []
    params[:id].split(',').each do |s|
      if (spectrum = Spectrum.find(s))
        spectra << spectrum.id
      end
    end
    @set = SpectraSet.new(params[:spectra_set])
    @set.spectra_string = spectra.join(',')
    if verify_recaptcha(:model => @set, :message => "ReCAPTCHA thinks you're not a human!") && @set.save
      redirect_to :action => :show, :id => @set.id
    else
      render :action => "new", :id => params[:id]
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
    if verify_recaptcha(:model => @comment, :message => "ReCAPTCHA thinks you're not a human!") && @comment.save
      redirect_to "/sets/show/"+params[:id]
    else
      render :action => "show", :id => params[:id]
    end
  end

end
