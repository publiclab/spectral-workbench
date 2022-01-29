# frozen_string_literal: true

require 'test_helper'

class RedirectsTest < ActionDispatch::IntegrationTest
  fixtures :all

  test 'GET /sets/show/#' do
    set = SpectraSet.first
    get "/sets/show/#{set.id}"
    assert_response 301
  end
end