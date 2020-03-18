#!/bin/bash

pidfile=/app/tmp/pids/server.pid

bower install --allow-root
cp config/database.yml.docker.example config/database.yml
cp config/config.yml.example config/config.yml
cp db/schema.rb.example db/schema.rb

until nc -z -v -w30 db 3306; do
 echo 'Waiting for MySQL...'
 sleep 1
done

echo "MySQL is up and running!"

bundle exec rake db:setup
bundle exec rake db:migrate

if [ -f $pidfile ] ; then
	>&2 echo 'Server PID file already exists. Removing it...';
	rm $pidfile;
fi

bundle exec rails s -p 5000 -b '0.0.0.0'
