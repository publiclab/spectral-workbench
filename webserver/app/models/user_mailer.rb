class UserMailer < ActionMailer::Base

  def direct_message(user,author,title,body)
    recipients  user.email
    from        "site@spectralworkbench.org"
    subject     "[SpectralWorkbench] "+title
    body        :user => user, :body => body, :author => author
  end

end
