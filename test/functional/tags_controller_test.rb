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
    assert_equal "You must be logged in to access this section", flash[:warning]
    assert_redirected_to "/login?back_to=/tags"
  end

  test "should delete tag" do
    session[:user_id] = tags(:one).user_id # log in
    get :destroy, :id => tags(:one).id
    assert_response :redirect
    assert_equal nil, flash[:error]
    assert_equal "Tag 'cfl' deleted.", flash[:notice]
    assert_redirected_to spectrum_path(tags(:one).spectrum_id)
  end

  test "should not delete tag if not owner" do
    session[:user_id] = tags(:two).user_id # log in
    get :destroy, :id => tags(:one).id
    assert_response :redirect
    assert_equal "You must have authored a tag or own its spectrum to delete it.", flash[:error]
    assert_equal nil, flash[:notice]
    assert_redirected_to spectrum_path(tags(:one).spectrum_id)
  end

  test "should not delete tag if not logged in" do
    get :destroy, :id => 'cfl'
    assert_response :redirect
    assert_equal "You must be logged in to access this section", flash[:warning]
    assert_redirected_to "/login?back_to=/tags/cfl"
  end

  test "should delete tag if admin" do
    session[:user_id] = users(:admin).id
    tag = Tag.find_by_name('cfl')
    get :destroy, :id => tag.id
    assert_response :redirect
    assert_equal "Tag 'cfl' deleted.", flash[:notice]
    assert_redirected_to spectrum_path(tag.spectrum_id)
  end


end
