SpectralWorkbench::Application.routes.draw do
  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (gets HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with 'root'
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with 'rake routes'

  mount JasmineRails::Engine => "/specs" if defined?(JasmineRails)

  get '/local/:login' => 'sessions#local'
  get '/logout' => 'sessions#logout'
  get '/login' => 'sessions#login'
  get '/session/new' => 'sessions#new'
  get '/session' => 'session#create', conditions: { :method => :get }

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

  post '/message' => 'users#message'
  get '/stats' => 'spectrums#stats'

  # legacy; permanent redirect:
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

  # Here comes the matching controller
  get '/match/livesearch' => 'match#livesearch'
  get '/match/:id' => 'match#index'


  # cache_interval is how often the cache is recalculated
  # but if nothing changes, the checksum will not change
  # and the manifest will not trigger a re-download
  offline = Rack::Offline.configure :cache_interval => 120 do
    cache ActionController::Base.helpers.asset_path("application.css")
    cache ActionController::Base.helpers.asset_path("application.js")
    cache ActionController::Base.helpers.asset_path("capture.css")
    cache ActionController::Base.helpers.asset_path("capture.js")
    cache ActionController::Base.helpers.asset_path("analyze.js")

    #cache "/capture"
    cache "/capture/offline"
    cache "/offline"

    cache "/images/spectralworkbench.png"
    cache "/images/example-sky.jpg"
    cache "/images/example-cfl.jpg"
    cache "/images/calibration-example.png"
    cache "/images/logo.png"
    cache "/lib/junction/webfonts/junction-regular.eot"
    cache "/lib/junction/webfonts/junction-regular.woff"
    cache "/lib/junction/webfonts/junction-regular.ttf"
    cache "/lib/junction/webfonts/junction-regular.svg"
    cache "/lib/fontawesome/css/font-awesome.min.css"

    network "/"
    fallback "/" => "/offline"
    fallback "/dashboard" => "/offline"
  end
  get "/index.manifest" => offline

  root to: 'spectrums#index'

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'


  # The commented dynamic routes are no longer supported after Rails 6.0
  # See how all your routes lay out with 'rake routes'
  # get ':controller/:action'
  # get ':controller/:action/:id'
  # get ':controller/:action/:id.:format'


  # Hardcoding dynamic routes due to deprecation in Rails 6.0

  get 'capture/offline' => 'capture#offline' 
  get 'capture/recent_calibrations' => 'capture#recent_calibrations' 
  get 'capture/save' => 'capture#save' 
  get 'capture/index' => 'capture#index' 
  get 'comments/spectraset' => 'comments#spectraset' 
  get 'comments/delete' => 'comments#delete' 
  get 'comments/spectrum' => 'comments#spectrum' 
  get 'comments/index' => 'comments#index' 
  get 'devices/create_key' => 'devices#create_key' 
  get 'devices/lookup' => 'devices#lookup' 
  get 'devices/claim' => 'devices#claim' 
  get 'devices/index' => 'devices#index' 
  get 'likes/index' => 'likes#index' 
  get 'likes/delete' => 'likes#delete' 
  get 'likes/toggle' => 'likes#toggle' 
  get 'likes/recent' => 'likes#recent' 
  get 'macros/author' => 'macros#author' 
  get 'macros/edit' => 'macros#edit' 
  get 'macros/create' => 'macros#create' 
  get 'macros/show' => 'macros#show' 
  get 'macros/update' => 'macros#update' 
  get 'macros/index' => 'macros#index' 
  get 'macros/delete' => 'macros#delete' 
  get 'macros/new' => 'macros#new' 
  get 'matches/get_conditions' => 'matches#get_conditions' 
  get 'matches/livesearch' => 'matches#livesearch' 
  get 'matches/search' => 'matches#search' 
  get 'matches/index' => 'matches#index' 
  get 'sessions/new' => 'sessions#new' 
  get 'sessions/local' => 'sessions#local' 
  get 'sessions/login' => 'sessions#login' 
  get 'sessions/openid_authentication' => 'sessions#openid_authentication' 
  get 'sessions/failed_login' => 'sessions#failed_login' 
  get 'sessions/successful_login' => 'sessions#successful_login' 
  get 'sessions/logout' => 'sessions#logout' 
  get 'sets/update' => 'sets#update' 
  get 'sets/show' => 'sets#show' 
  get 'sets/search' => 'sets#search' 
  get 'sets/index' => 'sets#index' 
  get 'sets/remove' => 'sets#remove' 
  get 'sets/embed' => 'sets#embed' 
  get 'sets/delete' => 'sets#delete' 
  get 'sets/add' => 'sets#add' 
  get 'sets/new' => 'sets#new' 
  get 'sets/edit' => 'sets#edit' 
  get 'sets/create' => 'sets#create' 
  get 'sets/calibrated' => 'sets#calibrated' 
  get 'sets/show2' => 'sets#show2' 
  get 'sets/find_match' => 'sets#find_match' 
  get 'sets/embed2' => 'sets#embed2' 
  get 'snapshots/show' => 'snapshots#show' 
  get 'snapshots/create' => 'snapshots#create' 
  get 'spectrums/match' => 'spectrums#match' 
  get 'spectrums/show' => 'spectrums#show' 
  get 'spectrums/extract' => 'spectrums#extract' 
  get 'spectrums/search' => 'spectrums#search' 
  get 'spectrums/index' => 'spectrums#index' 
  get 'spectrums/embed' => 'spectrums#embed' 
  get 'spectrums/latest' => 'spectrums#latest' 
  get 'spectrums/anonymous' => 'spectrums#anonymous' 
  get 'spectrums/new' => 'spectrums#new' 
  get 'spectrums/edit' => 'spectrums#edit' 
  get 'spectrums/destroy' => 'spectrums#destroy' 
  get 'spectrums/create' => 'spectrums#create' 
  get 'spectrums/plots_rss' => 'spectrums#plots_rss' 
  get 'spectrums/clone_search' => 'spectrums#clone_search' 
  get 'spectrums/compare_search' => 'spectrums#compare_search' 
  get 'spectrums/set_search' => 'spectrums#set_search' 
  get 'spectrums/show2' => 'spectrums#show2' 
  get 'spectrums/all' => 'spectrums#all' 
  get 'spectrums/update' => 'spectrums#update' 
  get 'spectrums/embed2' => 'spectrums#embed2' 
  get 'spectrums/save' => 'spectrums#save' 
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
  get 'tags/destroy' => 'tags#destroy' 
  get 'tags/create' => 'tags#create' 
  get 'tags/show' => 'tags#show' 
  get 'tags/index' => 'tags#index' 
  get 'users/dashboard' => 'users#dashboard' 
  get 'users/show' => 'users#show' 
  get 'users/message' => 'users#message' 
  get 'users/index' => 'users#index' 
  get 'users/comments' => 'users#comments' 
  get 'users/contributors' => 'users#contributors' 
  get 'users/top_contributors' => 'users#top_contributors' 
  get 'capture/offline/:id' => 'capture#offline' 
  get 'capture/recent_calibrations/:id' => 'capture#recent_calibrations' 
  get 'capture/save/:id' => 'capture#save' 
  get 'capture/index/:id' => 'capture#index' 
  get 'comments/spectraset/:id' => 'comments#spectraset' 
  get 'comments/delete/:id' => 'comments#delete' 
  get 'comments/spectrum/:id' => 'comments#spectrum' 
  get 'comments/index/:id' => 'comments#index' 
  get 'devices/create_key/:id' => 'devices#create_key' 
  get 'devices/lookup/:id' => 'devices#lookup' 
  get 'devices/claim/:id' => 'devices#claim' 
  get 'devices/index/:id' => 'devices#index' 
  get 'likes/index/:id' => 'likes#index' 
  get 'likes/delete/:id' => 'likes#delete' 
  get 'likes/toggle/:id' => 'likes#toggle' 
  get 'likes/recent/:id' => 'likes#recent' 
  get 'macros/author/:id' => 'macros#author' 
  get 'macros/edit/:id' => 'macros#edit' 
  get 'macros/create/:id' => 'macros#create' 
  get 'macros/show/:id' => 'macros#show' 
  get 'macros/update/:id' => 'macros#update' 
  get 'macros/index/:id' => 'macros#index' 
  get 'macros/delete/:id' => 'macros#delete' 
  get 'macros/new/:id' => 'macros#new' 
  get 'matches/get_conditions/:id' => 'matches#get_conditions' 
  get 'matches/livesearch/:id' => 'matches#livesearch' 
  get 'matches/search/:id' => 'matches#search' 
  get 'matches/index/:id' => 'matches#index' 
  get 'sessions/new/:id' => 'sessions#new' 
  get 'sessions/local/:id' => 'sessions#local' 
  get 'sessions/login/:id' => 'sessions#login' 
  get 'sessions/openid_authentication/:id' => 'sessions#openid_authentication' 
  get 'sessions/failed_login/:id' => 'sessions#failed_login' 
  get 'sessions/successful_login/:id' => 'sessions#successful_login' 
  get 'sessions/logout/:id' => 'sessions#logout' 
  get 'sets/update/:id' => 'sets#update' 
  get 'sets/show/:id' => 'sets#show' 
  get 'sets/search/:id' => 'sets#search' 
  get 'sets/index/:id' => 'sets#index' 
  get 'sets/remove/:id' => 'sets#remove' 
  get 'sets/embed/:id' => 'sets#embed' 
  get 'sets/delete/:id' => 'sets#delete' 
  get 'sets/add/:id' => 'sets#add' 
  get 'sets/new/:id' => 'sets#new' 
  get 'sets/edit/:id' => 'sets#edit' 
  get 'sets/create/:id' => 'sets#create' 
  get 'sets/calibrated/:id' => 'sets#calibrated' 
  get 'sets/show2/:id' => 'sets#show2' 
  get 'sets/find_match/:id' => 'sets#find_match' 
  get 'sets/embed2/:id' => 'sets#embed2' 
  get 'snapshots/show/:id' => 'snapshots#show' 
  get 'snapshots/create/:id' => 'snapshots#create' 
  get 'spectrums/match/:id' => 'spectrums#match' 
  get 'spectrums/show/:id' => 'spectrums#show' 
  get 'spectrums/extract/:id' => 'spectrums#extract' 
  get 'spectrums/search/:id' => 'spectrums#search' 
  get 'spectrums/index/:id' => 'spectrums#index' 
  get 'spectrums/embed/:id' => 'spectrums#embed' 
  get 'spectrums/latest/:id' => 'spectrums#latest' 
  get 'spectrums/anonymous/:id' => 'spectrums#anonymous' 
  get 'spectrums/new/:id' => 'spectrums#new' 
  get 'spectrums/edit/:id' => 'spectrums#edit' 
  get 'spectrums/destroy/:id' => 'spectrums#destroy' 
  get 'spectrums/create/:id' => 'spectrums#create' 
  get 'spectrums/plots_rss/:id' => 'spectrums#plots_rss' 
  get 'spectrums/clone_search/:id' => 'spectrums#clone_search' 
  get 'spectrums/compare_search/:id' => 'spectrums#compare_search' 
  get 'spectrums/set_search/:id' => 'spectrums#set_search' 
  get 'spectrums/show2/:id' => 'spectrums#show2' 
  get 'spectrums/all/:id' => 'spectrums#all' 
  get 'spectrums/update/:id' => 'spectrums#update' 
  get 'spectrums/embed2/:id' => 'spectrums#embed2' 
  get 'spectrums/save/:id' => 'spectrums#save' 
  get 'spectrums/calibrate/:id' => 'spectrums#calibrate' 
  get 'spectrums/stats/:id' => 'spectrums#stats' 
  get 'spectrums/recent/:id' => 'spectrums#recent' 
  get 'spectrums/clone_calibration/:id' => 'spectrums#clone_calibration' 
  get 'spectrums/latest_snapshot_id/:id' => 'spectrums#latest_snapshot_id' 
  get 'spectrums/rss/:id' => 'spectrums#rss' 
  get 'spectrums/find_brightest_row/:id' => 'spectrums#find_brightest_row' 
  get 'spectrums/upload/:id' => 'spectrums#upload' 
  get 'spectrums/setsamplerow/:id' => 'spectrums#setsamplerow' 
  get 'spectrums/rotate/:id' => 'spectrums#rotate' 
  get 'spectrums/fork/:id' => 'spectrums#fork' 
  get 'spectrums/reverse/:id' => 'spectrums#reverse' 
  get 'spectrums/choose/:id' => 'spectrums#choose' 
  get 'tags/change_reference/:id' => 'tags#change_reference' 
  get 'tags/destroy/:id' => 'tags#destroy' 
  get 'tags/create/:id' => 'tags#create' 
  get 'tags/show/:id' => 'tags#show' 
  get 'tags/index/:id' => 'tags#index' 
  get 'users/dashboard/:id' => 'users#dashboard' 
  get 'users/show/:id' => 'users#show' 
  get 'users/message/:id' => 'users#message' 
  get 'users/index/:id' => 'users#index' 
  get 'users/comments/:id' => 'users#comments' 
  get 'users/contributors/:id' => 'users#contributors' 
  get 'users/top_contributors/:id' => 'users#top_contributors' 
  get 'capture/offline/:id.:format' => 'capture#offline' 
  get 'capture/recent_calibrations/:id.:format' => 'capture#recent_calibrations' 
  get 'capture/save/:id.:format' => 'capture#save' 
  get 'capture/index/:id.:format' => 'capture#index' 
  get 'comments/spectraset/:id.:format' => 'comments#spectraset' 
  get 'comments/delete/:id.:format' => 'comments#delete' 
  get 'comments/spectrum/:id.:format' => 'comments#spectrum' 
  get 'comments/index/:id.:format' => 'comments#index' 
  get 'devices/create_key/:id.:format' => 'devices#create_key' 
  get 'devices/lookup/:id.:format' => 'devices#lookup' 
  get 'devices/claim/:id.:format' => 'devices#claim' 
  get 'devices/index/:id.:format' => 'devices#index' 
  get 'likes/index/:id.:format' => 'likes#index' 
  get 'likes/delete/:id.:format' => 'likes#delete' 
  get 'likes/toggle/:id.:format' => 'likes#toggle' 
  get 'likes/recent/:id.:format' => 'likes#recent' 
  get 'macros/author/:id.:format' => 'macros#author' 
  get 'macros/edit/:id.:format' => 'macros#edit' 
  get 'macros/create/:id.:format' => 'macros#create' 
  get 'macros/show/:id.:format' => 'macros#show' 
  get 'macros/update/:id.:format' => 'macros#update' 
  get 'macros/index/:id.:format' => 'macros#index' 
  get 'macros/delete/:id.:format' => 'macros#delete' 
  get 'macros/new/:id.:format' => 'macros#new' 
  get 'matches/get_conditions/:id.:format' => 'matches#get_conditions' 
  get 'matches/livesearch/:id.:format' => 'matches#livesearch' 
  get 'matches/search/:id.:format' => 'matches#search' 
  get 'matches/index/:id.:format' => 'matches#index' 
  get 'sessions/new/:id.:format' => 'sessions#new' 
  get 'sessions/local/:id.:format' => 'sessions#local' 
  get 'sessions/login/:id.:format' => 'sessions#login' 
  get 'sessions/openid_authentication/:id.:format' => 'sessions#openid_authentication' 
  get 'sessions/failed_login/:id.:format' => 'sessions#failed_login' 
  get 'sessions/successful_login/:id.:format' => 'sessions#successful_login' 
  get 'sessions/logout/:id.:format' => 'sessions#logout' 
  get 'sets/update/:id.:format' => 'sets#update' 
  get 'sets/show/:id.:format' => 'sets#show' 
  get 'sets/search/:id.:format' => 'sets#search' 
  get 'sets/index/:id.:format' => 'sets#index' 
  get 'sets/remove/:id.:format' => 'sets#remove' 
  get 'sets/embed/:id.:format' => 'sets#embed' 
  get 'sets/delete/:id.:format' => 'sets#delete' 
  get 'sets/add/:id.:format' => 'sets#add' 
  get 'sets/new/:id.:format' => 'sets#new' 
  get 'sets/edit/:id.:format' => 'sets#edit' 
  get 'sets/create/:id.:format' => 'sets#create' 
  get 'sets/calibrated/:id.:format' => 'sets#calibrated' 
  get 'sets/show2/:id.:format' => 'sets#show2' 
  get 'sets/find_match/:id.:format' => 'sets#find_match' 
  get 'sets/embed2/:id.:format' => 'sets#embed2' 
  get 'snapshots/show/:id.:format' => 'snapshots#show' 
  get 'snapshots/create/:id.:format' => 'snapshots#create' 
  get 'spectrums/match/:id.:format' => 'spectrums#match' 
  get 'spectrums/show/:id.:format' => 'spectrums#show' 
  get 'spectrums/extract/:id.:format' => 'spectrums#extract' 
  get 'spectrums/search/:id.:format' => 'spectrums#search' 
  get 'spectrums/index/:id.:format' => 'spectrums#index' 
  get 'spectrums/embed/:id.:format' => 'spectrums#embed' 
  get 'spectrums/latest/:id.:format' => 'spectrums#latest' 
  get 'spectrums/anonymous/:id.:format' => 'spectrums#anonymous' 
  get 'spectrums/new/:id.:format' => 'spectrums#new' 
  get 'spectrums/edit/:id.:format' => 'spectrums#edit' 
  get 'spectrums/destroy/:id.:format' => 'spectrums#destroy' 
  get 'spectrums/create/:id.:format' => 'spectrums#create' 
  get 'spectrums/plots_rss/:id.:format' => 'spectrums#plots_rss' 
  get 'spectrums/clone_search/:id.:format' => 'spectrums#clone_search' 
  get 'spectrums/compare_search/:id.:format' => 'spectrums#compare_search' 
  get 'spectrums/set_search/:id.:format' => 'spectrums#set_search' 
  get 'spectrums/show2/:id.:format' => 'spectrums#show2' 
  get 'spectrums/all/:id.:format' => 'spectrums#all' 
  get 'spectrums/update/:id.:format' => 'spectrums#update' 
  get 'spectrums/embed2/:id.:format' => 'spectrums#embed2' 
  get 'spectrums/save/:id.:format' => 'spectrums#save' 
  get 'spectrums/calibrate/:id.:format' => 'spectrums#calibrate' 
  get 'spectrums/stats/:id.:format' => 'spectrums#stats' 
  get 'spectrums/recent/:id.:format' => 'spectrums#recent' 
  get 'spectrums/clone_calibration/:id.:format' => 'spectrums#clone_calibration' 
  get 'spectrums/latest_snapshot_id/:id.:format' => 'spectrums#latest_snapshot_id' 
  get 'spectrums/rss/:id.:format' => 'spectrums#rss' 
  get 'spectrums/find_brightest_row/:id.:format' => 'spectrums#find_brightest_row' 
  get 'spectrums/upload/:id.:format' => 'spectrums#upload' 
  get 'spectrums/setsamplerow/:id.:format' => 'spectrums#setsamplerow' 
  get 'spectrums/rotate/:id.:format' => 'spectrums#rotate' 
  get 'spectrums/fork/:id.:format' => 'spectrums#fork' 
  get 'spectrums/reverse/:id.:format' => 'spectrums#reverse' 
  get 'spectrums/choose/:id.:format' => 'spectrums#choose' 
  get 'tags/change_reference/:id.:format' => 'tags#change_reference' 
  get 'tags/destroy/:id.:format' => 'tags#destroy' 
  get 'tags/create/:id.:format' => 'tags#create' 
  get 'tags/show/:id.:format' => 'tags#show' 
  get 'tags/index/:id.:format' => 'tags#index' 
  get 'users/dashboard/:id.:format' => 'users#dashboard' 
  get 'users/show/:id.:format' => 'users#show' 
  get 'users/message/:id.:format' => 'users#message' 
  get 'users/index/:id.:format' => 'users#index' 
  get 'users/comments/:id.:format' => 'users#comments' 
  get 'users/contributors/:id.:format' => 'users#contributors' 
  get 'users/top_contributors/:id.:format' => 'users#top_contributors'


end
