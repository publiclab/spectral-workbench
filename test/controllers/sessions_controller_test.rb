# frozen_string_literal: true

require 'test_helper'
require 'sessions_controller'

# Re-raise errors caught by the controller.
class SessionsController
  def rescue_action(exception)
    raise exception
                          end; end

class SessionsControllerTest < ActionController::TestCase
  fixtures :users

  test 'should redirect if logged in' do
    session[:user_id] = User.first.id
    get :login

    assert_response :redirect
  end

  test 'should not redirect if not logged in' do
    get :login

    assert_response :success
  end

  test 'should create new user and login' do
    def @controller.openid_authentication(_openid_url, _back_to)
      @user = User.new
      @user.login = 'test'
      @user.email = 'who@what.com'
      @user.role = 'basic'
      @user.save!
      @current_user = @user
      successful_login(params[:back_to], nil)
    end

    post :new, params: {
      subaction: 'github',
      back_to: '/dashboard'
    }

    assert_equal 'You have successfully logged in.', flash[:success]
    assert_response :redirect
    assert_redirected_to '/dashboard'
  end

  test 'should fail to create a new user if something goes wrong' do
    def @controller.openid_authentication(_openid_url, _back_to)
      @user = User.new
      @user.login = 'test'
      @user.email = 'who@what.com'
      @user.role = 'basic'
      @user.save!
      @current_user = @user
      failed_login('Something went wrong')
    end

    post :new, params: {
      subaction: 'github',
      back_to: '/dashboard'
    }

    assert_equal 'Something went wrong', flash[:danger]
    assert_response :redirect
    assert_redirected_to '/'
  end

  test 'should logout user' do
    session[:user_id] = User.first.id
    get :logout

    assert_equal 'You have successfully logged out.', flash[:success]
    assert_nil session[:user_id]
    assert_response :redirect
    assert_redirected_to '/'
  end

  test 'should login locally' do
    session[:user_id] = User.first.login
    APP_CONFIG['local'] = true
    post :local, params: { login: session[:user_id] }

    assert_equal 'You have successfully logged in.', flash[:success]
    assert_response :redirect
  end

  test 'should not initiate local login if not local' do
    session[:user_id] = User.first.login
    APP_CONFIG['local'] = false
    post :local, params: { login: session[:user_id] }

    assert_equal 'Forbidden', flash[:error]
    assert_response :redirect
  end
end
