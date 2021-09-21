# frozen_string_literal: true

class MatchController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
    id = params[:id]

    if id.nil? # No need to search anything
      flash[:error] = 'ID is required for matching'
      redirect_to '/dashboard/'
      nil

    else
      @proc_spectrum = ProcessedSpectrum.find_by_spectrum_id(id)

      if @proc_spectrum # Found a spectrum with specified id.
        @spectra = @proc_spectrum.closest_match(params[:fit].to_i, 20)
        @spectrum = Spectrum.find(id)

        if params[:c] # Flag to check if the rendering is for comparing or displaying
          render partial: 'match_results', layout: false
        else
          render partial: 'list_results', layout: false
        end

      else # Didnt find a spectrum with specified id
        flash[:error] = 'A spectrum with the specified ID is not found'
        redirect_to '/dashboard/'
        nil
      end
    end
  end

  def search
    id = params[:id]
    range = params[:fit]
    range ||= 100

    @range = range.to_i

    if @range.negative? || @range > 150
      @range = 100
      @err = 'The fit input must be between 0 and 150'
    end

    @spectrum = Spectrum.find(id)

    unless @spectrum.calibrated
      message = 'The spectrum is not calibrated. If you are the author of this spectrum please calibrate it first'
      if params[:toolPane]
        render plain: message, layout: false
      else
        flash[:error] = message
        redirect_to spectrum_path(id.to_s)
      end
      return
    end

    @spectra = @spectrum.find_similar(@range)
                        .paginate(page: params[:page], per_page: 24)

    @sets = @spectrum.sets
    @macros = Macro.find :all, conditions: { macro_type: 'analyze' }
    @calibrations = current_user.calibrations if logged_in?
    @comment = Comment.new

    respond_to do |format|
      format.html { render partial: 'macros/spectra', locals: { spectrums: @spectra } if params[:toolPane] }
      format.xml  { render xml: @spectra }
      format.csv  do
        render html: SpectrumsHelper.show_csv(@spectrum)
      end
      format.json { render json: @spectra.map(&:json) } # actually flatten in the json of each spectrum; kind of messy
    end
  end

  def livesearch
    data = ActiveSupport::JSON.decode('{' + params[:data] + '}')
    bins = (10...640).step(10)
    types = %w(a r g b)
    range = 50
    ids = []

    matches = ProcessedSpectrum.find(:all, conditions: [get_conditions(data, bins, types, range)])

    range_visits = [range] # To check the ranges visited

    # This loop will take 8 iterations at maximum.
    while matches.empty? || (matches.size > 5)
      range = if matches.size > 5 # Need to reduce the range
                range - 10
              else
                range + 10
              end

      break if range_visits.member?(range) || range.negative? || (range > 80)

      range_visits.push(range)
      matches = ProcessedSpectrum.find(:all, conditions: [get_conditions(data, bins, types, range)])
    end

    matches.each do |match|
      ids += ["id = #{match.spectrum_id}"]
    end

    if ids == [] # This means that we have not found even a single match
      @error = 'Sorry, No Matches found!'
    else
      id_string = ids.join(' OR ')
      @spectra = Spectrum.find(:all, order: 'created_at DESC', conditions: [id_string], limit: 2)
    end

    render partial: 'livesearch', layout: false
  end

  def get_conditions(data, bins, types, range)
    conditions = []
    bins.each do |bin|
      types.each do |type|
        bin_string = "#{type}#{bin}"

        low = data[bin_string].to_i - range
        high = data[bin_string].to_i + range
        conditions += ["#{bin_string} BETWEEN #{low} AND #{high}"]
      end
    end

    conditions.join(' AND ')
  end
end
