# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper

  def markdown(text)
    options = [:hard_wrap, :filter_html, :autolink, :no_intraemphasis, :fenced_code, :gh_blockcode]
    Redcarpet.new(text, *options).to_html
  end

  def admin
    APP_CONFIG["password"] == params[:password]
  end

end
