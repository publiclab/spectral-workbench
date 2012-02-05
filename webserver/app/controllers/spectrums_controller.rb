class SpectrumsController < ApplicationController
  # GET /spectrums
  # GET /spectrums.xml
  def index
    @spectrums = Spectrum.find(:all,:order => "created_at DESC")
    @sets = SpectraSet.find(:all,:limit => 4,:order => "created_at DESC")
    @comments = Comment.all :limit => 12, :order => "id DESC"

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @spectrums }
    end
  end

  # GET /spectrums/1
  # GET /spectrums/1.xml
  # GET /spectrums/1.json
  def show
    @spectrum = Spectrum.find(params[:id])
    if @spectrum.data == "" || @spectrum.data.nil?
      @spectrum.extract_data 
      @spectrum.save 
    end
    @comment = Comment.new

    @spectrums = Spectrum.find(:all, :limit => 4, :order => "created_at DESC", :conditions => ["id != ?",@spectrum.id])

    respond_to do |format|
      format.html { render 'spectrums/show' } # show.html.erb
      format.xml  { render :xml => @spectrum }
      format.json  { render :json => @spectrum }
    end
  end

  # non REST
  def embed
    @spectrum = Spectrum.find(params[:id])
    render :layout => false 
  end

  # non REST
  def author
    @spectrums = Spectrum.find_all_by_author(params[:id])
    render "spectrums/search"
  end

  # non REST
  def compare
    @spectrum = Spectrum.find(params[:id])
    @spectrums = Spectrum.find(:all, :conditions => ['id != ? AND (title LIKE ? OR notes LIKE ?)',@spectrum.id,"%"+params[:q]+"%", "%"+params[:q]+"%"],:limit => 100,:order => "created_at DESC")
    render :partial => "compare", :layout => false
  end

  # non REST
  def search
    params[:id] = params[:q]
    @spectrums = Spectrum.find(:all, :conditions => ['title LIKE ? OR notes LIKE ?',"%"+params[:id]+"%", "%"+params[:id]+"%"],:limit => 100)
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
    @spectrum = Spectrum.new

    respond_to do |format|
      format.html # new.html.erb 
      format.xml  { render :xml => @spectrum }
    end
  end

  # GET /spectrums/1/edit
  def edit
    @spectrum = Spectrum.find(params[:id])
  end

  # POST /spectrums
  # POST /spectrums.xml
  # ?spectrum[title]=TITLE&spectrum[author]=anonymous&client=VERSION&uniq_id=UNIQID&startWavelength=STARTW&endWavelength=ENDW;
  def create
    client_code = params[:client]+"::"+params[:uniq_id]
    puts client_code

    if params[:photo]
      @spectrum = Spectrum.new({:title => params[:spectrum][:title],
				:author => params[:spectrum][:author],
				:photo => params[:photo]})
      @spectrum.client_code = client_code if params[:client] || params[:uniq_id]

      @spectrum.extract_data
      @spectrum.scale_data(params[:endWavelength],params[:startWavelength])

    else
      @spectrum = Spectrum.new(params[:spectrum])
    end

    respond_to do |format|
      if (params[:client] == "0.5" || verify_recaptcha(:model => @spectrum, :message => "ReCAPTCHA thinks you're not a human!")) && @spectrum.save
        if (params[:client]) # java client
          format.html { render :text => @spectrum.id }
        else
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
  end

  # PUT /spectrums/1
  # PUT /spectrums/1.xml
  def update
    @spectrum = Spectrum.find(params[:id])

    respond_to do |format|
      if verify_recaptcha(:model => @spectrum, :message => "ReCAPTCHA thinks you're not a human!") && @spectrum.update_attributes(params[:spectrum])
        flash[:notice] = 'Spectrum was successfully updated.'
        format.html { redirect_to(@spectrum) }
        format.xml  { head :ok }
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
    @spectrum.destroy

    respond_to do |format|
      format.html { redirect_to(spectrums_url) }
      format.xml  { head :ok }
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
    if verify_recaptcha(:model => @comment, :message => "ReCAPTCHA thinks you're not a human!") && @comment.save
      redirect_to "/spectra/"+params[:id]
    else
      render :action => "show", :id => params[:id]
    end
  end

  #def calibrate(x1,wavelength1,x2,wavelength2)
  def calibrate
    #auth_token
    @spectrum = Spectrum.find(params[:id])
    @spectrum.calibrate(params[:x1],params[:w1],params[:x2],params[:w2]).save
    @spectrum.save
    redirect_to "/spectra/show/"+@spectrum.id.to_s
  end

  def extract
    #auth_token
    @spectrum = Spectrum.find(params[:id])
    @spectrum.extract_data
    @spectrum.save
    redirect_to "/spectra/show/"+@spectrum.id.to_s
  end

  def clone
    #auth_token
    @spectrum = Spectrum.find(params[:id])
    @spectrum.clone(params[:clone_id])
    @spectrum.save
    redirect_to "/spectra/show/"+@spectrum.id.to_s
  end

end
