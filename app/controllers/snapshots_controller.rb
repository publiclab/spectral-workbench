class SnapshotsController < ApplicationController

  before_filter :require_login, :except => []

  def create

    @spectrum = Spectrum.find params[:id]
    @snapshot = Spectrum.add_snapshot({

      user_id: current_user.id,
      data: params[:data]

    })

  end

end
