class LikesController < ApplicationController

  def index
    @spectrums = Spectrum.find :all, :limit => 100, :order => "like_count DESC"
    @spectrums = @spectrums.paginate :page => params[:page], :per_page => 24
  end

  # recently liked
  def recent
    @spectrums = Spectrum.find(:all,:order => "created_at DESC", :conditions => ["author != 'anonymous'"], :limit => 100, :joins => :likes)
    @spectrums = @spectrums.paginate :page => params[:page], :per_page => 24
    render :template => "likes/index"
  end

  # Adds a like to spectrum from current_user
  # as: /likes/toggle/:id where params[:id] is spectrum_id
  def toggle
    @spectrum = Spectrum.find params[:id]
    if logged_in? && @spectrum.author != current_user.login
      if @spectrum.liked_by(current_user.id)
        Like.find_by_user_id(current_user.id,:conditions => {:spectrum_id => @spectrum.id}).delete
        render :text => "unliked"
      else
        @like = Like.new({
          :user_id => current_user.id,
          :spectrum_id => params[:id]
        })
        if @like.save
          render :text => @spectrum.likes.length
        else
          render :text => "error"
        end
      end
    else
      render :text => "You must be logged in to like, you cannot like your own, and you cannot double-like."
    end
  end

  def delete
    @like = Like.find(params[:id])
    if @like.user_id == current_user.id || params[:password].to_i == APP_CONFIG["password"] || current_user.role == "admin"
      @like.delete
    end
    redirect_to spectrum_path(@like.spectrum_id.to_s) if params[:index] != "true"
  end

end
