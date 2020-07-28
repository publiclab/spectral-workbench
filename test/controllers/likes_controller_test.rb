require 'test_helper'

class LikesControllerTest < ActionController::TestCase

  test "should get likes index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:spectrums)
  end

  test "should not get toggle like if not logged in" do
    get :toggle, params: { id: spectrums(:one).id }
    assert_response :redirect
    assert_equal "You must be logged in to access this function.", flash[:error]
    assert_redirected_to "/login?back_to=/likes/toggle/#{spectrums(:one).id}"
  end

  test "should get toggle like" do
    session[:user_id] = tags(:one).user_id # log in
    get :toggle, params: { id: likes(:one).id }
    assert_response :success
    assert_not_nil assigns(:spectrum)
    assert_not_nil assigns(:like)
  end

  test "should not get delete if like doesn't exist" do
    session[:user_id] = tags(:one).user_id # log in
    get :delete, params: { id: spectrums(:one).id }
    assert_response :redirect
  end

  test "should delete like if author" do
  	session[:user_id] = Like.first.user_id
  	get :delete, params: { id: Like.first.id }

  	assert_response :redirect
  end

  test "should get recent likes" do
  	get :recent, params: { page: 1 }

  	assert_response :success
  	assert_not_nil assigns(:spectrums)
  end

end
