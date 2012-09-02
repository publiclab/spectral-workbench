require 'will_paginate/array'
class CaptureController < ApplicationController
  #protect_from_forgery :only => [:clone, :extract, :calibrate]
  # http://api.rubyonrails.org/classes/ActionController/RequestForgeryProtection/ClassMethods.html
  # create and update are protected by recaptcha

  def index
    if logged_in?
      @calibration = current_user.last_calibration
      @calibration = Spectrum.find(params[:calibration_id]) if params[:calibration_id]
      @start_wavelength,@end_wavelength = @calibration.wavelength_range 
    end
    if mobile?
      render :template => "capture/index.mobile.erb", :layout => "mobile"
    end
  end

  def match
    @set = SpectraSet.find params[:id]
    if logged_in?
      @calibration = current_user.last_calibration
      @start_wavelength,@end_wavelength = @calibration.wavelength_range 
    end
    @calibration = Spectrum.find :last if APP_CONFIG['local']
    if mobile?
      render :template => "capture/index.mobile.erb", :layout => "mobile" 
    else
      render :template => "capture/index.html.erb"
    end
  end

end
