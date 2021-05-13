# frozen_string_literal: true

require 'simplecov'
ENV['RAILS_ENV'] = 'test'
SimpleCov.start do
  add_filter 'test/'
  add_filter 'config/'
end

require 'rack_session_access/capybara'
require File.expand_path('../config/environment', __dir__)
require 'rails/test_help'
require 'support/ruby_2_6_rails_4_2_patch'

module ActiveSupport
  class TestCase
    # Setup all fixtures in test/fixtures/*.(yml|csv) for all tests in alphabetical order.
    #
    # Note: You'll currently still have to declare fixtures explicitly in integration tests
    # -- they do not yet inherit this setting
    fixtures :all

    # Add more helper methods to be used by all tests here...
  end
end
