class AddUserEmailPrefs < ActiveRecord::Migration[5.2]
  def self.up
      add_column :users, :email_preferences, :string, null: false, default: 1
  end

  def self.down
      remove_column :users, :email_preferences
  end
end
