class AddSpectrumsIndex < ActiveRecord::Migration[5.2]
  def up
    add_index(:spectrums, :user_id)
  end

  def down
    remove_index(:spectrums, :user_id)
  end
end
