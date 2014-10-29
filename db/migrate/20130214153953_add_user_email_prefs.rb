class AddUserEmailPrefs < ActiveRecord::Migration
  def self.up
      add_column :users, :email_preferences, :string, :default => "1", :null => false
  end

  def self.down
      remove_column :users, :email_preferences
  end
end
