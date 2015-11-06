class AddIndexTagSpectrumId < ActiveRecord::Migration
  def up
    add_index("tags", "spectrum_id")
  end

  def down
    remove_index("tags", "spectrum_id")
  end
end
