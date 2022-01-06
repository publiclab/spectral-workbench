require 'application_system_test_case'

class HomeTest < ApplicationSystemTestCase
  Capybara.default_max_wait_time = 60
  
  test 'visiting the index' do
    visit '/'

    assert_selector('a.title', text: 'Spectral Workbench')
    assert_selector('div.jumbotron', text: 'DIY material analysis')
    assert_selector('div.span8', text: 'Featured tags ')
    assert_selector('.hidden-phone', text: 'by contributors like you')
  end

  test 'Capture Spectra should redirect' do
    visit '/'

    within find('#headerBtns') do
      first('a.btn.btn-primary.btn-large').click
    end
    within find('#login-prompt-modal') do
      find('a.btn.btn-large.btn-no-thanks').click
    end
    within find('#settings') do
      assert_selector('a.btn.btn-large.btn-primary', text: 'Begin capturing »')
    end
  end

  test 'Check author profile link to be correct' do
    visit '/'

    within find('#author-profile') do
      first('a').click
    end
    first('a.author-profile', minimum: 1).click
    # page.find('a.btn-mini', text: 'RSS')
    assert_selector('a.btn-mini', text: 'RSS')
  end
end
