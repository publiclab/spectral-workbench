class TagController < ApplicationController

  def create
    if logged_in?
      @tag = Tag.new({
        :name => params[:tag][:name],
        :spectrum_id => params[:tag][:spectrum_id],
        :user_id => current_user.id
      })
      @tag.save
      flash[:notice] = "Tag added."
      redirect_to "/spectra/show/"+@tag.spectrum_id.to_s
    else
      flash[:error] = "You must be logged in to add tags."
      redirect_to "/login"
    end
  end

  def show
    @tag = Tag.find_by_name params[:id]
    @spectrums = @tag.spectra
    @spectrums = @spectrums.paginate :page => params[:page], :per_page => 24
    @comments = Comment.all :limit => 12, :order => "id DESC"
  end

  def delete
    @tag = Tag.find(params[:id])
    if logged_in? && (@tag.user_id == current_user.id || current_user.role == "admin")
      @tag.delete
      flash[:notice] = "Tag "+@tag.name+" deleted."
      redirect_to "/spectra/show/"+@tag.spectrum_id
    else
      flash[:error] = "You must be logged in to delete tags."
      redirect_to "/login"
    end
  end

end
