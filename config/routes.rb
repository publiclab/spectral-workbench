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
  #       get 'recent', :on => :collection
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

  get '/local/:login' => 'sessions#local'
  get '/logout' => 'sessions#logout'
  get '/login' => 'sessions#login'
  get '/session/new' => 'sessions#new'

  get '/register' => 'users#create'
  get '/signup' => 'users#new'
  get '/contributors' => 'users#contributors'
  get '/offline' => 'users#offline'

  resources :users

  resources :session

  # countertop spectrometer and device paths
  get '/key/:id' => 'device#create_key'
  get '/lookup' => 'device#lookup'
  get '/device/claim' => 'device#claim'

  get '/upload' => 'spectrums#new'

  get '/capture' => 'capture#index'
  get '/capture/recent_calibrations' => 'capture#recent_calibrations'
  get '/capture/beta' => 'capture#index', :alt => 'true'
  get '/capture/legacy' => 'capture#index', :legacy => 'true'


  # Registered user pages:
  get '/profile', to: 'users#show', :as => 'profile'
  get '/profile/:id', to: 'users#show', :as => 'profile'

  get '/macro/edit/:id' => 'macros#edit'
  get '/macro/update/:id' => 'macros#update'
  get '/macro/:author/:id' => 'macros#show'
  get '/macro/:author/:id.:format' => 'macros#show'
  get '/macros' => 'macros#index'
  get '/dashboard' => 'users#dashboard'
  get '/popular' => 'likes#index'
  get '/popular/recent' => 'likes#recent'
  get '/comments' => 'comments#index'
  post '/comment/create/:id' => 'comments#create'

  get '/session' => 'session#create', :conditions => { :method => :get }

  get '/spectra/assign' => 'spectrums#assign'

  resources :tags

  resources :spectrums do
    member do
      get :clone_search
      get :set_search
    end
  end

  resources :spectra_sets
  resources :comments, :belongs_to => :spectrums
  post '/spectrums/create' => 'spectrums#create'

  get '/message' => 'users#message'

  get '/sets' => 'sets#index'

  get '/stats' => 'spectrums#stats'
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

    cache "/capture"
    #cache "/capture/offline"
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
  match "/index.manifest" => offline

  root to: 'spectrums#index'

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'

  # See how all your routes lay out with 'rake routes'
  match ':controller/:action'
  match ':controller/:action/:id'
  match ':controller/:action/:id.:format'

end
