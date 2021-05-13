# frozen_string_literal: true

class CreateSnapshots < ActiveRecord::Migration[5.2]
  def up
    create_table 'snapshots' do |t|
      t.integer   :user_id
      t.integer   :spectrum_id
      t.integer   :tag_id
      t.text      :description
      t.text      :data

      t.timestamps
    end
  end

  def down
    drop_table 'snapshots'
  end
end
