# 📦 Complete Order Workflow & Money Flow Explanation

## 🔄 Order Status Flow

Your food delivery system follows this exact workflow:

```
Step 1: CREATED (0)
   └─> Customer places order & pays ETH
   └─> Money locked in Escrow contract
   
Step 2: ACCEPTED (1)  
   └─> Restaurant accepts the order
   └─> Starts preparing food
   
Step 3: PREPARED (2) ⭐ **RIDERS CAN NOW SEE THIS**
   └─> Restaurant marks food ready
   └─> Order appears in "Available Orders" for riders
   └─> YOU (Restaurant) can assign a rider OR rider can accept it themselves
   
Step 4: PICKEDUP (3)
   └─> Rider picks up food from restaurant
   └─> Delivery in progress
   
Step 5: DELIVERED (4)
   └─> Rider marks delivered
   └─> Waiting for customer confirmation
   
Step 6: COMPLETED (5) 💰 **PAYMENT RELEASED**
   └─> Customer confirms delivery
   └─> Escrow releases payment to:
       • Restaurant (80%)
       • Rider (10%)
       • Platform (10%)
```

---

## 🍕 Restaurant Workflow (Your Role)

### What You See & Do:

#### **When Order Arrives (Status: CREATED)**
```
┌─────────────────────────────────────┐
│  Order #1  [🟡 Created]            │
│                                     │
│  🕐 5m ago                          │
│  👤 0x1234...5678                  │
│  📍 123 Main Street                │
│                                     │
│  🔔 New order waiting for          │
│     confirmation                   │
│                                     │
│  [✅ Accept Order]                 │
└─────────────────────────────────────┘
```
**Action:** Click "Accept Order"

---

#### **After You Accept (Status: ACCEPTED)**
```
┌─────────────────────────────────────┐
│  Order #1  [🔵 Accepted]           │
│                                     │
│  👨‍🍳 Start preparing the food      │
│                                     │
│  [🍳 Mark as Prepared]             │
└─────────────────────────────────────┘
```
**Action:** Cook the food, then click "Mark as Prepared"

---

#### **After Marking Prepared (Status: PREPARED)**
```
┌─────────────────────────────────────┐
│  Order #1  [🟣 Prepared]           │
│                                     │
│  🏍️ Ready for rider pickup         │
│  3 riders available                │
│                                     │
│  [🏍️ Assign Rider]                │
└─────────────────────────────────────┘
```

**Two Options:**

1. **You Assign a Rider** (Click "Assign Rider")
   - System automatically assigns first available rider
   - OR you can select from available riders (if UI implemented)

2. **Rider Accepts Themselves**
   - Order appears in riders' "Available Orders" list
   - Any available rider can accept it
   - First one to accept gets the order

---

#### **After Rider Assigned (Status: PICKEDUP)**
```
┌─────────────────────────────────────┐
│  Order #1  [🟠 PickedUp]           │
│                                     │
│  🚚 Out for delivery                │
│  (No action needed)                │
└─────────────────────────────────────┘
```
**Action:** Wait for delivery

---

#### **After Delivery (Status: DELIVERED)**
```
┌─────────────────────────────────────┐
│  Order #1  [🟢 Delivered]          │
│                                     │
│  ✅ Delivered - Waiting for        │
│     customer confirmation          │
└─────────────────────────────────────┘
```
**Action:** Wait for customer to confirm

---

#### **After Customer Confirms (Status: COMPLETED)**
```
┌─────────────────────────────────────┐
│  Order #1  [✅ Completed]          │
│                                     │
│  🎉 Order completed!               │
│     Payment released               │
│                                     │
│  💰 You received: 0.00008 ETH      │
└─────────────────────────────────────┘
```
**Result:** You get paid! 🎉

---

## 💰 Money Flow Explained

### When Customer Places Order

**Customer pays:** 0.0001 ETH

**What happens:**
1. ✅ Transaction sent to OrderManager contract
2. ✅ OrderManager forwards money to Escrow contract
3. ✅ Money **LOCKED** in escrow (safe custody)
4. ❌ **Nobody can touch it yet!**

---

### Money is Held Until...

The order must reach **COMPLETED** status. This happens when:
- Rider delivers the food
- **Customer confirms delivery**

---

### When Customer Confirms Delivery

**Escrow automatically distributes:**

| Recipient    | Percentage | Example (0.0001 ETH order) |
|--------------|------------|----------------------------|
| **Restaurant** | 80%        | 0.00008 ETH               |
| **Rider**      | 10%        | 0.00001 ETH               |
| **Platform**   | 10%        | 0.00001 ETH               |

**This happens in ONE transaction when customer clicks "Confirm Delivery"**

---

### Where Does Your Money Go?

**Restaurant's ETH goes to:**  
→ Your wallet address (the one that registered the restaurant)

**You can see it in MetaMask:**
1. Open MetaMask
2. Check your balance
3. You'll see it increased by your share!

---

## 🏍️ Rider Assignment - Two Methods

### Method 1: Restaurant Assigns (Current System)

**Steps:**
1. Restaurant marks order as "Prepared"
2. Restaurant clicks "Assign Rider"
3. System checks available riders
4. First available rider is automatically assigned
5. Rider receives notification

**Pros:**
- Fast assignment
- Restaurant has control

**Cons:**
- Rider might not want that specific order
- No choice for rider

---

### Method 2: Rider Self-Accepts (What Riders Prefer)

**Steps:**
1. Restaurant marks order as "Prepared"
2. Order appears in ALL riders' "Available Orders" list
3. Any rider can click "Accept Delivery"
4. First rider to accept gets the order
5. Order disappears from other riders' lists

**Pros:**
- Riders choose orders they want
- Competition = faster pickup
- More flexible

**Cons:**
- Might take longer if no riders nearby
- Restaurant has less control

---

### How It Currently Works in Your System

**Your system uses BOTH methods:**

1. **If restaurant doesn't assign:**
   - Order stays in "Prepared" status
   - Riders can see it in "Available Orders"
   - Any rider can accept it

2. **If restaurant clicks "Assign Rider":**
   - System auto-assigns first available rider
   - Other riders can't see it anymore

**Recommendation:** Let riders self-accept! It's faster and more efficient.

---

## 👀 What You Can See in Order Details

When you click on an order, you'll see:

### Customer Information
- ✅ Customer wallet address
- ✅ Delivery address
- ✅ Phone number
- ✅ Special instructions

### Order Items
- ✅ All food items ordered
- ✅ Quantities
- ✅ Prices

### Payment Breakdown
```
Order Total:      0.0001 ETH
├─ Restaurant:    0.00008 ETH (80%)
├─ Rider:         0.00001 ETH (10%)
└─ Platform:      0.00001 ETH (10%)
```

### Timeline
- ✅ When order was placed
- ✅ When you accepted it
- ✅ When food was prepared
- ✅ When rider picked up
- ✅ When delivered
- ✅ When payment released

---

## 🔍 Tracking Order Status

### For Restaurant (You)
- Go to "Restaurant Dashboard"
- See all your orders
- Click any order to see full details
- Status updates in real-time

### For Customer
- Go to "My Orders"
- Click any order
- See live tracking
- Confirm delivery when received

### For Rider
- Go to "Rider Dashboard"
- See "Available Orders" (status = Prepared)
- See "My Active Deliveries" (status = PickedUp)
- Update status as you deliver

---

## 🚨 Common Issues & Solutions

### Issue 1: "Money not in my wallet after order complete"

**Check:**
1. Is order status "Completed"? (green checkmark)
2. Did customer confirm delivery?
3. Check MetaMask - transaction might be pending
4. Look at transaction on Etherscan

**Money goes to:** The wallet address you used to register the restaurant

---

### Issue 2: "Can't assign rider - No riders available"

**Reasons:**
- No riders have registered yet
- All riders are busy (already on deliveries)
- Riders are offline (marked as unavailable)

**Solutions:**
- Wait for riders to come online
- Let riders self-accept the order
- Have someone register as a rider

---

### Issue 3: "Order stuck in 'Prepared' status"

**This is NORMAL!** It means:
- ✅ Food is ready
- ⏳ Waiting for rider to accept

**What to do:**
- Option 1: Wait for rider to self-accept
- Option 2: Click "Assign Rider" to auto-assign
- Option 3: Contact a rider directly

---

### Issue 4: "Customer won't confirm delivery"

**The Problem:**
- Payment is locked in escrow
- Customer must click "Confirm Delivery"
- If they don't, money stays locked

**Solutions:**
1. Contact customer directly (you have their phone)
2. Wait 24-48 hours
3. If still not confirmed, raise a dispute
4. Admin can resolve and release payment

---

## 📞 Real-World Example

Let's walk through a complete order:

### 1. Customer (Ali) Orders Pizza
```
Ali pays: 0.0001 ETH ($0.30)
Money locked in Escrow ✅
```

### 2. You (Restaurant) See New Order
```
ORDER #15
From: Ali (0x1234...5678)
Address: 123 Main St, Apartment 4B
Phone: +92-300-1234567
Items: 1x Margherita Pizza

[Accept Order] button
```

**You click "Accept Order"** ✅

### 3. You Prepare the Pizza
```
30 minutes later...
Pizza is ready!

[Mark as Prepared] button
```

**You click "Mark as Prepared"** ✅

### 4. Rider (Hassan) Sees Available Order
```
On Hassan's Rider Dashboard:

AVAILABLE ORDERS
┌──────────────────────┐
│ Order #15            │
│ Restaurant: Your Name│
│ Delivery: 2.5 km     │
│ Pay: 0.00001 ETH     │
│                      │
│ [Accept Delivery]    │
└──────────────────────┘
```

**Hassan clicks "Accept Delivery"** ✅

### 5. Hassan Arrives at Your Restaurant
```
Hassan shows Order #15 on his phone
You give him the pizza

Hassan clicks [Mark Picked Up] ✅
```

### 6. Hassan Delivers to Ali
```
Hassan delivers pizza to:
123 Main St, Apartment 4B

Hassan clicks [Mark Delivered] ✅
```

### 7. Ali Confirms Receipt
```
Ali checks his order:
"Did you receive your pizza?"

Ali clicks [Confirm Delivery] ✅
Ali rates: ⭐⭐⭐⭐⭐ (5 stars)
```

### 8. Payment Released! 💰
```
Escrow distributes:
→ You (Restaurant):  0.00008 ETH ✅
→ Hassan (Rider):    0.00001 ETH ✅
→ Platform:          0.00001 ETH ✅

Total distributed: 0.0001 ETH
```

**Check your MetaMask - money is there!** 🎉

---

## 🎯 Quick Reference

| Status | Who Acts | Action Required |
|--------|----------|----------------|
| **Created** | Restaurant | Click "Accept Order" |
| **Accepted** | Restaurant | Prepare food, click "Mark Prepared" |
| **Prepared** | Restaurant OR Rider | Assign rider OR wait for rider to accept |
| **PickedUp** | Rider | Deliver food, click "Mark Delivered" |
| **Delivered** | Customer | Click "Confirm Delivery" |
| **Completed** | Nobody | Automatic - Payment distributed |

---

## 💡 Pro Tips for Restaurants

1. **Accept orders quickly** - Customers are waiting!
2. **Mark as prepared ASAP** - Gets riders' attention faster
3. **Keep phone handy** - Riders might call for directions
4. **Rate riders fairly** - Helps build good delivery network
5. **Check order details** - Special instructions matter!

---

## ✅ Summary

**Key Points:**

✅ Money is **safe in Escrow** until delivery confirmed  
✅ You get **80% of order value**  
✅ Payment **automatic** when customer confirms  
✅ Status "Prepared" = **Riders can see it**  
✅ You can **assign rider** OR let them **self-accept**  
✅ Check **full order details** by clicking on order  
✅ Money goes to **your restaurant wallet**  

---

**Questions?** Check your order details page - it shows everything including payment breakdown and timeline!

**Last Updated:** November 16, 2025  
**Status:** Fully Operational ✅

