class CommentsController < ApplicationController

  def create
    @spectrum = Spectrum.find(params[:id])
    @comment = Comment.new({
	:spectrum_id => @spectrum.id,
	:body => params[:comment][:body],
	:author => params[:comment][:author],
	:email => params[:comment][:email]})
    @comment.save
    redirect_to "/spectra/"+params[:id]
  end

end
