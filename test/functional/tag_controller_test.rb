require 'test_helper'

class TagControllerTest < ActionController::TestCase

  test "should show tag" do
    get :show, :id => 'cfl'
    assert_response :success
  end

end
