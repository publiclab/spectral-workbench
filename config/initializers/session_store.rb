# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_spectrometer_session',
  :secret      => '650c8ba31fcfae25a98326d1dd41fcff32d2975113d8bf8d9199f8a36ba4a7421953f775f35e7c19348cbf050bf220d200eb3cdc4beae3de4e9140a86f423f8a'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
