# frozen_string_literal: true

class IndexSpectrumTitles < ActiveRecord::Migration[5.2]
  def up
    add_index('spectrums', 'title')
  end

  def down
    remove_index('spectrums', 'title')
  end
end
