class MacrosController < ApplicationController

  def index
    @macros = Macro.find :all, :order => "id DESC"
    render :layout => "bootstrap" 
  end

  def author
    @user = User.find_by_login params[:id]
    @macros = @user.macros
    render :template => "macros/index", :layout => "bootstrap" 
  end

  def show
    @user = User.find_by_login params[:author]
    @macro = Macro.find_by_title params[:id], :conditions => {:user_id => @user.id}, :order => "id DESC"
    respond_to do |format|
      format.html { render :layout => "bootstrap" }
      format.js  { 
        if params[:run]
          render :text => "$W.macro = {"+@macro.code+"};$W.macro.setup()" 
        else
          render :text => "{"+@macro.code+"}" 
        end
      }
    end
  end

  def delete
    @macro = Macro.find params[:id]
    if logged_in? && (current_user.id == @macro.user_id || current_user.role == "admin")
      if @macro.delete
        flash[:notice] = "Macro deleted."
        redirect_to "/macros"
      else
        flash[:error] = "Macro could not be deleted."
        redirect_to "/macro/"+@macro.user.login+"/"+@macro.title
      end
    else
      flash[:error] = "You must be logged in and own this macro to delete it."
      redirect_to "/login"
    end
  end

  def new
    if logged_in?
      @macro = Macro.new()
      render :layout => "bootstrap" 
    else
      flash[:error] = "You must be logged in to create a macro."
      redirect_to "/login"
    end
  end

  def create
    if logged_in?
      @macro = Macro.new({
        :title => params[:title],
        :description => params[:description],
        :code => params[:code],
        :macro_type => params[:macro_type],
        :url => params[:url],
        :user_id => current_user.id
      })
      if @macro.save
        redirect_to "/macro/"+@macro.user.login+"/"+@macro.title
      else
        render :action => "new", :layout => "bootstrap"
      end
    else
      flash[:error] = "You must be logged in to create a macro."
      redirect_to "/login"
    end
  end

end
