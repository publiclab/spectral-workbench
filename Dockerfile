# Dockerfile # Spectral Workbench 
# https://github.com/publiclab/spectral-workbench

FROM ruby:2.1

LABEL maintainer="Sebastian Silva <sebastian@fuentelibre.org>"
LABEL description="This image deploys Spectral Worbench!"

# Set correct environment variables.
ENV HOME /root

# Install dependencies
RUN sed -i '/.*jessie-updates.*/d' /etc/apt/sources.list
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
                       imagemagick \
                       ruby-rmagick \
                       libmagickwand-dev \
                       libmagick++-dev \
                       ruby-rmagick \
                       libfreeimage3 \
                       libfreeimage-dev \
                       gdal-bin \
                       python-gdal \
                       curl \
                       libcurl4-openssl-dev \
                       libssl-dev \
                       zip \
                       nodejs-legacy \
                       npm \
                       netcat

RUN npm install -g bower

# Install bundle of gems
WORKDIR /tmp
ADD Gemfile /tmp/Gemfile
ADD Gemfile.lock /tmp/Gemfile.lock
RUN bundle install 

# Add the Rails app
WORKDIR /app
COPY . /app
ENV GIT_DIR=/app

RUN apt-get remove -y zip \
                      curl

ENTRYPOINT ["sh", "script/start.sh"]
