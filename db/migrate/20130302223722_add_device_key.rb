class AddDeviceKey < ActiveRecord::Migration
  def self.up
      add_column :devices, :key, :string, null: false, default: ''
  end

  def self.down
      remove_column :devices, :key
  end
end
