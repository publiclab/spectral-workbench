class UsersController < ApplicationController
  # Be sure to include AuthenticationSystem in Application Controller instead
  include AuthenticatedSystem

  def dashboard
    @spectrums = Spectrum.find_all_by_user_id current_user.id, :order => "created_at DESC"
    @spectrums = @spectrums.paginate :page => params[:page], :per_page => 24
    @sets = SpectraSet.find(:all,:limit => 4,:order => "created_at DESC")
    @comments = current_user.received_comments[0..5]
  end

  # render new.rhtml
  def new
    @user = User.new
  end
 
  def list
    if true#(logged_in? && current_user.role == "admin")
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
	@spectrums = @user.spectra
	@spectrums = @spectrums.paginate :page => params[:page], :per_page => 24
  end

  def delete
    if (logged_in? && current_user.role == "admin"))
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
