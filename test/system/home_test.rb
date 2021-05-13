require 'application_system_test_case'

class HomeTest < ApplicationSystemTestCase
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
    find('a.btn.btn-large').click
    within find('#settings') do
      assert_selector('a.btn.btn-large.btn-primary', text: 'Begin capturing »')
    end
  end
end
