# frozen_string_literal: true

class AddIndexTagSpectrumId < ActiveRecord::Migration[5.2]
  def up
    add_index('tags', 'spectrum_id')
  end

  def down
    remove_index('tags', 'spectrum_id')
  end
end
