class DeviceController < ApplicationController

  def index
    if logged_in?
      @devices = Device.where(user_id: current_user.id)  

    else
      flash[:error] = "You must be logged in to view that page."
      redirect_to "/login"
    end
  end

  # One-off method for creating precalibrated countertop spectrometers for the Kickstarter.
  def create_key
    if logged_in? && current_user.role == "admin"
      @device = Device.new({
        :name => "Precalibrated Countertop Spectrometer",
        :user_id => 0,
        :calibration_id => params[:id]
      })
      if @device.save!
        @device.key = @device.id.to_s + [*'A'..'Z'].sample + [*'A'..'Z'].sample
        @device.save!
        flash[:notice] = "Key saved: "+@device.key
      else
        flash[:error] = "Device key generation failed."
      end
      redirect_to spectrum_path(params[:id])
    else
      flash[:error] = "You must be logged in to view that page."
      redirect_to "/login"
    end
  end

  def lookup
  end

  # for claiming a calibration based on a key
  def claim
    if logged_in?
      @device = Device.find_by_key params[:key].upcase
      @device.user_id = current_user.id
      @device.save!
      @spectrum = Spectrum.find @device.calibration_id
      @spectrum.author = current_user.login
      @spectrum.user_id = current_user.id
      @spectrum.save!
      flash[:notice] = "Successfully fetched precalibration; your device is now calibrated and ready to use."
      redirect_to user_path(current_user.login)
    else
      flash[:error] = "You must be logged in to view that page."
      redirect_to "/login"
    end
  end

end
