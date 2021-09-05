# frozen_string_literal: true

require 'test_helper'

class SpectrumsControllerTest < ActionController::TestCase
  test 'should get index' do
    get :index
    assert_response :success
    assert_not_nil assigns(:spectrums)
  end

  test 'should get /upload' do
    session[:user_id] = User.first.id # log in
    get :new
    assert_response :success
  end

  test 'should not create spectrum if not logged in' do
    post :create, params: {
      dataurl: 'data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7',
      spectrum: {
        user_id: session[:user_id],
        author: User.first.login,
        title: 'One nice spectrum',
        video_row: 5,
        # calibration_id: spectrums(:one).id, # clone calibration
        notes: 'A test spectrum.'
      }
    }
    assert_equal flash[:error], 'You must be logged in to upload data.'
    assert_redirected_to '/'
  end

  test 'should create spectrum via API token' do
    post :create, params: {
      dataurl: 'data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7',
      token: User.first.token,
      spectrum: {
        title: 'One nice spectrum',
        notes: 'A test spectrum.'
      }
    }
    assert_not_nil :spectrum
    assert_equal 'Spectrum was successfully created.', flash[:notice]
    assert_redirected_to spectrum_path(assigns(:spectrum))
  end

  test 'should not create spectrum via API token and JSON POST with bad data' do
    post :create, params: {
      token: User.first.token,
      spectrum: {
        title: 'One nice spectrum',
        notes: 'A test spectrum.',
        data_type: 'json',
        data: ''
      },
      format: 'json'
    }
    assert_not_nil :spectrum
    assert_response 422 # unprocessable_entity
  end

  test 'should create spectrum via API token and JSON POST' do
    post :create, params: {
      token: User.first.token,
      spectrum: {
        title: 'One nice spectrum',
        notes: 'A test spectrum.',
        data_type: 'json',
        token: User.last.token,
        data: '[{"average":64.3333,"r":69,"g":46,"b":78,"wavelength":269.089},{"average":63.3333,"r":71,"g":45,"b":74,"wavelength":277.718},{"average":64,"r":71,"g":47,"b":74,"wavelength":291.524},{"average":64,"r":68,"g":49,"b":75,"wavelength":303.604}]'
      },
      format: 'json'
    }

    assert_not_nil :spectrum
    assert_equal "/spectrums/#{assigns(:spectrum).id}", @response.body
  end

  test 'should create spectrum' do
    session[:user_id] = User.first.id # log in
    post :create, params: {
      dataurl: 'data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7',
      spectrum: {
        user_id: session[:user_id],
        author: User.first.login,
        title: 'One nice spectrum',
        video_row: 5,
        # calibration_id: spectrums(:one).id, # clone calibration
        notes: 'A test spectrum.'
      }
    }
    assert_not_nil :spectrum
    assert_equal 'Spectrum was successfully created.', flash[:notice]
    assert_redirected_to spectrum_path(assigns(:spectrum))
  end

  test 'should show spectrum' do
    get :show, params: { id: spectrums(:one).id }
    assert_response :success # to /analyze/spectrums/#, lets update this
    assert_nil assigns(:spectrums)
    assert_not_nil assigns(:spectrum)
  end

  test 'should show spectrum json' do
    get :show, params: { id: spectrums(:one).id, format: :json }
    assert_response :success
  end

  test 'should show spectrum csv' do
    get :show, params: { id: spectrums(:one).id, format: :csv }
    assert_response :success
  end

  test 'should show spectrum xml' do
    get :show, params: { id: spectrums(:one).id, format: :xml }
    assert_response :success
  end

  test 'should respond to latest_snapshot_id' do
    get :latest_snapshot_id, params: { id: spectrums(:one).id }
    assert_response :success
  end

  test 'should show latest snapshot in json' do
    get :latest, params: { id: snapshots(:one).id, format: :json }
    assert_response :success
  end

  test 'should show latest snapshot csv' do
    get :latest, params: { id: snapshots(:one).id, format: :csv }
    assert_response :success
  end

  test 'should show latest snapshot xml' do
    get :latest, params: { id: snapshots(:one).id, format: :xml }
    assert_response :success
  end

  test 'should show spectrum embed' do
    get :embed, params: { id: spectrums(:one).id }
    assert_response :success
    assert_not_nil :spectrum
  end

  test 'should show search' do
    get :search, params: { id: 'cfl' }
    assert_response :success
    assert_not_nil :spectrums
    assert_not_nil :sets
  end

  test 'should show search results for similarities with author name and spectrum title' do
    get :search, params: { id: spectrums(:one).title }
    assert_response :success
    assert_not_nil :spectrums
    assert_not_nil :sets

    get :search, params: { id: spectrums(:one).author }
    assert_response :success
    assert_not_nil :spectrums
    assert_not_nil :sets
  end

  test 'should respond to choose' do
    session[:user_id] = User.first.id # log in
    get :choose, params: { id: 'calibration' }
    assert_response :success
    assert_not_nil :spectrums
  end

  test 'should respond to choose in JSON' do
    session[:user_id] = User.first.id # log in
    get :choose, params: { id: 'calibration', format: :json }
    assert_response :success
    assert_not_nil :spectrums
  end

  test "should respond with 'No results' to invalid search" do
    session[:user_id] = User.first.id # log in
    get :choose, params: { id: 'calibration' }
    assert_response :success
    assert_equal @response.body, "<p>No results</p>\n"
  end

  test 'should respond to choose with partial tagname' do
    session[:user_id] = User.first.id # log in

    spectrums(:one).tag("calibration:#{spectrums(:two).id}",
                        User.first.id)
    assert Tag.where('name LIKE (?)', 'calibration%')

    get :choose, params: { id: 'calibration' }

    assert_response :success
    assert_not_equal assigns(:spectrums), []
    assert_equal assigns(:spectrums).first.id, spectrums(:one).id
  end

  test 'should respond to choose with spectrum ID' do
    session[:user_id] = User.first.id # log in

    get :choose, params: { id: spectrums(:one).id }

    assert_response :success
    assert_not_equal assigns(:spectrums), []
    assert_equal assigns(:spectrums).first.id, spectrums(:one).id
  end

  test 'should respond to choose with title beginning' do
    session[:user_id] = User.first.id # log in

    assert !spectrums(:one).id.nil?
    spectrums(:one).title = 'Elephant spectrum'
    spectrums(:one).save

    get :choose, params: { id: 'Elephant' }
    assert_response :success
    assert_not_equal assigns(:spectrums), []
    assert_equal assigns(:spectrums).first.id, spectrums(:one).id
  end

  test 'should respond to choose with no terms' do
    session[:user_id] = User.first.id # log in
    get :choose, params: { id: '' }
    assert_response :success
    assert_not_nil :spectrums
  end

  test 'should get edit' do
    session[:user_id] = User.first.id # log in
    get :edit, params: { id: spectrums(:one).id }
    assert_response :success
  end

  test 'should update spectrum' do
    session[:user_id] = User.first.id # log in
    patch :update, params: { id: spectrums(:one).id, spectrum: { title: "really nice spectrum" } }

    assert_response :redirect
    assert_equal 'Spectrum was successfully updated.', flash[:notice]
    assert_not_nil :spectrum
    assert_redirected_to spectrum_path(assigns(:spectrum))
  end

  test 'should update spectrum title' do
    session[:user_id] = User.first.id # log in
    patch :update, params: { id: spectrums(:one).id, spectrum: { title: "Really cool spectrum" } }

    assert_response :redirect
    # to check if the new spectrum title was updated
    assert_equal 'Spectrum was successfully updated.', flash[:success]
    assert_equal "Really cool spectrum" , Spectrum.find(spectrums(:one)).title
    assert_not_nil :spectrum
    assert_redirected_to spectrum_path(assigns(:spectrum))
  end


  test 'should update spectrum notes' do
    session[:user_id] = User.first.id # log in
    patch :update, params: { id: spectrums(:one).id, spectrum: { notes: "Neon spectrum info." } }

    assert_response :redirect
    # to check if the new spectrum notes was updated
    assert_equal 'Spectrum was successfully updated.', flash[:success]
    assert_equal "Neon spectrum info", Spectrum.find(spectrums(:one)).notes
    assert_not_nil :spectrum
    assert_redirected_to spectrum_path(assigns(:spectrum))
  end

  test 'should calibrate spectrum' do
    session[:user_id] = User.first.id # log in
    # we need a real spectrum with an image to work with:
    spectrum = Spectrum.last
    spectrum.image_from_dataurl('data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7')
    spectrum.save
    put :calibrate, params: { id: spectrum.id, x1: 0, x2: 10, w1: 400, w2: 500 }
    assert_response :redirect
    assert_equal 'Great, calibrated!', flash[:notice][0..17]
    assert_redirected_to spectrum_path(spectrum)
  end

  test 'should clone spectrum calibration' do
    session[:user_id] = User.first.id # log in
    # we need a real spectrum with an image to work with:
    spectrum = Spectrum.last
    spectrum.image_from_dataurl('data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7')
    spectrum.save
    put :clone_calibration, params: { id: spectrum.id, clone_id: spectrums(:one).id }
    assert_response :redirect
    assert_equal 'Spectrum was successfully calibrated.', flash[:notice]
    assert_redirected_to spectrum_path(spectrum)
  end

  test 'should fork spectrum' do
    session[:user_id] = User.first.id # log in
    # we need a real spectrum with an image to work with:
    spectrum = Spectrum.last
    spectrum.image_from_dataurl('data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7')
    spectrum.save
    get :fork, params: { id: spectrums(:one).id }
    assert_response :redirect
    assert_equal Spectrum.last.tags.last.name, "forked:#{spectrums(:one).id}"
  end

  test 'should not destroy spectrum if not owner' do
    session[:user_id] = users(:aaron).id # log in
    current_user = users(:aaron) # log in
    assert_not_equal current_user.id, spectrums(:one).user_id
    assert_not_equal current_user.role, 'admin'
    assert_difference('Spectrum.count', 0) do
      delete :destroy, params: { id: spectrums(:one).id }
    end
    assert_redirected_to spectrum_path(spectrums(:one))
  end

  test 'should destroy spectrum' do
    session[:user_id] = spectrums(:one).user.id # log in
    current_user = spectrums(:one).user # log in
    assert_equal current_user.id, spectrums(:one).user.id
    assert_difference('Spectrum.count', -1) do
      delete :destroy, params: { id: spectrums(:one).id }
    end
    assert_redirected_to '/'
  end

  test 'should destroy spectrum if admin' do
    session[:user_id] = users(:admin).id # log in
    current_user = users(:admin) # log in
    spectrum = Spectrum.last
    assert_not_equal spectrum.user_id, current_user.id
    spectrum.save
    assert_difference('Spectrum.count', -1) do
      delete :destroy, params: { id: spectrum.id }
    end
    assert_redirected_to '/'
  end

  test 'should save spectrum if vertical' do
    session[:user_id] = User.first.id
    post :create, params: {
      dataurl: 'data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7',
      spectrum: {
        user_id: session[:user_id],
        author: User.first.login,
        title: 'Another vertical spectrum',
        notes: 'It is vertical'
      },
      vertical: true
    }
    assert_equal 'Spectrum was successfully created.', flash[:notice]
    assert_response :redirect
  end

  test 'should save spectrum if not vertical' do
    session[:user_id] = User.first.id
    post :create, params: {
      dataurl: 'data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7',
      spectrum: {
        user_id: session[:user_id],
        author: User.first.login,
        title: 'Another horizontal spectrum',
        notes: 'It is horizontal'
      },
      vertical: false
    }
    assert_equal 'Spectrum was successfully created.', flash[:notice]
    assert_response :redirect
  end

  test 'should rotate spectrum' do
    session[:user_id] = users(:admin).id
    spectrum = Spectrum.last
    spectrum.image_from_dataurl('data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7')
    spectrum.save
    post :rotate, params: { id: spectrum.id }
    assert_response :redirect
  end

  test 'should reverse spectrum' do
    session[:user_id] = users(:admin).id
    spectrum = Spectrum.last
    spectrum.image_from_dataurl('data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7')
    spectrum.save
    post :reverse, params: { id: spectrum.id }
    assert_response :redirect
  end

  test 'should extract spectrum' do
    session[:user_id] = users(:admin).id
    spectrum = Spectrum.last
    spectrum.image_from_dataurl('data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7')
    spectrum.save
    post :extract, params: { id: spectrum.id }
    assert_equal "Now, recalibrate, since you've <a href='//publiclab.org/wiki/spectral-workbench-calibration#Cross+section'>set a new cross-section</a>.", flash[:warning]
    assert_response :redirect
  end

  test 'should find the brightest row in the spectrum' do
    session[:user_id] = users(:admin).id
    spectrum = Spectrum.last
    spectrum.image_from_dataurl('data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7')
    spectrum.save
    post :find_brightest_row, params: { id: spectrum.id }
    assert_equal "If this spectrum image is not perfectly vertical, you may need to recalibrate after <a href='//publiclab.org/wiki/spectral-workbench-calibration#Cross+section'>setting a new cross-section</a>.", flash[:warning]
    assert_response :redirect
  end

  test 'should set sample row to spectrum' do
    session[:user_id] = users(:admin).id
    spectrum = Spectrum.last
    spectrum.image_from_dataurl('data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7')
    spectrum.save
    post :setsamplerow, params: { id: spectrum.id }
    assert_equal "If this spectrum image is not perfectly vertical, you may need to recalibrate after <a href='//publiclab.org/wiki/spectral-workbench-calibration#Cross+section'>setting a new cross-section</a>.", flash[:warning]
    assert_response :redirect
    assert_redirected_to spectrum_path(spectrum)
  end

  test 'should do clone search' do
    get :clone_search, params: {
      id: Spectrum.first.id,
      q: 'quentin'
    }

    assert_not_nil assigns(:calibrations)
    assert_response :success
  end

  test 'should do compare search' do
    get :compare_search, params: {
      id: Spectrum.first.id,
      q: 'quentin'
    }

    assert_not_nil assigns(:spectra)
    assert_response :success
  end

  test 'should do set search' do
    session[:user_id] = users(:quentin).id
    get :set_search, params: {
      id: Spectrum.first.id,
      q: 'Rad'
    }

    assert_not_nil assigns(:user_sets)
    assert_response :success
  end

  test 'should get all spectra as JSON' do
    get :all, params: { format: 'json' }

    assert_response :success
  end

  test 'should get all spectra as XML' do
    get :all, params: { format: 'xml' }

    assert_response :success
  end

  test 'should get recent spectra' do
    get :recent, params: { capture: true }

    assert_not_nil assigns(:spectrums)
    assert_response :success
  end

  test 'should save modified spectrum' do
    session[:user_id] = Spectrum.first.user_id
    post :save, params: {
      id: Spectrum.first.id,
      data: '{"lines":[{"r":10,"g":10,"b":10,"average":10,"wavelength":400},{"r":10,"g":10,"b":10,"average":10,"wavelength":700}]}'
    }

    assert_not_nil assigns(:spectrum)
    assert_response :success
  end
end
