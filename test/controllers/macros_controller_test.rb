# frozen_string_literal: true

require 'test_helper'

class MacrosControllerTest < ActionController::TestCase
  test 'should get macros index' do
    get :index
    assert_response :success
    # assert_not_nil assigns(:spectrums)
  end
end