# frozen_string_literal: true

require 'test_helper'

class RoutesTest < ActionDispatch::IntegrationTest
  fixtures :all
  
  test "test get request for sets embed" do
    assert_routing({ path: '/sets/embed/:id', method: 'get' }, {controller: 'sets', action: 'embed', id: ':id' })
  end
  
  test "test get request for spectrums embed2" do
    assert_routing({ path: '/spectrums/embed2/:id', method: 'get' }, {controller: 'spectrums', action: 'embed2', id: ':id' })
  end  

  test "test get request for sets create" do
    assert_routing({ path: '/sets/create/:id', method: 'post' }, {controller: 'sets', action: 'create', id: ':id' })
  end

  test "test spectrums choose route" do
    assert_routing({ path: '/spectrums/choose', method: :post }, { controller: 'spectrums', action: 'choose' })
  end
  
  test "test get request for spectrums embed" do
    assert_routing({ path: '/spectrums/embed/:id', method: 'get' }, {controller: 'spectrums', action: 'embed', id: ':id' })
  end
  
end
