# Complete Workflow Integration - Backend Documentation

## Overview

This document describes the complete integrated workflow connecting the Table Module, Order Module, Kitchen Module, and Billing Module. The workflow manages the entire guest lifecycle from reservation/walk-in through check-out and cleaning.

## Workflow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       GUEST LIFECYCLE                            │
└─────────────────────────────────────────────────────────────────┘

1. RESERVATION/WALK-IN BOOKING
   ├─ Create Reservation (if reserved)
   │  └─ Table Status: "reserved"
   └─ Create Walk-in Booking (if walk-in)
      └─ Table Status: "walk-in-blocked" (15 min timeout)

2. GUEST ARRIVAL
   ├─ Guest arrives (within 15 min for walk-in)
   └─ Table Status: "occupied"

3. WAITER ASSIGNMENT
   ├─ Admin assigns waiter to table
   └─ Table now ready for order taking

4. ORDER CREATION & ACCEPTANCE
   ├─ Waiter creates order
   ├─ Order sent to kitchen
   └─ Table Status: "order_accepted"

5. KITCHEN PREPARATION
   ├─ Chef takes order
   ├─ Table Status: "eating"
   ├─ Order Status: "preparing"
   └─ Estimated time shown

6. ORDER READY
   ├─ Chef marks order as ready
   ├─ Table Status: "served"
   └─ Order Status: "ready"

7. BILLING & PAYMENT
   ├─ Bill generated
   ├─ Payment processed
   └─ Table Status: "checked_out"

8. CLEANING
   ├─ Table Status: "cleaning" (5 min)
   └─ Auto-transition to "available" or "reserved"
```

---

## Table Statuses

| Status | Description | Next Action |
|--------|-------------|------------|
| `available` | Table is empty and ready for guests | Seat guests or create reservation |
| `reserved` | Table is reserved for a guest | Wait for guest arrival |
| `walk-in-blocked` | Walk-in booking received, awaiting guest (15 min timeout) | Guest must arrive within 15 min |
| `occupied` | Guest is seated | Assign waiter |
| `order_accepted` | Order accepted and sent to kitchen | Kitchen prepares |
| `eating` | Food being prepared | Wait for order ready |
| `served` | Food is ready and served | Generate bill |
| `checked_out` | Payment completed | Start cleaning (5 min) |
| `cleaning` | Table being cleaned (5 min timeout) | Auto-transition to available/reserved |

---

## API Endpoints

All workflow endpoints are prefixed with `/api/workflow`

### 1. Walk-in Booking
**Create a walk-in booking for a specific time slot**

```
POST /api/workflow/walk-in-booking/{table_id}

Request Body:
{
    "guestCount": 4,
    "customerName": "John Doe"
}

Response:
{
    "success": true,
    "message": "Table blocked for 15 minutes (until HH:MM:SS). Guest must arrive to proceed.",
    "status": "walk-in-blocked",
    "blockingTimeout": "2026-02-21T14:30:00Z",
    "nextStep": "wait_for_guest_arrival"
}

Details:
- Table is blocked for exactly 15 minutes
- If guest doesn't arrive within 15 minutes, table automatically returns to "available"
- Background task handles auto-release
```

### 2. Guest Arrival
**Guest has arrived - transition from reserved/walk-in-blocked to occupied**

```
POST /api/workflow/guest-arrived/{table_id}

Request Body: {} (empty)

Response:
{
    "success": true,
    "message": "Guest arrived. Ready for waiter assignment.",
    "status": "occupied",
    "nextStep": "assign_waiter"
}

Details:
- Called when guest physically arrives at the restaurant
- Works for both reserved and walk-in guests
- Clears any blocking timeout
- Next step: Assign a waiter to the table
```

### 3. Waiter Assignment
**Assign a waiter to the table**

```
POST /api/workflow/waiter-assigned/{table_id}

Request Body:
{
    "waiterId": "waiter_123",
    "waiterName": "Rahul Sharma"
}

Response:
{
    "success": true,
    "message": "Waiter Rahul Sharma assigned. Ready to take order.",
    "status": "occupied",
    "nextStep": "take_order"
}

Details:
- Waiter is now assigned and ready to take order
- Waiter name is stored for reference
- Next step: Waiter creates the order
```

### 4. Order Created
**Order is created by waiter - link order to table**

```
POST /api/workflow/order-created/{table_id}

Request Body:
{
    "orderId": "order_123",
    "orderNumber": "#ORD-1001"
}

Response:
{
    "success": true,
    "message": "Order created and linked to table",
    "status": "occupied",
    "nextStep": "order_acceptance"
}

Details:
- Order is linked to table and stored in table.orders array
- Order becomes "current order" for the table
- Next step: Order is accepted by system/kitchen
```

### 5. Order Accepted
**Order is confirmed and sent to kitchen**

```
POST /api/workflow/order-accepted/{table_id}

Request Body:
{
    "orderId": "order_123"
}

Response:
{
    "success": true,
    "message": "Order accepted and sent to kitchen",
    "status": "order_accepted",
    "kitchenStatus": "new_order",
    "nextStep": "kitchen_prepares"
}

Details:
- Table status changes to "order_accepted"
- Order status changes to "accepted"
- Order is visible in Kitchen Display System (KDS)
- Next step: Chef takes order and starts preparing
```

### 6. Order Preparing
**Chef has taken the order and started preparing**

```
POST /api/workflow/order-preparing/{table_id}

Request Body:
{
    "orderId": "order_123",
    "chefId": "chef_456",
    "estimatedTimeMinutes": 20
}

Response:
{
    "success": true,
    "message": "Chef started preparing order",
    "status": "eating",
    "kitchenStatus": "preparing",
    "estimatedReadyTime": "2026-02-21T14:35:00Z",
    "nextStep": "order_ready"
}

Details:
- Table status changes to "eating"
- Order status changes to "preparing"
- Estimated ready time is calculated and stored
- Guests are informed about estimated wait time
- Next step: Order is ready for serving
```

### 7. Order Ready
**Chef finished preparing - order is ready to serve**

```
POST /api/workflow/order-ready/{table_id}

Request Body:
{
    "orderId": "order_123"
}

Response:
{
    "success": true,
    "message": "Order ready and served",
    "status": "served",
    "kitchenStatus": "ready",
    "nextStep": "bill_generation"
}

Details:
- Table status changes to "served"
- Order status changes to "ready"
- Table is marked as ready for billing
- Order is removed from KDS queue
- Next step: Generate bill for payment
```

### 8. Bill Generated
**Bill is created for the order**

```
POST /api/workflow/bill-generated/{table_id}

Request Body:
{
    "orderId": "order_123",
    "billId": "bill_789",
    "totalAmount": 500.00,
    "billDetails": {
        "items": [...],
        "tax": 45.00,
        "discount": 0,
        "total": 500.00
    }
}

Response:
{
    "success": true,
    "message": "Bill generated",
    "status": "served",
    "nextStep": "payment_processing"
}

Details:
- Bill is stored on table record
- Bill details are recorded in billing module
- Waiter presents bill to guest
- Next step: Process payment
```

### 9. Payment Completed
**Payment is processed - immediately starts cleaning phase**

```
POST /api/workflow/payment-completed/{table_id}

Request Body:
{
    "billId": "bill_789",
    "paymentId": "payment_001",
    "amount": 500.00,
    "paymentMethod": "cash",
    "originalStatus": "available"
}

Response:
{
    "success": true,
    "message": "Payment completed. Table now cleaning (ready in 5 minutes)",
    "status": "cleaning",
    "cleaningEndTime": "2026-02-21T14:45:00Z",
    "nextStatus": "available",
    "nextStep": "cleaning"
}

Details:
- Table immediately transitions to "checked_out" status
- Then transitions to "cleaning" status
- Cleaning staff is notified to clean the table
- 5-minute timer starts automatically
- After 5 minutes:
  - All guest data is cleared
  - All order data is cleared
  - Table returns to "available" or original reserved status
- Next step: Table is ready for next guests

Background Task:
- auto_complete_cleaning() runs after 5 minutes
- Automatically transitions table back to available/reserved
- All temporary data is cleared
- Table is ready for new guests
```

---

## Automatic Timers & Background Tasks

### Walk-in 15-Minute Timeout

When a walk-in booking is created:
1. Table status → "walk-in-blocked"
2. 15-minute timer starts
3. If guest arrives before timeout expires → call `POST /api/workflow/guest-arrived/{table_id}`
4. If guest DOESN'T arrive within 15 minutes:
   - Automatic background task `auto_release_walk_in_table()` executes
   - Table status → "available"
   - All walk-in data is cleared
   - Table is available for new bookings

### Cleaning 5-Minute Duration

When payment is completed:
1. Table status → "checked_out" → "cleaning"
2. 5-minute timer starts
3. Cleaning staff cleans the table
4. After 5 minutes:
   - Automatic background task `auto_complete_cleaning()` executes
   - Table returns to original status (usually "available")
   - All guest data is cleared
   - All order data is cleared
   - Table is ready for next guests

---

## Database Schema Updates

### Table Document Fields

```javascript
{
    "_id": ObjectId,
    "name": string,
    "displayNumber": string,
    "capacity": number,
    "location": string,
    "segment": string,
    "status": string,  // available, reserved, walk-in-blocked, occupied, order_accepted, eating, served, checked_out, cleaning
    
    // Guest Information
    "currentGuests": number,
    "customerName": string,
    "guestCount": number,
    
    // Reservation Information
    "reservationType": string,  // "reserved" or "walk-in"
    "reservationStatus": string,  // "confirmed", "arrived", "completed", "cancelled", "no-show", "expired", "waiting_for_arrival"
    
    // Waiter Information
    "waiterId": string,
    "waiterName": string,
    "waiterAssignedAt": ISO8601,
    
    // Order Information
    "orders": [ObjectId],  // Array of order IDs
    "currentOrderId": ObjectId,
    "orderCreatedAt": ISO8601,
    "orderAcceptedAt": ISO8601,
    
    // Kitchen Information
    "kitchenStatus": string,  // "new_order", "preparing", "ready"
    "chefId": string,
    "preparationStartedAt": ISO8601,
    "estimatedReadyTime": ISO8601,
    "orderReadyAt": ISO8601,
    
    // Billing Information
    "billGenerated": boolean,
    "billId": string,
    "billAmount": number,
    "paymentId": string,
    "paymentMethod": string,
    "paymentCompletedAt": ISO8601,
    
    // Timing Information
    "occupiedAt": ISO8601,
    "arrivalTime": ISO8601,
    
    // Walk-in Blocking
    "blockingStartTime": ISO8601,
    "blockingTimeout": ISO8601,  // Auto-release time (15 min)
    
    // Cleaning Information
    "cleaningStartedAt": ISO8601,
    "cleaningEndTime": ISO8601,  // Auto-completion time (5 min)
    "originalStatus": string,  // Status to return to after cleaning
    
    // Timestamps
    "createdAt": ISO8601,
    "updatedAt": ISO8601
}
```

---

## Workflow Examples

### Example 1: Reserved Guest Arrival

```
1. Create reservation
   POST /api/tables/reservations
   Table status: "reserved"

2. Guest arrives
   POST /api/workflow/guest-arrived/{table_id}
   Table status: "occupied"

3. Assign waiter
   POST /api/workflow/waiter-assigned/{table_id}
   Table status: "occupied"

4. Waiter creates order
   POST /api/workflow/order-created/{table_id}
   Table status: "occupied"

5. Order accepted
   POST /api/workflow/order-accepted/{table_id}
   Table status: "order_accepted"

6. Chef starts preparing
   POST /api/workflow/order-preparing/{table_id}
   Table status: "eating"

7. Order ready
   POST /api/workflow/order-ready/{table_id}
   Table status: "served"

8. Bill generated
   POST /api/workflow/bill-generated/{table_id}
   Table status: "served"

9. Payment completed
   POST /api/workflow/payment-completed/{table_id}
   Table status: "checked_out" → "cleaning"
   [5 min timer]
   Table status: "available" (auto)
```

### Example 2: Walk-in Guest Arrival

```
1. Create walk-in booking
   POST /api/workflow/walk-in-booking/{table_id}
   Table status: "walk-in-blocked"
   [15 min timer]

2a. Guest arrives within 15 min:
   POST /api/workflow/guest-arrived/{table_id}
   Table status: "occupied"
   [Continue with steps 3-9 like reserved guest]

2b. Guest doesn't arrive within 15 min:
   [Auto timer expires]
   Table status: "available" (auto)
   [Table is available for new bookings]
```

---

## Frontend Integration

### Key API Calls for Frontend

1. **Create Walk-in Booking**
   ```typescript
   await fetch('/api/workflow/walk-in-booking/{tableId}', {
       method: 'POST',
       body: JSON.stringify({
           guestCount: 4,
           customerName: 'John Doe'
       })
   });
   ```

2. **Handle Guest Arrival**
   ```typescript
   await fetch('/api/workflow/guest-arrived/{tableId}', {
       method: 'POST'
   });
   ```

3. **Create Order via Waiter**
   ```typescript
   await fetch('/api/workflow/order-created/{tableId}', {
       method: 'POST',
       body: JSON.stringify({
           orderId: orderId,
           orderNumber: '#ORD-1001'
       })
   });
   ```

4. **Accept Order**
   ```typescript
   await fetch('/api/workflow/order-accepted/{tableId}', {
       method: 'POST',
       body: JSON.stringify({
           orderId: orderId
       })
   });
   ```

5. **Complete Payment**
   ```typescript
   await fetch('/api/workflow/payment-completed/{tableId}', {
       method: 'POST',
       body: JSON.stringify({
           billId: billId,
           paymentId: paymentId,
           amount: 500,
           paymentMethod: 'cash',
           originalStatus: 'available'
       })
   });
   ```

---

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Table not found" (404) | Invalid table ID | Check table ID exists in database |
| "Table must be occupied" (400) | Wrong table status | Ensure guest arrived before assigning waiter |
| "Waiter can only be assigned to occupied tables" (400) | Table not occupied | Call `guest-arrived` endpoint first |
| "Invalid status" (400) | Invalid status value | Use valid status from status list |
| "Guest count exceeds capacity" (400) | Too many guests | Check table capacity |

---

## Audit Trail

All workflow actions are logged in the audit collection with:
- Action type (e.g., "guest_arrived", "order_accepted")
- Module (e.g., "table")
- Record ID
- Details (relevant data)
- Timestamp
- User ID (if available)

---

## Summary

This integrated workflow ensures:
✅ Complete tracking of guest lifecycle
✅ Proper order flow from creation to completion
✅ Kitchen visibility of pending orders
✅ Automatic table status transitions
✅ Precise timing for reservations and cleaning
✅ Comprehensive audit trail
✅ Seamless integration between modules
