class ProcessedSpectrum < ActiveRecord::Base

  # we allow this here due to line 389 of spectrum.rb
  columns.each do |column|
    attr_accessible column.name.to_sym
  end 

  def closest_match(range,limit)
    bins = (10...1500).step(10)
    types = ['a', 'r', 'g', 'b']
    
    #range = 100 # Earlier it was only 100. Now, we can read it from user.
    
    conditions = []

    bins.each do |bin|
      types.each do |type|
        bin_string = "#{type}#{bin}"
        low = self[bin_string].to_i - range
        high = self[bin_string].to_i + range
        conditions += ["#{bin_string} BETWEEN #{low} AND #{high}"]
      end
    end
    
    condition_string = conditions.join(" AND ")
    matches = ProcessedSpectrum.find(:all, :conditions => [condition_string],:limit => limit)
      
    ids = []
    matches.each do |match|
      ids += ["id = #{match.spectrum_id}"]
    end

    id_string = ids.join(" OR ")
    id_string += " AND id != #{self.spectrum_id}"

    Spectrum.find(:all, :conditions => [id_string])
  end

end
