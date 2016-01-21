require 'test_helper'

class SnapshotTest < ActiveSupport::TestCase


  test "creating a snapshot" do

    snapshot = Snapshot.new({
                 spectrum_id: Spectrum.last.id,
                 user_id:     User.first.id,
                 tag_id:      Tag.first.id,
                 data:        '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
               })

    snapshot.save!

    assert         snapshot
    assert         snapshot.is_latest?
    assert_not_nil snapshot.dependent_spectrum_ids
    assert_not_nil snapshot.json
    assert_not_nil snapshot.json['data']
    assert_equal   snapshot.dependent_spectrum_ids, []
    assert_not_nil snapshot.id
    assert_not_nil Snapshot.find snapshot.id

  end


  test "creating a snapshot should generate/update a processed spectrum" do

    s = Spectrum.last
    assert_nil s.processed_spectrum

    assert_difference 'ProcessedSpectrum.count', 1 do
      s.save! # trigger generate_processed_spectrum, records if calibrated
    end

    ps = s.processed_spectrum.inspect
    assert s.processed_spectrum

    snapshot = Snapshot.new({
                 spectrum_id: Spectrum.last.id,
                 user_id:     User.first.id,
                 tag_id:      Tag.first.id,
                 data:        '{"lines":[{"r":20,"g":20,"b":20,"average":20,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
               })

    assert snapshot.spectrum.calibrated

    # updates, doesn't create a new PS
    assert_difference 'ProcessedSpectrum.count', 0 do
      snapshot.save!
    end

    assert           snapshot
    assert           snapshot.is_latest?
    assert_not_nil   snapshot.dependent_spectrum_ids
    assert_equal     snapshot.dependent_spectrum_ids, []
    assert_equal     ProcessedSpectrum.last.spectrum_id, s.id # confirm new PS 
    assert_not_equal ProcessedSpectrum.last.inspect, ps # compare stringified
    assert_not_nil   snapshot.id
    assert_not_nil   Snapshot.find snapshot.id

  end


  test "creating a snapshot with different author than spectrum should fail" do

    count = Snapshot.count

    snapshot = Snapshot.new({
                 spectrum_id: Spectrum.last.id,
                 user_id:     Spectrum.last.id + 1,
                 tag_id:      Tag.first.id,
                 data:        '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
               })

    assert snapshot.user_id != snapshot.spectrum.user_id
    assert !snapshot.valid?
    snapshot.save

    assert_nil snapshot.id
    assert_equal Snapshot.count, count

  end


  test "creating a snapshot with different author than spectrum but via tag.create_snapshot should make snapshot with same user as spectrum" do

    assert_not_equal spectrums(:one).user_id, users(:aaron).id

    # trigger a snapshot to be generated:
    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        "smooth:2"
    })

    tag.save

    data = '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
    snapshot = tag.create_snapshot(data)

    assert snapshot.user_id == snapshot.spectrum.user_id
    assert snapshot.valid?

  end


  test "creating a snapshot with non-JSON data should fail" do

    data = "data"

    snapshot = Snapshot.new({
                 spectrum_id: Spectrum.last.id,
                 user_id:     User.first.id,
                 tag_id:      Tag.first.id
               })

    assert_equal false, snapshot.save

    assert_not_nil snapshot
    assert_nil snapshot.id

  end


  test "using spectrum.add_snapshot()" do

    spectrum = Spectrum.last
    snapshots = spectrum.snapshots.length

    data = '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'

    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        "subtract:#{spectrums(:one).id}"
    })

    assert tag.save

    assert_not_nil tag.spectrum
    assert_not_nil tag.spectrum.user_id
    snapshot = spectrum.add_snapshot(tag, data)

    assert_not_nil snapshot
    assert_not_nil snapshot.user_id
    assert_equal snapshot.user_id, tag.user_id
    assert_not_equal snapshots, spectrum.snapshots.length
    assert_equal snapshots + 1, spectrum.snapshots.length
    assert_not_nil snapshot.id

    assert_not_nil Snapshot.find snapshot.id

    assert_not_equal snapshots, Spectrum.last.snapshots.length
    assert_equal snapshots + 1, Spectrum.last.snapshots.length
    assert_not_nil Spectrum.last.snapshots.last.id
    assert_not_nil Spectrum.last.snapshots.last.spectrum_id
    assert_equal Spectrum.last.snapshots.last.spectrum_id, spectrum.id
    assert_equal Spectrum.last.latest_snapshot.spectrum_id, spectrum.id
    assert_equal Spectrum.last.latest_snapshot.id, snapshot.id

  end


  ## Tagging

  test "no reference id should be generated if referred-to spectrum has no snapshots" do

    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        "subtract:#{spectrums(:one).id}"
    })

    assert tag.save

    assert_not_equal tag.value.split('#').length, 2
    reference_id = tag.value.split('#').last # should yield spectrum id, not snapshot id
    assert_equal spectrums(:one).snapshots.length, 0
    assert_not_equal tag.value, "#{spectrums(:one).id}##{reference_id}"
    assert_nil tag.reference

  end

  # if you subtract spectrum from self, it should use the last 
  # snapshot before the current one, due to references being made before snapshots. 
  test "no circular references to own spectrum" do 

    # trigger a snapshot to be generated:
    tag1 = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        "smooth:2"
    })

    assert tag1.save

    data = '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
    tag1.create_snapshot(data)

    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        "subtract:#{spectrums(:one).id}"
    })

    assert tag.save

    assert_equal tag.value.split('#').length, 2
    reference_id = tag.value.split('#').last.to_i
    assert_equal spectrums(:one).snapshots.last.id, reference_id
    assert_equal tag.value, "#{spectrums(:one).id}##{reference_id}"
    assert_not_nil tag.reference
    assert_not_nil tag.reference_spectrum

    data = '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
    snapshot = tag.create_snapshot(data)

    assert_not_nil tag.snapshot
    assert_not_nil tag.reference
    # ensure same author:
    assert_equal tag.user_id, tag.snapshot.user_id
    assert_equal tag.spectrum.user_id, tag.snapshot.user_id
    assert_not_equal tag.snapshot.id, tag.reference_id
    # but they point at different snapshots of the same spectrum:
    assert_equal tag.snapshot.spectrum_id, tag.reference.spectrum_id
    assert tag.snapshot.created_at > tag.reference.created_at

  end


  test "generating snapshot but not a reference" do 

    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        "smooth:2"
    })

    assert tag.save

    assert_equal tag.key, "smooth"
    assert_equal tag.value, "2"

    assert tag.needs_snapshot?

    data = '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
    assert_not_nil tag.spectrum
    assert_not_nil tag.spectrum.user_id
    tag.create_snapshot(data)

    assert_not_nil tag.snapshot
    assert !tag.has_reference?
    assert_nil tag.reference_id

    assert_equal spectrums(:one).snapshots.length, 1

  end


  test "tag relation to generated and reference snapshots via snapshot.tag_id and #, and cleanup on deletion" do

    referred_spectrum = spectrums(:one)

    # should generate a snapshot:
    tag1 = Tag.new({
      user_id:     referred_spectrum.user_id,
      spectrum_id: referred_spectrum.id,
      name:        "smooth:2"
    })

    assert tag1.save

    data = '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
    assert tag1.create_snapshot(data)

    assert_not_nil tag1.snapshot

    tag = Tag.new({
      user_id:     spectrums(:two).user_id,
      spectrum_id: spectrums(:two).id,
      name:        "subtract:#{referred_spectrum.id}" # this will generate a new snapshot and auto-add it to the tagname
    })

    assert tag.save

    assert_equal tag.key, "subtract"

    assert tag.needs_snapshot?

    data = '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
    assert tag.create_snapshot(data)
    # as of the previous test, spectrums(:one) should have a snapshot

    assert_not_nil tag.snapshot
    assert !tag.snapshot.has_subsequent_depended_on_snapshots?

    snapshot = Snapshot.last
    assert_equal snapshot.tag_id, tag.id
    assert_equal tag.snapshot.id, Snapshot.last.id

    # test the reference snapshot too: 
    # the reference should refer to the latest snapshot of the referred-to spectrum,
    # NOT the tag's own spectrum snapshot. No circular references!
    assert_not_equal tag.name, "subtract:1##{tag.spectrum.snapshots.last.id}"
    assert_equal tag.key, "subtract"
    assert_equal 1, tag.spectrum.snapshots.length

    assert tag.has_reference?
    assert tag.name, "subtract:1##{referred_spectrum.snapshots.last.id}"
    assert_equal referred_spectrum.snapshots.last.id, tag.reference.id
    assert_equal tag.value, "#{referred_spectrum.id}##{tag1.spectrum.snapshots.last.id}"
    assert_not_nil tag.reference
    assert_equal tag.reference_id, tag1.spectrum.snapshots.last.id
    assert_not_nil Snapshot.where(id: tag.reference_id).first

    # reject deletion of a referred_to snapshot:
    assert referred_spectrum.latest_snapshot.has_dependent_spectra?
    assert_difference 'Snapshot.count', 0 do
      referred_spectrum.latest_snapshot.destroy
    end
    assert_difference 'Snapshot.count', 0 do
      referred_spectrum.latest_snapshot.tag.destroy
    end
    assert_difference 'Snapshot.count', 0 do
      referred_spectrum.destroy
    end

    assert tag.snapshot.is_latest?
    tag.destroy

    # should delete snapshot too
    assert_equal Snapshot.where(id: tag.snapshot.id).length, 0

  end

  test "rejecting deletion of a snapshot that's not the latest" do

    data = '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'

    # trigger a snapshot to be generated:
    tag1 = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        "smooth:2"
    })

    assert tag1.valid?

    tag1.save
    snapshot1 = tag1.create_snapshot(data)

    assert snapshot1.valid?

    tag2 = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        "smooth:5"
    })

    assert tag2.valid?

    tag2.save
    snapshot2 = tag2.create_snapshot(data)

    assert snapshot2.valid?

    assert !snapshot1.is_latest?
    assert !snapshot1.is_deletable?
    assert_difference 'Snapshot.count', 0 do
      snapshot1.destroy
    end

    # this one should be the latest, so deletable:
    assert snapshot2.is_latest?
    assert snapshot2.is_deletable?
    assert_difference 'Snapshot.count', -1 do
      snapshot2.destroy
    end

  end

end
