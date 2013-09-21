class AddSpectrumReversal < ActiveRecord::Migration
  def self.up
    add_column :spectrums, :reversed, :boolean, :default => false, :null => false
      
    # Base reversal stated on best guess -- ascending pixel values. 
    Spectrum.find(:all).each do	|spectrum|
      spectrum.reversed = spectrum.is_flipped
      spectrum.save
    end
  end

  def self.down
    remove_column :spectrums, :reversed
  end
end
