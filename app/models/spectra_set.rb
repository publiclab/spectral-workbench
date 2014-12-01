class SpectraSet < ActiveRecord::Base

  attr_accessible :title, :notes, :spectra_string, :author


  validates_presence_of :title, :author#, :spectra_string
  validates_length_of :title, :maximum => 60
  has_many :comments, :dependent => :destroy
  
  def spectra
    Spectrum.find(self.spectra_string.split(','))
  end
  
  def match(spectrum)
    set = self.sort_set(spectrum)
    # find lowest score, return it
     set = set.sort_by {|a| a[1]}
    Spectrum.find set[0][0].to_i
  end

  def sort_set(spectrum)
    scored = {}
    self.spectra_string.split(',').each do |id|
      scored[id] = spectrum.compare(id) if id != self.id
    end
    scored
  end

  def add(spectrum_id)
    if Spectrum.find(spectrum_id.to_i)
      self.spectra_string = [self.spectra_string,spectrum_id].uniq.join(',') 
      self.save
    else
      false
    end
  end

  def remove(spectrum_id)
    if Spectrum.find(spectrum_id.to_i)
      set = self.spectra_string.split(',')
      newset = []
      set.each do |s|
        newset << s if s != spectrum_id
      end
      self.spectra_string = newset.uniq.join(',') 
      self.save
    else
      false
    end
  end

  # notify each commenter about a new comment 
  def notify_commenters(new_comment,current_user)
    emails = []
    self.comments.each do |comment|
      if comment != new_comment && (!current_user || (comment.author != current_user.login)) && comment.author != self.author
        emails << comment.email
      end
    end
    # send for every commenter, whether they are a registered user or not...
    emails.uniq.each do |email|
      registered_commenter = User.find_by_email(email)
      if (registered_commenter)
        UserMailer.deliver_set_commenter_notification(self,new_comment,registered_commenter)
      else
        UserMailer.deliver_unregistered_set_commenter_notification(self,new_comment,email)
      end
    end
  end

end
