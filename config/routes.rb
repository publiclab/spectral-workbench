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

  get '/offline' => 'users#offline'
  get '/local/:login' => 'sessions#local'
  get '/logout' => 'sessions#destroy'
  get '/login' => 'sessions#new'
  get '/register' => 'users#create'
  get '/signup' => 'users#new'
  get '/users' => 'users#list'
  get '/contributors' => 'users#contributors'
  resources :users
  resources :session

  # countertop spectrometer and device paths
  get '/key/:id' => 'device#create_key'
  get '/lookup' => 'device#lookup'
  get '/device/claim' => 'device#claim'

  get '/capture' => 'capture#index'
  get '/upload' => 'spectrums#new'
  get '/capture/beta' => 'capture#index', :alt => 'true'
  get '/capture/legacy' => 'capture#index', :legacy => 'true'

  # Registered user pages:
  get '/profile' => 'users#profile'
  get '/profile/:id' => 'users#profile'
  get '/macro/edit/:id' => 'macros#edit'
  get '/macro/update/:id' => 'macros#update'
  get '/macro/:author/:id' => 'macros#show'
  get '/macro/:author/:id.:format' => 'macros#show'
  get '/dashboard' => 'users#dashboard'
  get '/popular' => 'likes#index'
  get '/popular/recent' => 'likes#recent'
  get '/comments' => 'comments#index'
  get '/comment/create/:id' => 'comments#create'

  get '/session' => 'session#create', :conditions => { :method => :get }

  resources :videos
  get '/spectra/assign' => 'spectrums#assign'
  get '/tag/create' => 'tag#create'
  get '/tag/:id' => 'tag#show'
  get '/tag/:id.:format' => 'tag#show'
  get '/tags' => 'tag#index'
  resources :spectrums
  resources :spectra_sets
  resources :comments, :belongs_to => :spectrums

  get '/message' => 'users#message'

  get '/stats' => 'spectrums#stats'
  get '/spectra/feed' => 'spectrums#rss'
  get '/spectra/search' => 'spectrums#search'
  get '/spectra/anonymous' => 'spectrums#anonymous'
  get '/spectra/search/:id' => 'spectrums#search'
  get '/search/:id' => 'spectrums#search'
  get '/spectra/plotsfeed' => 'spectrums#plots_rss'
  get '/spectra/feed/:author' => 'spectrums#rss'
  get '/spectra/:id' => 'spectrums#show'
  get '/spectra/:action/:id' => 'spectrums'
  get '/spectra/show/:id.:format' => 'analyze#spectrum'

  get '/analyze/:action/:id' => 'analyze'

  # Here comes the matching controller
  get '/match/livesearch' => 'match#livesearch'
  get '/match/:id' => 'match#index'

  root to: 'spectrums#index'

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'

  # See how all your routes lay out with 'rake routes'
  match ':controller/:action'
  match ':controller/:action/:id'
  match ':controller/:action/:id.:format'

end
