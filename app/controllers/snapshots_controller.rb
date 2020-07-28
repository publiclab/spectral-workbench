# frozen_string_literal: true

class SnapshotsController < ApplicationController
  respond_to :json
  before_action :no_cache, only: [:show]

  def create
    @spectrum = Spectrum.find params[:id]
    @snapshot = @spectrum.add_snapshot(
      current_user,
      params[:data]
    )
  end

  def show
    @snapshot = Snapshot.find params[:id]

    respond_with(@snapshot) do |format|
      format.xml do
        render xml: @snapshot.data
      end
      format.csv do
        render html: SpectrumsHelper.show_csv_snapshot(@snapshot)
      end
      format.json do
        render json: @snapshot.data
      end
    end
  end
end
