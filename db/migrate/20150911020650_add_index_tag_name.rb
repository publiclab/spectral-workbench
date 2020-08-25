# frozen_string_literal: true

class AddIndexTagName < ActiveRecord::Migration[5.2]
  def up
    add_index('tags', 'name')
  end

  def down
    remove_index('tags', 'name')
  end
end
