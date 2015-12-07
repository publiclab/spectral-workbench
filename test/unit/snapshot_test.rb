require 'test_helper'

class SnapshotTest < ActiveSupport::TestCase


  test "creating a snapshot" do

    data = "data"

    snapshot = Snapshot.new({
                     spectrum_id: Spectrum.last.id,
                     user_id: User.first.id,
                     data: '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
                   })

    snapshot.save!

    assert_not_nil snapshot
    assert_not_nil snapshot.id
    assert_not_nil Snapshot.find snapshot.id

  end


  test "creating a snapshot with non-JSON data should fail" do

    data = "data"

    snapshot = Snapshot.new({
                     spectrum_id: Spectrum.last.id,
                     user_id: User.first.id
                   })

    assert_equal false, snapshot.save

    assert_not_nil snapshot
    assert_nil snapshot.id

  end


  test "using spectrum.add_snapshot()" do

    spectrum = Spectrum.last
    snapshots = spectrum.snapshots.length

    data = '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'

    snapshot = spectrum.add_snapshot(User.first, data)

    assert_not_nil snapshot
    assert_not_nil snapshot.user_id
    assert_equal snapshot.user_id, User.first.id
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

  end


  ## Tagging

  test "tag relation to snapshots via # and cleanup on deletion" do

    tag = Tag.new({
      user_id:     users(:quentin).id,
      spectrum_id: spectrums(:one).id,
      name:        "subtract:1" # this will generate a new snapshot and auto-add it to the tagname
      #name:        "subtract:1##{snapshot.id}"
    })

    assert tag.save
    assert tag.needs_snapshot?

    data = '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
    tag.add_snapshot(User.last, data)

    assert tag.has_snapshot?
    assert_equal tag.snapshot_id, tag.spectrum.snapshots.last.id
    assert_equal tag.snapshot_id, Snapshot.last.id
    assert_equal tag.name, "subtract:1##{tag.spectrum.snapshots.last.id}"
    assert_not_nil tag.snapshot

    assert_not_nil Snapshot.where(id: tag.snapshot_id).first

    tag.destroy

    # should delete snapshot too
    assert_nil Snapshot.where(id: tag.snapshot_id).first

  end

  test "fetch all tags for a given snapshot, and don't clean up if another tag depends on it" do

  end

end
