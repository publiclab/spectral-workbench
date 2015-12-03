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

  end

end
