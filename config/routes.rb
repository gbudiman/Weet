require 'sidekiq/web'

Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }
  authenticate :user do
    mount Sidekiq::Web => '/sidekiq'
  end
  mount ActionCable.server, at: '/cable'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root to: 'weeet#index'
  get      '/weets',                           to: 'weeet#fetch'
  get      '/weet',                            to: 'weeet#fetch_with'
  get      '/votes',                           to: 'weeet#get_votes'
  post     '/vote',                            to: 'weeet#send_vote'
  post     '/weet',                            to: 'weeet#post_weet'
  get      '/heartbeat',                       to: 'weeet#heartbeat'
  post     '/edit_name',                       to: 'user#edit_name'
  get      '/user/activity',                   to: 'user#activity'
  get      '/user/fetch_activity',             to: 'user#fetch_activity'
  get      '/user/has_enough_karma',           to: 'user#has_enough_karma'
  get      '/block_explorer',                  to: 'weeet#block_explorer'
  get      '/abi',                             to: 'weeet#get_abi'
  get      '/socket',                          to: 'weeet#get_socket_config'
  get      '/contract_meta',                   to: 'weeet#get_contract_meta'
  get      '/weeter_names',                    to: 'user#get_names'
  get      '/backroom',                        to: 'admin#index'
  get      '/weeters',                         to: 'admin#get_weeters'
  post     '/edit/karma',                      to: 'admin#edit_karma'
  post     '/edit/streak',                     to: 'admin#edit_streak'
  post     '/edit/refill',                     to: 'admin#edit_refill'
end
