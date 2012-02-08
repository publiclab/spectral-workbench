class UpdateController < ApplicationController

	def index
		render :text => APP_CONFIG['version']
	end

end
