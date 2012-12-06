# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper

  def markdown(text)
    if APP_CONFIG["redcarpet_version"] == 1
      options = [:hard_wrap, :filter_html, :autolink, :no_intraemphasis, :fenced_code, :gh_blockcode]
      Redcarpet.new(text, *options).to_html
    else
      markdown = Redcarpet::Markdown.new(Redcarpet::Render::HTML, :autolink => true, :space_after_headers => true)
      raw markdown.render(text)
    end
  end

  def admin
    APP_CONFIG["password"] == params[:password]
  end

  def ios?
    (request.env['HTTP_USER_AGENT'].match("iPad") || request.env['HTTP_USER_AGENT'].match("iPhone") || params[:ios] == "true")
  end

end
