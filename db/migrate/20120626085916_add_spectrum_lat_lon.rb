# frozen_string_literal: true

class AddSpectrumLatLon < ActiveRecord::Migration[5.2]
  def self.up
    add_column :spectrums, :lat, :decimal, default: 0, scale: 10, precision: 20
    add_column :spectrums, :lon, :decimal, default: 0, scale: 10, precision: 20
  end

  def self.down
    remove_column :spectrums, :lat
    remove_column :spectrums, :lon
  end
end
