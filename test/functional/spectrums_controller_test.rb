require 'test_helper'

class SpectrumsControllerTest < ActionController::TestCase

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:spectrums)
  end

  #test "should create spectrum" do
  #  assert_difference('Spectrum.count') do
  #    post :create, :spectrum => { }
  #  end
  #
  #  assert_redirected_to spectrum_path(assigns(:spectrum))
  #end

  test "should show spectrum" do
    get :show, :id => spectrums(:one).id
    assert_response :success # to /analyze/spectrums/#, lets update this
  end

  test "should show spectrum json" do
    get :show, :id => spectrums(:one).id, :format => :json
    assert_response :success
  end

  test "should show search" do
    get :search, :id => "cfl"
    assert_response :success
    assert_not_nil :spectrums
    assert_not_nil :sets
  end

  test "should get edit" do
    session[:user_id] = User.first.id # log in
    get :edit, :id => spectrums(:one).id
    assert_response :success
  end

  test "should update spectrum" do
    session[:user_id] = User.first.id # log in
    put :update, :id => spectrums(:one).id, :spectrum => { }
    assert_response :redirect
    assert_equal 'Spectrum was successfully updated.', flash[:notice]
    assert_redirected_to spectrum_path(assigns(:spectrum))
  end

  #test "should destroy spectrum" do
  #  assert_difference('Spectrum.count', -1) do
  #    delete :destroy, :id => spectrums(:one).to_param
  #  end
  #
  #  assert_redirected_to spectrums_path
  #end
end
