class IndexSpectrumAuthor < ActiveRecord::Migration[5.2]
  def up
    add_index("spectrums", "author")
  end

  def down
    remove_index("spectrums", "author")
  end
end
