class UserMailer < ActionMailer::Base

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
    subject     "[SpectralWorkbench] "+comment.author+" commented on your data"
    body(        {:user => comment.author, :body => comment.body, :author => comment.author, :spectrum => spectrum})
  end

end
