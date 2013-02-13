require 'test_helper'

class UserMailerTest < ActionMailer::TestCase
  test "direct_message" do
    @expected.subject = 'UserMailer#direct_message'
    @expected.body    = read_fixture('direct_message')
    @expected.date    = Time.now

    assert_equal @expected.encoded, UserMailer.create_direct_message(@expected.date).encoded
  end

end
