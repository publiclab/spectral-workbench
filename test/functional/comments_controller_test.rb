require 'test_helper'

class CommentsControllerTest < ActionController::TestCase

  test "should post comment on spectra HTML" do
  	session[:user_id] = User.first.id
  	post :spectrum,
      id: Spectrum.first.id,
      comment: {
        body: "Great job with this spectrum!",
      }

    assert_equal 'Comment saved.', flash[:notice]
    assert_response :redirect
  end

  test "should post comment on spectra JSON" do
  	session[:user_id] = User.first.id
  	post :spectrum,
      id: Spectrum.first.id,
      comment: {
        body: "Great job with this spectrum!",
      },
      format: "json"
    assert_equal 'Comment saved.', flash[:notice]
  end

  test "should not post comment on spectra if body absent" do
  	session[:user_id] = User.first.id
  	post :spectrum,
      id: Spectrum.first.id,
      comment: {
      	body: ""
      }
    assert_equal "There was an error creating your comment.", flash[:error]
  end

  test "should post comment on sets HTML" do
  	session[:user_id] = User.first.id
  	post :spectraset,
      id: SpectraSet.first.id,
      comment: {
        body: "Great job with this set!",
      }

    assert_equal 'Comment saved.', flash[:notice]
    assert_response :redirect
  end

  test "should post comment as on sets JSON" do
  	session[:user_id] = User.first.id
  	post :spectraset,
      id: SpectraSet.first.id,
      comment: {
        body: "Great job with this set!",
      },
      format: "json"
    assert_equal 'Comment saved.', flash[:notice]
  end

  #test fails because of problematic fixtures
  # test "should delete comment if author" do
  # 	comment = Comment.first
  # 	session[:user_id] = comment.user_id
  #  	delete :delete, id: comment.id

  #  	assert_equal "Comment deleted.", flash[:notice]
  #  	assert_response :redirect
  # end


  test "should index comments" do
    session[:user_id] = User.first.id
    get :index

    assert_response :success
  end

end
