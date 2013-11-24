require 'will_paginate/array'
class CaptureController < ApplicationController
  #protect_from_forgery :only => [:clone, :extract, :calibrate]
  # http://api.rubyonrails.org/classes/ActionController/RequestForgeryProtection/ClassMethods.html
  # create and update are protected by recaptcha

  skip_before_filter :verify_authenticity_token

  def index
    if logged_in?
      @offline = true
      @calibration = current_user.last_calibration
      @calibration = Spectrum.find(params[:calibration_id]) if params[:calibration_id]
      @start_wavelength,@end_wavelength = @calibration.wavelength_range if @calibration
    end
    @spectrums = Spectrum.find(:all, :limit => 12, :order => "id DESC")
    if params[:alt] == "true"
      render :template => "capture/index-beta.html.erb", :layout => "application"
    elsif mobile?
      render :template => "capture/index-mobile.html.erb", :layout => "mobile"
    end
  end

end
