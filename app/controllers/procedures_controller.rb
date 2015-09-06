class ProceduresController < ApplicationController
  def index
    @procedures = Procedure.order("id DESC").paginate(:page => params[:page], :per_page => 24)
  end

  def view
    id = params[:id]
    @procedure = Procedure.find(id)

    if @procedure.is_active?
      @steps = ProcedureStep.where(:procedure_id => id, :skipped => false, :is_done => true).order(:step)
    else
      flash[:error] = "The procedure is not public yet."
      redirect_to "/procedures"
    end
  end

  def create
    #if logged_in?
    if 1==1
      if request.post?
        user_id = current_user.id if logged_in?
        user_id ||= "0"
        author = current_user.login if logged_in?
        author ||= "anonymous"

        @procedure = Procedure.new({:title => params[:title],
                                    :author => author,
                                    :user_id => user_id,
                                    :description => params[:description],
                                    :main_image_url => params[:image],
                                    :is_active => params[:active]})
        if @procedure.save
          flash[:notice] = 'Procedure was successfully created. Add the steps to be performed, and make it live!'
          generate_initial @procedure.id
          redirect_to "/procedures/edit/%d" %(@procedure.id)
        else
          render "new"
        end
      else
        render "new"
      end
    else
      # possibly, we don't have to redirect - we could prompt for login at the moment of save...
      flash[:notice] = "You must first log in to create a procedure."
      redirect_to "/login"
    end
  end

  def edit
    id = params[:id]
    step = params[:step]
    if id
      @procedure = Procedure.find id
      @steps = ProcedureStep.where(:procedure_id => id).order(:step)
      
      @non_ready_steps = ProcedureStep.where(:procedure_id => id, :skipped => false, :is_done=>false).count
      
      if @non_ready_steps
        @ready = false
	  else
		@ready = true
	  end

      if step
        if not ProcedureStep.exists?(:procedure_id => id, :step => step)
          flash[:error] = "Step not found!"
        end
      else
        @current_step = ProcedureStep.where(:procedure_id => id, :is_done => false, :skipped=>false).order(:step)[0]
        if @current_step.nil?
          step = 1
        else
          step = @current_step.step
        end
      end

      @current_step = ProcedureStep.where(:procedure_id => id, :step => step)[0]

      render :action => "edit"
    else
      redirect_to "/procedures"
    end
  end

  def review
    id = params[:id]
    redirect = false

    @procedure = Procedure.find id
    @steps = ProcedureStep.where(:procedure_id => id).order(:step)

    @non_ready_steps = ProcedureStep.where(:procedure_id => id, :skipped => false, :is_done=>false).count

    if @non_ready_steps
      @ready = false
    else
      @ready = true
    end

    if request.post?
      submit = params[:submit]

      @procedure.title = params[:title]
      @procedure.description = params[:description]

      if submit == "live"
        @procedure.is_active = true
      end

      @procedure.save

      if submit == "continue"
        redirect = true
        redirect_url = "/procedures/edit/#{id}"
      end
    else
      if id
        render :action => "edit"
      else
        redirect = true
        redirect_url = "/procedures"
      end
    end

    if redirect
      redirect_to redirect_url
    end

  end


  def generate_initial procedure_id
    new_step procedure_id, 1,   "Sample Preparation"
    new_step procedure_id, 2,   "Spectrometer Setup"
    new_step procedure_id, 3,   "Initial Calibration"
    new_step procedure_id, 4,   "Capture Baseline Spectra"
    new_step procedure_id, 5,   "Capture Samples' Spectra"
    new_step procedure_id, 6,   "Apply Filters"
    new_step procedure_id, 7,   "Absorbance Calculation"
    new_step procedure_id, 8,   "Adjust Data"
    new_step procedure_id, 9,   "Select Measure & Wavelengths"
    new_step procedure_id, 10,  "Results"
  end

  def new_step procedure_id, step, heading
    @procedure_step =  ProcedureStep.new
    @procedure_step.procedure_id = procedure_id
    @procedure_step.heading = heading

    # Dealing with the step!
    if ProcedureStep.exists?(:step => step, :procedure_id => procedure_id)
      shift_step_by_one procedure_id, step
    end

    @procedure_step.step = step
    @procedure_step.save
  end

  def shift_step_by_one procedure_id, step
    if ProcedureStep.exists?(:step => step, :procedure_id => procedure_id)
      total_records = ProcedureStep.where(:procedure_id => procedure_id).count
      current_position = Integer(step)

      for position in total_records.downto(current_position)
        @step = ProcedureStep.where(:procedure_id => procedure_id, :step => position)[0]
        @step.step = position + 1
        @step.save
      end
    end
  end

  def add_new_step
    procedure_id = params[:procedure]
    step = params[:step]
    heading = params[:heading]

    if heading.length == 0
      heading = "Untitled"
    end

    new_step procedure_id, step, heading

    redirect_to "/procedures/edit/#{procedure_id}/#{step}"
  end

  def skip_step
    procedure_id = params[:procedure]
    step = params[:step]
    @step = ProcedureStep.where(:procedure_id => procedure_id, :step => step)[0]
    @step.skipped = true
    @step.save
    redirect_to "/procedures/edit/#{procedure_id}"
  end

  def update_step
    procedure_id = params[:procedure]
    step = params[:step]
    @step = ProcedureStep.where(:procedure_id => procedure_id, :step => step)[0]
    @step.skipped = false
    @step.description = params[:description]
    @step.heading = params[:heading]
    if params[:capture_required] == "true"
      @step.capture_required = true
    else
      @step.capture_required = false
    end
    @step.is_done = true
    @step.save
    redirect_to "/procedures/edit/#{procedure_id}"
  end

  def run
    id = params[:id]
    @procedure = Procedure.find(id)

    if @procedure.is_active?
      @steps = ProcedureStep.where(:procedure_id => id, :skipped => false, :is_done => true).order(:step)
    else
      flash[:error] = "The procedure is not public yet."
      redirect_to "/procedures"
    end

  end

end
