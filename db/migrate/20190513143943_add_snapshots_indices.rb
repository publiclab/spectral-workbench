class AddSnapshotsIndices < ActiveRecord::Migration[5.2]
  def up
    add_index :snapshots, :spectrum_id
  end
end
