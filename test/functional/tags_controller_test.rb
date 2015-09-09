require 'test_helper'

class TagsControllerTest < ActionController::TestCase

  test "should show tag" do
    get :show, :id => 'cfl'
    assert_response :success
  end

  test "should create tag" do
    session[:user_id] = User.first.id # log in
    get :create, tag: { name: 'mytag',
                        spectrum_id: Spectrum.first.id }
    assert_response :redirect
    assert_equal "Tag(s) added.", flash[:notice]
    assert_redirected_to spectrum_path(Spectrum.first.id)
  end

  test "should not create tag if not logged in" do
    get :create, tag: { name: 'mytag',
                        spectrum_id: Spectrum.first.id }
    assert_response :redirect
    assert_equal "You must be logged in to access this function.", flash[:error]
    assert_redirected_to "/login?back_to=/tags"
  end

  ## test for "post" vs "get"

  test "should delete tag" do
    session[:user_id] = tags(:one).user_id # log in
    post :destroy, :id => tags(:one).id
    assert_response :redirect
    assert_equal nil, flash[:error]
    assert_equal "Tag 'cfl' deleted.", flash[:notice]
    assert_redirected_to spectrum_path(tags(:one).spectrum_id)
  end

  test "should not delete tag if not owner" do
    session[:user_id] = tags(:two).user_id # log in
    post :destroy, :id => tags(:one).id
    assert_response :redirect
    assert_equal "You must have authored a tag or own its spectrum to delete it.", flash[:error]
    assert_equal nil, flash[:notice]
    assert_redirected_to spectrum_path(tags(:one).spectrum_id)
  end

  test "should not delete tag if not logged in" do
    post :destroy, :id => 'cfl'
    assert_response :redirect
    assert_equal "You must be logged in to access this function.", flash[:error]
    assert_redirected_to "/login?back_to=/tags/cfl"
  end

  test "should delete tag if admin" do
    session[:user_id] = users(:admin).id # log in as admin
    tag = Tag.find_by_name('cfl')
    post :destroy, :id => tag.id
    assert_response :redirect
    assert_equal "Tag 'cfl' deleted.", flash[:notice]
    assert_redirected_to spectrum_path(tag.spectrum_id)
  end

  test "powertag creation if you're not the owner" do 
    session[:user_id] = users(:aaron).id # log in

    @request.headers["Content-Type"] = "application/json"
    @request.headers["Accept"] = "application/javascript"
    xhr :post, :create, tag: { name: 'range:400-500',
                        spectrum_id: users(:quentin).spectrums.first.id }

    assert_equal ActiveSupport::JSON.decode(@response.body)['errors'].last, "Error: You must own the spectrum to add powertags"
    assert_response :success
  end

  test "powertag creation if you're not the owner but you are an admin" do 
    session[:user_id] = users(:admin).id # log in
    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        'range:100-500'
    })
    assert tag.save!
    assert_response :success
  end

end
