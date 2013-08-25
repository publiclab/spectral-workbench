class MatchController < ApplicationController

  def index
    id = params[:id]
    
    if id.nil?
      @d = "Welcome"
    else
      @d = search(id)
    end

    render :layout => "bootstrap"
  end


  def search(id)
    ## Search for the candidates here
    
    return "Results will be here"
  end

end
