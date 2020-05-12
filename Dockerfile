# Dockerfile # Spectral Workbench 
# https://github.com/publiclab/spectral-workbench

FROM ruby:2.6.5-stretch

LABEL maintainer="Sebastian Silva <sebastian@fuentelibre.org>"
LABEL description="This image deploys Spectral Workbench!"

# Set correct environment variables.
ENV HOME /root

# Install dependencies
RUN sed -i '/.*jessie-updates.*/d' /etc/apt/sources.list && \
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

RUN curl -sL https://deb.nodesource.com/setup_13.x | bash - && \
    apt-get install -y nodejs npm && \
    npm install -g bower

# Add the Rails app
WORKDIR /app
COPY . /app

ENTRYPOINT ["sh", "script/start.sh"]
