require File.dirname(__FILE__) + '/../test_helper'

class UserTest < ActiveSupport::TestCase
  fixtures :users

  test "user calibrations" do 
    u = User.first
    assert_not_nil u.calibrations
  end

  test "user last calibration" do 
    u = User.first

    s = Spectrum.new({
      title:     "A new spectrum",
      author:     User.first.login,
      video_row: 1, # the vertical cross section of the video feed
      notes:     "This was nice, wasn't it.",
      user_id:   User.first.id,
    })
    s.image_from_dataurl("data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7")
    s.data = '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
    assert s.save!
    assert s.tag('linearCalibration:0-1', User.first.id)

    assert u.calibrations.count > 0
    assert_not_nil u.last_calibration
    assert_not_nil u.token
  end

  test "user token" do
    u = User.first
    token = u.created_at.to_i.to_s.each_byte.map { |b| b.to_s(16) }.join
    assert_equal token, u.token
  end

  test "user lookup by token" do
    u = User.first
    u2 = User.find_by_token(u.token)
    assert_equal u, u2
  end

end
