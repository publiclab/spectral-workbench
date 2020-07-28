class AddSnapshotLimit < ActiveRecord::Migration[5.2]
  def change
    change_column :snapshots, :data, :text, limit: 4294967295
  end
end
