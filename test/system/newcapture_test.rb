require "application_system_test_case"

class NewcaptureTest < ApplicationSystemTestCase

  test 'visiting the capture page' do 
    visit '/capture'
  end

  test 'visiting the new capture page' do
    visit '/capture/v2'
    
    # 1 How to enable the in browser prompt for accessing the device camera 
    # 2 How to simulate login of the user (since we can only log in the app with other social media accounts)

    # dismissing the login model
    assert_selector('h4.modal-title', text: 'Log in for full functionality')
    find("div.modal-footer #login-dismiss").click()

    # if the user isn't logged in, then a `Log in` button should be displayed in the navbar
    loginButton = page.find('#login-btn')
    assert_equal(loginButton.text, 'Log in')

    # going to the settings page
    find("button#landing-page-next").click()
    find("a.btn-rotate").click() # checking for vertical spectrum
    find("a.btn-rotate").click() # back to horizontal spectrum
    find("button#setting-page-next").click()

    accept_alert do 
      find("button#json-download").click()
    end

  #checking the final view of the test
  sleep(2)
  end
end
