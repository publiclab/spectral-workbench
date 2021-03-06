# frozen_string_literal: true

class AddIndexLikesCount < ActiveRecord::Migration[5.2]
  def up
    add_index('spectrums', 'like_count')
    add_index('spectrums', 'created_at')
  end

  def down
    remove_index('spectrums', 'like_count')
    remove_index('spectrums', 'created_at')
  end
end
