# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application do |config|
  config.assets.version = '1.1'

  # Add additional assets to the asset load path.
  # Rails.application.config.assets.paths << Emoji.images_path
  # Version of your assets, change this if you want to expire all your assets
  config.assets.paths << Rails.root.join('public/lib')
  config.assets.paths << Rails.root.join("node_modules")
  config.assets.paths << Rails.root.join("app", "assets", "fonts")
  config.assets.precompile += ['capture.js', 'analyze.js']

  # Precompile additional assets.
  # application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
  # Rails.application.config.assets.precompile += %w( search.js )
end
