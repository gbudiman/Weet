# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path.
# Rails.application.config.assets.paths << Emoji.images_path
# Add Yarn node_modules folder to the asset load path.
Rails.application.config.assets.paths << Rails.root.join('node_modules')

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in the app/assets
# folder are already added.
Rails.application.config.assets.precompile += %w( activity.js
                                                  admin.js
                                                  block_explorer.js
                                                  bootstrap-editable.min.js
                                                  heartbeat.js
                                                  layout.js
                                                  slide-to-unlock.js
                                                  web3.min.js
                                                  weet_cloner.js
                                                  activity.scss
                                                  backroom.scss
                                                  bootstrap-editable.css
                                                  slide-to-unlock.scss
                                                  weeet.scss )
