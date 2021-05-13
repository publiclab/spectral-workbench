# frozen_string_literal: true

class CreateSpectrums < ActiveRecord::Migration[5.2]
  def self.up
    create_table :spectrums do |t|
      t.string :title
      t.string :author
      t.string :set
      t.text :data
      t.text :notes
      t.integer :version
      t.integer :parent_id

      # attachment (paperclip)
      t.string :photo_file_name
      t.string :photo_content_type
      t.string :photo_file_size

      t.timestamps
    end
  end

  def self.down
    drop_table :spectrums
  end
end
