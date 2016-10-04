#!/bin/bash
set -e -o pipefail

read -p "Enter your cloud9 username: " un
rvm install ruby-2.1.2
rvm 2.1.2
sudo apt-get update
sudo apt-get install libmagickwand-dev libmagick++-dev imagemagick ruby-rmagick
sudo apt-get install nodejs npm
mysql-ctl start
npm install bower
bower install
bundle install
rake cloud9 username=$un
rake db:setup
rake db:migrate
rake db:seed
echo "Done! Now, click 'Run Project' at the top of the screen."
