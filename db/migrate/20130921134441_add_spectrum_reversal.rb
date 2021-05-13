# frozen_string_literal: true

class AddSpectrumReversal < ActiveRecord::Migration[5.2]
  def self.up
    add_column :spectrums, :reversed, :boolean, null: false, default: false
  end

  def self.down
    remove_column :spectrums, :reversed
  end
end
