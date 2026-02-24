from playwright.sync_api import sync_playwright

def verify_transactions():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        print("Navigating to app...")
        try:
            page.goto("http://localhost:3000")
        except Exception as e:
            print(f"Failed to navigate: {e}")
            return

        # Wait for app to load
        print("Waiting for app to load...")
        try:
            page.wait_for_selector("h1:has-text('YAKAP-Link')", timeout=10000)
        except Exception as e:
            print(f"App didn't load in time: {e}")
            page.screenshot(path="verification/error.png")
            return

        # Add Dispense Transaction
        print("Adding Dispense transaction...")
        page.fill("input[type=number]", "5")
        page.click("button:has-text('Dispense ( - )')")

        # Add Receive Transaction
        print("Adding Receive transaction...")
        page.fill("input[type=number]", "10")
        page.click("button:has-text('Receive ( + )')")

        # Add Adjust Transaction
        print("Adding Adjust transaction...")
        page.fill("input[type=number]", "2")
        page.click("button:has-text('Adjust ( +/- )')")

        # Verify Ledger
        print("Verifying ledger...")
        # Check if 'DISPENSE', 'RECEIVE', 'ADJUST' text exists in the ledger area
        try:
            page.wait_for_selector("text=DISPENSE", timeout=5000)
            page.wait_for_selector("text=RECEIVE", timeout=5000)
            page.wait_for_selector("text=ADJUST", timeout=5000)
        except Exception as e:
             print(f"Ledger verification failed: {e}")

        print("Taking screenshot...")
        page.screenshot(path="verification/transactions.png")

        browser.close()

if __name__ == "__main__":
    verify_transactions()
