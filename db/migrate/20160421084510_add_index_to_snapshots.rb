class AddIndexToSnapshots < ActiveRecord::Migration
  def change
    add_index :snapshots, :tag_id
  end
end
