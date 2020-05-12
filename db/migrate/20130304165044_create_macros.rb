class CreateMacros < ActiveRecord::Migration
  def self.up
    create_table "macros" do |t|
      t.integer   :user_id
      t.string    :macro_type,              default: 'analyze', null: false
      t.string    :title
      t.string    :url # to gist, hopefully
      t.text      :description
      t.text      :code
      t.string    :published,               default: 'published'

      t.timestamps
    end
  end

  def self.down
    drop_table "macros"
  end
end
