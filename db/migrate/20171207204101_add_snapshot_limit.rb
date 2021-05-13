# frozen_string_literal: true

class AddSnapshotLimit < ActiveRecord::Migration[5.2]
  def change
    change_column :snapshots, :data, :text, limit: 4_294_967_295
  end
end
