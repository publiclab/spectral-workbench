require 'test_helper'

class TagTest < ActiveSupport::TestCase

  test "tag creation" do 
    tag = Tag.new({
      name:        'cfl',
      spectrum_id: spectrums(:one).id,
      user_id:     users(:quentin).id
    })
    assert tag.save!
    assert_not_nil tag.spectrum
  end

  test "tag deletion" do 
    assert tags(:one).destroy
  end

  test "tag creation w/out user" do 
    tag = Tag.new({
      spectrum_id: spectrums(:one).id,
      name:        'cfl'
    })
    assert !tag.save
  end

  test "tag creation w/out spectrum" do 
    tag = Tag.new({
      user_id:     users(:quentin).id,
      name:        'cfl'
    })
    assert !tag.save
  end

  test "range powertag creation" do 
    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        'range:100-500'
    })
    assert tag.save
    json = ActiveSupport::JSON.decode(tag.spectrum.clean_json)
    assert json['range']['low'] == 100
    assert json['range']['high'] == 500
  end

  test "range powertag replacement if there's already a range powertag" do 
    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        'range:100-500'
    })
    assert tag.save
    json = ActiveSupport::JSON.decode(tag.spectrum.clean_json)
    assert json['range']['low'] == 100
    assert json['range']['high'] == 500
    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        'range:200-600'
    })
    assert tag.save
    json = ActiveSupport::JSON.decode(tag.spectrum.clean_json)
    assert json['range']['low'] == 200
    assert json['range']['high'] == 600
  end

  test "range powertag creation if provided range are not integers" do 
    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        'range:100-F'
    })
    assert !tag.save
    json = ActiveSupport::JSON.decode(tag.spectrum.clean_json)
    assert json['range'] == nil
  end

  test "range powertag creation if provided range are not well formatted" do 
    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        'range:100x400'
    })
    assert !tag.save
    assert_equal "range tag poorly formed; see <a href='//publiclab.org/wiki/spectral-workbench-tagging'>more about tagging</a>", tag.errors[:base].last
    json = ActiveSupport::JSON.decode(tag.spectrum.clean_json)
    assert json['range'] == nil
  end

  test "tag creation with unallowed characters" do 
    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        'range;400'
    })
    assert !tag.save
    assert_equal "can only include letters, numbers, and dashes", tag.errors.messages[:name].last

  end

end
