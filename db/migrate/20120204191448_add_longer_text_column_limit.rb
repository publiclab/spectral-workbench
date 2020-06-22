class AddLongerTextColumnLimit < ActiveRecord::Migration[5.2]
  def self.up

    change_column :spectrums, :data, :text, :limit => 4294967295

  end

  def self.down
  end
end
