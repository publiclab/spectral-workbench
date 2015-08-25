require 'test_helper'

class LikesControllerTest < ActionController::TestCase

  test "should get likes index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:spectrums)
  end

  test "should not get toggle like if not logged in" do
    get :toggle, :id => spectrums(:one).id
    assert_response :redirect
    assert_equal "You must be logged in to access this function.", flash[:error]
    assert_redirected_to "/login?back_to=/likes/toggle/#{spectrums(:one).id}"
  end

  test "should get toggle like" do
    session[:user_id] = tags(:one).user_id # log in
    get :toggle, :id => likes(:one).id
    assert_response :success
    assert_not_nil assigns(:spectrum)
    assert_not_nil assigns(:like)
  end

  test "should not get delete if like doesn't exist" do
    session[:user_id] = tags(:one).user_id # log in
    get :delete, :id => spectrums(:one).id
    assert_response :redirect
  end

end
