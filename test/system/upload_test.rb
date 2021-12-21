require "application_system_test_case"

class UploadTest < ApplicationSystemTestCase
  Capybara.default_max_wait_time = 60

  def setup
    @user = User.create({
        login: Faker::Internet.username,
        name: Faker::Name.name,
        email: Faker::Internet.email 
    })
  end

  test 'upload a spectrum on upload spectrum page' do 
    #log in 
    page.set_rack_session(:user_id => @user.id)
    visit "/uplod"

    # Capybara.ignore_hidden_elements = false

    page.find('input#inputPhoto').set("#{Rails.root.to_s}/public/images/example-cfl-horizontal.jpg")
    
    # filling in the save form with data
    upload_form_title = page.find('input#inputTitle')
    upload_form_title
      .click
      .fill_in with: "Upload spectrum test"

    upload_form_notes = page.find('textarea#textareaNotes')
    upload_form_notes
      .click
      .fill_in with: "This is the notes section of the spectrum from the upload page."

    page.find('input#vertical').click()
    page.find('input#geotagInput').click()

    page.find('a#uploadBtn').click()

    # check if the spectrum was successfully created and deleting the spectrum
    page.find('div.alert-success', text: "Spectrum was successfully created.")

    assert_selector('a', text: 'Upload spectrum test')
    assert_selector('div.span4 p', text: 'This is the notes section of the spectrum from the upload page.')

    page.find('p.credit a', text: "#{@user.login}")

    accept_alert do 
        find("div.span4 div.btn-group i.fa-trash").click()
    end
    
    page.find('div.alert-success', text: "Spectrum deleted.")
  end
end
