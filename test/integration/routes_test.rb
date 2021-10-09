# frozen_string_literal: true

require 'test_helper'

class RoutesTest < ActionDispatch::IntegrationTest
  fixtures :all
 test "test get request for sets create" do
 assert_routing({ path: '/sets/create/:id', method: 'post' }, {controller: 'sets', action: 'create', id: ':id' })
 end

  test "test spectrums choose route" do
    assert_routing({ path: '/spectrums/choose', method: :post }, { controller: 'spectrums', action: 'choose' })
  end
end
