class CreateComments < ActiveRecord::Migration
  def self.up
    create_table :comments do |t|
      t.string :author
      t.string :email
      t.text :body
      t.float :wavelength
      t.integer :x
      t.integer :y

      t.timestamps
    end
  end

  def self.down
    drop_table :comments
  end
end
