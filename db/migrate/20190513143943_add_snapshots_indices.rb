class AddSnapshotsIndices < ActiveRecord::Migration
  def up
    add_index :snapshots, :spectrum_id
  end
end
