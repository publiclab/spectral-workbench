class TagController < ApplicationController

  def create
    if logged_in?
      response = { :errors => [],
        :saved => [],
      }
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
            redirect_to "/spectra/show/"+params[:tag][:spectrum_id]
          end
        end
      end
    else
      flash[:error] = "You must be logged in to add tags."
      redirect_to "/login"
    end
  end

  def show
    @tag = Tag.find_by_name(params[:id], :order => "id DESC")
    if @tag
      @spectrums = @tag.spectra
      @count = @spectrums.length
      @spectrums = @spectrums.paginate :page => params[:page], :per_page => 24
    end
    @spectrums = [] if @spectrums.nil?
    @comments = Comment.all :limit => 12, :order => "id DESC"
    respond_to do |format|
      format.html { 
        render :layout => 'bootstrap'
      } # show.html.erb
      format.xml  { render :xml => @spectrums }
      format.json  { render :json => @spectrums }
    end
  end

  def delete
    @tag = Tag.find(params[:id])
    if logged_in?
      if @tag.user_id == current_user.id || current_user.role == "admin"
        @tag.delete
        respond_to do |format|
          format.html do
            if request.xhr?
              render :text => "success"
            else
              flash[:notice] = "Tag '"+@tag.name+"' deleted."
              redirect_to "/analyze/spectrum/"+@tag.spectrum_id.to_s
            end
          end
        end
      else
        flash[:error] = "You must own a tag to delete it."
        redirect_to "/analyze/spectrum/"+@tag.spectrum_id.to_s
      end
    else
      flash[:error] = "You must be logged in to delete tags."
      redirect_to "/login"
    end
  end

  def index
    @tags = Tag.find :all, :order => "id DESC", :limit => 500
    count = {}
    @tagnames = @tags.collect(&:name).each do |tag|
      if count[tag]
        count[tag] += 1
      else
        count[tag] = 1
      end
    end
    @tagnames = count.sort_by {|k,v| v }.reverse
    render :layout => "bootstrap"
  end

end
