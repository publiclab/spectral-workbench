class CreateSetsSpectrumsJoinTable < ActiveRecord::Migration[5.2]
  def up
    create_table :spectra_sets_spectrums, id: false do |t|
      t.integer :spectrum_id
      t.integer :spectra_set_id
    end
 
    add_index :spectra_sets_spectrums, :spectrum_id
    add_index :spectra_sets_spectrums, :spectra_set_id

    # migrate them in
    SpectraSet.all.each do |set|
      Spectrum.where('id IN (?)',set.spectra_string.split(',')).each do |spectrum|
        set.spectrums << spectrum
      end
    end

    remove_column :spectra_sets, :spectra_string
  end

  def down
    add_column :spectrums, :spectra_string, :string, null: false, default: ''
    remove_table :spectra_sets_spectrums
  end

end
