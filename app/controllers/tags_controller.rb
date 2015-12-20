class TagsController < ApplicationController

  before_filter :require_login, :only => [ :create, :destroy ]


  # FYI, we've stopped accepting requests with multiple comma-delimited tags
  def create
    @response = { 
      :errors => [],
      :saved => {},
    }
    @spectrum = Spectrum.select("id, title, created_at, user_id, author, calibrated")
                        .where(id: params[:tag][:spectrum_id])
                        .limit(1)
                        .first
    if params[:tag][:name].match(':').nil? || @spectrum.user_id == current_user.id || current_user.role == "admin"
      name = params[:tag][:name].strip # clean whitespace
      tag = Tag.new({
        :name => name,
        :spectrum_id => params[:tag][:spectrum_id],
        :user_id => current_user.id
      })
      tag.created_at = DateTime.parse(params[:tag][:created_at]) if params[:tag][:created_at]
      if tag.valid?
        # look for enclosed data in the tag request if 
        # it's the kind of powertag that should create a snapshot
        # the enclosed data is not required; but the client side will do it automatically
        old_name = tag.name
        tag.save
        @response[:saved][old_name] = { id: tag.id, created_at: tag.created_at }
        # send updated name to client if any:
        @response[:saved][old_name][:name] = tag.name
        # setup the generated snapshot if needed:
        if tag.generate_snapshot? && params[:tag][:data]
          snapshot = tag.create_snapshot(params[:tag][:data])
          tag[:snapshot_id] = snapshot.id # add it to the response even though it's not part of the record
        end
      else
        @response[:errors] << "Error: tags "+tag.errors[:name].first
      end
    else
      @response[:errors] << "Error: You must own the spectrum to add powertags"
    end
    respond_to do |format|
      if request.xhr? # ajax
        format.json { render :json => @response }
      else
        format.html do
          flash[:notice] = "Tag(s) added."
          redirect_to "/spectrums/"+params[:tag][:spectrum_id]
        end
        format.json { render :json => @response }
      end
    end
  end


  def show
    @spectrums = Spectrum.select("spectrums.id, spectrums.title, spectrums.created_at, spectrums.user_id, spectrums.author, spectrums.calibrated")
                         .joins(:tags)
                         .where('tags.name = (?)', params[:id])
                         .order("spectrums.id DESC")
                         .paginate(:page => params[:page], :per_page => 24)
    respond_to do |format|
      format.html {} # show.html.erb
      format.xml  { render :xml => @spectrums }
      format.json  { render :json => @spectrums }
    end
  end


  def destroy
    @tag = Tag.find(params[:id])
    if @tag
      if @tag.user_id == current_user.id || current_user.role == "admin"
        @tag.destroy
        respond_to do |format|
          format.html do
            if request.xhr?
              render :text => "success"
            else
              flash[:notice] = "Tag '"+@tag.name+"' deleted."
              redirect_to spectrum_path(@tag.spectrum_id)
            end
          end
        end
      else
        flash[:error] = "You must have authored a tag or own its spectrum to delete it."
        redirect_to spectrum_path(@tag.spectrum_id)
      end
    else
      flash[:error] = "That tag didn't exist."
      redirect_to "/dashboard"
    end
  end


  def index
    # resourceful request for a set's tag list:
    if params[:set_id]
      @set = Set.find params[:set_id]
      render partial: 'tags/inlineList', locals: { datum: @set }, layout: false
    # resourceful request for a spectrum's tag list:
    elsif params[:spectrum_id]
      @spectrum = Spectrum.find params[:spectrum_id]
      @spectrum.tags.each do |tag|
        if tag.snapshot
          tag[:snapshot_id] = tag.snapshot.id
          if tag.snapshot.has_dependent_spectra?
            tag[:has_dependent_spectra] = true
          else
            tag[:has_dependent_spectra] = false
          end
        end
      end
      if request.xhr?
        render :json => @spectrum.tags
      else
        render partial: 'tags/inlineList', locals: { datum: @spectrum }, layout: false
      end
    else
      # this is dumb, get rid of it:
      @tags = Tag.order("id DESC").where(created_at: Time.now-1.month..Time.now).limit(100)
      count = {}
      @tagnames = @tags.collect(&:name).each do |tag|
        if count[tag]
          count[tag] += 1
        else
          count[tag] = 1
        end
      end
      @tagnames = count.sort_by {|k,v| v }.reverse
    end
  end

end
