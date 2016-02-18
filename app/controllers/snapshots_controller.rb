class SnapshotsController < ApplicationController
  respond_to :json
  before_filter :no_cache, :only => [ :show ]

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
      format.xml  { render :xml => @snapshot }
      format.csv  {
        render :text => SpectrumsHelper.show_csv_snapshot(@snapshot)
      }
      format.json  {
        render :json => @snapshot.data
      }
    end

  end

end
