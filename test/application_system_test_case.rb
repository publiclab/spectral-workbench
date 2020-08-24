require "test_helper"

class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
  chrome_options = %w(--headless --disable-gpu --no-sandbox --remote-debugging-port=9222 --disable-dev-shm-usage)
  caps = Selenium::WebDriver::Remote::Capabilities.chrome("chrome_options" => { "args" => chrome_options })
  driven_by :selenium, using: :chrome, screen_size: [1400, 1400], options: { desired_capabilities: caps }
end
