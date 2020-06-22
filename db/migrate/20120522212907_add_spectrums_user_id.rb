class AddSpectrumsUserId < ActiveRecord::Migration[5.2]
  def self.up
      add_column :spectrums, :user_id, :integer, :default => 0, :null => false
  end

  def self.down
      remove_column :spectrums, :user_id
  end
end
