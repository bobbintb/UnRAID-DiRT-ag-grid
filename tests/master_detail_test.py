import pytest
from playwright.sync_api import Page, expect

def test_master_detail_functionality(page: Page):
    # Go to the page
    page.goto("http://localhost/plugins/bobbintb.system.dirt/index.php")

    # Wait for the grid to load
    page.wait_for_timeout(10000)

    # Check that the AG-Grid container is present
    grid = page.locator('#myGrid')
    expect(grid).to_be_visible()

    # Find the first row in the grid.
    # We use the first row of the master grid.
    first_row = page.locator('.ag-row[row-index="0"]').first
    expect(first_row).to_be_visible()

    # Find the expand icon.
    # In the custom implementation, we used a span with class 'master-expand-icon' containing a FontAwesome icon.
    expand_icon = first_row.locator('.master-expand-icon')

    # Fallback or verify strictness
    if expand_icon.count() == 0:
        # Maybe strictly look for the FA icon
        expand_icon = first_row.locator('.fa-plus-square-o')

    expect(expand_icon).to_be_visible()
    expand_icon.click()

    # Wait for detail row to appear.
    # In our custom implementation, the detail cell renderer creates a div with class 'detail-grid-wrapper'.
    detail_wrapper = page.locator('.detail-grid-wrapper').first
    expect(detail_wrapper).to_be_visible()

    # Verify detail grid exists inside.
    # It should contain another AG Grid root.
    detail_grid_root = detail_wrapper.locator('.ag-root-wrapper')
    expect(detail_grid_root).to_be_visible()

    # Optional: Check that the icon changed to minus
    minus_icon = first_row.locator('.fa-minus-square-o')
    expect(minus_icon).to_be_visible()
