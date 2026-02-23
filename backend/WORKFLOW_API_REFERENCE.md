# Workflow API Quick Reference & Examples

## Base URL
```
http://localhost:8000/api/workflow
https://restaurant-management-system-24c2.onrender.com/api/workflow
```

---

## Complete Workflow Request/Response Examples

### 1. WALK-IN BOOKING (Blocking Table for 15 Minutes)

**cURL:**
```bash
curl -X POST http://localhost:8000/api/workflow/walk-in-booking/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "guestCount": 4,
    "customerName": "Rajesh Kumar"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "message": "Table blocked for 15 minutes (until 14:45:30). Guest must arrive to proceed.",
  "status": "walk-in-blocked",
  "blockingTimeout": "2026-02-21T14:45:30.123Z",
  "nextStep": "wait_for_guest_arrival"
}
```

**What Happens:**
- Table status: `available` → `walk-in-blocked`
- Background task: If guest doesn't arrive in 15 min → auto-release to `available`

---

### 2. GUEST ARRIVAL (Both Reserved & Walk-in)

**cURL:**
```bash
curl -X POST http://localhost:8000/api/workflow/guest-arrived/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Guest arrived. Ready for waiter assignment.",
  "status": "occupied",
  "nextStep": "assign_waiter"
}
```

**What Happens:**
- Table status: `reserved`/`walk-in-blocked` → `occupied`
- Clears any blocking timers
- Waiter can now be assigned

---

### 3. WAITER ASSIGNMENT

**cURL:**
```bash
curl -X POST http://localhost:8000/api/workflow/waiter-assigned/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "waiterId": "507f1f77bcf86cd799439012",
    "waiterName": "Rahul Sharma"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Waiter Rahul Sharma assigned. Ready to take order.",
  "status": "occupied",
  "nextStep": "take_order"
}
```

**What Happens:**
- Waiter info is stored on table
- Waiter can now create order from Order Management module

---

### 4. ORDER CREATED (Waiter Takes Order)

**cURL:**
```bash
curl -X POST http://localhost:8000/api/workflow/order-created/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "507f1f77bcf86cd799439013",
    "orderNumber": "#ORD-1001"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order created and linked to table",
  "status": "occupied",
  "nextStep": "order_acceptance"
}
```

**What Happens:**
- Order is linked to table
- Order appears in system for acceptance
- Next: System/Admin accepts the order

---

### 5. ORDER ACCEPTED (Sent to Kitchen)

**cURL:**
```bash
curl -X POST http://localhost:8000/api/workflow/order-accepted/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "507f1f77bcf86cd799439013"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order accepted and sent to kitchen",
  "status": "order_accepted",
  "kitchenStatus": "new_order",
  "nextStep": "kitchen_prepares"
}
```

**What Happens:**
- Table status: `occupied` → `order_accepted`
- Order status: `placed` → `accepted`
- Order appears in Kitchen Display System (KDS)
- Next: Chef takes the order

---

### 6. CHEF STARTS PREPARING

**cURL:**
```bash
curl -X POST http://localhost:8000/api/workflow/order-preparing/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "507f1f77bcf86cd799439013",
    "chefId": "507f1f77bcf86cd799439014",
    "estimatedTimeMinutes": 20
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Chef started preparing order",
  "status": "eating",
  "kitchenStatus": "preparing",
  "estimatedReadyTime": "2026-02-21T15:05:30.123Z",
  "nextStep": "order_ready"
}
```

**What Happens:**
- Table status: `order_accepted` → `eating`
- Order status: `accepted` → `preparing`
- Estimated ready time is calculated (now + 20 min)
- Guests can see wait time estimate
- Kitchen continues preparation

---

### 7. ORDER READY (Chef Marks as Ready)

**cURL:**
```bash
curl -X POST http://localhost:8000/api/workflow/order-ready/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "507f1f77bcf86cd799439013"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order ready and served",
  "status": "served",
  "kitchenStatus": "ready",
  "nextStep": "bill_generation"
}
```

**What Happens:**
- Table status: `eating` → `served`
- Order status: `preparing` → `ready`
- Order removed from KDS queue
- Waiter notified to serve food
- Next: Generate bill for payment

---

### 8. BILL GENERATED

**cURL:**
```bash
curl -X POST http://localhost:8000/api/workflow/bill-generated/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "507f1f77bcf86cd799439013",
    "billId": "507f1f77bcf86cd799439015",
    "totalAmount": 525.00,
    "billDetails": {
      "items": [
        {"name": "Butter Chicken", "qty": 2, "price": 350, "total": 700},
        {"name": "Naan", "qty": 4, "price": 50, "total": 200}
      ],
      "subtotal": 900,
      "tax": 81,
      "discount": 0,
      "total": 981
    }
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bill generated",
  "status": "served",
  "nextStep": "payment_processing"
}
```

**What Happens:**
- Bill is created in billing module
- Bill info is stored on table record
- Waiter presents bill to guest
- Guest reviews and proceeds to payment

---

### 9. PAYMENT COMPLETED (Automatic Cleaning Starts)

**cURL:**
```bash
curl -X POST http://localhost:8000/api/workflow/payment-completed/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "billId": "507f1f77bcf86cd799439015",
    "paymentId": "507f1f77bcf86cd799439016",
    "amount": 981.00,
    "paymentMethod": "card",
    "originalStatus": "available"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment completed. Table now cleaning (ready in 5 minutes)",
  "status": "cleaning",
  "cleaningEndTime": "2026-02-21T15:10:30.123Z",
  "nextStatus": "available",
  "nextStep": "cleaning"
}
```

**What Happens:**
- Table status: `served` → `checked_out` → `cleaning`
- Payment is recorded
- Cleaning staff is notified
- 5-minute cleaning timer starts **automatically**
- After 5 minutes:
  - Auto-transition to `available` (or original status)
  - All guest data cleared
  - All order data cleared
  - Table ready for new guests

---

## Status Transition Diagram

```
                              RESERVATION PATH
                              ────────────────
                                    │
                                   ▼
                    Create Reservation (status: reserved)
                                    │
                                   ▼
                    Guest Arrives → (status: occupied)
                                    │
                                   ▼
                    Assign Waiter ──┐
                                   │
                     WALK-IN PATH  │
                     ─────────────┘
                            │
                           ▼
                Block Table for 15 min (status: walk-in-blocked)
                            │
                ┌───────────┴────────────┐
                │                        │
               ▼                        ▼
        Guest Arrives            15 min Timeout
        (status: occupied)       (auto-release to available)
                │
                └─ Assign Waiter
                │
                ▼
        Order Created ──────────┐
                                │
                               ▼
                        Order Accepted (status: order_accepted)
                                │
                               ▼
                        Kitchen: Order Preparing (status: eating)
                                │
                               ▼
                        Order Ready (status: served)
                                │
                               ▼
                        Bill Generated (status: served)
                                │
                               ▼
                        Payment Processed (status: checked_out)
                                │
                               ▼
                        Table Cleaning (status: cleaning)
                                │
                        5 min Timeout (auto)
                                │
                               ▼
                        Back to Available/Reserved (status: available/reserved)
```

---

## Testing with Postman

### 1. Create Workspace
- New → Workspace → "Restaurant Workflow"

### 2. Create Collection
- Restaurant Workflow API

### 3. Create Requests

#### Request: Create Walk-in
```
Method: POST
URL: {{base_url}}/api/workflow/walk-in-booking/{{table_id}}
Headers:
  Content-Type: application/json
Body (raw):
{
  "guestCount": 4,
  "customerName": "Test Guest"
}
```

#### Request: Guest Arrival
```
Method: POST
URL: {{base_url}}/api/workflow/guest-arrived/{{table_id}}
Headers:
  Content-Type: application/json
Body: (empty)
```

### 4. Set Environment Variables
```
base_url: http://localhost:8000/api/workflow
table_id: [actual table ID from database]
```

---

## Testing with Python

```python
import requests
import json

BASE_URL = "http://localhost:8000/api/workflow"
TABLE_ID = "507f1f77bcf86cd799439011"

# 1. Create Walk-in Booking
response = requests.post(
    f"{BASE_URL}/walk-in-booking/{TABLE_ID}",
    json={
        "guestCount": 4,
        "customerName": "Rajesh Kumar"
    }
)
print("Walk-in Booking:", response.json())

# 2. Guest Arrives
response = requests.post(
    f"{BASE_URL}/guest-arrived/{TABLE_ID}",
    json={}
)
print("Guest Arrival:", response.json())

# 3. Assign Waiter
response = requests.post(
    f"{BASE_URL}/waiter-assigned/{TABLE_ID}",
    json={
        "waiterId": "507f1f77bcf86cd799439012",
        "waiterName": "Rahul Sharma"
    }
)
print("Waiter Assigned:", response.json())

# 4. Order Created
response = requests.post(
    f"{BASE_URL}/order-created/{TABLE_ID}",
    json={
        "orderId": "507f1f77bcf86cd799439013",
        "orderNumber": "#ORD-1001"
    }
)
print("Order Created:", response.json())

# 5. Order Accepted
response = requests.post(
    f"{BASE_URL}/order-accepted/{TABLE_ID}",
    json={
        "orderId": "507f1f77bcf86cd799439013"
    }
)
print("Order Accepted:", response.json())

# 6. Order Preparing
response = requests.post(
    f"{BASE_URL}/order-preparing/{TABLE_ID}",
    json={
        "orderId": "507f1f77bcf86cd799439013",
        "chefId": "507f1f77bcf86cd799439014",
        "estimatedTimeMinutes": 20
    }
)
print("Order Preparing:", response.json())

# 7. Order Ready
response = requests.post(
    f"{BASE_URL}/order-ready/{TABLE_ID}",
    json={
        "orderId": "507f1f77bcf86cd799439013"
    }
)
print("Order Ready:", response.json())

# 8. Bill Generated
response = requests.post(
    f"{BASE_URL}/bill-generated/{TABLE_ID}",
    json={
        "orderId": "507f1f77bcf86cd799439013",
        "billId": "507f1f77bcf86cd799439015",
        "totalAmount": 525.00,
        "billDetails": {}
    }
)
print("Bill Generated:", response.json())

# 9. Payment Completed
response = requests.post(
    f"{BASE_URL}/payment-completed/{TABLE_ID}",
    json={
        "billId": "507f1f77bcf86cd799439015",
        "paymentId": "507f1f77bcf86cd799439016",
        "amount": 525.00,
        "paymentMethod": "cash",
        "originalStatus": "available"
    }
)
print("Payment Completed:", response.json())
```

---

## Error Responses

### 400 Bad Request - Invalid Status
```json
{
  "detail": "Table must be occupied to assign waiter"
}
```

### 404 Not Found - Table Missing
```json
{
  "detail": "Table not found"
}
```

### 500 Server Error
```json
{
  "detail": "Failed to create order: [error message]"
}
```

---

## Key Points for Integration

1. **Order IDs**: Always get from the Orders module when creating
2. **Waiter IDs**: Get from Staff module with role="waiter"
3. **Payment Details**: Include all details from Billing module
4. **Timing**: Allow 5-10 seconds between requests for processing
5. **Error Handling**: Check status codes and error messages
6. **Audit Trail**: All actions are logged automatically
