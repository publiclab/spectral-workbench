require 'test_helper'

class SetsControllerTest < ActionController::TestCase

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:sets)
  end

  test "should show spectra_set" do
    get :show, :id => spectra_sets(:one).id
    assert_response :success
    assert_not_nil assigns(:set)
  end

  test "should show spectra_set json" do
    get :show, :id => spectra_sets(:one).id, :format => :json
    assert_response :success
    assert_not_nil assigns(:set)
  end

  test "should get edit spectra_set" do
    session[:user_id] = User.first.id # log in
    get :edit, :id => spectra_sets(:three).id
    assert_response :success
  end

  test "should not get edit other user's spectra_set" do
    session[:user_id] = User.first.id # log in
    get :edit, :id => spectra_sets(:one).id
    assert_response :redirect
    assert_redirected_to '/login'
    assert_equal "You must be logged in and own the set to edit it.", flash[:error]
  end

  test "should update user's spectra_set" do
    session[:user_id] = User.first.id # log in
    put :update, :id => spectra_sets(:three).id, :spectra_set => {:title => "New title"}
    assert_response :redirect
    assert_equal 'Set was successfully updated.', flash[:notice]
    assert_redirected_to set_path(assigns(:set))
  end

  test "should not update other user's spectra_set" do
    session[:user_id] = User.first.id # log in
    put :update, :id => spectra_sets(:one).id, :spectra_set => {:title => "New title"}
    assert_response :redirect
    assert_equal "You must be logged in and own the set to edit it.", flash[:error]
    assert_redirected_to '/login'
  end

end
