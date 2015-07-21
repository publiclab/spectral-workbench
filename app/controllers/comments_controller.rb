class CommentsController < ApplicationController

  before_filter :require_login, :only => [:create, :delete]

  def index
    @comments = Comment.find :all, :order => "id DESC"
  end

  def create
    @spectrum = Spectrum.find(params[:spectrum_id])
    @spectrums = Spectrum.find(:all, :limit => 4, :order => "created_at DESC", :conditions => ["id != ?",@spectrum.id])
    @jump_to_comment = true
    @comment = @spectrum.comments.new({
	    :body => params[:comment][:body],
	    :user_id => current_user.id
    })

    if @comment.save
      UserMailer.comment_notification( @spectrum,
                                       @comment,
                                       User.find(@spectrum.user_id)
      ) if current_user.id != @spectrum.user_id
      @spectrum.notify_commenters(@comment,current_user)

      flash[:notice] == "Your comment was saved." unless params[:format] == 'json'

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
      flash[:error] == "There was an error creating your comment."
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
