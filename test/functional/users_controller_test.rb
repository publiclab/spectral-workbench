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
    get :contributors
    assert_response :success
    assert_not_nil :users
  end

end
