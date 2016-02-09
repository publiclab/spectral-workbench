class TagsController < ApplicationController

  before_filter :require_login, :only => [ :create, :destroy, :change_reference ]


  # FYI, we've stopped accepting requests with multiple comma-delimited tags
  # so, if we edit SpectralWorkbench.Tag.js, we can ditch the 'errors' and 
  # 'saved' hashes in the response. 
  def create
    @response = { 
      :errors => [],
      :saved => {},
    }
    @spectrum = Spectrum.select("id, title, created_at, user_id, author, calibrated")
                        .where(id: params[:tag][:spectrum_id])
                        .limit(1)
                        .first
    # is it a powertag? only owners or admins can make those:
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
        old_name = tag.name.split('#')[0]
        tag.save
        @response[:saved][old_name] = { id: tag.id, created_at: tag.created_at }
        # send updated name to client if any:
        @response[:saved][old_name][:name] = tag.name
        # setup the generated snapshot if needed:
        if tag.needs_snapshot? && params[:tag][:data]
          snapshot = tag.create_snapshot(params[:tag][:data])
          @response[:saved][old_name][:snapshot_id] = snapshot.id # add it to the response even though it's not part of the record
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
    @spectrums = Spectrum.select("spectrums.id, spectrums.title, spectrums.created_at, spectrums.user_id, spectrums.author, spectrums.calibrated, spectrums.lat, spectrums.lon, spectrums.photo_file_name, spectrums.like_count")
                         .joins(:tags)
                         .where('tags.name = (?)', params[:id])
                         .order("spectrums.id DESC")
                         .paginate(:page => params[:page], :per_page => 24)

    respond_to do |format|
      format.html { # show.html.erb
        @mappable = []
        @spectrums.each do |spectrum|
          @mappable << spectrum if spectrum.lat != 0.0 && spectrum.lon != 0.0
        end
      }
      format.xml  { render :xml => @spectrums }
      format.json  { render :json => @spectrums }
    end
  end


  def destroy
    @tag = Tag.find(params[:id])
    if @tag
      if @tag.user_id == current_user.id || current_user.role == "admin"
        if @tag.is_deletable?
          @tag.destroy
          respond_to do |format|
            format.html do
              if request.xhr?
                render :json => { :message => "success" }
              else
                flash[:notice] = "Tag '#{@tag.name}' deleted."
                redirect_to spectrum_path(@tag.spectrum_id)
              end
            end
          end
        else
          respond_to do |format|
            format.html do
              if request.xhr?
                render :json => { has_dependent_spectra: @tag.snapshot.has_dependent_spectra?, 
                                  dependent_spectra: @tag.dependent_spectrum_ids,
                                  has_subsequent_depended_on_snapshots: @tag.snapshot.has_subsequent_depended_on_snapshots?,
                                  is_latest: @tag.snapshot.is_latest?
                                },
                       :status => :unprocessable_entity
              else
                flash[:error] = "Powertags/operations may not be deleted if other data relies upon it."
                # OMG, without status 303, some browsers will redirect with request method DELETE and delete the spectrum!
                # http://api.rubyonrails.org/classes/ActionController/Redirecting.html
                redirect_to spectrum_path(@tag.spectrum_id), status: :see_other # i.e. 303 to force GET. VERY DANGEROUS, RAILS!
              end
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


  # resourceful request for a spectrum's or set's tag list:
  def index
    if params[:set_id]
      @set = Set.find params[:set_id]
      render partial: 'tags/inlineList', locals: { datum: @set }, layout: false
    elsif params[:spectrum_id]
      @spectrum = Spectrum.find params[:spectrum_id]
      @tags = []
      @spectrum.tags.order('created_at').each do |tag|
        # here we convert to a hash so we can append arbitrary fields without triggering a warning:
        hash = tag.attributes
        # may be able to append this information in the model, tuck it away
        hash[:refers_to_latest_snapshot] = tag.has_reference? && tag.reference.is_latest?
        hash[:reference_spectrum_snapshots] = tag.reference_spectrum.snapshots.collect(&:id) if tag.needs_reference?
        if tag.snapshot
          hash[:snapshot_id] = tag.snapshot.id
          if tag.snapshot.has_dependent_spectra?
            hash[:has_dependent_spectra] = true
            hash[:dependent_spectra] = tag.dependent_spectrum_ids
          else
            hash[:has_dependent_spectra] = false
          end
          hash[:has_subsequent_depended_on_snapshots] = tag.snapshot.has_subsequent_depended_on_snapshots?
        end
        @tags << hash
      end
      if request.xhr?
        render :json => @tags
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

  # json only
  # ensure that this cannot be done for tags that are referred to
  # and TEST it
  def change_reference

    @tag = Tag.find params[:id]
    
    if (@tag.user_id == current_user.id || current_user.role == "admin") && @tag.change_reference(params[:snapshot_id])
      render :json => @tag
    else
      render :json => { error: 'Cannot change reference of tag with dependent spectra.' }, :status => 422
    end

  end

end
