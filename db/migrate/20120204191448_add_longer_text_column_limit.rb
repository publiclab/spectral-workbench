# frozen_string_literal: true

class AddLongerTextColumnLimit < ActiveRecord::Migration[5.2]
  def self.up
    change_column :spectrums, :data, :text, limit: 4_294_967_295
  end

  def self.down; end
end
