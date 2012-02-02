class CommentsController < ApplicationController

	def delete
		@comment = Comment.find(params[:id])
		if params[:password].to_i == APP_CONFIG["password"]
			@comment.destroy
		end
		redirect_to "/spectra/show/"+@comment.spectrum_id.to_s
	end

end
