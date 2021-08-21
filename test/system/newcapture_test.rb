require "application_system_test_case"

class NewcaptureTest < ApplicationSystemTestCase
  Capybara.default_max_wait_time = 60

  def setup
    @user = User.create({
        login: Faker::Internet.username,
        name: Faker::Name.name,
        email: Faker::Internet.email 
    })
  end

  test 'new capture spectrum page' do
    #log in 
    page.set_rack_session(:user_id => @user.id)
    visit "/capture/v2"
    sleep(2) # taking in account modal display transition

    # Enable the in browser prompt for accessing the device camera (use-fake-ui-for-media-stream (Not working))

    loginStatus = page.find('p#login-status')
    assert_equal(loginStatus.text, "(logged in as #{@user.login})")

    # going to the settings page
    find("button#landing-page-next").click()
    assert_selector('video#webcam-video')

    # Testing buttons
    # horizontal spectrum image is shown by default
    assert_selector('img.img-rot')
    # vertical spectrum image is hidden
    find('img#cfl-resp', visible: false)

    find("a.btn-rotate").click() # rotate 90 degrees
    
    # vertical spectrum image is shown
    assert_selector('img#cfl-resp')
    # horizontal spectrum image is hidden
    find('img.img-rot', visible: false)

    find("a.btn-rotate").click() # rotate 90 degrees (back to horizontal spectrum)

    find("video#webcam-video").assert_matches_style("transform" => "none")

    # clicking the flip-image button
    find("a.btn-flip").click()
    find("video#webcam-video").assert_matches_style("transform" => "matrix(-1, 0, 0, 1, 0, 0)")

    find("button#setting-page-next").click()

    accept_alert do 
      find("button#json-download").click()
    end

    # goto save spectrum page
    find("button#capture-page-next").click()
    
    # preview of the spectrum should be displayed
    assert_selector('img#spectrum-preview')      
    
    # login status is displayed on the save page
    assert_selector('i', text: "(logged in as #{@user.login})")

    # filling in the save form with data
    save_form_title = page.find('input#saveFormTitle')
    save_form_title
      .click
      .fill_in with: "Title of the test spectrum"

    save_form_tags = page.find('input#spectrum_tags')
    save_form_tags
      .click
      .fill_in with: "test, spectrum, rgb"

    save_form_notes = page.find('textarea#spectrum_notes')
    save_form_notes
      .click
      .fill_in with: "This is the notes section of the test spectrum."

    # saving with selected calibration
    new_window = window_opened_by { click_link 'Save with selected calibration' }

    # following the page on new spectrum creation (/spectrums/{spectrum.id})
    within_window new_window do
      # check if the spectrum was successfully created
      page.find('div.alert-success', text: "Spectrum was successfully created.")

      assert_selector('a', text: 'Title of the test spectrum')
      assert_selector('div.span4 p', text: 'This is the notes section of the test spectrum.')

      page.find('p.credit a', text: "#{@user.login}")

      accept_alert do 
        find("div.span4 div.btn-group i.fa-trash").click()
      end
      
      page.find('div.alert-success', text: "Spectrum deleted.")
    end
  end

end
