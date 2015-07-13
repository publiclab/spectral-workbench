require 'test_helper'

class RedirectsTest < ActionController::IntegrationTest
  fixtures :all

  test "GET /sets/show/#" do
    set = SpectraSet.find :first
    get "/sets/show/#{set.id}"
    assert_response 301
  end

end
