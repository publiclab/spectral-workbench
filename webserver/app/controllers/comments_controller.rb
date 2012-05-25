class CommentsController < ApplicationController

	def index
	end

	def delete
		@comment = Comment.find(params[:id])
		if @comment.author == current_user.login || params[:password].to_i == APP_CONFIG["password"]
			@comment.destroy
		end
		redirect_to "/spectra/show/"+@comment.spectrum_id.to_s
	end

end
