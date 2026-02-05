# Deduction Feed - Quick Start Guide

## 🎯 What's New?

The **Deduction Feed tab** in the Inventory module now behaves like a **true live-streaming platform** with real-time stock deductions, beautiful animations, and live timestamps.

---

## 🚀 Getting Started

### Step 1: Open Inventory Management
1. Navigate to **Inventory Management** in the sidebar
2. Click on the **"Deduction Feed"** tab

### Step 2: Start Simulating Live Orders
1. Click the **"Simulate Live Orders"** button (top right)
2. The button will change to **"Stop Live Orders"**
3. Watch as deductions appear in real-time!

### Step 3: Monitor the Feed
- **New entries appear at the top** (prepending behavior)
- **Timestamps update every second** (real-time clock)
- **Feed auto-scrolls** to show newest entries
- **Stock levels decrease** as ingredients are deducted

---

## 📊 What You'll See

### Deduction Entry Example
```
✅ Margherita Pizza             hh:mm:ss (LIVE)
   ORD-1234
   🏷️ Cheese −0.1 kg
   🏷️ Tomato −0.15 kg
   🏷️ Olive Oil −0.02 L
```

### Each Entry Contains:
- ✅ **Green checkmark** - Successful deduction
- **Dish name** - What was ordered (bold white)
- **Order ID** - Unique identifier (ORD-XXXX)
- **Real-time timestamp** - When deducted (hh:mm:ss)
- **Ingredient pills** - What was deducted:
  - Ingredient name (slate color)
  - **Deducted quantity in RED** (−5, −0.2, etc.)
  - Unit (kg, L, pcs, etc.)

---

## 🎨 Visual Features

### Dark Gradient Background
- Professional slate gradient (950 → 900)
- Matches modern streaming platforms

### Live Indicator Badge
- **"LIVE STREAM"** badge at top right
- Animated pulse effect
- Shows when streaming is active

### System Logic Panel (Right Side)
- **Live Connection Status**: Shows KDS integration
- **Restrictions & Safety**: Predictive deduction DISABLED
- **Feed Behavior**: Explains how feed operates

---

## 🔄 Feed Behavior

### Entry Flow
```
Every 2.5-5 seconds (randomly):
  1. Select a random dish
  2. Generate unique Order ID
  3. Deduct ingredients from stock
  4. Create entry with live timestamp
  5. Prepend to top of feed
  6. Auto-scroll to newest entry
  7. Show toast notification
  8. Timestamp updates every second
```

### Stock Impact
- ✅ Stock levels **decrease in real-time**
- ✅ Check **Inventory Dashboard** tab to see changes
- ✅ Entries are **order-driven** (safe simulation)
- ✅ Won't deduct if stock is unavailable

---

## 💡 Tips & Tricks

### Monitor Stock Changes
1. Open Inventory Dashboard (first tab)
2. Keep Deduction Feed visible
3. Watch stock levels decrease as orders process
4. Notice how low-stock items turn yellow/red

### Understanding the Feed
- **#1, #2, #3** numbers show newest entries
- **Oldest entries scroll down** as new ones arrive
- **Up to 50 entries** kept in memory
- **Smooth animations** on entry and ingredient pills

### Timestamps
- Update **every second**
- Show **hh:mm:ss** format
- **Real-time** clock display
- Synchronized across all entries

### Toast Notifications
- **Blue info toast** appears for each order
- Shows Order ID and Dish name
- Dismisses after 3 seconds
- Multiple orders queue nicely

---

## 🛑 Stop Streaming

### To Stop Live Orders
1. Click **"Stop Live Orders"** button (top right)
2. Button changes back to **"Simulate Live Orders"**
3. No new entries will appear
4. Existing entries remain visible for review

### Clear the Feed
The feed automatically maintains 50 recent entries. Older entries are removed automatically to prevent memory overflow.

---

## 📈 Real-World Scenario

### Example: Restaurant During Lunch Rush

**Time: 12:15 PM - Lunch service active**

```
✅ Margherita Pizza          12:15:30 (NEW)
   ORD-9854
   🏷️ Cheese −0.1 kg
   🏷️ Tomato −0.15 kg

✅ Caesar Salad              12:15:18
   ORD-9853
   🏷️ Lettuce −0.2 kg
   🏷️ Dressing −0.05 L

✅ Chicken Biryani           12:15:05
   ORD-9852
   🏷️ Chicken −0.25 kg
   🏷️ Rice −0.3 kg
   🏷️ Spices −0.05 kg

... (older orders scroll down)
```

**Stock Dashboard shows:**
- Cheese: 4.8 kg → 4.7 kg → 4.6 kg (decreasing)
- Rice: 8.2 kg → 7.9 kg → 7.6 kg (decreasing)
- Status may change from "Healthy" to "Low"

---

## ✅ System Logic

### Live Connection Status
```
✅ Connected to Kitchen Display System (KDS)
   Deductions occur at "Order Confirmed" stage
```

This means:
- Deductions happen automatically when orders are confirmed
- No manual action needed
- Stock is always in sync with order fulfillment

### Restrictions & Safety
```
🔒 Predictive deduction based on reservations is DISABLED
```

This means:
- Only **confirmed orders** trigger deductions
- **No pre-deduction** for reservations
- **Safe operation** mode

### Feed Behavior
```
⚡ New deductions prepend to the top
🔄 Feed updates automatically without refresh
💫 Smooth animations on entry arrival
```

---

## 🔧 Advanced Features

### Auto-Scroll
- **Enabled by default**
- Feed scrolls to top when new entry arrives
- Can scroll manually without interruption
- Auto-scroll resumes when new entry arrives

### Staggered Animations
- Ingredient pills animate in **sequence**
- Each pill delays by 50ms for visual polish
- Smooth spring animation effect
- Professional appearance

### Real-Time Updates
- Timestamps update every **1 second**
- Completely separate from entry animation
- No lag or stuttering
- Seamless user experience

---

## 📱 Mobile Friendly

### On Mobile Devices
- ✅ Feed adapts to screen width
- ✅ Ingredient pills wrap naturally
- ✅ Timestamps remain visible
- ✅ Scrolling is smooth
- ✅ Touch-friendly interactions

---

## 🚨 Troubleshooting

### No entries appearing?
- ✅ Click **"Simulate Live Orders"** button
- ✅ Button should show **"Stop Live Orders"**
- ✅ Wait 2.5-5 seconds for first entry

### Timestamps not updating?
- ✅ Browser may need refresh (rare)
- ✅ Check browser console for errors
- ✅ Restart simulation

### Stock not changing?
- ✅ Open **Inventory Dashboard** tab
- ✅ Verify simulation is running
- ✅ Check if stock reaches zero (can't go negative)

### Feed jumping around?
- ✅ This is normal auto-scroll behavior
- ✅ Scroll manually if you want to pause
- ✅ Auto-scroll resumes on new entry

---

## 📚 Related Tabs

### Inventory Dashboard
- View all ingredient stock levels
- See status indicators (Healthy/Low/Critical/Out)
- Overall inventory health

### Purchase Records
- View all purchase history
- Track supplier transactions
- Audit trail for accountability

### Suppliers
- Manage supplier relationships
- View supplied items
- Enable/disable suppliers

---

## 🎓 Learning Path

1. **Start Here**: Deduction Feed (this page)
2. **Then Explore**: Inventory Dashboard
3. **Understand**: How stock decreases with orders
4. **Master**: Full inventory workflow

---

## 💬 Key Takeaways

✨ **Live Streaming Feed**: Real-time stock deductions  
✨ **Professional UI**: Modern dark gradient styling  
✨ **Real-Time Timestamps**: Updates every second  
✨ **Smart Simulation**: Realistic 2.5-5 second intervals  
✨ **Order-Driven**: Safe, validated deductions  
✨ **No Page Refresh**: Seamless continuous updates  
✨ **Beautiful Animations**: Spring-based motion effects  
✨ **Responsive Design**: Works on all devices  

---

## 🎉 Ready to Go!

Your Deduction Feed is now **live and ready to stream real-time stock deductions**!

**Click "Simulate Live Orders" and watch the magic happen!** ✨

---

*For detailed design specifications, see: DEDUCTION_FEED_DESIGN_SPECS.md*  
*For technical details, see: DEDUCTION_FEED_ENHANCEMENT.md*  
*For change summary, see: DEDUCTION_FEED_CHANGES.md*

**Last Updated:** February 5, 2026  
**Status:** ✅ Production Ready
