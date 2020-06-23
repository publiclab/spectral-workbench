require 'test_helper'

class LikeTest < ActiveSupport::TestCase

  test "like creation" do 
    like = Like.new({
      spectrum_id: spectrums(:one).id,
      user_id:     users(:quentin).id,
    })
    assert like.save!
    assert_not_nil like.spectrum
  end

  test "like creation, then deletion" do 
    like = Like.new({
      spectrum_id: spectrums(:one).id,
      user_id:     users(:quentin).id,
    })
    assert like.save!
    assert like.destroy
  end

  test "like creation w/out user" do 
    like = Like.new({
      spectrum_id: spectrums(:one).id
    })
    assert !like.save
  end

  test "like creation w/out spectrum" do 
    like = Like.new({
      user_id:     users(:quentin).id
    })
    assert !like.save
  end

end
