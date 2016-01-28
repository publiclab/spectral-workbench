require 'test_helper'

class TagsControllerTest < ActionController::TestCase

  test "should show tag" do
    tag = Tag.new({
      name:        'cfl',
      spectrum_id: spectrums(:one).id,
      user_id:     users(:quentin).id
    })
    assert tag.save!
    get :show, :id => 'cfl'
    assert_response :success
    assert_not_nil assigns(:spectrums).first.lat
    assert_not_nil assigns(:spectrums).first.lon
  end

  test "should show tag index for spectrum" do
    get :index, :spectrum_id => spectrums(:one).id
    assert_response :success
  end

  test "should create tag" do
    session[:user_id] = User.first.id # log in
    get :create, tag: { name: 'mytag',
                        spectrum_id: Spectrum.first.id }
    assert_response :redirect
    assert_not_nil assigns(:response)[:saved]['mytag']
    assert_not_nil assigns(:response)[:saved]['mytag']['id']
    assert_not_nil assigns(:response)[:saved]['mytag']['name']
    assert_not_nil assigns(:response)[:saved]['mytag']['created_at']
    assert_equal "Tag(s) added.", flash[:notice]
    assert_redirected_to spectrum_path(Spectrum.first.id)
  end

  test "should not create tag if not logged in" do
    get :create, tag: { name: 'mytag',
                        spectrum_id: Spectrum.first.id }
    assert_response :redirect
    assert_equal "You must be logged in to access this function.", flash[:error]
    assert_redirected_to "/login?back_to=/tags"
  end

  ## test for "post" vs "get"

  test "should delete tag" do
    session[:user_id] = tags(:one).user_id # log in
    post :destroy, :id => tags(:one).id
    assert_response :redirect
    assert_equal nil, flash[:error]
    assert_equal "Tag 'cfl' deleted.", flash[:notice]
    assert_redirected_to spectrum_path(tags(:one).spectrum_id)
  end

  test "should not delete tag if not owner" do
    session[:user_id] = tags(:two).user_id # log in
    post :destroy, :id => tags(:one).id
    assert_response :redirect
    assert_equal "You must have authored a tag or own its spectrum to delete it.", flash[:error]
    assert_equal nil, flash[:notice]
    assert_redirected_to spectrum_path(tags(:one).spectrum_id)
  end

  test "should not delete tag if not logged in" do
    post :destroy, :id => 'cfl'
    assert_response :redirect
    assert_equal "You must be logged in to access this function.", flash[:error]
    assert_redirected_to "/login?back_to=/tags/cfl"
  end

  test "should delete tag if admin" do
    session[:user_id] = users(:admin).id # log in as admin
    tag = Tag.find_by_name('cfl')
    post :destroy, :id => tag.id
    assert_response :redirect
    assert_equal "Tag 'cfl' deleted.", flash[:notice]
    assert_redirected_to spectrum_path(tag.spectrum_id)
  end

  test "powertag creation if you're not the owner" do 
    session[:user_id] = users(:aaron).id # log in

    @request.headers["Content-Type"] = "application/json"
    @request.headers["Accept"] = "application/javascript"
    xhr :post, :create, tag: { name: 'range:400-500',
                        spectrum_id: users(:quentin).spectrums.first.id }

    assert_equal ActiveSupport::JSON.decode(@response.body)['errors'].last, "Error: You must own the spectrum to add powertags"
    assert_response :success
  end

  test "powertag creation if you're not the owner but you are an admin" do 
    session[:user_id] = users(:admin).id # log in

    @request.headers["Content-Type"] = "application/json"
    @request.headers["Accept"] = "application/javascript"
    xhr :post, :create, tag: { 
      name: 'range:100-500',
      spectrum_id: spectrums(:one).id
    }

    response = ActiveSupport::JSON.decode(@response.body)
    assert_not_nil response
    assert_not_nil response['saved']
    assert_not_nil response['saved']['range:100-500']
    assert_not_nil response['saved']['range:100-500']['id']
    assert_not_nil response['saved']['range:100-500']['name']
    assert_not_nil response['saved']['range:100-500']['created_at']
    assert_nil response['saved']['range:100-500']['has_dependent_spectra']
    assert_nil response['saved']['range:100-500']['reference_is_latest']
    assert_response :success
  end

  test "should not delete tag if not latest snapshot, in json" do
    session[:user_id] = users(:aaron).id # log in
    # create a snapshot
    tag = Tag.new({
      user_id:     users(:aaron).id,
      spectrum_id: users(:aaron).spectrums.last.id,
      name:        'smooth:1'
    })
    assert tag.save!
    assert_equal tag.name, 'smooth:1'
    assert tag.create_snapshot('{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}')

    # create a snapshot which will refer to the same spectrum, and be the latest:
    tag2 = Tag.new({
      user_id:     tag.user_id,
      spectrum_id: tag.spectrum_id,
      name:        'smooth:3'
    })
    assert tag2.save!
    assert_equal tag2.name, 'smooth:3'
    tag2.create_snapshot('{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}')

    xhr :post, :destroy, :id => tag.id # we do this instead of :format => :json, for some reason

    assert_response 422 # rejected
    assert_nil flash[:error]
    assert_nil flash[:notice]
    response = ActiveSupport::JSON.decode(@response.body)
    assert_not_nil response
    assert_not_nil response['has_dependent_spectra']
    assert_equal response['has_dependent_spectra'], false
    assert_not_nil response['has_subsequent_depended_on_snapshots']
    assert_equal response['has_subsequent_depended_on_snapshots'], false
    assert_not_nil response['is_latest']
    assert_equal response['is_latest'], false
  end

  test "should not delete tag if there are dependent spectra, in json" do
    session[:user_id] = users(:aaron).id # log in
    # create a snapshot
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

    xhr :post, :destroy, :id => tag.id # we do this instead of :format => :json, for some reason

    assert_response 422 # rejected
    assert_nil flash[:error]
    assert_nil flash[:notice]
    response = ActiveSupport::JSON.decode(@response.body)
    assert_not_nil response
    assert_not_nil response['has_dependent_spectra']
    assert_equal response['has_dependent_spectra'], true
    assert_not_nil response['dependent_spectra']
    assert_equal response['dependent_spectra'], [tag2.spectrum_id]
    assert_not_nil response['has_subsequent_depended_on_snapshots']
    assert_equal response['has_subsequent_depended_on_snapshots'], false
    assert_not_nil response['is_latest']
    assert_equal response['is_latest'], true
  end

  test "powertag creation which generates a snapshot and returns a new #tagname" do 
    session[:user_id] = users(:admin).id # log in

    # create a snapshot which will be referred to:
    tag = Tag.new({
      user_id:     spectrums(:two).user_id,
      spectrum_id: spectrums(:two).id,
      name:        'range:100-500'
    })
    assert tag.save!
    data = '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
    tag.create_snapshot(data)

    # now refer to it:
    @request.headers["Content-Type"] = "application/json"
    @request.headers["Accept"] = "application/javascript"
    tagname = "subtract:#{spectrums(:two).id}"
    xhr :post, :create, tag: { 
      name: tagname,
      spectrum_id: spectrums(:one).id
    }
    assert_response :success
    response = ActiveSupport::JSON.decode(@response.body)
    assert_not_nil response
    assert_not_nil response['saved']
    assert_not_nil response['saved'][tagname]
    assert_not_nil response['saved'][tagname]['id']
    assert_not_nil response['saved'][tagname]['name']
    assert response['saved'][tagname]['name'], tagname + "##{tag.snapshot.id}"
  end

  test "powertag index listing for spectrum, which indicates that a referenced snapshot is no longer latest for that spectrum" do 

    # create a snapshot which will be referred to:
    tag = Tag.new({
      user_id:     spectrums(:two).user_id,
      spectrum_id: spectrums(:two).id,
      name:        "smooth:3"
    })
    assert tag.save!
    data = '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
    tag.create_snapshot(data)

    # create an operation which will refer to the snapshot:
    tag2 = Tag.new({
      user_id:     spectrums(:one).user_id,
      spectrum_id: spectrums(:one).id,
      name:        "subtract:#{spectrums(:two).id}"
    })
    assert tag2.save!

    @request.headers["Content-Type"] = "application/json"
    @request.headers["Accept"] = "application/javascript"

    xhr :get, :index, spectrum_id: spectrums(:one).id, :format => :json

    assert_response :success
    response = ActiveSupport::JSON.decode(@response.body)
    assert_not_nil response
    tag = response.last
    assert_not_nil tag
    assert_not_equal tag['name'], "subtract:#{spectrums(:two).id}"
    assert_equal     tag['name'], "subtract:#{spectrums(:two).id}##{spectrums(:two).snapshots.first.id}"
    assert_not_nil   tag['refers_to_latest_snapshot']
    assert_equal     tag['refers_to_latest_snapshot'], true
    assert_not_nil   tag['reference_spectrum_snapshots']
    assert_equal     tag['reference_spectrum_snapshots'].length, spectrums(:two).snapshots.length

    # create a new snapshot, making our tag no longer pointed at the most recent snapshot
    tag = Tag.new({
      user_id:     spectrums(:two).user_id,
      spectrum_id: spectrums(:two).id,
      name:        'range:100-500'
    })
    assert tag.save!
    data = '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
    tag.create_snapshot(data)

    xhr :get, :index, spectrum_id: spectrums(:one).id, :format => :json
    assert_response :success
    response = ActiveSupport::JSON.decode(@response.body)
    assert_not_nil response
    tag = response.last
    index = response.length - 1
    assert_not_nil tag
    assert_not_equal tag['name'], "subtract:#{spectrums(:two).id}"
    assert_equal     tag['name'], "subtract:#{spectrums(:two).id}##{spectrums(:two).snapshots.first.id}"
    assert_not_nil   tag['refers_to_latest_snapshot']
    assert_equal     tag['refers_to_latest_snapshot'], false

  end

  test 'change_reference' do 
    session[:user_id] = nil # ensure not logged in

    # try while not logged in
    xhr :post, :change_reference, id: tags(:one).id, snapshot_id: -1

    # not 422, because we're prompted to log in;
    # it's JSON, so we're given a string back, not redirected 
    assert @response.body.match("logged in to do this")

    #session[:user_id] = User.first.id # log in
    #assert_not_equal tags(:one).user_id, User.first.id

    # try non-owned snapshot_id (this requires setup of a tag which actually has a reference spectrum...)
    #xhr :post, :change_reference, id: tags(:one).id, snapshot_id: -1

    # 422, because we don't own it:
    #assert_response 422

    # remainder is well-tested in tag unit test... 


    # try invalid snapshot_id
    # xhr :post, :change_reference, id: tags(:one).id, snapshot_id: -1
    
    # assert_response 422

    # try successful request

  end

end
