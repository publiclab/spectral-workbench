class UsersController < ApplicationController

  def message
    @user = User.find params[:user_id]
    if logged_in? && @user
      UserMailer.deliver_direct_message(@user,current_user,params[:title],params[:body])
      flash[:notice] = "Sent successfully."
      redirect_to "/dashboard"
    else
      flash[:error] = "You must be logged in to message users."
      redirect_to "/login"
    end
  end

  def dashboard
    @offline = "flush"
    if logged_in?
      @spectrums = Spectrum.paginate(:order => "created_at DESC", :conditions => ["author != 'anonymous'"], :page => params[:spectrums_page], :per_page => 100)
      @sets = SpectraSet.paginate(:page => params[:sets_page], :limit => 3,:order => "created_at DESC")
      @comments = Comment.paginate(:page => params[:comments_page], :limit => 12,:order => "created_at DESC")
    else
      flash[:error] = "You must be logged in to view your dashboard."
      redirect_to "/login"
    end
  end

  # render new.rhtml
  def new
    @user = User.new
  end

  def contributors
    @users = User.find :all, :order => "id DESC", :limit => 50
  end

  def list
    if (logged_in? && current_user.role == "admin")
      @users = User.find :all
    else
      flash[:error] = "You must be logged in and an admin to view the users listing."
      redirect_to "/login"
    end
  end

  def comments
    @comments = current_user.received_comments
    @comments = @comments.paginate :page => params[:page], :per_page => 25
  end

  def create
    logout_keeping_session!
    @user = User.new(params[:user])
    success = @user && @user.save
    if success && @user.errors.empty?
            # Protects against session fixation attacks, causes request forgery
      # protection if visitor resubmits an earlier form using back
      # button. Uncomment if you understand the tradeoffs.
      # reset session
      self.current_user = @user # !! now logged in
      redirect_back_or_default('/')
      flash[:notice] = "Thanks for signing up!  We're sending you an email with your activation code."
    else
      flash[:error]  = "We couldn't set up that account, sorry.  Please try again, or contact an admin (link is above)."
      render :action => 'new'
    end
  end

  def profile
    #params[:id] ||= current_user.login if logged_in?
    @user = User.find_by_login(params[:id])
    @spectrums = @user.spectra(100)
    @spectrums = @spectrums.paginate :page => params[:page], :per_page => 24
    @sets = @user.sets
  end

  def delete
    if (logged_in? && current_user.role == "admin")
      @user = User.find(params[:id])
      @user.delete
      flash[:notice] = "User "+@user.name+" deleted."
      redirect_to "/"
    else
      flash[:error] = "You must be logged in and an admin."
      redirect_to "/login"
    end
  end

end
