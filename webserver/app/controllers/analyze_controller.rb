class AnalyzeController < ApplicationController

  def spectrum
    @spectrum = Spectrum.find(params[:id])
    if @spectrum.data == "" || @spectrum.data.nil?
      @spectrum.extract_data 
      @spectrum.save 
    end
    @spectra = Spectrum.find(:all, :limit => 12, :order => "created_at DESC", :conditions => ["id != ?",@spectrum.id])
    @sets = @spectrum.sets
    @calibrations = current_user.calibrations if logged_in?
    @comment = Comment.new
    respond_to do |format|
      format.html { render :layout => "bootstrap" }
      format.xml  { render :xml => @spectrum }
      format.csv  { 
        if params[:raw]
          render :template => "spectrums/raw.csv.erb" 
        else
          render :template => "spectrums/show.csv.erb" # formatted for SpectraOnline.com 
        end
      }
      format.json  { render :json => @spectrum }
    end
  end

end
