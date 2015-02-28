class UserMailer < ActionMailer::Base
  default from: "do-not-reply@spectralworkbench.org"

  def welcome_email(user)
    recipients  user.email
    from        "do-not-reply@spectralworkbench.org"
    subject     "Welcome to Spectral Workbench"
    body(        {:user => user})
  end

  def google_groups_email(user)
    recipients  'plots-spectrometry+subscribe@googlegroups.com'
    from        user.email
    subject     "subscribe"
    body(        {:list => 'plots-spectrometry'})
  end

  def direct_message(user,author,title,body)
    recipients  user.email
    from        "do-not-reply@spectralworkbench.org"
    subject     "[SpectralWorkbench] "+title
    body(        {:user => user, :body => body, :author => author})
  end

  # we can change spectrum_author when we get rid of the "author" field in @spectrums
  def comment_notification(spectrum,comment,spectrum_author)
    recipients  spectrum_author.email
    from        "do-not-reply@spectralworkbench.org"
    subject     "[SpectralWorkbench] "+comment.author+" commented on your Spectrum #"+spectrum.id.to_s+': "'+spectrum.title+'"'
    body(        {:user => spectrum.author, :comment => comment, :spectrum => spectrum})
  end

  # we can change spectrum_author when we get rid of the "author" field in @spectrums
  def commenter_notification(spectrum,comment,old_commenter)
    recipients  old_commenter.email
    from        "do-not-reply@spectralworkbench.org"
    subject     "[SpectralWorkbench] "+comment.author+" commented on Spectrum #"+spectrum.id.to_s+': "'+spectrum.title+'"'
    body(        {:user => old_commenter.login, :comment => comment})
  end

  # we can change spectrum_author when we get rid of the "author" field in @spectrums
  def unregistered_commenter_notification(spectrum,comment,email)
    recipients  email
    from        "do-not-reply@spectralworkbench.org"
    subject     "[SpectralWorkbench] "+comment.author+" commented on Spectrum #"+spectrum.id.to_s+': "'+spectrum.title+'"'
    body(        {:comment => comment})
  end

  def set_comment_notification(set,comment,set_author)
    recipients  set_author.email
    from        "do-not-reply@spectralworkbench.org"
    subject     "[SpectralWorkbench] "+comment.author+" commented on your Set #"+set.id.to_s+': "'+set.title+'"'
    body(        {:user => set.author, :comment => comment, :set => set})
  end

  def set_commenter_notification(set,comment,old_commenter)
    recipients  old_commenter.email
    from        "do-not-reply@spectralworkbench.org"
    subject     "[SpectralWorkbench] "+comment.author+" commented on Set #"+set.id.to_s+': "'+set.title+'"'
    body(        {:user => old_commenter.login, :comment => comment})
  end

  # we can change set_author when we get rid of the "author" field in @spectrums
  def unregistered_set_commenter_notification(set,comment,email)
    recipients  email
    from        "do-not-reply@spectralworkbench.org"
    subject     "[SpectralWorkbench] "+comment.author+" commented on Set #"+set.id.to_s+': "'+set.title+'"'
    body(        {:comment => comment})
  end

end
