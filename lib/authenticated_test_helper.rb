# frozen_string_literal: true

module AuthenticatedTestHelper
  # Sets the current user in the session from the user fixtures.
  def login_as(user)
    @request.session[:user_id] = if user
                                   user.is_a?(User) ? user.id : users(user).id
                                 end
  end

  def authorize_as(user)
    @request.env['HTTP_AUTHORIZATION'] = user ? ActionController::HttpAuthentication::Basic.encode_credentials(users(user).login, 'monkey') : nil
  end
end
