require "application_system_test_case"
 
class HomeTest < ApplicationSystemTestCase
  test "viewing the index" do
    visit '/'
    # assert_selector "h1", text: "Articles"
  end
end
