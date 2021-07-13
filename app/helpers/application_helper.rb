# frozen_string_literal: true

module ApplicationHelper
  def ios?
    request.env['HTTP_USER_AGENT'] && (request.env['HTTP_USER_AGENT'].match('iPad') || request.env['HTTP_USER_AGENT'].match('iPhone') || params[:ios] == 'true')
  end

  def chrome?
    request.env['HTTP_USER_AGENT']&.match('Chrome')
  end

  def opera?
    request.env['HTTP_USER_AGENT']&.match('Opera')
  end

  def safari?
    request.env['HTTP_USER_AGENT']&.match('Safari')
  end

  def webrtc?
    request.env['HTTP_USER_AGENT'] && (request.env['HTTP_USER_AGENT'].match('Opera') || request.env['HTTP_USER_AGENT'].match('Safari') || request.env['HTTP_USER_AGENT'].match('Firefox') || request.env['HTTP_USER_AGENT'].match('Chrome'))
  end

  def mobile?
    request.env['HTTP_USER_AGENT']&.match('Mobi')
  end

  def current_user
    user_id = session[:user_id]
    if user_id
      begin
        User.find(user_id)
      rescue StandardError
        nil
      end
    end
  end

  # for v2 embeds
  def is_embed?
    params[:action] == 'embed2'
  end

  # add this to app/helpers/application_helper.rb
  # http://www.emersonlackey.com/article/rails3-error-messages-for-replacemen
  def errors_for(object, message = nil)
    html = ''
    unless object.nil? || object.errors.blank?
      html << "<div class='alert alert-error #{object.class.name.humanize.downcase}Errors'>\n"
      html << if message.blank?
                if object.new_record?
                  "\t\t<h5>There was a problem creating the #{object.class.name.humanize.downcase}</h5>\n"
                else
                  "\t\t<h5>There was a problem updating the #{object.class.name.humanize.downcase}</h5>\n"
                        end
              else
                "<h5>#{message}</h5>"
              end
      html << "\t\t<ul>\n"
      object.errors.full_messages.each do |error|
        html << "\t\t\t<li>#{error}</li>\n"
      end
      html << "\t\t</ul>\n"
      html << "\t</div>\n"
    end
    html
  end
end
