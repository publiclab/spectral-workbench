class SpectrumsController < ApplicationController
  # GET /spectrums
  # GET /spectrums.xml
  def index
    @spectrums = Spectrum.all.reverse
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
    @comment = Comment.new

    respond_to do |format|
      format.html { render 'spectrums/show' } # show.html.erb
      format.xml  { render :xml => @spectrum }
      format.json  { render :json => @spectrum }
    end
  end

  # non REST
  def author
    @spectrums = Spectrum.find_all_by_author(params[:id])
    render "spectrums/search"
  end

  # non REST
  def search
    params[:id] = params[:q]
    @spectrums = Spectrum.find(:all, :conditions => ['name LIKE ? OR location LIKE ? OR description LIKE ?',"%"+params[:id]+"%", "%"+params[:id]+"%", "%"+params[:id]+"%"],:limit => 100)
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
  def create
    @spectrum = Spectrum.new({:title => params[:spectrum][:title],
				:author => params[:spectrum][:author],
				:photo => params[:photo]})

    respond_to do |format|
      if (params[:client] == "0.5" || verify_recaptcha(:model => @spectrum, :message => "ReCAPTCHA thinks you're not a human!")) && @spectrum.save
        if (params[:client]) # java client
          format.html { render :text => @spectrum.id }
        else
          flash[:notice] = 'Spectrum was successfully created.'
          format.html { redirect_to(@spectrum) }
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
end
