import datetime
from typing import List, Dict, Any, Optional
import uuid

INFINITE_DOI = 9999.0

# --- Data Structures ---

class InventoryItem:
    def __init__(self, sku: str, batch_id: str, current_stock: int, expiry_date: datetime.date, daily_burn_rate: float):
        self.sku = sku
        self.batch_id = batch_id
        self.current_stock = current_stock
        self.expiry_date = expiry_date
        self.daily_burn_rate = daily_burn_rate

class Clinic:
    def __init__(self, id: str, name: str, location: tuple, inventory: List[InventoryItem]):
        self.id = id
        self.name = name
        self.location = location # (lat, lon)
        self.inventory = inventory

class TransferOrder:
    def __init__(self, source_clinic_id: str, dest_clinic_id: str, sku: str, batch_id: str, qty: int, priority: str):
        self.id = str(uuid.uuid4())
        self.source_clinic_id = source_clinic_id
        self.dest_clinic_id = dest_clinic_id
        self.sku = sku
        self.batch_id = batch_id
        self.qty = qty
        self.priority = priority

# --- Core Logic ---

def calculate_bmi(item: InventoryItem) -> float:
    """Calculates Days of Inventory (DOI)"""
    if item.daily_burn_rate <= 0:
        return INFINITE_DOI # Effectively infinite stock if no burn
    return item.current_stock / item.daily_burn_rate

def calculate_dynamic_threshold(expiry_date: datetime.date, current_date: datetime.date, base_threshold_days: int = 90) -> float:
    """
    Calculates the dynamic overstock threshold based on expiry pressure.
    Formula: Threshold_dynamic = Threshold_base * (Months_to_Expiry / 12)
    """
    delta = expiry_date - current_date
    months_to_expiry = delta.days / 30.0
    
    if months_to_expiry <= 0:
        return 0.0 # Expired stock should be moved immediately (or rather, is invalid, but zero threshold implies surplus)
        
    # Cap months to expiry to avoid inflating threshold too much for very fresh stock? 
    # The formula implies linear scaling.
    
    threshold = base_threshold_days * (months_to_expiry / 12.0)
    return max(0.0, threshold)

def detect_imbalances(clinics: List[Clinic], current_date: datetime.date) -> List[TransferOrder]:
    """
    Analyzes all clinics and generates transfer orders to balance stock.
    """
    orders = []
    
    # Simple registry of shortages and surpluses
    # Key: SKU
    shortages: Dict[str, List[Dict]] = {} 
    surpluses: Dict[str, List[Dict]] = {}
    
    CRITICAL_LOW_DAYS = 15
    BASE_OVERSTOCK_DAYS = 90
    
    # 1. Identify Imbalances
    for clinic in clinics:
        for item in clinic.inventory:
            doi = calculate_bmi(item)
            dynamic_threshold = calculate_dynamic_threshold(item.expiry_date, current_date, BASE_OVERSTOCK_DAYS)
            
            # Check for Shortage
            if doi < CRITICAL_LOW_DAYS:
                needed_qty = int((30 * item.daily_burn_rate) - item.current_stock)
                if needed_qty > 0:
                    if item.sku not in shortages: shortages[item.sku] = []
                    shortages[item.sku].append({
                        "clinic": clinic,
                        "item": item,
                        "needed_qty": needed_qty,
                        "priority": "CRITICAL"
                    })

            # Check for Surplus (FENO Logic)
            # We treat stock as surplus if DOI > Dynamic Threshold
            # AND the actual days to consume locally > Days to expiry (Guaranteed Waste)
            
            days_to_consume_locally = item.current_stock / item.daily_burn_rate if item.daily_burn_rate > 0 else INFINITE_DOI
            days_to_expiry = (item.expiry_date - current_date).days
            
            is_overstock = doi > dynamic_threshold
            will_expire_unused = days_to_consume_locally > days_to_expiry
            
            if is_overstock or will_expire_unused:
                 # Calculate transferable amount
                 # If expiring unused, move everything we can't use
                 if will_expire_unused:
                      keep_qty = int(days_to_expiry * item.daily_burn_rate)
                      surplus_qty = item.current_stock - keep_qty
                      priority = "URGENT_EXPIRY"
                 else:
                      # Just standard overstock
                      # Keep enough for the threshold
                      keep_qty = int(dynamic_threshold * item.daily_burn_rate)
                      surplus_qty = item.current_stock - keep_qty
                      priority = "STANDARD_REBALANCE"
                 
                 if surplus_qty > 0:
                     if item.sku not in surpluses: surpluses[item.sku] = []
                     surpluses[item.sku].append({
                         "clinic": clinic,
                         "item": item,
                         "qty": surplus_qty,
                         "batch_id": item.batch_id,
                         "priority": priority
                     })

    # 2. Matchmaker
    for sku, need_list in shortages.items():
        if sku in surpluses:
            available_list = surpluses[sku]
            
            # Sort available by priority (URGENT_EXPIRY first)
            available_list.sort(key=lambda x: 0 if x['priority'] == 'URGENT_EXPIRY' else 1)
            
            for need in need_list:
                qty_needed = need['needed_qty']
                
                for source in available_list:
                    if qty_needed <= 0: break
                    if source['qty'] <= 0: continue
                    
                    # Determine transfer amount
                    transfer_qty = min(qty_needed, source['qty'])
                    
                    # Create Order
                    order = TransferOrder(
                        source_clinic_id=source['clinic'].id,
                        dest_clinic_id=need['clinic'].id,
                        sku=sku,
                        batch_id=source['batch_id'],
                        qty=transfer_qty,
                        priority=source['priority']
                    )
                    orders.append(order)
                    
                    # Update counters
                    qty_needed -= transfer_qty
                    source['qty'] -= transfer_qty
                
    return orders
