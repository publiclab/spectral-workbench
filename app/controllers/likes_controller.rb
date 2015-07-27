class LikesController < ApplicationController

  before_filter :require_login, :only => [ :toggle, :delete ]

  def index
    @spectrums = Spectrum.order('like_count DESC').where('user_id != 0').paginate(:page => params[:page], :per_page => 24)
  end

  # recently liked
  def recent
    @spectrums = Spectrum.order('created_at DESC').where('user_id != 0').page(params[:page])
    render :template => "likes/index"
  end

  # Adds a like to spectrum from current_user
  # as: /likes/toggle/:id where params[:id] is spectrum_id
  def toggle
    @spectrum = Spectrum.find params[:id]
    unless @spectrum.user_id == current_user.id
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
      render :text => "You cannot like your own."
    end
  end

  def delete
    @like = Like.find(params[:id])
    if @like.user_id == current_user.id || current_user.role == "admin"
      @like.delete
    end
    redirect_to spectrum_path(@like.spectrum_id.to_s) if params[:index] != "true"
  end

end
