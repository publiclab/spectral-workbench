class Tag < ActiveRecord::Base

  attr_accessible :spectrum_id, :name, :user_id

  validates_presence_of :name, :on => :create, :message => "can't be blank"
  validates_presence_of :user_id, :on => :create, :message => "can't be blank"
  validates_presence_of :spectrum_id, :on => :create, :message => "can't be blank"

  belongs_to :spectrum
  belongs_to :user
  before_save :scan_powertags
  before_destroy :clear_powertags

  def spectra
    Spectrum.joins(:tags).where('tags.name = (?)',self.name)
  end

  def is_powertag
    self.name.match(/[a-zA-Z-]+:(\d+)-(\d+)/)
  end

  # before saving, see if there are any powertags
  def scan_powertags
    if match = self.name.match(/range:(\d+)-(\d+)/)
      # if you're not the spectrum owner or an admin? 
      if self.spectrum.user_id == self.user_id || User.find(self.user_id).role == "admin" # only your own or admins
        low = match[1].to_i
        high = match[2].to_i

        def is_number? string
          true if Float(string) rescue false
        end

        if is_number?(low)  && is_number?(high) 
          # if there's already a range directive, replace it
          self.spectrum.remove_powertags('range')
          self.spectrum.set_range(low.to_i,high.to_i)
          self.spectrum.save
        end
      else
        errors[:base] << "spectrum owned by another user"
        false
      end
    elsif self.name.match('range:')
      errors[:base] << "range tag poorly formed; see <a href='//publiclab.org/wiki/spectral-workbench-tagging'>more about tagging</a>"
      false
    end
  end

  # before deleting, clear any powertag which have 
  # been stored in the parent spectrum's JSON
  def clear_powertags
    self.spectrum.clear_range.save if self.spectrum && self.spectrum.has_powertag('range')
    true
  end

  def colors
    colors = ""

    colors = " purple" if self.is_powertag

    colors
  end

end
