# PaymentPoint Migration - Quick Start Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Verify Configuration

Check your `.env` file has these variables:
```bash
cat .env | grep -E "(MONGODB_URI|PAYMENTPOINT)"
```

You should see:
- ✅ `MONGODB_URI=mongodb+srv://...`
- ✅ `PAYMENTPOINT_API_KEY=...`
- ✅ `PAYMENTPOINT_SECRET_KEY=...`

### Step 2: Test with Dry-Run

```bash
node migrate-users-to-paymentpoint.js --dry-run
```

Review the output. You should see:
- Total users found
- How many already have accounts
- How many would be migrated
- Any users that would be skipped

### Step 3: Run Migration

If dry-run looks good:
```bash
node migrate-users-to-paymentpoint.js
```

## 📊 Expected Output

```
================================================================================
PaymentPoint Virtual Account Migration Script
================================================================================
✓ PaymentPoint configuration validated
✓ Connected to MongoDB successfully

Found 150 users in database

[1/150]
📝 Processing user: John Doe (john@example.com)
   ✅ SUCCESS: Virtual account created
      Bank 1: Wema Bank - 1234567890
      Bank 2: Sterling Bank - 0987654321

...

================================================================================
Migration Summary
================================================================================
Total Users:              150
Already Migrated:         45
Successfully Migrated:    100
Failed:                   3
Skipped (missing data):   2
```

## 📁 Generated Files

After running, you'll find:
- `migration-log-[timestamp].txt` - Detailed log
- `migration-report-[timestamp].json` - Summary report

## ⚠️ Important Notes

1. **Safe to Re-run**: Script checks for existing accounts and skips them
2. **No Data Loss**: Script only adds data, never deletes
3. **Rate Limited**: 500ms delay between API calls
4. **Error Tolerant**: Continues even if individual users fail

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "MONGODB_URI not found" | Add to `.env` file |
| "PaymentPoint credentials not found" | Add API keys to `.env` |
| Script hangs | Check internet connection and API status |
| Some users fail | Check log file for specific error details |

## 📞 Need Help?

1. Check `MIGRATION_README.md` for detailed documentation
2. Review log files for error details
3. Contact development team with migration report JSON

## ✅ Success Criteria

Migration is successful when:
- ✅ All users processed (or skipped with reason)
- ✅ Failed count is 0 or acceptable
- ✅ Log file shows no critical errors
- ✅ Users can see their virtual accounts in the dashboard
