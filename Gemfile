source 'https://rubygems.org'
source 'https://rails-assets.org'

ruby '2.1.2'
gem 'rails', '~>3.2'

# Bundle edge Rails instead:
# gem 'rails', :git => 'git://github.com/rails/rails.git'

# Database handling
group :sqlite do
  gem 'sqlite3'
end

group :mysql do
  gem 'mysql2', '~> 0.3.10'
end

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  #gem 'sass-rails',   '~> 3.2.3'
  #gem 'coffee-rails', '~> 3.2.1'

  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  # gem 'therubyracer', :platforms => :ruby

  gem 'uglifier', '>= 1.0.3'
end

gem 'rmagick'#, :require => "RMagick"
gem 'mime-types'#, '1.18'
gem 'jquery-rails'
gem 'passenger'
gem 'recaptcha', '3.0.0', :require => "recaptcha/rails"
gem 'cocaine', '~>0.5.3'
gem 'redcarpet', '2.1.1'

gem 'rdiscount', '1.6.8'
gem 'will_paginate'
gem 'will_paginate-bootstrap', '0.2.5'
gem 'paperclip', '>= 4.1.1'

gem 'ruby-openid'
gem 'open_id_authentication'

gem 'rack-offline', '>=0.6.4'

group :development, :test do
  #gem 'rspec-rails'
  #gem 'factory_girl_rails'
end

group :test, :development do
  gem 'jasmine-rails'
  gem 'jasmine'
  gem 'jasmine-jquery-rails'
  # this doesn't seem to work; maybe it's an old version? Trying Bower
  #gem 'jasmine-ajax'
end

# To use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'

# To use Jbuilder templates for JSON
# gem 'jbuilder'

# Use unicorn as the app server
# gem 'unicorn'

# Deploy with Capistrano
# gem 'capistrano'

#gem "mocha", :group => :test
