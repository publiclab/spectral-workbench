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
    assert !s.has_operations
    assert s.save
  end

  test "spectrum creation using just a JSON string" do 
    s = Spectrum.new({
      title:     "A new spectrum",
      author:    "warren",
      notes:     "This was nice, wasn't it.",
      user_id:   1,
      "data" => "{\"lines\":[{\"average\":64.3333,\"r\":69,\"g\":46,\"b\":78,\"wavelength\":269.089},{\"average\":63.3333,\"r\":71,\"g\":45,\"b\":74,\"wavelength\":277.718},{\"average\":64,\"r\":71,\"g\":47,\"b\":74,\"wavelength\":291.524},{\"average\":64,\"r\":68,\"g\":49,\"b\":75,\"wavelength\":303.604}]}"
    })
    assert s.valid?
  end

  test "spectrum creation using just JSON, improperly formatted (nonstring)" do 
    s = Spectrum.new({
      title:     "A new spectrum",
      author:    "warren",
      notes:     "This was nice, wasn't it.",
      user_id:   1,
      data: {
        lines: [
          { average: 64.3, r: 69, g: 46, b: 78, wavelength: 269.089 },
          { average: 63.3, r: 71, g: 45, b: 74, wavelength: 277.718 },
          { average: 64,   r: 71, g: 47, b: 74, wavelength: 291.524 },
          { average: 64,   r: 68, g: 49, b: 75, wavelength: 303.604 }
        ]
      }
    })
    assert !s.valid?
  end

  test "spectrum creation using just JSON, improperly formatted as a string" do 
    s = Spectrum.new({
      title:     "A new spectrum",
      author:    "warren",
      notes:     "This was nice, wasn't it.",
      user_id:   1,
      data:      {
        lines: "[{\"average\":0,\"r\":0,\"g\":0,\"b\":0,\"pixel\":0},{\"average\":2.55,\"r\":2.55,\"g\":2.55,\"b\":2.55,\"pixel\":1},{\"average\":0,\"r\":0,\"g\":0,\"b\":0,\"pixel\":2}]"
      }
    })
    assert !s.valid?
  end

  test "spectrum title length short enough" do
    s = Spectrum.last
    s.title = "A short title"
    assert s.save
  end

  test "spectrum title length too long" do
    s = Spectrum.last
    s.title = "A very long title that just goes on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on"
    assert !s.save
  end

  test "spectrum title with single quotations" do
    s = Spectrum.last
    s.title = "A 'title' with single quotes"
    assert s.save
  end

  test "spectrum title with double quotations" do
    s = Spectrum.last
    s.title = 'A "title" with double quotes'
    assert s.save
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

  test "spectrum generates json" do
    s = Spectrum.last
    s.data = '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
    assert_not_nil s.json
    assert_not_nil s.json['data']
    assert_not_nil s.json['data']['lines']
  end

  test "spectrum clone, copies tags & snapshots" do

    # create spectrums(:one).photo, so later validations work:
    spectrums(:one).image_from_dataurl("data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7")

    # trigger a snapshot to be generated:
    tag = Tag.new({
      user_id:     spectrums(:one).user_id,
      spectrum_id: spectrums(:one).id,
      name:        "smooth:2"
    })

    assert tag.save
    assert spectrums(:one).has_operations

    data = '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
    snapshot = tag.create_snapshot(data)

    assert snapshot.valid?
    assert_not_nil spectrums(:one).tags.last.snapshot
    s = false # pin scope

    assert_difference('Spectrum.count', 1) do
      s = spectrums(:one).fork(users(:aaron))
    end

    # ensure this works across users:
    assert_not_equal spectrums(:one).user_id, users(:aaron).id
    assert_equal s.user_id, users(:aaron).id
    assert_not_nil s.id
    assert_not_equal s.id, spectrums(:one).id
    assert_equal s.tags.length - 1, spectrums(:one).tags.length
    # we compare names, because they are different tags and snapshots, but their names should be in the same order
    assert_equal s.tags.order('created_at').last.name, spectrums(:one).tags.order('created_at').last.name
    assert_equal s.snapshots.order('created_at').last.tag.name, spectrums(:one).snapshots.order('created_at').last.tag.name
    assert_equal s.snapshots.order('created_at').first.tag.name, spectrums(:one).snapshots.order('created_at').first.tag.name
    assert_equal s.tags[0].name, "forked:#{spectrums(:one).id}##{snapshot.id}"
    assert_equal s.tags[1].name, "smooth:2"
    # ensure sorted by created_at:
    sortedTags = s.tags.sort { |a, b| a.created_at <=> b.created_at }
    assert_equal s.tags.collect(&:name).join(','), sortedTags.collect(&:name).join(',')
    # ensure all same tags as original, plus "forked":
    assert_equal s.tags.collect(&:name).join(','), "forked:#{spectrums(:one).id}##{snapshot.id}," + spectrums(:one).tags.collect(&:name).join(',')
    assert_not_equal s.tags.first.user_id, spectrums(:one).tags.first.user_id
    assert_not_nil s.tags[1].snapshot

  end

end
