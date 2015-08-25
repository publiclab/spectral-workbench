class TagsController < ApplicationController

  before_filter :require_login, :only => [ :create, :destroy ]

  def create
    response = { :errors => [],
      :saved => [],
    }
    # we do it this way to handle JSON error generation
    params[:tag][:name].split(',').uniq.each do |name|
      tag = Tag.new({
        :name => name.strip,
        :spectrum_id => params[:tag][:spectrum_id],
        :user_id => current_user.id
      })
      if tag.save
        response[:saved] << [tag.name,tag.id]
      else
        response[:errors] << "Error: tags "+tag.errors[:name].first
      end
    end
    respond_to do |format|
      format.html do
        if request.xhr?
          render :json => response
        else
          flash[:notice] = "Tag(s) added."
          redirect_to "/spectrums/"+params[:tag][:spectrum_id]
        end
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
