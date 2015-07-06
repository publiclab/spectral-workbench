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

  test "set author with single quotations" do
    s = SpectraSet.last
    s.author = "jeff 'the iceman' warren"
    assert !s.save
  end

  test "set without title" do
    s = SpectraSet.last
    s.title = ""
    assert !s.save
  end

  test "set without author" do
    s = SpectraSet.last
    s.author = ""
    assert !s.save
  end



end
