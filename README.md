# Spectral Workbench

Copyright 2011-2016 Public Lab
publiclab.org | spectralworkbench.org

![tests](https://travis-ci.org/publiclab/spectral-workbench.svg)

Spectral Workbench is an open-source tool to perform low-cost spectral analysis and to share those results online. It consists of a Ruby on Rails web application for publishing, archiving, discussing, and analyzing spectra online -- running at http://spectralworkbench.org

Read about how to build and use your own spectrometer with this software here: http://publiclab.org/wiki/spectrometer


****

## Simple installation with Cloud9

1. If you have a GitHub account, visit https://c9.io and log in with the GitHub button.
2. Fork this repository to your own GitHub account, creating a `yourname/spectral-workbench` project.
3. Name your project, then (order important!) choose the **Ruby** template, THEN enter `yourname/spectral-workbench` in the "Clone from Git or Mercurial URL" field, and press **Create Workspace** 
4. In the command line prompt at the bottom of the page, type `./install_cloud9.sh` and press enter.
5. Enter your username when prompted, and click "Run Project" when it's done.
6. You're done! Go to the URL shown!


****

## Installation

The app now runs on Ruby 1.9.3 up to Ruby 2.1.2 (preferred), and Rails 3.2.x, and uses Bundler for gem management and Bower for static asset management.  


### Prerequisites:

Recommended; for an Ubuntu/Debian system. Varies slightly for mac/fedora/etc

Install a database, if necessary:

`sudo apt-get install mysql-server`

**Note:** You will have to update the `config/database.yml` file appropriately. The example file assumes usage of SQLite. For which you need not install MySQL.

RMagick dependencies are required for processing uploaded spectrum images: `apt-get install imagemagick ruby-rmagick libmagickwand-dev libmagick++-dev`

* On Fedora/centOs: `yum install ImageMagick-devel`
* On mac, you can use Homebrew: `brew install imagemagick`

Install rvm for Ruby management (http://rvm.io)

`curl -L https://get.rvm.io | bash -s stable`

**Note:** At this point during the process, you may want to log out and log back in, or open a new terminal window; RVM will then properly load in your environment. 

**Ubuntu users:** You may need to enable `Run command as a login shell` in Ubuntu's Terminal, under Profile Preferences > Title and Command. Then close the terminal and reopen it.

Then, use RVM to install version 2.1.2 of Ruby:

`rvm install 2.1.2`

You'll also need **bower** which is available through NPM. To install NPM, you can run:

`sudo apt-get install npm`

However, on Ubuntu, you may need to also install the `nodejs-legacy` package, as due to a naming collision, some versions of Ubuntu already have an unrelated package called `node`. To do this, run:

`sudo apt-get install nodejs-legacy`

Once NPM is installed, you should be able to run:

`sudo npm install -g bower`


### Installation steps:

1. Download a copy of the source with `git clone https://github.com/publiclab/spectral-workbench.git` 
2. Install gems with `bundle install` from the rails root folder. You may need to run `bundle update` if you have older gems in your environment.
3. Copy and configure config/database.yml from config/database.yml.example, using a new empty databse you've created. Do the same thing for config/config.yml file copying it from config/config.yml.example file.
4. Initialize database with `bundle exec rake db:setup`
5. Install static assets (like external javascript libraries, fonts) with `bower install` 
6. Start rails with `bundle exec passenger start` from the Rails root and open http://localhost:3000 in a web browser. (For some, just `passenger start` will work; adding `bundle exec` ensures you're using the version of passenger you just installed with Bundler.)

Sign in instructions:

*  Create a account at PublicLab.org and use that username to log in.
*  Then you will be redirected to publiclab.org to "approve" a use of the openid identity.
*  Note that this applies for development environment as well. 


## Bugs and support

To report bugs and request features, please use the GitHub issue tracker provided at http://github.com/publiclab/spectral-workbench/issues 

For additional support, join the Public Laboratory website and mailing list at http://publiclab.org/lists or for urgent requests, email web@publiclab.org

For questions related to the use of this software and your open source spectrometer, the same page links to the "plots-spectrometry" group. 


## API

Using your secret API token on your SpectralWorkbench.org profile, you can submit spectral via the API in JSON format:

POST to "https://spectralworkbench.org/spectrums.json"

The required parameters are: 

```json
{"spectrum": {
  "title": "Test spectrum",
  "data_type": "json",
  "data": [
    {"average": 64.3, "r": 69, "g": 46, "b": 78, "wavelength": 269.089 },
    {"average": 63.3, "r": 71, "g": 45, "b": 74, "wavelength": 277.718 },
    {"average": 64,   "r": 71, "g": 47, "b": 74, "wavelength": 291.524 },
    {"average": 64,   "r": 68, "g": 49, "b": 75, "wavelength": 303.604 }
  ]},
  "token": "00000000"
}
```

This will return a path (from the root URL by default) to the spectrum, as in: `/spectrums/12345`



## Developers

Development is occurring at https://github.com/publiclab/spectral-workbench/; please fork and submit pull requests; for more guidelines on contributing to Public Lab projects, see http://publiclab.org/wiki/contributing-to-public-lab-software

If you're a developer, consider joining the Public Lab developer list, also at http://publiclab.org/wiki/developers


### Testing

Before submitting changes, please run tests with `rake test` to ensure that your code passes.

Also run `rake jasmine` and navigate to http://localhost:8888 to check client-side tests.

New tests are also appreciated to increase coverage; Rails tests are in /test and Jasmine tests (JavaScript tests) are in /spec.


****

## License

Spectral Workbench is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Spectral Workbench is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Spectral Workbench.  If not, see <http://www.gnu.org/licenses/>.
