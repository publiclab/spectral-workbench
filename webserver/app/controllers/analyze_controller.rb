class AnalyzeController < ApplicationController

  def spectrum
    @spectrum = Spectrum.find(params[:id])
    @spectrums = Spectrum.find(:all, :limit => 4, :order => "created_at DESC", :conditions => ["id != ?",@spectrum.id])
    @comment = Comment.new
    render :layout => "bootstrap"
  end

end
