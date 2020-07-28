# frozen_string_literal: true

require 'test_helper'
require 'capture_controller'

# Re-raise errors caught by the controller.
class CaptureController
  def rescue_action(e)
    raise e
                         end; end

class CaptureControllerTest < ActionController::TestCase
  fixtures :users

  test 'should get capture' do
    get :index
    assert_response :success
    assert_not_nil :spectrums
  end

  test 'should get capture while logged in' do
    session[:user_id] = users(:quentin).id # log in
    get :index
    assert_response :success
    assert_not_nil :spectrums
    assert_not_nil :calibration
    assert_not_nil :calibrations
  end

  test 'should get capture with calibration_id' do
    session[:user_id] = users(:quentin).id # log in
    get :index, params: { calibration_id: spectrums(:one) }
    assert_response :success
  end

  test "should get capture with calibration_id = 'calibrate'" do
    session[:user_id] = users(:quentin).id # log in
    get :index, params: { calibration_id: 'calibrate' }
    assert_response :success
  end

  test 'should load the offline page' do
    session[:user_id] = users(:quentin).id
    get :offline

    assert_response :success
  end

  test 'should save a spectrum' do
    session[:user_id] = users(:quentin).id
    post :save, params: {
      title: 'A very cool spectrum',
      notes: 'One of the best ones I have had so far',
      img: 'data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7',
      data: '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
    }

    assert_response :redirect
    assert_equal 'Spectrum was successfully created.', flash[:notice]
  end

  test 'should get recent calibrations' do
    session[:user_id] = users(:quentin).id
    get :recent_calibrations, params: { format: 'json' }

    assert_response :success
  end
end
