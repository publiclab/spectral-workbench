require 'test_helper'

class TagTest < ActiveSupport::TestCase

  test "tag creation" do 
    tag = Tag.new({
      name:        'cfl',
      spectrum_id: spectrums(:one).id,
      user_id:     users(:quentin).id
    })
    assert tag.save!
    assert_not_nil tag.dependent_spectrum_ids
    assert_equal tag.dependent_spectrum_ids, []
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

  test "linearCalibration powertag marks spectrum as calibrated" do 
    s = spectrums(:one)
    assert !s.calibrated
    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: s.id,
      name:        'linearCalibration:180.15-634.54'
    })
    assert tag.save
    s = Spectrum.find s.id
    assert s.calibrated
  end

  test "linearCalibration powertag deletion marks spectrum as uncalibrated" do 
    s = spectrums(:one)
    # make it uncalibrated data:
    s.data = '{"lines":[{"r":10,"g":10,"b":10,"average":10},{"r":10,"g":10,"b":10,"average":10}]}'
    s.save!
    assert !s.calibrated

    # trigger calibration to be true via tag
    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: s.id,
      name:        'linearCalibration:180.15-634.54'
    })
    assert !s.is_calibrated?
    assert tag.save # should process tags and update spectrum.calibrated after_save

    s = Spectrum.find s.id # re-fetch updated version
    assert s.is_calibrated?
    assert s.calibrated

    tag = Tag.where(spectrum_id: s.id)
             .where(name: 'linearCalibration:180.15-634.54')

    assert tag.last.destroy
    s = Spectrum.find s.id # re-fetch updated version
    assert !s.calibrated
  end

  # the data could be overwritten in a separate call, though
  test "linearCalibration powertag does not change spectrum data" do 
    data = spectrums(:one).data
    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        'linearCalibration:180.15-634.54'
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

  test "powertags .is_deletable? should be false if they are not the latest snapshot for that spectrum" do 

    # create a snapshot
    tag = Tag.new({
      user_id:     users(:aaron).id,
      spectrum_id: users(:aaron).spectrums.last.id,
      name:        'smooth:1'
    })
    assert tag.save!
    assert_equal tag.name, 'smooth:1'
    assert tag.create_snapshot('{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}')

    assert_not_nil tag.dependent_spectrum_ids
    assert_equal tag.dependent_spectrum_ids, []

    # create a snapshot which will refer to the same spectrum, and be the latest:
    tag2 = Tag.new({
      user_id:     tag.user_id,
      spectrum_id: tag.spectrum_id,
      name:        'smooth:3'
    })
    assert tag2.save!
    assert_equal tag2.name, 'smooth:3'
    tag2.create_snapshot('{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}')

    assert !tag.is_deletable?
    assert tag.snapshot
    assert !tag.snapshot.is_latest?
    assert !tag.snapshot.has_dependent_spectra?

    # ensure no change:
    assert_difference('Tag.count', 0) do
      tag.destroy
    end

  end

  test "powertags .is_deletable? should be false if other tags rely on their snapshot" do 

    tag = Tag.new({
      user_id:     users(:aaron).id,
      spectrum_id: users(:aaron).spectrums.last.id,
      name:        'smooth:1'
    })
    assert tag.save!
    assert_equal tag.name, 'smooth:1'
    assert tag.create_snapshot('{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}')
    assert tag.snapshot.is_latest?

    # create a snapshot which will reference this snapshot, and be dependent on it:
    tag2 = Tag.new({
      user_id:     Spectrum.last.user_id,
      spectrum_id: Spectrum.last.id,
      name:        "subtract:#{tag.spectrum_id}"
    })
    assert tag2.save!
    assert_not_equal tag.spectrum_id, tag2.spectrum_id
    tag2.create_snapshot('{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}')
    assert_equal tag2.name, "subtract:#{tag.spectrum_id}##{tag.snapshot.id}"

    assert !tag.is_deletable?
    assert tag.snapshot
    assert tag.snapshot.is_latest?
    assert tag.snapshot.has_dependent_spectra?
    assert !tag.snapshot.has_subsequent_depended_on_snapshots?

    # ensure no change:
    assert_difference('Tag.count', 0) do
      tag.destroy
    end

  end

  test "tag.change_reference fails gracefully if given snapshot_id isn't valid, but succeeds when valid" do 

    tag = Tag.new({
      user_id:     users(:aaron).id,
      spectrum_id: users(:aaron).spectrums.last.id,
      name:        'smooth:8'
    })
    assert tag.save!
    assert_equal tag.name, 'smooth:8'
    assert tag.create_snapshot('{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}')
    assert tag.snapshot.is_latest?

    tag2 = Tag.new({
      user_id:     users(:aaron).id,
      spectrum_id: users(:aaron).spectrums.last.id,
      name:        'smooth:12'
    })
    assert tag2.save!
    assert_equal tag2.name, 'smooth:12'
    assert tag2.create_snapshot('{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}')
    assert tag2.snapshot.is_latest?

    # create a snapshot which will reference this snapshot, and be dependent on it:
    tag3 = Tag.new({
      user_id:     Spectrum.last.user_id,
      spectrum_id: Spectrum.last.id,
      name:        "subtract:#{tag.spectrum_id}"
    })
    assert tag3.save!
    assert_equal tag3.name, "subtract:#{tag.spectrum_id}##{tag2.snapshot.id}"
    assert tag3.needs_reference?
    assert tag3.has_reference?
    assert_not_nil tag3.reference
    assert_equal tag3.reference.id, tag2.snapshot.id
    assert tag2.snapshot.has_dependent_spectra?
    assert_not_nil tag2.snapshot.dependent_spectrum_ids
    assert_equal tag2.snapshot.dependent_spectrum_ids.first, tag3.spectrum_id
    assert !tag2.snapshot.has_subsequent_depended_on_snapshots?
    assert tag.snapshot.has_subsequent_depended_on_snapshots?

    # create a snapshot which we should NOT be able to change tag3's reference to:
    assert tag3.create_snapshot('{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}')

    assert !tag3.snapshot.has_subsequent_depended_on_snapshots?
    tag3.change_reference(tag.snapshot.id + 100) # feed it an invalid id
    assert_equal tag3.reference_id, tag2.snapshot.id # confirm no change

    tag3.change_reference(tag3.snapshot.id) # feed it an id which is a real snapshot, but not of the right spectrum
    assert_equal tag3.reference_id, tag2.snapshot.id # confirm no change

    tag3.change_reference(tag.snapshot.id) # back to original tag snapshot
    assert_not_equal tag3.reference_id, tag2.snapshot.id
    assert_equal tag3.reference_id, tag.snapshot.id # confirm change
    assert_equal tag3.name, "subtract:#{tag.spectrum_id}##{tag.snapshot.id}"

    # depend on it with a new tag4, then try to change reference to original, valid snapshot
    tag4 = Tag.new({
      user_id:     tag3.user_id,
      spectrum_id: tag3.spectrum_id,
      name:        "subtract:#{tag3.spectrum_id}##{tag3.snapshot.id}" # depend on the tag/ref-snapshot we're about to try to change
    })
    assert tag4.save!
    assert_equal tag4.name, "subtract:#{tag3.spectrum_id}##{tag3.snapshot.id}"
    assert tag3.snapshot.has_dependent_spectra?
    assert !tag3.snapshot.has_subsequent_depended_on_snapshots?

    tag3.change_reference(tag2.snapshot.id)
    assert_not_equal tag3.reference_id, tag2.snapshot.id # confirm no change

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
