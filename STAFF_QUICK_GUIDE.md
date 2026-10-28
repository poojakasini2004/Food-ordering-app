# Staff Dashboard - Quick Reference Guide

## 🔐 Login
- **URL:** http://localhost:3000/login
- **Username:** `staff`
- **Password:** `staff123`
- **Redirects to:** `/staff/orders`

## 📊 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🍽 SmartX Foods — Staff Dashboard              [Back]      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TODAY'S SUMMARY                                             │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  Total   │ Pending  │    In    │Completed │    Revenue      │
│  Orders  │    3     │ Progress │  Today   │   Collected     │
│  Today   │          │    2     │    5     │    $127.50      │
│    10    │          │          │          │                 │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘

┌──────────────┬──────────────┬──────────────────────────────┐
│   PENDING    │ IN PROGRESS  │        COMPLETED             │
│      3       │      2       │            5                 │
├──────────────┼──────────────┼──────────────────────────────┤
│ Order Card   │ Order Card   │ Order Card                   │
│ Order Card   │ Order Card   │ Order Card                   │
│ Order Card   │              │ Order Card                   │
│              │              │ Order Card                   │
│              │              │ Order Card                   │
└──────────────┴──────────────┴──────────────────────────────┘
```

## 📋 Order Card Details

```
┌─────────────────────────────────────┐
│ #a7f3d9e1              2:34 PM      │
│                                     │
│ John Smith (bold, large)            │
│ 📍 123 Main St, City, 12345        │
│ 📞 07911123456                     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ITEMS ORDERED                   │ │
│ │ Grilled Chicken × 2    $25.98   │ │
│ │ Fresh Lemonade × 1     $2.99    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ─────────────────────────────────── │
│ TOTAL               $28.97          │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │      [Action Button]            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🔄 Order Workflow

### Step 1: New Order Arrives
```
Customer places order
        ↓
Appears in PENDING column (yellow)
Shows "Order Picked" button
```

### Step 2: Staff Picks Order
```
Staff clicks "Order Picked"
        ↓
Moves to IN PROGRESS column (blue)
Shows "Order Ready" button
```

### Step 3: Order Complete
```
Staff clicks "Order Ready"
        ↓
Moves to COMPLETED column (green)
No buttons (read-only)
Shows "✅ Completed"
Revenue added to summary
```

## 🎯 Action Buttons

| Order Status | Column Name  | Button Text    | Next Status  |
|-------------|-------------|----------------|--------------|
| PENDING     | Pending     | Order Picked   | ACTIVE       |
| ACTIVE      | In Progress | Order Ready    | COMPLETED    |
| COMPLETED   | Completed   | (none)         | (final)      |

## ⏱️ Auto-Refresh
- **Frequency:** Every 5 seconds
- **What updates:**
  - New orders appear automatically
  - Summary statistics refresh
  - Order counts update
  - Revenue updates
- **No manual refresh needed!**

## 📈 Summary Statistics

| Stat | Description |
|------|-------------|
| **Total Orders Today** | All orders placed today (any status) |
| **Pending** | Current count of PENDING orders |
| **In Progress** | Current count of ACTIVE orders |
| **Completed Today** | Orders completed today |
| **Revenue Collected** | $ from COMPLETED orders today |

## 🎨 Color Coding

- 🟡 **Yellow** - Pending (needs attention)
- 🔵 **Blue** - In Progress (being prepared)
- 🟢 **Green** - Completed (done)
- 🟠 **Orange** - Money/totals

## ✅ Quick Checklist

**When opening shift:**
- [ ] Login at `/login`
- [ ] Verify you're on `/staff/orders`
- [ ] Check summary panel for order counts
- [ ] Review pending orders

**For each order:**
- [ ] Order appears in Pending (yellow)
- [ ] Click "Order Picked" to start preparing
- [ ] Order moves to In Progress (blue)
- [ ] Prepare the order
- [ ] Click "Order Ready" when done
- [ ] Order moves to Completed (green)
- [ ] Revenue updates automatically

**During shift:**
- [ ] Dashboard auto-refreshes every 5s
- [ ] New orders appear without refresh
- [ ] Monitor summary for totals
- [ ] Process pending orders first

## 🚨 Troubleshooting

**Q: Orders not showing?**
- Verify customer actually placed order
- Check browser console for errors
- Try manual refresh (F5)
- Verify at `/staff/orders` URL

**Q: Can't click button?**
- Check for error message on card
- Verify order hasn't already been updated
- Check network connection

**Q: Wrong counts in summary?**
- Wait for next auto-refresh (5s)
- Summary only counts TODAY'S orders
- Revenue only from COMPLETED orders

**Q: Lost orders after moving column?**
- Not lost - just moved!
- Check the next column
- Order IDs don't change

## 📱 Keyboard Shortcuts
- **F5** - Manual refresh (rarely needed)
- **Ctrl/Cmd + -** - Zoom out (more cards visible)
- **Ctrl/Cmd + +** - Zoom in (larger text)

## 💡 Pro Tips
1. Keep dashboard visible on dedicated screen
2. Orders auto-refresh - no need to reload
3. Process pending orders in time order (oldest first)
4. Check summary at start/end of shift
5. Revenue only counts completed orders today
6. Use Order ID to reference specific orders

## 🔗 Quick Links
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/staff/orders
- Home: http://localhost:3000

---

**Need help?** Check the full documentation in `STAFF_DASHBOARD_REDESIGN.md`
