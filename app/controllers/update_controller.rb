# originally to provide a way to check version numbers on client apps. Keep for native smartphone apps.
class UpdateController < ApplicationController

  def index
    render :text => APP_CONFIG['version']
  end

end
