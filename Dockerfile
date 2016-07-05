# Dockerfile # Spectral Workbench 
# https://github.com/publiclab/spectral-workbench

FROM ruby:2.1.2
MAINTAINER Sebastian Silva "sebastian@fuentelibre.org"

LABEL "This image deploys Spectral Worbench!"

# Set correct environment variables.
RUN mkdir -p /app
ENV HOME /root

# Install dependencies
RUN apt-get update -qq && apt-get install -y imagemagick ruby-rmagick libmagickwand-dev libmagick++-dev bundler libmysqlclient-dev ruby-rmagick libfreeimage3 libfreeimage-dev ruby-dev gdal-bin python-gdal curl libcurl4-openssl-dev libssl-dev zip nodejs-legacy npm
RUN npm install -g bower

# Install bundle of gems
WORKDIR /tmp
ADD Gemfile /tmp/Gemfile
ADD Gemfile.lock /tmp/Gemfile.lock
RUN bundle install 

# Add the Rails app
WORKDIR /app
ADD . /app
ENV GIT_DIR=/app
RUN bower install --allow-root
COPY config/database.yml.example config/database.yml
COPY config/config.yml.example config/config.yml

RUN bundle exec rake db:setup
RUN bundle exec rake db:seed
RUN bundle exec rake db:migrate
