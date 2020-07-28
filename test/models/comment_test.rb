# frozen_string_literal: true

require 'test_helper'

class CommentTest < ActiveSupport::TestCase
  test 'should post comments on spectra if signed in' do
    user = User.first
    spectrum = Spectrum.first
    comment = spectrum.comments.new(
      user_id: user.id,
      body: "That's a very cool spectrum!"
    )
    assert comment.save
  end

  test 'should post comments on spectra set if signed in' do
    user = User.first
    set = SpectraSet.first
    comment = set.comments.new(
      user_id: user.id,
      body: "That's a very cool set!",
      spectra_set_id: set.id,
      email: user.email
    )
    assert comment.save
  end
end
