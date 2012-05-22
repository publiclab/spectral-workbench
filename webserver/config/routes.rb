ActionController::Routing::Routes.draw do |map|
  map.users '/users', :controller => 'users', :action => 'list'
  map.profile '/profile', :controller => 'users', :action => 'profile'
  map.logout '/logout', :controller => 'sessions', :action => 'destroy'
  map.login '/login', :controller => 'sessions', :action => 'new'
  map.register '/register', :controller => 'users', :action => 'create'
  map.signup '/signup', :controller => 'users', :action => 'new'
  map.resources :users
  map.resource :session

  map.open_id_complete '/session', :controller => "session", :action => "create", :conditions => { :method => :get }
  #map.open_id_complete 'session', :controller => "session", :action => "create", :requirements => { :method => :get }

  map.resources :videos
  map.assign '/spectra/assign', :controller => 'spectrums', :action => 'assign'
  map.resources :spectrums
#  map.resources :spectrums, :collection=>{
#  :doSomething= > :get,
#  :doSomethingAgain => :post }
  map.resources :spectra_sets
  map.resources :comments, :belongs_to => :spectrums

  map.connect 'spectra/:id', :controller => "spectrums", :action => "show"
  map.connect 'spectra/:action/:id', :controller => "spectrums"
  map.connect 'spectra/:action/:id.:format', :controller => "spectrums"

  # The priority is based upon order of creation: first created -> highest priority.

  # Sample of regular route:
  #   map.connect 'products/:id', :controller => 'catalog', :action => 'view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   map.purchase 'products/:id/purchase', :controller => 'catalog', :action => 'purchase'
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   map.resources :products

  # Sample resource route with options:
  #   map.resources :products, :member => { :short => :get, :toggle => :post }, :collection => { :sold => :get }

  # Sample resource route with sub-resources:
  #   map.resources :products, :has_many => [ :comments, :sales ], :has_one => :seller
  
  # Sample resource route with more complex sub-resources
  #   map.resources :products do |products|
  #     products.resources :comments
  #     products.resources :sales, :collection => { :recent => :get }
  #   end

  # Sample resource route within a namespace:
  #   map.namespace :admin do |admin|
  #     # Directs /admin/products/* to Admin::ProductsController (app/controllers/admin/products_controller.rb)
  #     admin.resources :products
  #   end

  # You can have the root of your site routed with map.root -- just remember to delete public/index.html.
   map.root :controller => "spectrums"

  # See how all your routes lay out with "rake routes"

  # Install the default routes as the lowest priority.
  # Note: These default routes make all actions in every controller accessible via GET requests. You should
  # consider removing or commenting them out if you're using named routes and resources.
  map.connect ':controller/:action/:id'
  map.connect ':controller/:action/:id.:format'
end
