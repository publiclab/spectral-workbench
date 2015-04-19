class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  helper :all # include all helpers, all the time

  before_filter :current_user, :check_subdomain
  helper_method :logged_in?

  def check_subdomain
    if request.subdomain.present? && Rails.env != 'test'
      redirect_to 'http://' + request.domain + request.port_string + request.fullpath
    end
  end

  def mobile?
    (request.env['HTTP_USER_AGENT'].match("Mobi") || params[:format] == "mobile") && params[:format] != "html" && params[:m] != "false" || params[:m] == "true"
  end

  def ios?
    (request.env['HTTP_USER_AGENT'].match("iPad") || request.env['HTTP_USER_AGENT'].match("iPhone") || params[:ios] == "true")
  end

  def current_user
    user_id = session[:user_id] 
    if user_id
      begin
        @user = User.find(user_id)
      rescue
        @user = nil
      end
    else
      @user = nil
    end
  end

  private

  def require_login
    unless logged_in?
      path_info = request.env['PATH_INFO']
      flash[:warning] = "You must be logged in to access this section"
      redirect_to '/login?back_to=' + URI.encode(path_info) # halts request cycle
    end
  end

  def logged_in?
    user_id = session[:user_id]
    begin
      if user_id and User.find(user_id)
        return true
      else
        return false
      end
    rescue
      return false
    end
  end

end
