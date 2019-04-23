# Dockerfile # Spectral Workbench 
# https://github.com/publiclab/spectral-workbench

FROM ruby:2.4.6

LABEL maintainer="Sebastian Silva <sebastian@fuentelibre.org>"
LABEL description="This image deploys Spectral Worbench!"

# Set correct environment variables.
RUN mkdir -p /app
ENV HOME /root

# Install dependencies
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get update -qq && apt-get install -y imagemagick default-libmysqlclient-dev curl nodejs npm build-essential
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
