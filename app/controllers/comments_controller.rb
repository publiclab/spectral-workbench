class CommentsController < ApplicationController

  def index
    @comments = Comment.find :all, :order => "id DESC"
  end

  def create
    @spectrum = Spectrum.find(params[:spectrum_id])
    @spectrums = Spectrum.find(:all, :limit => 4, :order => "created_at DESC", :conditions => ["id != ?",@spectrum.id])
    @jump_to_comment = true
    @comment = @spectrum.comments.new({
	    :body => params[:comment][:body],
	    :author => params[:comment][:author],
	    :email => params[:comment][:email]
    })
    @comment.author = current_user.login if logged_in?
    @comment.email = current_user.email if logged_in?
    if (logged_in? || APP_CONFIG["local"]) && @comment.save
      UserMailer.comment_notification(@spectrum,@comment,User.find(@spectrum.user_id)) if (!logged_in? || current_user.id != @spectrum.user_id)
      @spectrum.notify_commenters(@comment,current_user) if logged_in?
      @spectrum.notify_commenters(@comment,false) unless logged_in?
      respond_to do |format|
        format.html {
          flash[:notice] = "Comment saved."
          redirect_to spectrum_path(params[:spectrum_id])
        }
        format.json  {
          @comment.body = RDiscount.new(@comment.body).to_html
          render :json => @comment
        }
      end
    else
      redirect_to spectrum_path(params[:spectrum_id])
    end
  end

  def delete
    @comment = Comment.find(params[:id])
    if @comment.can_delete(current_user) || params[:password].to_i == APP_CONFIG["password"]
      @comment.destroy
      flash[:notice] = "Comment deleted."
    end
    redirect_to "/spectra/show/"+@comment.spectrum_id.to_s if params[:index] != "true"
    redirect_to "/comments" if params[:index] == "true"
  end

end
