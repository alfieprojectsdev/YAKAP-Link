import pytest
import datetime
from core import InventoryItem, Clinic, detect_imbalances, TransferOrder, calculate_dynamic_threshold, calculate_bmi, INFINITE_DOI

def test_dynamic_threshold():
    today = datetime.date(2025, 1, 1)
    
    # 24 months to expiry
    exp_far = datetime.date(2027, 1, 1) # 24 months
    thresh_far = calculate_dynamic_threshold(exp_far, today, 90)
    # Expected: 90 * (24/12) = 180
    assert abs(thresh_far - 180) < 5

    # 3 months to expiry
    exp_near = datetime.date(2025, 4, 1) # ~3 months
    thresh_near = calculate_dynamic_threshold(exp_near, today, 90)
    # Expected: 90 * (3/12) = 22.5
    assert abs(thresh_near - 22.5) < 5

def test_balancer_simple_transfer():
    today = datetime.date(2025, 1, 1)
    far_future = datetime.date(2026, 1, 1)
    
    # Clinic A: Surplus of Doxycycline
    # Burn rate: 1/day. Stock: 200. DOI: 200 days.
    # Threshold: 90 days. Surplus ~110.
    item_a = InventoryItem("DOXY", "B1", 200, far_future, 1.0)
    clinic_a = Clinic("A", "Clinic A", (0,0), [item_a])
    
    # Clinic B: Shortage of Doxycycline
    # Burn rate: 2/day. Stock: 10. DOI: 5 days.
    # Critical Low: 15 days. Need ~20 more to check logic (target 30 days = 60 stock).
    item_b = InventoryItem("DOXY", "B2", 10, far_future, 2.0)
    clinic_b = Clinic("B", "Clinic B", (0,1), [item_b])
    
    orders = detect_imbalances([clinic_a, clinic_b], today)
    
    assert len(orders) == 1
    assert orders[0].source_clinic_id == "A"
    assert orders[0].dest_clinic_id == "B"
    assert orders[0].sku == "DOXY"
    # Clinic B needs (30 * 2) - 10 = 50.
    # Clinic A has surplus 200 - 90 = 110.
    # Transfer should be 50.
    assert orders[0].qty == 50

def test_balancer_expiry_push():
    today = datetime.date(2025, 1, 1)
    
    # Clinic A: Low burn rate, expiring stock
    # Burn rate: 0.1/day. Stock: 100.
    # Months to expiry: 3 (Exp April 1st). 90 days.
    # Days to consume: 100 / 0.1 = 1000 days.
    # Will expire unused? Yes (1000 > 90).
    # Keep qty: 90 * 0.1 = 9. Surplus: 91.
    exp_near = datetime.date(2025, 4, 1)
    item_a = InventoryItem("INSULIN", "B1", 100, exp_near, 0.1)
    clinic_a = Clinic("A", "Clinic A", (0,0), [item_a])
    
    # Clinic B: High burn rate
    # Burn rate: 5/day. Stock: 0.
    # Needs urgent stock.
    item_b = InventoryItem("INSULIN", "B2", 0, exp_near, 5.0)
    clinic_b = Clinic("B", "Clinic B", (0,1), [item_b])
    
    orders = detect_imbalances([clinic_a, clinic_b], today)
    
    assert len(orders) >= 1
    found = False
    for o in orders:
        if o.priority == "URGENT_EXPIRY":
            found = True
            assert o.source_clinic_id == "A"
            assert o.dest_clinic_id == "B"
    assert found

def test_zero_burn_rate():
    today = datetime.date(2025, 1, 1)
    far_future = datetime.date(2026, 1, 1)

    # Test calculate_bmi with zero burn
    item_zero = InventoryItem("SKU1", "B1", 100, far_future, 0.0)
    assert calculate_bmi(item_zero) == INFINITE_DOI

    # Test detect_imbalances with zero burn
    # Clinic A: Stock 100, Burn 0. DOI = 9999.
    # Days to expiry = 365.
    # DOI > Threshold (90) -> Overstock.
    # will_expire_unused = days_to_consume (9999) > days_to_expiry (365) -> True.
    # keep_qty = days_to_expiry * burn_rate = 365 * 0 = 0.
    # surplus = 100 - 0 = 100.
    clinic_a = Clinic("A", "Clinic A", (0,0), [item_zero])

    # Clinic B needs some
    item_b = InventoryItem("SKU1", "B2", 0, far_future, 1.0)
    clinic_b = Clinic("B", "Clinic B", (0,1), [item_b])

    orders = detect_imbalances([clinic_a, clinic_b], today)
    assert len(orders) == 1
    assert orders[0].qty == 30 # (30 * 1) - 0 = 30
    assert orders[0].priority == "URGENT_EXPIRY"
