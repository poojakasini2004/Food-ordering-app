# Debug Order Ready Email - Comprehensive Logging Added

## What Was Fixed

I've added extensive logging throughout the order ready email flow to help diagnose exactly where the issue is occurring.

## Changes Made

### 1. Enhanced Logging in `/app/staff/orders/actions.ts`

**Added logging at every critical point:**

1. **Before status update:**
   - Logs complete order details including email field
   - Shows whether email exists (`hasEmail: true/false`)
   - Shows actual email value or "UNDEFINED"

2. **When entering email trigger:**
   - Confirms the ACTIVE → COMPLETED transition was detected
   - Shows customer email and name
   - Verifies email exists before proceeding

3. **Email missing check:**
   - Explicit error if `order.email` is undefined or empty
   - Shows what order details ARE available

4. **Before calling email function:**
   - Logs the exact parameters being passed
   - Shows item count

5. **After email attempt:**
   - Success: Logs confirmation with email address
   - Failure: Logs complete error with details
   - Exception: Logs exception with stack trace

### 2. Enhanced Logging in `/lib/email.ts`

**Added environment variable checks:**

1. **EMAIL_FROM check:**
   - Returns error immediately if missing
   - Logs error for debugging

2. **EMAIL_APP_PASSWORD check:**
   - Returns error immediately if missing  
   - Logs error for debugging

3. **Starting email send:**
   - Logs all parameters being used
   - Shows email from address
   - Shows item count

4. **Before transporter.sendMail:**
   - Logs exact mail options
   - Shows to, from, subject

5. **Success:**
   - Confirms email sent successfully
   - Shows customer email and order ID

6. **Failure:**
   - Logs complete error details
   - Includes error message
   - Includes stack trace if available

## How to Debug

### Step 1: Place and Complete an Order

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Place order as customer:**
   - Go to http://localhost:3000/menu
   - Add items, checkout
   - **Use a real email address you can check**
   - Complete order

3. **Login as staff:**
   - Go to http://localhost:3000/login
   - Username: `staff`, Password: `staff123`

4. **Process order:**
   - Click "Order Picked" (PENDING → ACTIVE)
   - Click "Order Ready" (ACTIVE → COMPLETED)

### Step 2: Check Terminal Logs

Look for these log messages in your terminal:

#### Expected Log Sequence (Success):

```
INFO: updateOrderStatus: order details before update
  orderId: xxx
  customerEmail: customer@example.com
  hasEmail: true
  emailValue: customer@example.com
  previousStatus: ACTIVE
  newStatus: COMPLETED

INFO: updateOrderStatus: success
  orderId: xxx
  previousStatus: ACTIVE
  newStatus: COMPLETED

INFO: updateOrderStatus: Attempting to send order ready email
  orderId: xxx
  customerEmail: customer@example.com
  hasEmail: true

INFO: updateOrderStatus: Calling sendOrderReadyEmail with params
  orderId: xxx
  customerEmail: customer@example.com
  itemCount: 2

INFO: sendOrderReadyEmail: Starting email send
  customerEmail: customer@example.com
  orderId: xxx
  itemCount: 2
  emailFrom: manmeeth.bajwa@gmail.com

INFO: sendOrderReadyEmail: Sending email via transporter
  to: customer@example.com
  from: "SmartX Foods" <manmeeth.bajwa@gmail.com>
  subject: Your order is ready for pickup! 🎉

INFO: sendOrderReadyEmail: Email sent successfully
  customerEmail: customer@example.com
  orderId: xxx

INFO: updateOrderStatus: Order ready email sent successfully
  orderId: xxx
  customerEmail: customer@example.com
```

#### If Email Field is Missing:

```
INFO: updateOrderStatus: order details before update
  orderId: xxx
  customerEmail: undefined
  hasEmail: false
  emailValue: UNDEFINED  ← PROBLEM!
  previousStatus: ACTIVE
  newStatus: COMPLETED

ERROR: updateOrderStatus: Cannot send email - customer email is missing
  orderId: xxx
  orderDetails: { customerName: "...", phone: "..." }
```

**Fix:** The order was created without an email. Check checkout form is capturing email correctly.

#### If Environment Variables are Missing:

```
ERROR: sendOrderReadyEmail: EMAIL_FROM environment variable is missing
```
OR
```
ERROR: sendOrderReadyEmail: EMAIL_APP_PASSWORD environment variable is missing
```

**Fix:** Check `.env.local` file has:
```
EMAIL_FROM=manmeeth.bajwa@gmail.com
EMAIL_APP_PASSWORD=iwef vmwr yjer qymg
```

#### If SMTP Connection Fails:

```
ERROR: sendOrderReadyEmail: Failed to send email
  error: Invalid login: 535-5.7.8 Username and Password not accepted
  errorMessage: Invalid login...
  customerEmail: customer@example.com
```

**Fix:** App password is incorrect or expired. Generate new Gmail app password.

#### If Trigger Not Reached:

If you see:
```
INFO: updateOrderStatus: success
  previousStatus: ACTIVE
  newStatus: COMPLETED
```

But you DON'T see:
```
INFO: updateOrderStatus: Attempting to send order ready email
```

**Problem:** The trigger condition is not being met. Check that:
- Previous status was exactly "ACTIVE"
- New status is exactly "COMPLETED"

## Verification Checklist

After clicking "Order Ready", verify each step:

### ✅ Step 1: Status Update Triggered
```
INFO: updateOrderStatus: order details before update
INFO: updateOrderStatus: success
```
If missing → Status update function not being called at all

### ✅ Step 2: Email Field Exists
```
hasEmail: true
emailValue: customer@example.com  (not UNDEFINED)
```
If false → Order doesn't have email, check checkout action

### ✅ Step 3: Email Trigger Reached
```
INFO: updateOrderStatus: Attempting to send order ready email
```
If missing → Condition `previousStatus === "ACTIVE" && newStatus === "COMPLETED"` not met

### ✅ Step 4: Email Function Called
```
INFO: updateOrderStatus: Calling sendOrderReadyEmail with params
INFO: sendOrderReadyEmail: Starting email send
```
If missing → Exception occurred before function call

### ✅ Step 5: Environment Variables Valid
```
emailFrom: manmeeth.bajwa@gmail.com
```
If missing → Environment variables not loaded

### ✅ Step 6: Email Send Attempted
```
INFO: sendOrderReadyEmail: Sending email via transporter
```
If missing → Transporter creation failed

### ✅ Step 7: Email Sent Successfully
```
INFO: sendOrderReadyEmail: Email sent successfully
INFO: updateOrderStatus: Order ready email sent successfully
```
If missing → SMTP send failed, check error message

## Common Issues and Solutions

### Issue 1: No Logs at All
**Symptom:** Terminal shows nothing when clicking "Order Ready"

**Diagnosis:**
- Check terminal is showing dev server output
- Try refreshing page and clicking again
- Check browser console for client errors

**Solution:**
- Verify `npm run dev` is running
- Check for JavaScript errors in browser console

---

### Issue 2: Email Field is Undefined
**Symptom:** 
```
hasEmail: false
emailValue: UNDEFINED
ERROR: Cannot send email - customer email is missing
```

**Diagnosis:** Order was created without email field

**Solution:**
1. Check `/app/checkout/actions.ts` includes:
   ```typescript
   email: email.trim(),
   ```
2. Verify checkout form has email input
3. Place new test order with email
4. Check that order in database has email field

---

### Issue 3: Environment Variables Missing
**Symptom:**
```
ERROR: EMAIL_FROM environment variable is missing
```

**Diagnosis:** `.env.local` not loaded or missing

**Solution:**
1. Check file exists: `c:\Users\harja\Desktop\Food ordering app\.env.local`
2. Verify contents:
   ```
   EMAIL_FROM=manmeeth.bajwa@gmail.com
   EMAIL_APP_PASSWORD=iwef vmwr yjer qymg
   ```
3. **Restart dev server** (environment variables load at startup)
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

---

### Issue 4: SMTP Authentication Failed
**Symptom:**
```
ERROR: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Diagnosis:** Gmail credentials invalid

**Solution:**
1. Verify email: `manmeeth.bajwa@gmail.com`
2. Verify app password: `iwef vmwr yjer qymg` (remove spaces)
3. If expired, generate new app password:
   - Go to Google Account → Security
   - 2-Step Verification → App passwords
   - Generate new password for "Mail"
   - Update `.env.local`
   - Restart server

---

### Issue 5: Email Trigger Not Reached
**Symptom:**
```
INFO: updateOrderStatus: success
(No "Attempting to send order ready email" log)
```

**Diagnosis:** Condition not met

**Solution:**
1. Verify order was in ACTIVE status before clicking
2. Verify "Order Ready" button (not "Order Picked")
3. Check logs show:
   ```
   previousStatus: ACTIVE
   newStatus: COMPLETED
   ```
4. Both must match exactly for trigger

---

### Issue 6: Network/Connection Error
**Symptom:**
```
ERROR: ETIMEDOUT
ERROR: ECONNREFUSED
```

**Diagnosis:** Cannot reach Gmail SMTP server

**Solution:**
1. Check internet connection
2. Check firewall isn't blocking port 587/465
3. Try again in a few minutes
4. Check Gmail service status

---

## Testing Procedure

### Test 1: Verify Email Field Saved

1. Place order with email: `test@example.com`
2. Check terminal logs for:
   ```
   INFO: createOrder: success
   ```
3. Then in staff dashboard, click "Order Ready"
4. Look for:
   ```
   customerEmail: test@example.com
   hasEmail: true
   ```

**Expected:** Email shown in logs
**If not:** Email not being saved with order

---

### Test 2: Verify Email Function Called

1. Place order
2. Move to Completed
3. Look for log sequence:
   ```
   INFO: Attempting to send order ready email
   INFO: Calling sendOrderReadyEmail
   INFO: Starting email send
   ```

**Expected:** All three logs appear
**If not:** Function not being called

---

### Test 3: Verify Environment Variables

1. Stop server
2. Check `.env.local` file exists and has correct values
3. Restart server
4. Look for log at startup (if any env loading messages)
5. Try order flow again

**Expected:** No "environment variable missing" errors
**If not:** Env file not loaded or missing

---

### Test 4: Verify SMTP Send

1. Complete order
2. Look for:
   ```
   INFO: Sending email via transporter
   INFO: Email sent successfully
   ```

**Expected:** Success message
**If not:** SMTP error should be logged with details

---

## Quick Debug Commands

### Check if .env.local exists:
```bash
dir "c:\Users\harja\Desktop\Food ordering app\.env.local"
```

### View .env.local contents:
```bash
type "c:\Users\harja\Desktop\Food ordering app\.env.local"
```

### Check dev server is running:
Look for: `Ready started server on 0.0.0.0:3000`

### Restart dev server:
```bash
# Press Ctrl+C to stop
npm run dev
```

---

## Success Indicators

When everything is working, you should see this exact log flow:

```
1. INFO: updateOrderStatus: order details before update
   ✅ hasEmail: true
   ✅ emailValue: customer@example.com

2. INFO: updateOrderStatus: Attempting to send order ready email
   ✅ Trigger reached

3. INFO: sendOrderReadyEmail: Starting email send
   ✅ Email function called
   ✅ emailFrom: manmeeth.bajwa@gmail.com

4. INFO: sendOrderReadyEmail: Sending email via transporter
   ✅ SMTP send attempted

5. INFO: sendOrderReadyEmail: Email sent successfully
   ✅ Email delivered

6. INFO: updateOrderStatus: Order ready email sent successfully
   ✅ Complete success
```

Plus:
- ✅ Customer receives email in inbox
- ✅ Subject: "Your order is ready for pickup! 🎉"
- ✅ Email contains correct order details

---

## What to Report

If still not working after checking logs, report:

1. **Exact log output** from terminal (copy/paste all INFO and ERROR lines)
2. **Which step fails** (use checklist above)
3. **Environment:**
   - Is `.env.local` present? YES/NO
   - Are env variables set? YES/NO
   - Did you restart server after editing? YES/NO
4. **Order details:**
   - Does order have email field? (from logs)
   - What is `hasEmail` value?
   - What is `emailValue` value?

---

**With these enhanced logs, we can pinpoint exactly where the email flow breaks!**
