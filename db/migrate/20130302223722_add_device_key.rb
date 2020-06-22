class AddDeviceKey < ActiveRecord::Migration[5.2]
  def self.up
      add_column :devices, :key, :string, null: false, default: ''
  end

  def self.down
      remove_column :devices, :key
  end
end
