require 'test_helper'
require 'users_controller'

# Re-raise errors caught by the controller.
class UsersController; def rescue_action(e) raise e end; end

class UsersControllerTest < ActionController::TestCase

  fixtures :users

  test "should get profile" do
    session[:user_id] = users(:quentin).id # log in
    get :show, :id => users(:quentin).login
    assert_response :success
  end

  test "should get dashboard" do
    session[:user_id] = users(:quentin).id # log in
    get :dashboard, :id => users(:quentin).login
    assert_response :success
    assert_not_nil :spectrums
    assert_not_nil :sets
    assert_not_nil :comments
  end

  test "should get contributors" do
    get :contributors
    assert_response :success
    assert_not_nil :users
  end

  test "should get top contributors" do
    get :top_contributors

    assert_response :success
    assert_not_nil :users
  end

  test "should get user list if admin" do
    session[:user_id] = users(:admin).id
    get :index

    assert_response :success
  end

  test "should not get user list if not admin" do
    session[:user_id] = users(:quentin).id
    get :index

    assert_equal "You must be an admin to view the users listing.", flash[:error]
    assert_response :redirect
    assert_redirected_to "/login"
  end
end
