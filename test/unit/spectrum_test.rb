require 'test_helper'

class SpectrumTest < ActiveSupport::TestCase

  test "spectrum creation" do 
    s = Spectrum.new({
      title:     "A new spectrum",
      author:    "warren",
      video_row: 1, # the vertical cross section of the video feed
      notes:     "This was nice, wasn't it.",
      user_id:   1,
    })
    s.image_from_dataurl("data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7")
    assert s.save!
  end

  test "spectrum title length short enough" do
    s = Spectrum.last
    s.title = "A short title"
    assert s.save!
  end

  test "spectrum title length too long" do
    s = Spectrum.last
    s.title = "A very long title that just goes on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on"
    assert !s.save
  end

  test "spectrum title with single quotations" do
    s = Spectrum.last
    s.title = "A 'title' with single quotes"
    assert s.save!
  end

  test "spectrum title with double quotations" do
    s = Spectrum.last
    s.title = 'A "title" with double quotes'
    assert s.save!
  end

  test "spectrum author with single quotations" do
    s = Spectrum.last
    s.author = "jeff 'the iceman' warren"
    assert !s.save
  end

  test "spectrum without title" do
    s = Spectrum.last
    s.title = ""
    assert !s.save
  end

  test "spectrum without author" do
    s = Spectrum.last
    s.author = ""
    assert !s.save
  end

  test "spectrum add range" do 
    s = Spectrum.last
    s.set_range(300,400)
    assert s.save
    s = Spectrum.find s.id
    json = ActiveSupport::JSON.decode(s.clean_json)
    assert json['range']['low'] == 300
    assert json['range']['high'] == 400
  end

  test "spectrum clear range" do 
    s = Spectrum.last
    s.clear_range
    assert s.save
    s = Spectrum.find s.id
    json = ActiveSupport::JSON.decode(s.clean_json)
    assert json['range'] == nil
  end

end
