class ProcessedSpectrum < ActiveRecord::Base
  
  def closest_match(range,limit)
    bins = (10...1500).step(10)
    types = ['a', 'r', 'g', 'b']
    
    #range = 100 # Earlier it was only 100. Now, we can read it from user.
    
    conditions = []
    ids = []

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
      
    matches.each do |match|
      ids += ["id = #{match.spectrum_id}"]
    end

    id_string = ids.join(" OR ")
    Spectrum.find(:all, :conditions => [id_string])
  end

end
