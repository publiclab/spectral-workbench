# frozen_string_literal: true

class AddTagsAndLinkedSpectra < ActiveRecord::Migration[5.2]
  def self.up
    create_table :tags do |t|
      t.string :user_id
      t.string :name
      t.integer :spectrum_id
      t.integer :set_id

      t.timestamps
    end
    create_table :spectrum_links do |t|
      t.string :author
      t.string :name
      t.string :type # calibration, baseline, comparison...
      t.integer :spectrum_id
      t.integer :spectrum_2_id

      t.timestamps
    end
  end

  def self.down
    drop_table :tags
    drop_table :spectrum_links
  end
end
