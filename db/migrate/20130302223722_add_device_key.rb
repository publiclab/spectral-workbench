class AddDeviceKey < ActiveRecord::Migration
  def self.up
      add_column :devices, :key, :string, :default => "", :null => false
  end

  def self.down
      remove_column :devices, :key
  end
end
