class SnapshotsController < ApplicationController

  before_filter :require_login, :except => []

  def create

    @spectrum = Spectrum.find params[:id]
    @snapshot = @spectrum.add_snapshot(
      current_user,
      params[:data]
    )

  end

end
