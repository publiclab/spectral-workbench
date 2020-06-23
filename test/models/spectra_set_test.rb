require 'test_helper'

class SpectraSetTest < ActiveSupport::TestCase

  test "set title length short enough" do
    s = SpectraSet.last
    s.title = "A short title"
    assert s.save!
  end

  test "set title length too long" do
    s = SpectraSet.last
    s.title = "A very long title that just goes on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on"
    assert !s.save
  end

  test "set title with single quotations" do
    s = SpectraSet.last
    s.title = "A 'title' with single quotes"
    assert s.save!
  end

  test "set title with double quotations" do
    s = SpectraSet.last
    s.title = 'A "title" with double quotes'
    assert s.save!
  end

  test "set without title" do
    s = SpectraSet.last
    s.title = ""
    assert !s.save
  end

  test "creating new set" do
    assert SpectraSet.create({
      title: ""
    })
  end

  test "adds and removes spectrum from set" do
    set = SpectraSet.last
    assert_difference('set.spectrums.length', 1) do
      set.spectrums << Spectrum.last
    end
    assert set.contains(Spectrum.last)
    assert_difference('set.spectrums.length', -1) do
      set.spectrums.delete(Spectrum.last)
    end
  end

# We'd like to make this reject, but not sure how to structure such a 
# validation at the model level
#  test "rejecting duplicate spectrum" do
#    set = SpectraSet.last
#    set.spectrums << Spectrum.last
#    assert set.contains(Spectrum.last)
#    assert_difference('set.spectrums.length', 0) do
#      set.spectrums << Spectrum.last
#    end
#    assert_equal set.spectrums, []
#  end

  test "set.as_json_with_snapshots" do
    set = SpectraSet.last
    set.spectrums << Spectrum.last
    json = set.as_json_with_snapshots
    assert_not_nil json
    assert_not_nil json[:spectra]
    assert_equal json[:spectra].length, set.spectrums.length
  end

  # latest snapshots of all spectrums, if exist, in JSON
  # default to spectrums themselves if not
  test "set.snapshots" do
    set = SpectraSet.last
    set.spectrums << Spectrum.last
    assert_not_nil set.snapshots(false)
  end

end
