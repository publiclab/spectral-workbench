# get rid of this with better ActiveRecord 3 calls:
require 'will_paginate/array'

class CaptureController < ApplicationController
  #protect_from_forgery :only => [:clone, :extract, :calibrate]
  # http://api.rubyonrails.org/classes/ActionController/RequestForgeryProtection/ClassMethods.html
  # we no longer use recaptcha; start requiring auth token: 
  skip_before_filter :verify_authenticity_token

  before_filter :require_login, :except => [:index, :recent_calibrations]

  def index
    if logged_in?
      @offline = true
      @calibration = current_user.last_calibration
      @calibration = Spectrum.find(params[:calibration_id]) if params[:calibration_id]
      @calibrations = Spectrum.where(calibrated: true, user_id: current_user.id)
      @start_wavelength,@end_wavelength = @calibration.wavelength_range if @calibration
    else
      @offline = "flush"
    end
    @spectrums = Spectrum.find(:all, :limit => 12, :order => "id DESC")
    render :template => "capture/index", :layout => "application"
  end

  # designed to replace the spectrums_controller method "create" with a
  # unified, simplified version which integrates
  # rotation/flip, cross section, smoothing, equalizing, and comparison, and maybe calibration?
  # geocoding?
  def save
    # be sure there's a "login" field here too, so users don't lose data when they're required to log in.
    @spectrum = Spectrum.new({
      :title => params[:title],
      :author => current_user.login,
      :notes => params[:notes],
      :user_id => current_user.id
    })

    # save everything in an error block or transaction?

    # get the photo itself
    if params[:img]
      @spectrum.image_from_dataurl(params[:img])
    elsif params[:photo]
      @spectrum.photo = params[:photo]
    end

    if @spectrum.save
      if params[:data] # data supplied by client
        @spectrum.data = params[:data]
      else # server-side extract:
        @spectrum.extract_data
        @spectrum.scale_data(params[:endWavelength],params[:startWavelength]) if (params[:endWavelength] && params[:startWavelength])
      end

      # clone calibration? Do it based on a tag.
      # But can we clone all tags, and normalization, and sample row?
      @spectrum.clone(params[:spectrum][:calibration_id]) if params[:clone]

      # process all metadata based on tags:
      # @spectrum.tag("rotated:90",current_user.id)
      # @spectrum.tag("flipped:horizontal",current_user.id)
      # @spectrum.tag("normalized:area",current_user.id)
      # @spectrum.tag("calibrated:reference",current_user.id)
      # @spectrum.tag("cross-section:0-640x131",current_user.id) # X1-X2xY1-Y2 or X1-X2xY1
      # @spectrum.tag("lat:xxx",current_user.id)
      # @spectrum.tag("lon:xxx",current_user.id)

      # can we use: @spectrum.tag(params[:tags],current_user.id) if params[:tags]
      params[:tags].split(',').each do |tag|
        @spectrum.tag(tag,current_user.id)
      end

      flash[:notice] = 'Spectrum was successfully created.'
      format.html {
        redirect_to spectrum_path(@spectrum)
      }
      format.xml  { render :xml => @spectrum, :status => :created, :location => @spectrum }
    else
      # this isn't quite right. Also let's do ajax errors.
      render "spectrums/new-errors"
    end
  end

  def recent_calibrations
    if logged_in?
      #@offline = true
      @spectrums = current_user.tag('calibration',20)
      respond_to do |format|
        format.json { render :json => @spectrums.to_json(:methods => :created_at_in_words) }
      end
    else
      respond_to do |format|
        format.json { render :json => { :errors => "You must be logged in to get recent calibrations."}, :status => 422 }
      end
    end
  end

end
