class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  helper :all # include all helpers, all the time

  before_filter :current_user, :check_subdomain
  helper_method :logged_in?

  def check_subdomain
    if request.subdomain.present? && Rails.env == 'production'
      redirect_to 'http://' + request.domain + request.port_string + request.fullpath
    end
  end

  def mobile?
    ((request.env['HTTP_USER_AGENT'] && request.env['HTTP_USER_AGENT'].match("Mobi")) || params[:format] == "mobile") && params[:format] != "html" && params[:m] != "false" || params[:m] == "true"
  end

  def ios?
    ((request.env['HTTP_USER_AGENT'] && request.env['HTTP_USER_AGENT'].match("iPad")) || (request.env['HTTP_USER_AGENT'] && request.env['HTTP_USER_AGENT'].match("iPhone")) || params[:ios] == "true")
  end

  def current_user
    user_id = session[:user_id] 
    if user_id
      begin
        user = User.find(user_id)
      rescue
        user = nil
      end
    else
      user = nil
    end
  end

  private

  def no_cache
    response.headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "Fri, 01 Jan 1990 00:00:00 GMT"
  end

  def require_ownership(datum)
    dataType = (self.class.name == "SpectrumsController") ? :spectrum : :set

    unless logged_in? && (current_user.role == "admin" || current_user.id == datum.user_id)
      flash[:error] = "You must own this data to edit it."
      # without status 303, some browsers will redirect with request method DELETE
      redirect_to spectrum_path(datum), status: :see_other if dataType == :spectrum
      redirect_to      set_path(datum), status: :see_other if dataType == :set
      return false
    else
      return true
    end
  end

  def require_login
    unless logged_in?

      path_info = request.env['PATH_INFO']
      login_link = "/login?back_to=#{URI.encode(path_info)}"

      respond_to do |format|
        if request.xhr? # ajax
          login_prompt = "You must be <a href='#{login_link}'>logged in to do this</a>."
          format.json { render :json => { :errors => [ login_prompt ] } }
          format.html do
            render :text => login_prompt # halts request cycle
          end
        else
          format.html do
            flash[:error] = "You must be logged in to access this function."
            redirect_to login_link # halts request cycle
          end
        end
      end

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
