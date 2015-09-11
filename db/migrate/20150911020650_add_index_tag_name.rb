class AddIndexTagName < ActiveRecord::Migration
  def up
    add_index("tags", "name")
  end

  def down
    remove_index("tags", "name")
  end
end
