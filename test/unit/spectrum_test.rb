require 'test_helper'

class SpectrumTest < ActiveSupport::TestCase

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

end
