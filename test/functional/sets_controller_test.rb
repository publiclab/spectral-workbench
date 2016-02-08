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
    assert_not_nil assigns(:spectrums)
  end

  test "should redirect show2 spectra_set" do
    get :show2, :id => spectra_sets(:one).id
    assert_response :redirect
    assert_redirected_to "/sets/#{spectra_sets(:one).id}"
  end

  test "should spectra_set with spectra" do
    spectra_sets(:one).spectrums << spectrums(:one)
    get :show, :id => spectra_sets(:one).id
    assert_response :success
    assert_not_nil assigns(:set)
    assert_not_nil assigns(:spectrums)
    assert assigns(:spectrums).length > 0
  end

  test "should show spectra_set json" do
    get :show, :id => spectra_sets(:one).id, :format => :json
    assert_response :success
    assert_not_nil assigns(:set)
  end

  test "should show calibrated spectra_set json" do
    get :calibrated, :id => spectra_sets(:one).id, :format => :json
    assert_response :success
    assert_not_nil assigns(:set)
  end

  test "should show spectra_set embed" do
    get :embed, :id => spectra_sets(:one).id
    assert_response :success
    assert_not_nil assigns(:set)
  end

  test "should show spectra_set new embed" do
    get :embed2, :id => spectra_sets(:one).id
    assert_response :success
    assert_not_nil assigns(:set)
  end

  test "should not display new spectra_set action if not logged in" do
    get :new, :id => spectrums(:one).id.to_s + "," + spectrums(:two).id.to_s
    assert_response :redirect
  end

  test "should display new spectra_set action" do
    session[:user_id] = User.first.id # log in
    get :new, :id => spectrums(:one).id.to_s + "," + spectrums(:two).id.to_s
    assert_response :success
    assert_not_nil assigns(:set)
  end

  test "should not create spectra_set unless logged in" do
    assert_difference('SpectraSet.count', 0) do
      get :create, :id => "#{spectrums(:one).id},#{spectrums(:two).id}"
    end
    assert_response :redirect
  end

  test "should create spectra_set from comma-delimited ids" do
    session[:user_id] = User.first.id # log in
    assert_difference('SpectraSet.count', 1) do
      get :create, :id => "#{spectrums(:one).id},#{spectrums(:two).id}",
                   :spectra_set => { 
                     :title => "My set",
                     :notes => "Hey" 
                   }
      assert_response :redirect
      assert_redirected_to set_path(assigns(:set))
    end
    assert_not_nil assigns(:set)
    assert SpectraSet.find(assigns(:set).id).spectrums.count > 0
  end

  test "should not add spectrum to spectra_set unless logged in" do
    assert_difference('spectra_sets(:one).spectrums.length', 0) do
      get :add, :spectrum_id => spectrums(:one).id, :id => spectra_sets(:one).id
    end
    assert_response :redirect
  end

  test "should not add spectrum to spectra_set if not owner" do
    assert_not_equal User.last.id, spectra_sets(:one).user_id
    session[:user_id] = User.last.id # log in
    assert_difference('spectra_sets(:one).spectrums.length', 0) do
      get :add, :spectrum_id => spectrums(:one).id, :id => spectra_sets(:one).id
    end
    assert_response :redirect
  end

  test "should allow adding spectrum to spectra_set if admin" do
    assert_not_equal User.last.id, spectra_sets(:one).user_id
    session[:user_id] = users(:admin).id # log in
    assert_difference('spectra_sets(:one).spectrums.count', 1) do
      get :add, :spectrum_id => spectrums(:one).id, :id => spectra_sets(:one).id
      assert_response :redirect
    end
  end

  test "should not add spectrum to spectra_set if already added that spectrum" do
    assert_not_equal User.last.id, spectra_sets(:one).user_id
    session[:user_id] = User.last.id # log in
    spectra_sets(:one).spectrums << spectrums(:one)
    assert spectra_sets(:one).contains(spectrums(:one))
    assert_difference('spectra_sets(:one).spectrums.count', 0) do
      get :add, :spectrum_id => spectrums(:one).id, :id => spectra_sets(:one).id
    end
    assert_response :redirect
  end

  test "should add spectrum to spectra_set" do
    session[:user_id] = spectra_sets(:one).user_id # log in
    assert !spectra_sets(:one).contains(spectrums(:two))
    assert_difference('spectra_sets(:one).spectrums.count', 1) do
      get :add, :spectrum_id => spectrums(:two).id, :id => spectra_sets(:one).id
    end
    assert_response :redirect
    assert_redirected_to "/sets/#{assigns(:set).id}"
    assert spectra_sets(:one).contains(spectrums(:two))
  end

  test "should not remove spectrum from spectra_set unless logged in" do
    get :remove, :s => spectrums(:one).id, :id => spectra_sets(:one).id
    assert_response :redirect
  end

  test "should not remove spectrum from spectra_set if not owner" do
    assert_not_equal User.last.id, spectra_sets(:one).user_id
    session[:user_id] = User.last.id # log in
    get :remove, :s => spectrums(:one).id, :id => spectra_sets(:one).id
    assert_response :redirect
  end

  test "should not remove only spectrum from spectra_set" do
    set = spectra_sets(:one)
    session[:user_id] = set.user_id # log in
    set.spectrums << spectrums(:one)
    assert_difference('set.spectrums.count', 0) do
      get :remove, :s => spectrums(:one).id, :id => set.id
    end
    assert_response :redirect
    assert_equal "A set must have at least one spectrum.", flash[:error]
    assert_redirected_to set_path(assigns(:set))
  end

  test "should remove spectrum from spectra_set" do
    set = spectra_sets(:one)
    session[:user_id] = set.user_id # log in
    set.spectrums << spectrums(:one)
    set.spectrums << spectrums(:two)
    assert_difference('set.spectrums.count', -1) do
      get :remove, :s => spectrums(:one).id, :id => set.id
    end
    assert_response :redirect
    assert_redirected_to set_path(assigns(:set))
    assert !set.spectrums.include?(spectrums(:one))
  end

  test "should get edit spectra_set" do
    session[:user_id] = spectra_sets(:one).user_id # log in
    get :edit, :id => spectra_sets(:three).id
    assert_response :success
  end

  test "should not get edit other user's spectra_set" do
    session[:user_id] = users(:aaron).id # log in
    assert_not_equal users(:aaron).id, spectra_sets(:one).user_id
    assert_not_equal users(:aaron).role, "admin"
    get :edit, :id => spectra_sets(:one).id
    assert_response :redirect
    assert_redirected_to set_path(assigns(:set))
    assert_equal "You must own the set to edit it.", flash[:error]
  end

  test "should update user's spectra_set" do
    session[:user_id] = spectra_sets(:one).user_id # log in
    put :update, :id => spectra_sets(:three).id, :spectra_set => {:title => "New title"}
    assert_response :redirect
    assert_equal 'Set was successfully updated.', flash[:notice]
    assert_redirected_to set_path(assigns(:set))
  end

  test "should not update other user's spectra_set" do
    session[:user_id] = users(:aaron).id # log in
    assert_not_equal users(:aaron).id, spectra_sets(:one).user_id
    assert_not_equal users(:aaron).role, "admin"
    put :update, :id => spectra_sets(:one).id, :spectra_set => {:title => "New title"}
    assert_response :redirect
    assert_equal "You must own the set to edit it.", flash[:error]
    assert_redirected_to set_path(assigns(:set))
  end

end
