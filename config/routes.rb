Rails.application.routes.draw do
  devise_for :users
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  get      '/weets',                           to: 'weeet#fetch'
  get      '/votes',                           to: 'weeet#get_votes'
  post     '/vote',                            to: 'weeet#send_vote'
  post     '/weet',                            to: 'weeet#post_weet'
end
