# frozen_string_literal: true

require 'test_helper'

class MacrosControllerTest < ActionController::TestCase
  test 'should get macros index' do
    get :index
    assert_response :success
  end

  test 'should create macros' do
    session[:user_id] = User.first.id # log in
    post :create, params: {
      dataurl: 'data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7',
      spectrum: {
        user_id: session[:user_id],
        author: User.first.login,
        title: 'One nice spectrum',
        video_row: 5,
        # calibration_id: spectrums(:one).id, # clone calibration
        notes: 'A test spectrum.'
      }
    }
    assert_not_nil :spectrum
    assert_equal 'Spectrum was successfully created.', flash[:notice]
    assert_redirected_to spectrum_path(assigns(:spectrum))
  end
end