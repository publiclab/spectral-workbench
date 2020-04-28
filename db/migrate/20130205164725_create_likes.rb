class CreateLikes < ActiveRecord::Migration
  def self.up
    create_table "likes" do |t|
      t.integer  :spectrum_id
      t.string   :like_type, null: false, default: "like"
      t.integer  :user_id

      t.timestamps
    end
    add_column :spectrums, :like_count, :integer, :default => 0, :null => false
  end

  def self.down
    drop_table "likes"
    remove_column :spectrums, :like_count
  end
end
