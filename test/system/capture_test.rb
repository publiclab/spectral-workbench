require "application_system_test_case"

class CaptureTest < ApplicationSystemTestCase
  Capybara.default_max_wait_time = 60

  def setup
    @user = User.create({
        login: Faker::Internet.username,
        name: Faker::Name.name,
        email: Faker::Internet.email 
    })
  end

  test 'capture spectrum page' do 
    #log in 
    page.set_rack_session(:user_id => @user.id)
    visit "/capture"
    sleep(2) # taking in account modal display transition

    page.find('a', text: "Begin capturing »").click()
    page.find('a', text: "Save").click()

    # preview of the spectrum should be displayed
    assert_selector('img#spectrum-preview') 
    assert_selector('h3', text: 'Save this spectrum')
    assert_selector('i', text: "(logged in as #{@user.login})")

    # filling in the save form with data
    save_form_title = page.find('input#saveform_title')
    save_form_title
      .click
      .fill_in with: "Capture page test spectrum"

    save_form_tags = page.find('input#spectrum_tags')
    save_form_tags
      .click
      .fill_in with: "test, spectrum, rgb, color"

    save_form_notes = page.find('textarea#spectrum_notes')
    save_form_notes
      .click
      .fill_in with: "This is the notes section of the test spectrum from capture page."

    new_window = window_opened_by { click_link 'Save with selected calibration' }

    within_window new_window do
      # check if the spectrum was successfully created
      page.find('div.alert-success', text: "Spectrum was successfully created.")

      assert_selector('a', text: 'Capture page test spectrum')
      assert_selector('div.span4 p', text: 'This is the notes section of the test spectrum from capture page.')

      page.find('p.credit a', text: "#{@user.login}")

      accept_alert do 
          find("div.span4 div.btn-group i.fa-trash").click()
      end
      
      page.find('div.alert-success', text: "Spectrum deleted.")
    end
  end

end
