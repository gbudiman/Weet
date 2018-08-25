Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }
  mount ActionCable.server, at: '/cable'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root to: 'weeet#index'
  get      '/weets',                           to: 'weeet#fetch'
  get      '/votes',                           to: 'weeet#get_votes'
  post     '/vote',                            to: 'weeet#send_vote'
  post     '/weet',                            to: 'weeet#post_weet'
  get      '/heartbeat',                       to: 'weeet#heartbeat'
  post     '/edit_name',                       to: 'user#edit_name'
end
