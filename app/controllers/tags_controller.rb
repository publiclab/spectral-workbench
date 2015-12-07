class TagsController < ApplicationController

  before_filter :require_login, :only => [ :create, :destroy ]


  # FYI, we've stopped accepting requests with multiple comma-delimited tags
  def create

    response = { 
      :errors => [],
      :saved => {},
    }

    @spectrum = Spectrum.select("id, title, created_at, user_id, author, calibrated")
                        .where(id: params[:tag][:spectrum_id])
                        .limit(1)
                        .first

    # we used to accept multiple comma-delimited tags and return a batch of errors.
    # that's getting messy. We need better client-side error handling
    tag = params[:tag]
    name = params[:tag][:name]

    if name.match(':').nil? || @spectrum.user_id == current_user.id || current_user.role == "admin"

      name = name.strip # clean whitespace
      tag = Tag.new({
        :name => name,
        :spectrum_id => params[:tag][:spectrum_id],
        :user_id => current_user.id
      })

      # look for enclosed data in the tag request if 
      # it's the kind of powertag that should create a snapshot
      # the enclosed data is not required; but the client side will do it automatically
      if tag.needs_snapshot? && tag[:data]
        self.spectrum.add_snapshot(self.user, tag[:data])
      end

      if tag.valid?
        tag.save
        response[:saved][tag.name] = { id: tag.id }
      else
        response[:errors] << "Error: tags "+tag.errors[:name].first
      end

    else
      response[:errors] << "Error: You must own the spectrum to add powertags"
    end

    respond_to do |format|
      if request.xhr? # ajax
        format.json { render :json => response }
      else
        format.html do
          flash[:notice] = "Tag(s) added."
          redirect_to "/spectrums/"+params[:tag][:spectrum_id]
        end
        format.json { render :json => response }
      end
    end

  end


  def show
    @tag = Tag.find_by_name(params[:id], :order => "id DESC")
    if @tag
      @spectrums = @tag.spectra.paginate(:page => params[:page], :per_page => 24)
    end
    @spectrums = [] if @spectrums.nil?
    @comments = Comment.all :limit => 12, :order => "id DESC"
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
