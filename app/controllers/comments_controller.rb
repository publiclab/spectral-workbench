class CommentsController < ApplicationController

  before_filter :require_login, :only => [:spectrum, :spectra_set, :delete]

  def index
    @comments = Comment.find :all, :order => "id DESC"
  end

  def spectrum
    @spectrum = Spectrum.find(params[:id])
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

      respond_to do |format|
        format.html {
          flash[:notice] = "Comment saved."
          redirect_to spectrum_path(@spectrum)+"#c"+@comment.id.to_s
        }
        format.json  {
          @comment.body = RDiscount.new(@comment.body).to_html
          render :json => @comment
        }
      end

    else
      flash[:error] == "There was an error creating your comment."
      redirect_to spectrum_path(@spectrum)
    end
  end

  def spectraset
    @set = SpectraSet.find(params[:id])
    @comment = Comment.new({
	spectra_set_id: @set.id,
	body:           params[:comment][:body],
	user_id:        current_user.id,
	email:          current_user.email})
    if @comment.save
      UserMailer.set_comment_notification(@set,@comment,User.find(@set.user_id)) if (!logged_in? || current_user.id != @set.user_id)
      @set.notify_commenters(@comment,current_user) if logged_in?
      @set.notify_commenters(@comment,false) unless logged_in?

      respond_to do |format|
        format.html {
          flash[:notice] == "Comment saved."
          redirect_to sets_path(@set)+"#c"+@comment.id.to_s
        }
        format.json  {
          @comment.body = RDiscount.new(@comment.body).to_html
          render :json => @comment
        }
      end
    else
      flash[:error] == "There was an error creating your comment."
      render :action => "show", :id => params[:id]
    end
  end

  def delete
    @comment = Comment.find(params[:id])
    if @comment.can_delete(current_user) || params[:password].to_i == APP_CONFIG["password"]
      @comment.destroy
      flash[:notice] = "Comment deleted."
    end

    if params[:index]
      redirect_to "/comments"
    elsif @comment.has_spectrum?
      redirect_to "/spectrums/#{@comment.spectrum_id}"
    else
      redirect_to "/sets/#{@comment.spectra_set_id}"
    end
    
  end

end
