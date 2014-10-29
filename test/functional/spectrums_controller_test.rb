require 'test_helper'

class SpectrumsControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:spectrums)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create spectrum" do
    assert_difference('Spectrum.count') do
      post :create, :spectrum => { }
    end

    assert_redirected_to spectrum_path(assigns(:spectrum))
  end

  test "should show spectrum" do
    get :show, :id => spectrums(:one).to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => spectrums(:one).to_param
    assert_response :success
  end

  test "should update spectrum" do
    put :update, :id => spectrums(:one).to_param, :spectrum => { }
    assert_redirected_to spectrum_path(assigns(:spectrum))
  end

  test "should destroy spectrum" do
    assert_difference('Spectrum.count', -1) do
      delete :destroy, :id => spectrums(:one).to_param
    end

    assert_redirected_to spectrums_path
  end
end
