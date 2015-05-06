class AddSpectrumsIndex < ActiveRecord::Migration
  def up
    add_index(:spectrums, :user_id)
  end

  def down
    remove_index(:spectrums, :user_id)
  end
end
