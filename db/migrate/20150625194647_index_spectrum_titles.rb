class IndexSpectrumTitles < ActiveRecord::Migration
  def up
    add_index("spectrums", "title")
  end

  def down
    remove_index("spectrums", "title")
  end
end
