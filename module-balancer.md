### New Module: " The Balancer" (Smart Redistribution)

### 1\. The Core Logic: "Days of Inventory" (DOI)

The system shouldn't just look at *quantity* (e.g., "Clinic A has 500 pills"). It must look at **Velocity**. 500 pills might last Clinic A for a year (Overstock), but might last Clinic B only 2 days (Critical).

We normalize everything using this formula:

$$
DOI=Average Daily Consumption (ADC)Current Stock Level​
$$

Where 
$$
ADC
$$
 is calculated using a rolling average (e.g., last 30 or 60 days) to account for recent trends.

### 2\. Architecture Decision Record (ADR)

**ADR-003: Server-Side Heuristic Analysis for Redistribution**

- **Context:** Remote clinics operate in silos. They don't know if a neighboring town has the meds they lack.
- **Decision:** Implement a nightly Cron Job (The "Night Watchman") on the Central Server.
	- **Input:** Synced transaction logs from all RHUs.
	- **Process:** Calculate the 
		$$
		DOI
		$$
		 for every SKU in every location.
	- **Logic:** Match "Sources" (DOI > 90 days) with "Sinks" (DOI < 15 days) within the same geographic cluster.
- **Output:** A "Stock Transfer Request" (STR) pushed to the specific clinics during their next sync.

### 3\. The Algorithm (Pseudo-Code)

This is the logic you would implement in your Python/Node backend:

Python

```
def run_redistribution_analysis():
    # Thresholds
    CRITICAL_LOW = 15  # Days
    OVERSTOCK = 90     # Days

    for region in regions:
        shortages = []
        surpluses = []

        # Step 1: Identify imbalances
        for clinic in region.clinics:
            for med in clinic.inventory:
                burn_rate = calculate_burn_rate(med.history)
                doi = med.current_stock / burn_rate

                if doi < CRITICAL_LOW:
                    shortages.append({clinic, med, needed: (30 * burn_rate) - med.stock})
                elif doi > OVERSTOCK:
                    surpluses.append({clinic, med, available: med.stock - (60 * burn_rate)})

        # Step 2: Matchmaker (The "Robin Hood" Logic)
        for need in shortages:
            # Find the nearest clinic with a surplus of this specific med
            donor = find_nearest_donor(surpluses, need.med, need.clinic.gps)
            
            if donor:
                create_transfer_order(source=donor, destination=need.clinic, qty=need.qty)
```

### 4\. The User Experience (The "Smart" Alert)

This is how the user perceives the "Intelligence." They don't see the math; they see a helpful notification.

**Scenario:**

- **Clinic A (Mountain Province - Low Traffic)** has 1,000 boxes of Doxycycline meant for a leptospirosis outbreak that never happened. It's expiring in 6 months.
- **Clinic B (Rice Field Area - High Traffic)** just ran out of Doxycycline and is 20km away.

**The Alert on Clinic A's Tablet (Next Sync):**

> 🔔 **Action Recommended:** We detected you have **excess Doxycycline** (240 Days of Stock). **Clinic B** nearby is in critical need.
> 
> **Task:** Please box **200 units** for pickup by the municipal courier on Friday. *\[Button: Accept Transfer Order\]*

### 5\. Why this is "Time Series" ready

Currently, the `calculate_burn_rate` uses a simple average. But later, you can swap that function with a **Holt-Winters Exponential Smoothing** model or an **ARIMA** model to predict seasonal spikes (e.g., "It's September, expect Dengue meds to spike in Region 4").

This structure solves the "Medicine Rotting in Warehouses" problem—one of the biggest inefficiencies in government healthcare.


---

### Update to Module: "The Balancer" (Expiry-Weighted Logic)

### 1\. Conceptual Shift: From SKU to "Batch" Level

We can no longer just track "Amoxicillin." We must track "Amoxicillin (Batch #101, Exp: Dec 2026)."

**The Core Principle: FENO (First-Expired-Network-Out)** Usually, clinics practice FEFO (First-Expired-First-Out) *internally*. We are scaling this to the *entire network*. If Clinic A has stock expiring in 3 months that they won't consume, it becomes a "Critical Surplus" immediately.

### 2\. The Math: Dynamic Thresholds

Normally, we declare a "Surplus" if a clinic has **\>90 Days** of supply. However, if the stock is expiring soon, that threshold must drop. We don't want to wait until they have 90 days of stock left; we want to move it *now*.

**The "Pressure" Formula:** We adjust the **Overstock Threshold** based on the remaining shelf life.

$$
Thresholddynamic​=Thresholdbase​×(12Months to Expiry​)
$$

- **Scenario A (Fresh Stock):** Expiring in 24 months. 
	$$
	Threshold=90×(24/12)=180 Days
	$$
	. (System is relaxed. You can keep a lot of it.)
- **Scenario B (Dying Stock):** Expiring in 3 months. 
	$$
	Threshold=90×(3/12)=22.5 Days
	$$
	. (System is panicked. If you have more than 22 days' worth, **move it out immediately**.)

### 3\. Updated Algorithm Logic

Python

```
def check_expiry_pressure(clinic, batch):
    months_left = (batch.expiry_date - current_date).months
    daily_consumption = clinic.get_burn_rate(batch.sku)
    
    # How many days will it take THIS clinic to finish THIS batch?
    days_to_consume = batch.qty / daily_consumption
    
    # THE CHECK: Will it expire before they finish it?
    if days_to_consume > (months_left * 30):
        # Result: Guaranteed Waste detected.
        excess_qty = batch.qty - (daily_consumption * months_left * 30)
        
        # Trigger High-Priority Transfer
        flag_for_transfer(
            batch=batch, 
            source=clinic, 
            qty=excess_qty, 
            priority="URGENT_EXPIRY"
        )
```

### 4\. The User Experience (The "Hero" Notification)

This feature allows the LGU (Local Gov Unit) to look competent by preventing waste.

**The Alert to the Municipal Health Officer:**

> ⚠️ **Waste Prevention Alert**
> 
> You have **500 vials of Insulin** expiring in **4 months**. Based on your current usage, you will only use **150 vials** by then. **350 vials** are at risk of being wasted (Value: ₱175,000).
> 
> **Solution:** The Provincial Hospital (20km away) can consume this in 2 weeks.
> 
> **\[Approve Transfer to Provincial Hospital\]**

### 5\. Why this wins proposals

When you pitch this to PhilHealth or an LGU, you aren't just selling software. You are selling **Audit Compliance**.

- **COA (Commission on Audit)** hates wasted inventory.
- By showing that your algorithm mathematically minimizes waste *before it happens*, you solve their biggest legal liability.
