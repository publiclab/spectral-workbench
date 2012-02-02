class AddSetComments < ActiveRecord::Migration
  def self.up
      add_column :spectrums, :client_code, :string, :default => '', :null => false
      add_column :spectra_sets, :notes, :text, :default => "", :null => false 
      add_column :comments, :spectra_set_id, :integer, :default => 0, :null => false 
  end

  def self.down
      remove_column :spectrums, :client_code
      remove_column :spectra_sets, :notes
      remove_column :comments, :spectra_set_id
  end
end
