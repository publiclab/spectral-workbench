class CreateProcedures < ActiveRecord::Migration
  def up
    create_table :procedures do |t|
	  t.string   :title
	  t.integer  :author
	  t.integer  :user_id		
	  t.text     :description
	  t.string   :main_image_url
	  t.boolean  :is_active,      :default => false
	  
	  t.timestamps
	end
	
	create_table :procedure_steps do |t|
	  t.integer  :procedure_id
	  t.integer  :step
	  t.string   :heading
	  t.text     :description
	  t.string   :image_url
	  t.boolean  :capture_required
	  t.boolean  :is_optional,      :default => true
	  t.boolean  :is_done,          :default => false
	  t.boolean  :skipped,          :default => false
	  
	  t.timestamps
    end
    
    create_table :procedure_runs do |t|
	  t.string   :title
	  t.integer  :procedure_id
	  t.string   :procedure_name
	  t.string   :run_by
	  t.integer  :user_id
	  t.text     :description
	  t.string   :main_image_url
	  
	  t.timestamps
	end
	
	create_table :procedure_step_runs do |t|
	  t.integer  :spectrum_id
	  t.text     :description
	  t.integer  :order
	  t.string   :heading
	  
	  t.timestamps
	end
  end

  def down
	drop_table	:procedures
	drop_table	:procedure_steps
	drop_table	:procedure_runs
	drop_table	:procedure_step_runs
  end
end
