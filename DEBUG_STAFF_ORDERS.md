# Debug: Customer Orders Not Showing in Staff Dashboard

## Quick Diagnosis Steps

### Step 1: Check if Orders Are Being Created

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Place a test order:**
   - Go to: http://localhost:3000/menu
   - Add items to cart
   - Checkout with email: `test@example.com`
   - Complete order
   - ✅ Verify you see confirmation page

3. **Check terminal logs:**
   Look for:
   ```
   INFO: createOrder: success
     orderId: xxx
     totalOrdersInMemory: 1
     orderStatus: PENDING
   
   INFO: createOrder: current orders in memory
     orderCount: 1
     orderIds: [{ id: "xxx", status: "PENDING", customer: "Test Customer" }]
   ```

   **If you see this:** Orders ARE being created ✅
   **If you don't see this:** Orders NOT being created ❌

### Step 2: Use Debug API Endpoint

**Open in browser:**
```
http://localhost:3000/api/debug-orders
```

You should see JSON like:
```json
{
  "timestamp": "2026-06-11T...",
  "ordersCount": 1,
  "orders": [
    {
      "id": "abc12345",
      "customer": "Test Customer",
      "email": "test@example.com",
      "status": "PENDING",
      "total": 28.97,
      "createdAt": "2026-06-11T...",
      "itemCount": 2
    }
  ],
  "orderItemsCount": 2
}
```

**What this tells you:**
- `ordersCount` should be > 0 if orders exist
- `orders` array shows all orders in memory
- `itemCount` shows if order items are linked correctly

**If ordersCount is 0:** Orders are being lost/reset ❌
**If ordersCount matches orders placed:** Orders are in memory ✅

### Step 3: Login as Staff and Check Dashboard

1. **Login:**
   - Go to: http://localhost:3000/login
   - Username: `staff`
   - Password: `staff123`

2. **Check terminal logs:**
   Look for:
   ```
   INFO: getOrders: fetching orders
     totalOrdersInMemory: 1
     orderIds: [{ id: "xxx", status: "PENDING", customer: "Test Customer" }]
   
   INFO: getOrders: returning orders
     count: 1
   ```

3. **Check staff dashboard:**
   - Should show order in Pending column
   - Should show summary with 1 pending order

**If logs show orders but UI doesn't:**
- Problem is in frontend rendering
- Check browser console (F12) for errors

**If logs show 0 orders:**
- Orders were lost between creating and fetching
- Likely server restart or memory issue

---

## Common Issues and Fixes

### Issue 1: Orders Reset After Each Action

**Symptom:**
- You place an order
- `debug-orders` shows ordersCount: 1
- You refresh page
- `debug-orders` shows ordersCount: 0

**Cause:** Server is restarting between requests (Next.js hot reload)

**Fix:**
This is normal in development mode. Orders are stored in memory and will be lost on server restart.

**Workaround:**
- Don't edit code files while testing
- Place order and immediately check staff dashboard
- Keep server running without changes

---

### Issue 2: Different Memory Spaces

**Symptom:**
- Terminal shows "ordersCount: 1" when creating order
- Terminal shows "ordersCount: 0" when fetching orders
- Never see same number twice

**Cause:** Multiple server instances or memory isolation

**Fix:**
1. Stop dev server completely (Ctrl+C)
2. Clear Next.js cache:
   ```bash
   rmdir /s /q .next
   ```
3. Restart:
   ```bash
   npm run dev
   ```

---

### Issue 3: Email Field Breaking Order Creation

**Symptom:**
- Order creation fails silently
- No logs in terminal
- Orders never appear

**Fix:**
Check for TypeScript errors:
```bash
npm run typecheck
```

If errors, the issue is with the `email` field we added.

---

### Issue 4: Server Action Not Executing

**Symptom:**
- No logs when placing order
- Button clicks but nothing happens

**Fix:**
1. Check browser console for errors
2. Verify server is running
3. Check network tab for failed requests

---

## Complete Test Sequence

### Test 1: Verify Order Creation

```bash
# Terminal 1: Watch logs
npm run dev

# Browser 1: Place order
http://localhost:3000/menu
→ Add items → Checkout → Place Order

# Terminal 1: Look for
INFO: createOrder: success
INFO: createOrder: current orders in memory
  orderCount: 1

# Browser 2: Check debug endpoint
http://localhost:3000/api/debug-orders
→ Should show ordersCount: 1
```

**Expected:** orderCount shows in both terminal and debug endpoint
**Result:** 
- ✅ If both show 1: Orders being created correctly
- ❌ If terminal shows 1 but endpoint shows 0: Memory issue
- ❌ If neither show orders: Creation failing

---

### Test 2: Verify Staff Can See Orders

```bash
# DON'T restart server or edit files!

# Browser: Login as staff
http://localhost:3000/login
→ Username: staff
→ Password: staff123

# Terminal: Look for
INFO: getOrders: fetching orders
  totalOrdersInMemory: 1
INFO: getOrders: returning orders
  count: 1

# Browser: Staff dashboard should show
- Summary: Total Orders Today: 1
- Summary: Pending: 1
- Pending column: 1 order card visible
```

**Expected:** Staff sees the order
**Result:**
- ✅ Logs show orderCount: 1 AND UI shows order: Working!
- ❌ Logs show orderCount: 1 BUT UI empty: Frontend issue
- ❌ Logs show orderCount: 0: Orders lost

---

### Test 3: End-to-End Flow

```bash
# 1. Fresh start
npm run dev

# 2. Place order
Browser → Menu → Add items → Checkout → Confirm
Terminal → Should log: orderCount: 1

# 3. Check debug endpoint immediately
Browser → http://localhost:3000/api/debug-orders
Should show: ordersCount: 1

# 4. Login as staff immediately
Browser → Login as staff
Terminal → Should log: totalOrdersInMemory: 1

# 5. Staff dashboard
Browser → Should show order in Pending column
```

**If ANY step fails, note which one!**

---

## Debug Checklist

Use this to report issues:

### Order Creation
- [ ] Terminal shows "createOrder: success"
- [ ] Terminal shows "orderCount: 1" or more
- [ ] Debug endpoint shows ordersCount > 0
- [ ] Confirmation page shows order details

### Order Retrieval
- [ ] Terminal shows "getOrders: fetching orders"
- [ ] Terminal shows "totalOrdersInMemory: X" matches created
- [ ] Terminal shows "returning orders count: X"
- [ ] Debug endpoint shows same ordersCount

### Staff Dashboard
- [ ] Login successful
- [ ] No errors in browser console
- [ ] Summary panel loads
- [ ] Order cards appear in Pending column
- [ ] Order details correct (name, items, price)

### Browser Console
Open DevTools (F12) → Console tab:
- [ ] No red errors
- [ ] No "Failed to fetch" messages
- [ ] No "undefined" errors

---

## What to Report

If orders still not showing, provide:

1. **Terminal logs from order creation:**
   ```
   Copy/paste the INFO: createOrder logs here
   ```

2. **Debug endpoint output:**
   ```json
   Copy/paste from http://localhost:3000/api/debug-orders
   ```

3. **Terminal logs from staff dashboard:**
   ```
   Copy/paste the INFO: getOrders logs here
   ```

4. **Browser console errors:**
   ```
   Copy/paste any red errors from F12 console
   ```

5. **What you see:**
   - Does Pending column say "No orders" or is it empty?
   - Does summary show 0 or does it not load?
   - Any error messages on page?

---

## Quick Fix: Try This First

If orders not showing, try this complete reset:

```bash
# 1. Stop server (Ctrl+C)

# 2. Clear cache
rmdir /s /q .next

# 3. Restart
npm run dev

# 4. Place ONE test order
# 5. Immediately check debug endpoint
# 6. Immediately login as staff
# 7. Check if order visible
```

If this works → memory was stale
If this fails → deeper issue

---

## Expected Behavior

When working correctly:

```
1. Customer places order
   → Terminal: "orderCount: 1"
   → Endpoint: ordersCount: 1
   → Confirmation page shows

2. Staff logs in
   → Terminal: "totalOrdersInMemory: 1"
   → Terminal: "returning orders count: 1"
   → Dashboard shows 1 pending order

3. Order details match
   → Same customer name
   → Same items
   → Same total
   → Same email
```

**Use the debug endpoint and terminal logs to trace exactly where the orders disappear!**

---

## Debug API Endpoints

### Check Orders in Memory:
```
GET http://localhost:3000/api/debug-orders
```

Returns complete state of orders array.

**Use this to verify:**
- Orders exist after creation
- Orders persist when navigating
- Order data is complete and correct
- Order items are linked properly

---

**With these logs and debug endpoint, we can pinpoint exactly where orders are being lost!**
