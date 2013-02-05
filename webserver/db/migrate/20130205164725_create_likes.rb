class CreateLikes < ActiveRecord::Migration
  def self.up
    create_table "likes" do |t|
      t.integer  :spectrum_id
      t.string   :like_type,              :default => 'like', :null => false
      t.integer  :user_id

      t.timestamps
    end
  end

  def self.down
    drop_table "likes"
  end
end
