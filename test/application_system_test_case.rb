require "test_helper"
require "capybara/rails"

class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
  chrome_options = %w(--use-fake-ui-for-media-stream --use-fake-device-for-media-stream --headless --disable-gpu --no-sandbox --remote-debugging-port=9222 --disable-dev-shm-usage)
  caps = Selenium::WebDriver::Remote::Capabilities.chrome("chromeOptions" => { "args" => chrome_options })
  driven_by :selenium, using: :chrome, screen_size: [1080, 1920], options: { desired_capabilities: caps }

  def wait_for_ajax
    Timeout.timeout(Capybara.default_max_wait_time) do
      loop until finished_all_ajax_requests?
    end
  end

  def finished_all_ajax_requests?
      request_count = page.evaluate_script("$.active").to_i
      request_count && request_count.zero?
    rescue Timeout::Error
  end
end
