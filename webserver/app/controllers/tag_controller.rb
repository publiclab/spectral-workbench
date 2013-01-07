class TagController < ApplicationController

  def create
    if logged_in?
      params[:tag][:name].split(',').uniq.each do |name|
        tag = Tag.new({
          :name => name.strip,
          :spectrum_id => params[:tag][:spectrum_id],
          :user_id => current_user.id
        })
        tag.save
      end
      flash[:notice] = "Tag(s) added."
      redirect_to "/spectra/show/"+params[:tag][:spectrum_id]
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
    render :layout => 'bootstrap'
  end

  def delete
    @tag = Tag.find(params[:id])
    if logged_in? && (@tag.user_id == current_user.id || current_user.role == "admin")
      @tag.delete
      flash[:notice] = "Tag "+@tag.name+" deleted."
      redirect_to "/spectra/show/"+@tag.spectrum_id
    else
      flash[:error] = "You must be logged in to delete tags."
      redirect_to "/login"
    end
  end

  def index
    @tags = Tag.find :all, :order => "id DESC"
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
