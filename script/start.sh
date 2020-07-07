#!/bin/bash

pidfile=/app/tmp/pids/server.pid

bundle update --bundler
bundle check || bundle install
bower install --allow-root

cp db/schema.rb.example db/schema.rb
cp config/database.yml.docker.example config/database.yml
cp config/config.yml.example config/config.yml

until nc -z -v -w30 db 3306; do
 echo 'Waiting for MySQL...'
 sleep 1
done

echo "MySQL is up and running!"

bundle exec rails db:create
bundle exec rails db:migrate
bundle exec rails db:seed

if [ -f $pidfile ] ; then
	>&2 echo 'Server PID file already exists. Removing it...';
	rm $pidfile;
fi

echo "Web server started"

bundle exec passenger start --port $PORT
