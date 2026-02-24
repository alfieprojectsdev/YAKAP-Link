import pytest
import datetime
from core import InventoryItem, Clinic, detect_imbalances, TransferOrder, calculate_bmi, INFINITE_DOI

def test_infinite_doi_constant():
    """Verify that calculate_bmi uses the INFINITE_DOI constant for zero/negative burn rates."""
    today = datetime.date(2025, 1, 1)

    # Zero burn rate
    item_zero = InventoryItem("TEST", "B1", 100, today, 0.0)
    assert calculate_bmi(item_zero) == INFINITE_DOI

    # Negative burn rate
    item_neg = InventoryItem("TEST", "B2", 100, today, -1.0)
    assert calculate_bmi(item_neg) == INFINITE_DOI

def test_zero_burn_rate_rebalancing():
    """Verify that items with zero burn rate are treated as surplus (since they will expire unused)."""
    today = datetime.date(2025, 1, 1)
    expiry_future = datetime.date(2026, 1, 1) # 1 year expiry

    # Clinic A: Zero burn rate, has stock.
    # Should be detected as surplus.
    item_a = InventoryItem("ZERO_BURN", "B1", 50, expiry_future, 0.0)
    clinic_a = Clinic("A", "Clinic A", (0,0), [item_a])

    # Clinic B: High burn rate, needs stock.
    item_b = InventoryItem("ZERO_BURN", "B2", 0, expiry_future, 10.0)
    clinic_b = Clinic("B", "Clinic B", (0,1), [item_b])

    orders = detect_imbalances([clinic_a, clinic_b], today)

    # Expecting a transfer of all 50 items from A to B
    assert len(orders) == 1
    order = orders[0]
    assert order.source_clinic_id == "A"
    assert order.dest_clinic_id == "B"
    assert order.sku == "ZERO_BURN"
    assert order.qty == 50
    assert order.priority == "URGENT_EXPIRY" # Because infinite DOI > days to expiry implies waste
