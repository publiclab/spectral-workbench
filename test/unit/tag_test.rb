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
