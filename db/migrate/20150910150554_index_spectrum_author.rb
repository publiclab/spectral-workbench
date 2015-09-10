class IndexSpectrumAuthor < ActiveRecord::Migration
  def up
    add_index("spectrums", "author")
  end

  def down
    remove_index("spectrums", "author")
  end
end
