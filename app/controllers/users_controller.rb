class UsersController < ApplicationController

  before_filter :require_login, :except => [:show, :contributors]

  def message
    @user = User.find params[:user_id]
    UserMailer.direct_message(@user,current_user,params[:title],params[:body])
    flash[:notice] = "Sent successfully."
    redirect_to "/dashboard"
  end

  def dashboard
    @offline = "flush"
    @spectrums = Spectrum.paginate(:order => "created_at DESC", :conditions => ["author != 'anonymous'"], :page => params[:spectrums_page], :per_page => 50)
    @sets = SpectraSet.paginate(:page => params[:sets_page], :order => "created_at DESC", :per_page => 25)
    @comments = Comment.paginate(:page => params[:comments_page], :order => "created_at DESC", :per_page => 40)
    @users = User.paginate(:page => params[:users_page], :order => "created_at DESC", :per_page => 100)
    @tags = Tag.paginate(:page => params[:tags_page], :order => "created_at DESC", :per_page => 100)
  end

  def contributors
    @users = User.order("id DESC").paginate(:page => params[:page])
  end

  # for dashboard
  def comments
    @comments = current_user.received_comments
    @comments = @comments.paginate :page => params[:page], :per_page => 25
  end

  def show
    @user = User.find_by_login(params[:id])
    @spectrums = @user.spectrums.order("created_at DESC").paginate(:page => params[:page])
    @sets = @user.sets.order("created_at DESC").paginate(:page => params[:set_page], :per_page => 2)
  end

  ##### Admin only: #####

  def delete
    if current_user.role == "admin"
      @user = User.find(params[:id])
      @user.delete
      flash[:notice] = "User "+@user.name+" deleted."
      redirect_to "/"
    else
      flash[:error] = "You must be an admin to delete users."
      redirect_to "/login"
    end
  end

  def index
    if current_user.role == "admin"
      @users = User.find :all
    else
      flash[:error] = "You must be an admin to view the users listing."
      redirect_to "/login"
    end
  end

end
