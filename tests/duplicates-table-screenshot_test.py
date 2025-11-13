from datetime import datetime
import pytest
from playwright.sync_api import Page, expect

@pytest.mark.describe("DIRT Duplicates Table Page Screenshot")
def test_duplicates_table_screenshot(page: Page):
    # Go to the page
    page.goto("http://localhost/plugins/bobbintb.system.dirt/index.php")

    # Wait for 10 seconds to allow the page to load
    page.wait_for_timeout(10000)

    # Check that the AG-Grid container is present
    grid = page.locator('#myGrid')
    expect(grid).to_be_visible()

    # Generate timestamped filename
    timestamp = datetime.now().isoformat().replace(":", "-").replace(".", "-")
    filename = f"test-results/duplicates-screenshot-{timestamp}.png"

    # Take a full-page screenshot
    page.screenshot(path=filename, full_page=True)
