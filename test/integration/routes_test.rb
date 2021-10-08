# frozen_string_literal: true

require 'test_helper'

class RoutesTest < ActionDispatch::IntegrationTest
  fixtures :all

  test "test get request for sets new" do
    assert_routing({ path: '/sets/new/:id', method: 'get' }, {controller: 'sets', action: 'new', id: ':id' })
  end

end
