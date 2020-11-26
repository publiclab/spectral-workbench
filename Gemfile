# frozen_string_literal: true

source 'https://rubygems.org'

gem 'rails', '~> 5.2.4.3'

# Database handling
group :mysql do
  gem 'mysql2', '~> 0.5.3'
end

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  # gem 'therubyracer', :platforms => :ruby

  gem 'uglifier', '>= 1.0.3'
end

group :test do
  gem 'rails-controller-testing', '~> 1.0.5'
  gem 'rubocop', '~> 1.4.2'
  gem 'rubocop-performance'
  gem 'simplecov', require: false
  gem 'puma'
end

group :development, :test do
  gem 'rack_session_access'
  gem 'capybara'
  gem 'selenium-webdriver', '~> 3.12.0'
end

gem 'bootsnap', '~> 1.4.6'
gem 'jquery-rails'
gem 'listen', '~> 3.2.1'
gem 'mime-types' # , '1.18'
gem 'passenger'
gem 'recaptcha', '5.5.0', require: 'recaptcha/rails'
gem 'redcarpet', '~> 3.5.0'
gem 'responders', '~> 3.0.1'
gem 'rmagick' # , :require => "RMagick"
gem 'skylight' # performance tracking via skylight.io
gem 'terrapin', '~> 0.6.0'

gem 'paperclip', '>= 4.1.1'
gem 'rdiscount', '2.2.0.1'
gem 'will_paginate', '~> 3.3.0'
gem 'will_paginate-bootstrap', '~> 1.0.2'

gem 'tzinfo', '~> 1.1'

gem 'open_id_authentication'
gem 'protected_attributes_continued', '~> 1.5.0'
gem 'ruby-openid'

gem 'rack-offline', '>= 0.6.4'

# To use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'

# To use Jbuilder templates for JSON
# gem 'jbuilder'

# Use unicorn as the app server
# gem 'unicorn'

# Deploy with Capistrano
# gem 'capistrano'
