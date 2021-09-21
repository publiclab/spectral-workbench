# Dockerfile # Spectral Workbench 
# https://github.com/publiclab/spectral-workbench

FROM ruby:2.6.5-stretch

LABEL maintainer="Sebastian Silva <sebastian@fuentelibre.org>"
LABEL description="This image deploys Spectral Workbench!"

# Set correct environment variables.
ENV HOME /root

# Install dependencies
RUN sed -i '/.*stretch-updates.*/d' /etc/apt/sources.list && \
    apt-get update -qq && \
    apt-get install -y --no-install-recommends \
                       imagemagick \
                       ruby-rmagick \
                       libmagickwand-dev \
                       libmagick++-dev \
                       libfreeimage3 \
                       libfreeimage-dev \
                       gdal-bin \
                       python-gdal \
                       curl \
                       libcurl4-openssl-dev \
                       libssl-dev \
                       zip \
                       netcat

# Install dependencies for system tests
RUN apt-get -y install fonts-liberation libappindicator3-1 libasound2 \
    libatk-bridge2.0-0 libatspi2.0-0 libgtk-3-0 libnspr4 \
    libnss3 libx11-xcb1 libxss1 libxtst6 lsb-release xdg-utils && \
    wget https://github.com/webnicer/chrome-downloads/raw/master/x64.deb/google-chrome-stable_75.0.3770.142-1_amd64.deb \
          -O google-chrome.deb && \
    dpkg -i google-chrome.deb && \
    apt-get -fy install && \
    wget https://chromedriver.storage.googleapis.com/74.0.3729.6/chromedriver_linux64.zip && \
    unzip chromedriver_linux64.zip && \
    mv chromedriver /usr/local/bin/chromedriver && \
    chmod +x /usr/local/bin/chromedriver

RUN curl -sL https://deb.nodesource.com/setup_13.x | bash - && \
    apt-get install -y nodejs npm && \
    npm install -g yarn && \
    gem install bundler

# Add the Rails app
WORKDIR /app
COPY . /app

ENTRYPOINT ["sh", "script/start.sh"]
