# frozen_string_literal: true

class UsersController < ApplicationController
  before_action :require_login, except: %i(show contributors top_contributors)

  def message
    @user = User.find params[:user_id]
    UserMailer.direct_message(@user, current_user, params[:title], params[:body])
    flash[:notice] = 'Sent successfully.'
    redirect_to '/dashboard'
  end

  def dashboard
    @offline = 'flush'
    @spectrums = Spectrum.order('created_at DESC').where('user_id != 0').paginate(page: params[:page], per_page: 24)
    @sets = SpectraSet.order(created_at: :desc).paginate(page: params[:sets_page], per_page: 25)
    @comments = Comment.order(created_at: :desc).paginate(page: params[:comments_page], per_page: 40)
    @users = User.order(created_at: :desc).paginate(page: params[:users_page], per_page: 100)
    @tags = Tag.order(created_at: :desc).paginate(page: params[:tags_page], per_page: 100)
  end

  def contributors
    @users = User.order('id DESC').paginate(page: params[:page])
  end

  def top_contributors
    @users = User.joins(:spectrums).select('users.*, count(users.id) as spectrums_count').group('spectrums.user_id').order('spectrums_count DESC').paginate(page: params[:page])
    render 'users/contributors'
  end

  # for dashboard
  def comments
    @comments = current_user.received_comments
    @comments = @comments.paginate page: params[:page], per_page: 25
  end

  def show
    @user = User.find_by_login(params[:id])
    @spectrums = @user.spectrums.order(created_at: :desc).paginate(page: params[:page])
    @sets = @user.sets.order(created_at: :desc).paginate(page: params[:set_page], per_page: 2)
  end

  def index
    if logged_in? && current_user.role == 'admin'
      @users = User.all
    else
      flash[:error] = 'You must be an admin to view the users listing.'
      redirect_to '/login'
    end
  end
end
