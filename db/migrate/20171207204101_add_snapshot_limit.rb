class AddSnapshotLimit < ActiveRecord::Migration
  def change
    change_column :snapshots, :data, :text, limit: 4294967295
  end
end
