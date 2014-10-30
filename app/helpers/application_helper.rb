module ApplicationHelper

  def ios?
    request.env['HTTP_USER_AGENT'] && (request.env['HTTP_USER_AGENT'].match("iPad") || request.env['HTTP_USER_AGENT'].match("iPhone") || params[:ios] == "true")
  end

  def chrome?
    request.env['HTTP_USER_AGENT'] && request.env['HTTP_USER_AGENT'].match("Chrome")
  end

  def opera?
    request.env['HTTP_USER_AGENT'] && request.env['HTTP_USER_AGENT'].match("Opera")
  end

  def webrtc?
    request.env['HTTP_USER_AGENT'] && (request.env['HTTP_USER_AGENT'].match("Opera") || request.env['HTTP_USER_AGENT'].match("Firefox") || request.env['HTTP_USER_AGENT'].match("Chrome"))
  end

  def mobile?
    request.env['HTTP_USER_AGENT'] && request.env['HTTP_USER_AGENT'].match("Mobi")
  end

end
