class UserMailer < ActionMailer::Base
  default from: "do-not-reply@spectralworkbench.org"

  def welcome_email(user)
    @user = user
    mail(:to => user.email, 
         :subject => "Welcome to Spectral Workbench"
    )
  end

  def google_groups_email(user)
    @list = "plots-spectrometry"
    mail(:to => "plots-spectrometry+subscribe@googlegroups.com",
         :from => user.email, 
         :subject => "subscribe"
    )
  end

  def direct_message(user,author,title,body)
    @user = user
    @body = body
    @author = author
    mail(:to => user.email, 
         :subject => "[SpectralWorkbench] "+title
    )
  end

  # we can change spectrum_author when we get rid of the "author" field in @spectrums
  def comment_notification(spectrum,comment,spectrum_author)
    @user = spectrum.user.login
    @comment = comment
    @spectrum = spectrum
    mail(:to => spectrum_author.email, 
         :subject => "[SpectralWorkbench] "+comment.user.login+" commented on your Spectrum #"+spectrum.id.to_s+': "'+spectrum.title+'"'
    )
  end

  def commenter_notification(spectrum,comment,old_commenter)
    @user = old_commenter.login
    @comment = comment
    mail(:to => old_commenter.email, 
         :subject => "[SpectralWorkbench] "+comment.user.login+" commented on Spectrum #"+spectrum.id.to_s+': "'+spectrum.title+'"'
    )
  end

  def unregistered_commenter_notification(spectrum,comment,email)
    @comment = comment
    mail(:to => email, 
         :subject => "[SpectralWorkbench] "+comment.user.login+" commented on Spectrum #"+spectrum.id.to_s+': "'+spectrum.title+'"'
    )
  end

  def set_comment_notification(set,comment,set_author)
    @user = set.user.login
    @comment = comment
    @set = set
    mail(:to => set_author.email, 
         :subject => "[SpectralWorkbench] "+comment.user.login+" commented on your Set #"+set.id.to_s+': "'+set.title+'"'
    )
  end

  def set_commenter_notification(set,comment,old_commenter)
    @user = old_commenter.login
    @comment = comment
    @set = set
    mail(:to => old_commenter.email, 
         :subject => "[SpectralWorkbench] "+comment.user.login+" commented on Set #"+set.id.to_s+': "'+set.title+'"'
    )
  end

  def unregistered_set_commenter_notification(set,comment,email)
    @comment = comment
    @set = set
    mail(:to => email, 
         :subject => "[SpectralWorkbench] "+comment.user.login+" commented on Set #"+set.id.to_s+': "'+set.title+'"'
    )
  end

end
