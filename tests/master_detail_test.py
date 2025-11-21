import pytest
from playwright.sync_api import Page, expect

def test_sorting_and_expansion(page: Page):
    page.on("console", lambda msg: print(f"BROWSER: {msg.text}"))
    # Go to the page
    page.goto("http://localhost/plugins/bobbintb.system.dirt/index.php")

    # Wait for the grid to load
    page.wait_for_timeout(10000)

    # 1. Verify Default Expansion
    print("Verifying default expansion...")
    detail_rows = page.locator('.detail-grid-wrapper')
    expect(detail_rows.first).to_be_visible()

    # 2. Verify Sorting
    print("Verifying sorting...")

    # Sort by 'Count' (Click header)
    count_header = page.locator('.ag-header-cell-label', has_text="Count")
    count_header.click()

    # Wait for sort
    page.wait_for_timeout(2000)

    # Debug info
    main_rows = page.locator('.ag-row:not(.detail-grid-wrapper .ag-row)')
    count = main_rows.count()
    print(f"Main rows count: {count}")

    for k in range(min(6, count)):
        row = main_rows.nth(k)
        classes = row.get_attribute("class")
        print(f"Row {k} classes: {classes}")
        # Try to get row ID
        row_id = row.get_attribute("row-id")
        print(f"Row {k} ID: {row_id}")

    for i in range(0, 6, 2):
        master_idx = i
        detail_idx = i + 1

        master_row = main_rows.nth(master_idx)
        detail_row = main_rows.nth(detail_idx)

        expect(master_row.locator('.detail-grid-wrapper')).not_to_be_visible()
        expect(detail_row.locator('.detail-grid-wrapper')).to_be_visible()

    print("Sorting verification passed.")
