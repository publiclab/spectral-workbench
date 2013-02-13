class UserMailer < ActionMailer::Base

  def direct_message(user,title)
    recipients  user.email
    from        "site@spectralworkbench.org"
    subject     title
    body        :user => user
  end

  def email(email,title,body)
    recipients  email
    from        "site@spectralworkbench.org"
    subject     title
    body        body
  end

end
