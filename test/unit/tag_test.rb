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

  # the data could be overwritten in a separate call, though
  test "linearCalibration powertag does not change spectrum data" do 
    data = spectrums(:one).data
    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        'range:100-500'
    })
    assert_equal tag.spectrum.data, data
    assert tag.save
  end

  test "range powertag creation" do 
    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        'range:100-500'
    })
    assert tag.save
  end

  test "non-admin powertag creation invalidation for other user's spectrum" do 
    tag = Tag.new({
      user_id:     users(:aaron).id,
      spectrum_id: spectrums(:one).id,
      name:        'range:100-500'
    })
    assert tag.user_id != tag.spectrum.user_id
    assert !tag.valid?
  end

  test "admin powertag creation for other user's spectrum" do 
    tag = Tag.new({
      user_id:     users(:admin).id,
      spectrum_id: spectrums(:one).id,
      name:        'range:100-500'
    })
    assert tag.valid?
  end

  test "crossSection powertag creation and spectrum.sample_row saving" do 
    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        'crossSection:100'
    })
    assert tag.save
    assert_equal 100, tag.spectrum.sample_row
    assert_not_equal 200, tag.spectrum.sample_row
  end

  test "tag spectra" do 
    tag = Tag.last
    spectra = tag.spectra
    assert spectra
  end

# We now allow all kinds of characters with "transform" tags. We should switch for this.

#  test "tag creation with unallowed characters" do 
#    tag = Tag.new({
#      user_id:     users(:quentin).id,
#      spectrum_id: spectrums(:one).id,
#      name:        'range:400'
#    })
#    assert !tag.save
#    assert_equal "can only include letters, numbers, and dashes", tag.errors.messages[:name].last
#
#  end

end
