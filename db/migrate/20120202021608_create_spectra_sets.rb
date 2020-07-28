# frozen_string_literal: true

class CreateSpectraSets < ActiveRecord::Migration[5.2]
  def self.up
    create_table :spectra_sets do |t|
      t.string :title, default: '', null: false
      t.string :author, default: '', null: false
      t.string :spectra_string, default: '', null: false
      t.string :notes, default: '', null: false

      t.timestamps
    end
  end

  def self.down
    drop_table :spectra_sets
  end
end
