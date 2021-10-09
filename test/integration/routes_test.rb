# frozen_string_literal: true

require 'test_helper'

class RoutesTest < ActionDispatch::IntegrationTest
  fixtures :all

   "test spectrums choose route" do
    assert_routing({ path: '/spectrums/choose', method: :post }, { controller: 'spectrums', action: 'choose' })
  end
  
   test "test get request for sets embed2" do
     assert_routing({ path: '/sets/embed2/:id', method: 'get' }, {controller: 'sets', action: 'embed2', id: ':id' })
  end

end
