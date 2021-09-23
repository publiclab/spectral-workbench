# frozen_string_literal: true

SpectralWorkbench::Application.routes.draw do
  mount JasmineRails::Engine => '/specs' if defined?(JasmineRails)

  get '/local/:login' => 'sessions#local'
  get '/logout' => 'sessions#logout'
  get '/login' => 'sessions#login'
  get '/session/new' => 'sessions#new'
  get '/session' => 'session#create', conditions: { method: :get }

  get '/register' => 'users#create'
  get '/signup' => 'users#new'
  get '/contributors' => 'users#contributors'
  get '/contributors/top' => 'users#top_contributors'
  get '/offline' => 'users#offline'

  # countertop spectrometer and device paths
  get '/key/:id' => 'device#create_key'
  get '/lookup' => 'device#lookup'
  get '/device/claim' => 'device#claim'

  get '/capture' => 'capture#index'
  get '/capture/v2' => 'capture#index2'
  get '/capture/recent_calibrations' => 'capture#recent_calibrations'

  # Registered user pages:
  get '/profile', to: 'users#show'
  get '/profile/:id', to: 'users#show'

  get '/macro/edit/:id' => 'macros#edit'
  get '/macro/update/:id' => 'macros#update'
  get '/macro/:author/:id' => 'macros#show'
  get '/macro/:author/:id.:format' => 'macros#show'
  get '/macros' => 'macros#index'

  get '/dashboard' => 'users#dashboard'
  get '/popular' => 'likes#index'
  get '/popular/recent' => 'likes#recent'

  get '/upload' => 'spectrums#new'
  post '/spectrums/create' => 'spectrums#create'
  get '/spectrums/destroy/:id' => 'spectrums#destroy' 
  get '/spectrums/:id/edit' => 'spectrums#edit'
  post '/spectrums/:id/update' => 'spectrums#update'
  post '/spectrums/fork/:id' => 'spectrums#fork'
  post '/spectrums/choose/:id' => 'spectrums#choose'

  post '/comments/spectrum/:id' => 'comments#spectrum'

  get '/tags/change_reference/:id' => 'tags#change_reference'

  get '/spectrums/choose' => 'spectrums#choose' # for pagination in adding spectrums to sets, for some reason needed to explicitly set this?

  resources :users do
    resources :spectrums
    resources :tags
    resources :macros
    resources :sets
    resources :comments
  end
  resources :snapshots
  resources :macros
  resources :session
  resources :tags do
    resources :snapshots
  end
  resources :sets do
    resources :comments
  end
  resources :comments, belongs_to: :spectrums
  resources :spectrums do
    resources :snapshots
    resources :comments
    resources :tags
    member do
      get :clone_search
      get :compare_search
      get :set_search
    end
  end
  resources :captures
  resources :sessions
  resources :devices
  resources :matches
  resources :likes
  resources :comments
  resources :sets

  post '/message' => 'users#message'
  get '/stats' => 'spectrums#stats'

  # legacy; permanent redirect:

  get 'capture/offline' => 'capture#offline'
  post 'capture/save' => 'capture#save'
  get 'capture/recent_calibrations' => 'capture#recent_calibrations'

  get 'comments/spectraset' => 'comments#spectraset'
  get 'comments/spectrum' => 'comments#spectrum'
  delete 'comments/delete' => 'comments#delete'

  post 'devices/create_key' => 'devices#create_key'
  get 'devices/lookup' => 'devices#lookup'
  get 'devices/claim' => 'devices#claim'

  get 'likes/toggle/:id' => 'likes#toggle'
  get 'likes/recent' => 'likes#recent'
  delete 'likes/delete' => 'likes#delete'

  get 'macros/author' => 'macros#author'

  # Here comes the matching controller
  get 'match/livesearch' => 'match#livesearch'
  get 'match/:id' => 'match#index'
  get 'match/get_conditions' => 'match#get_conditions'
  get 'match/livesearch' => 'match#livesearch'
  get 'match/search' => 'match#search'
  post 'match/search/:id' => 'match#search'

  get 'sessions/local' => 'sessions#local'
  get 'sessions/login' => 'sessions#login'
  get 'sessions/openid_authentication' => 'sessions#openid_authentication'
  get 'sessions/failed_login' => 'sessions#failed_login'
  get 'sessions/successful_login' => 'sessions#successful_login'
  post 'sessions/logout' => 'sessions#logout'

  get 'sets/search' => 'sets#search'
  delete 'sets/remove' => 'sets#remove'
  delete 'sets/delete' => 'sets#delete'
  get 'sets/embed/:id' => 'sets#embed'
  post 'sets/add' => 'sets#add'
  get 'sets/calibrated' => 'sets#calibrated'
  get 'sets/show2' => 'sets#show2'
  get 'sets/find_match' => 'sets#find_match'
  get 'sets/embed2/:id' => 'sets#embed2'

  get 'spectrums/match' => 'spectrums#match'
  get 'spectrums/extract' => 'spectrums#extract'
  get 'spectrums/search' => 'spectrums#search'
  get 'spectrums/embed/:id' => 'spectrums#embed'
  get 'spectrums/latest' => 'spectrums#latest'
  get 'spectrums/latest/:id' => 'spectrums#latest'
  get 'spectrums/anonymous' => 'spectrums#anonymous'
  get 'spectrums/plots_rss' => 'spectrums#plots_rss'
  get 'spectrums/clone_search' => 'spectrums#clone_search'
  get 'spectrums/compare_search' => 'spectrums#compare_search'
  get 'spectrums/set_search' => 'spectrums#set_search'
  get 'spectrums/show2' => 'spectrums#show2'
  get 'spectrums/all' => 'spectrums#all'
  get 'spectrums/embed2/:id' => 'spectrums#embed2'
  get 'spectrums/calibrate' => 'spectrums#calibrate'
  get 'spectrums/stats' => 'spectrums#stats'
  get 'spectrums/recent' => 'spectrums#recent'
  get 'spectrums/clone_calibration' => 'spectrums#clone_calibration'
  get 'spectrums/latest_snapshot_id' => 'spectrums#latest_snapshot_id'
  get 'spectrums/rss' => 'spectrums#rss'
  get 'spectrums/find_brightest_row' => 'spectrums#find_brightest_row'
  get 'spectrums/upload' => 'spectrums#upload'
  get 'spectrums/setsamplerow' => 'spectrums#setsamplerow'
  get 'spectrums/rotate' => 'spectrums#rotate'
  get 'spectrums/fork' => 'spectrums#fork'
  get 'spectrums/reverse' => 'spectrums#reverse'
  get 'spectrums/choose' => 'spectrums#choose'

  get 'tags/change_reference' => 'tags#change_reference'

  get 'users/dashboard' => 'users#dashboard'
  get 'users/message' => 'users#message'
  get 'users/comments' => 'users#comments'
  get 'users/contributors' => 'users#contributors'
  get 'users/top_contributors' => 'users#top_contributors'

  get '/analyze/spectrum/:id', to: redirect('/spectrums/%{id}')
  get '/analyze/spectrum/:id.:format', to: redirect('/spectrums/%{id}.%{format}')
  get '/spectra/show/:id.:format', to: redirect('/spectrums/%{id}.%{format}')
  get '/spectra/show/:id', to: redirect('/spectrums/%{id}')
  get '/sets/show/:id.:format', to: redirect('/sets/%{id}.%{format}')
  get '/sets/show/:id', to: redirect('/sets/%{id}')
  get '/sets/:id' => 'sets#show'

  get '/spectra/assign' => 'spectrums#assign'
  get '/spectra/feed' => 'spectrums#rss', defaults: { format: 'xml' }
  get '/spectra/search' => 'spectrums#search'
  post '/spectra/calibrate/:id' => 'spectrums#calibrate'
  get '/spectra/anonymous' => 'spectrums#anonymous'
  get '/spectra/search/:id' => 'spectrums#search'
  get '/search/:id' => 'spectrums#search'
  get '/spectra/plotsfeed' => 'spectrums#plots_rss', defaults: { format: 'xml' }
  get '/spectra/feed/:author' => 'spectrums#rss', defaults: { format: 'xml' }
  get '/spectra/:id' => 'spectrums#show'
  get '/spectra/:action/:id' => 'spectrums'

  # cache_interval is how often the cache is recalculated
  # but if nothing changes, the checksum will not change
  # and the manifest will not trigger a re-download
  offline = Rack::Offline.configure cache_interval: 120 do
    cache ActionController::Base.helpers.asset_path('application.css')
    cache ActionController::Base.helpers.asset_path('application.js')
    cache ActionController::Base.helpers.asset_path('capture.css')
    cache ActionController::Base.helpers.asset_path('capture.js')
    cache ActionController::Base.helpers.asset_path('analyze.js')

    # cache "/capture"
    cache '/capture/offline'
    cache '/offline'

    cache '/images/spectralworkbench.png'
    cache '/images/example-sky.jpg'
    cache '/images/example-cfl.jpg'
    cache '/images/calibration-example.png'
    cache '/images/logo.png'
    cache '/lib/junction/webfonts/junction-regular.eot'
    cache '/lib/junction/webfonts/junction-regular.woff'
    cache '/lib/junction/webfonts/junction-regular.ttf'
    cache '/lib/junction/webfonts/junction-regular.svg'
    cache '/lib/fontawesome/css/font-awesome.min.css'

    network '/'
    fallback '/' => '/offline'
    fallback '/dashboard' => '/offline'
  end
  get '/index.manifest' => offline

  root to: 'spectrums#index'
end
