class AddLongerTextColumnLimit < ActiveRecord::Migration
  def self.up

    change_column :spectrums, :data, :text, :limit => 4294967295

  end

  def self.down
  end
end
