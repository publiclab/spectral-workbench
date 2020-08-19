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
  gem 'simplecov', require: false
  gem 'rails-controller-testing', '~> 1.0.5'
  gem 'puma'
end

group :development, :test do
  gem 'rack_session_access'
  gem 'capybara'
  gem 'selenium-webdriver'
end

gem 'bootsnap', '~> 1.4.6'
gem 'listen', '~> 3.2.1'
gem 'responders', '~> 3.0.1'
gem 'rmagick'#, :require => "RMagick"
gem 'mime-types'#, '1.18'
gem 'jquery-rails'
gem 'passenger'
gem 'recaptcha', '5.5.0', require: "recaptcha/rails"
gem 'terrapin', '~> 0.6.0'
gem 'redcarpet', '~> 3.5.0'
gem 'skylight' # performance tracking via skylight.io

gem 'rdiscount', '2.2.0.1'
gem 'will_paginate', '~> 3.3.0'
gem 'will_paginate-bootstrap', '~> 1.0.2'
gem 'paperclip', '>= 4.1.1'

gem 'tzinfo', '~> 1.1'

gem 'protected_attributes_continued', '~> 1.5.0'
gem 'ruby-openid'
gem 'open_id_authentication'

gem 'rack-offline', '>= 0.6.4'

# To use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'

# To use Jbuilder templates for JSON
# gem 'jbuilder'

# Use unicorn as the app server
# gem 'unicorn'

# Deploy with Capistrano
# gem 'capistrano'
