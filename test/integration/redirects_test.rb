# frozen_string_literal: true

require 'test_helper'

class RedirectsTest < ActionDispatch::IntegrationTest
  fixtures :all

  test "test get request for sets find_match" do
    assert_routing({path: "/sets/find_match",method: get},{controller:'sets', action: 'find_match'})
  end
end
