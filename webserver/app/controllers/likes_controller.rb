class LikesController < ApplicationController

	def create
		@spectrum.find params[:id]
		if logged_in? && @spectrum.author != current_user.login && !@spectrum.liked_by(current_user.id)
			@like = Like.new({
				:user_id => current_user.id,
				:spectrum_id => params[:id]
			})
			if @like.save
				render :text => "success"
			else 
				render :text => "There was an error with this like"
			end 
		else 
			render :text => "You must be logged in to like, you cannot like your own, and you cannot double-like."
		end
	end

	def delete
		@like = Like.find(params[:id])
		if @like.user_id == current_user.id || params[:password].to_i == APP_CONFIG["password"] || current_user.role == "admin"
			@like.delete
		end
		redirect_to "/analyze/spectrum/"+@like.spectrum_id.to_s if params[:index] != "true"
	end

end
