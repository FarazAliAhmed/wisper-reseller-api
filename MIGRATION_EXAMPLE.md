# PaymentPoint Migration - Example Run

This document shows example output from running the migration script.

## Example 1: Dry-Run Mode

```bash
$ node migrate-users-to-paymentpoint.js --dry-run
```

### Output:

```
================================================================================
PaymentPoint Virtual Account Migration Script
================================================================================
🔍 RUNNING IN DRY-RUN MODE - No accounts will be created

[2024-01-15T10:30:00.123Z] Log file: /path/to/migration-log-1705318200123.txt

[2024-01-15T10:30:00.234Z] ✓ PaymentPoint configuration validated

[2024-01-15T10:30:00.345Z] Connecting to MongoDB...
[2024-01-15T10:30:01.456Z] ✓ Connected to MongoDB successfully

================================================================================
Fetching Users from Database
================================================================================
[2024-01-15T10:30:02.567Z] Found 10 users in database

================================================================================
Starting Migration Process
================================================================================
[2024-01-15T10:30:02.678Z] Processing 10 users with 500ms delay between API calls

[1/10]
[2024-01-15T10:30:02.789Z] 📝 Processing user: John Doe (john@example.com)
[2024-01-15T10:30:02.890Z]    ℹ️  BVN available: 123********
[2024-01-15T10:30:02.901Z]    🔍 DRY RUN: Would create PaymentPoint account
[2024-01-15T10:30:02.912Z]       Account Reference: 507f1f77bcf86cd799439011
[2024-01-15T10:30:02.923Z]       Account Name: John Doe
[2024-01-15T10:30:02.934Z]       Email: john@example.com

[2/10]
[2024-01-15T10:30:03.045Z] 📝 Processing user: Jane Smith (jane@example.com)
[2024-01-15T10:30:03.156Z]    ⏭️  User already has PaymentPoint account - SKIPPED

[3/10]
[2024-01-15T10:30:03.267Z] 📝 Processing user: Bob Wilson (bob@example.com)
[2024-01-15T10:30:03.378Z]    ℹ️  No BVN/NIN available (optional)
[2024-01-15T10:30:03.489Z]    🔍 DRY RUN: Would create PaymentPoint account
[2024-01-15T10:30:03.590Z]       Account Reference: 507f1f77bcf86cd799439012
[2024-01-15T10:30:03.601Z]       Account Name: Bob Wilson
[2024-01-15T10:30:03.612Z]       Email: bob@example.com

[4/10]
[2024-01-15T10:30:03.723Z] 📝 Processing user: Alice Brown (alice@example.com)
[2024-01-15T10:30:03.834Z]    ⚠️  User missing email - SKIPPED

[5/10]
[2024-01-15T10:30:03.945Z] 📝 Processing user: Charlie Davis (charlie@example.com)
[2024-01-15T10:30:04.056Z]    ℹ️  NIN available: 456********
[2024-01-15T10:30:04.167Z]    🔍 DRY RUN: Would create PaymentPoint account
[2024-01-15T10:30:04.278Z]       Account Reference: 507f1f77bcf86cd799439013
[2024-01-15T10:30:04.389Z]       Account Name: Charlie Davis
[2024-01-15T10:30:04.490Z]       Email: charlie@example.com

... (remaining users)

================================================================================
Migration Summary
================================================================================
[2024-01-15T10:30:10.123Z] Total Users:              10
[2024-01-15T10:30:10.234Z] Already Migrated:         2 (skipped)
[2024-01-15T10:30:10.345Z] Successfully Migrated:    7
[2024-01-15T10:30:10.456Z] Failed:                   0
[2024-01-15T10:30:10.567Z] Skipped (missing data):   1

[2024-01-15T10:30:10.678Z] Summary report saved to: /path/to/migration-report-1705318210678.json

================================================================================
Migration Complete
================================================================================
[2024-01-15T10:30:10.789Z] 🔍 This was a DRY RUN - no accounts were actually created
[2024-01-15T10:30:10.890Z] Run without --dry-run flag to perform actual migration
[2024-01-15T10:30:10.901Z] Database connection closed
[2024-01-15T10:30:10.912Z] Script execution completed
```

## Example 2: Production Migration

```bash
$ node migrate-users-to-paymentpoint.js
```

### Output:

```
================================================================================
PaymentPoint Virtual Account Migration Script
================================================================================
[2024-01-15T11:00:00.123Z] Log file: /path/to/migration-log-1705320000123.txt

[2024-01-15T11:00:00.234Z] ✓ PaymentPoint configuration validated

[2024-01-15T11:00:00.345Z] Connecting to MongoDB...
[2024-01-15T11:00:01.456Z] ✓ Connected to MongoDB successfully

================================================================================
Fetching Users from Database
================================================================================
[2024-01-15T11:00:02.567Z] Found 5 users in database

================================================================================
Starting Migration Process
================================================================================
[2024-01-15T11:00:02.678Z] Processing 5 users with 500ms delay between API calls

[1/5]
[2024-01-15T11:00:02.789Z] 📝 Processing user: John Doe (john@example.com)
[2024-01-15T11:00:02.890Z]    ℹ️  BVN available: 123********
[2024-01-15T11:00:02.901Z]    🔄 Creating PaymentPoint virtual account...
[2024-01-15T11:00:04.123Z]    ✅ SUCCESS: Virtual account created
[2024-01-15T11:00:04.234Z]       Account Reference: 507f1f77bcf86cd799439011
[2024-01-15T11:00:04.345Z]       Bank Accounts: 2
[2024-01-15T11:00:04.456Z]       Bank 1: Wema Bank - 7890123456
[2024-01-15T11:00:04.567Z]       Bank 2: Sterling Bank - 6543210987

[2/5]
[2024-01-15T11:00:05.678Z] 📝 Processing user: Jane Smith (jane@example.com)
[2024-01-15T11:00:05.789Z]    ⏭️  User already has PaymentPoint account - SKIPPED

[3/5]
[2024-01-15T11:00:06.890Z] 📝 Processing user: Bob Wilson (bob@example.com)
[2024-01-15T11:00:06.901Z]    ℹ️  No BVN/NIN available (optional)
[2024-01-15T11:00:06.912Z]    🔄 Creating PaymentPoint virtual account...
[2024-01-15T11:00:08.123Z]    ✅ SUCCESS: Virtual account created
[2024-01-15T11:00:08.234Z]       Account Reference: 507f1f77bcf86cd799439012
[2024-01-15T11:00:08.345Z]       Bank Accounts: 2
[2024-01-15T11:00:08.456Z]       Bank 1: Wema Bank - 1234567890
[2024-01-15T11:00:08.567Z]       Bank 2: Sterling Bank - 0987654321

[4/5]
[2024-01-15T11:00:09.678Z] 📝 Processing user: Charlie Davis (charlie@example.com)
[2024-01-15T11:00:09.789Z]    ℹ️  NIN available: 456********
[2024-01-15T11:00:09.890Z]    🔄 Creating PaymentPoint virtual account...
[2024-01-15T11:00:11.123Z]    ❌ ERROR: Failed to migrate user Charlie Davis (charlie@example.com)
[2024-01-15T11:00:11.234Z]       Details: PaymentPoint account creation failed: Invalid NIN format

[5/5]
[2024-01-15T11:00:12.345Z] 📝 Processing user: Eve Martinez (eve@example.com)
[2024-01-15T11:00:12.456Z]    ℹ️  BVN available: 789********
[2024-01-15T11:00:12.567Z]    🔄 Creating PaymentPoint virtual account...
[2024-01-15T11:00:14.123Z]    ✅ SUCCESS: Virtual account created
[2024-01-15T11:00:14.234Z]       Account Reference: 507f1f77bcf86cd799439014
[2024-01-15T11:00:14.345Z]       Bank Accounts: 2
[2024-01-15T11:00:14.456Z]       Bank 1: Wema Bank - 5555666677
[2024-01-15T11:00:14.567Z]       Bank 2: Sterling Bank - 7777888899

================================================================================
Migration Summary
================================================================================
[2024-01-15T11:00:15.123Z] Total Users:              5
[2024-01-15T11:00:15.234Z] Already Migrated:         1 (skipped)
[2024-01-15T11:00:15.345Z] Successfully Migrated:    3
[2024-01-15T11:00:15.456Z] Failed:                   1
[2024-01-15T11:00:15.567Z] Skipped (missing data):   0

================================================================================
Error Details
================================================================================
[2024-01-15T11:00:15.678Z] 1. User ID: 507f1f77bcf86cd799439013
[2024-01-15T11:00:15.789Z]    Message: Failed to migrate user Charlie Davis (charlie@example.com)
[2024-01-15T11:00:15.890Z]    Error: PaymentPoint account creation failed: Invalid NIN format

[2024-01-15T11:00:16.123Z] Summary report saved to: /path/to/migration-report-1705320016123.json

================================================================================
Migration Complete
================================================================================
[2024-01-15T11:00:16.234Z] Database connection closed
[2024-01-15T11:00:16.345Z] Script execution completed
```

## Example 3: Summary Report JSON

**File: `migration-report-1705320016123.json`**

```json
{
  "timestamp": "2024-01-15T11:00:16.123Z",
  "dryRun": false,
  "statistics": {
    "totalUsers": 5,
    "alreadyMigrated": 1,
    "successfullyMigrated": 3,
    "failed": 1,
    "skipped": 0,
    "errors": [
      {
        "userId": "507f1f77bcf86cd799439013",
        "message": "Failed to migrate user Charlie Davis (charlie@example.com)",
        "error": "PaymentPoint account creation failed: Invalid NIN format",
        "timestamp": "2024-01-15T11:00:11.234Z"
      }
    ]
  },
  "configuration": {
    "delayMs": 500,
    "mongoUri": "***configured***",
    "paymentPointConfigured": true
  }
}
```

## Example 4: Error Scenarios

### Scenario A: Missing Configuration

```bash
$ node migrate-users-to-paymentpoint.js
```

```
================================================================================
PaymentPoint Virtual Account Migration Script
================================================================================
[2024-01-15T12:00:00.123Z] Log file: /path/to/migration-log-1705323600123.txt

[2024-01-15T12:00:00.234Z] ❌ ERROR: PaymentPoint API credentials not found in .env file
[2024-01-15T12:00:00.345Z]    Details: undefined
```

### Scenario B: Database Connection Failed

```bash
$ node migrate-users-to-paymentpoint.js
```

```
================================================================================
PaymentPoint Virtual Account Migration Script
================================================================================
[2024-01-15T12:00:00.123Z] Log file: /path/to/migration-log-1705323600123.txt

[2024-01-15T12:00:00.234Z] ✓ PaymentPoint configuration validated

[2024-01-15T12:00:00.345Z] Connecting to MongoDB...
[2024-01-15T12:00:05.456Z] ❌ ERROR: Failed to connect to MongoDB
[2024-01-15T12:00:05.567Z]    Details: connection timed out
```

## Tips for Reading Output

### Color Coding (in terminal):

- 🔵 **Blue**: Informational messages
- 🟢 **Green**: Success messages
- 🟡 **Yellow**: Warnings/skipped items
- 🔴 **Red**: Errors
- 🟣 **Magenta**: Dry-run mode indicators
- 🔷 **Cyan**: Section headers

### Symbols:

- ✅ Success
- ❌ Error
- ⚠️ Warning
- ℹ️ Information
- 🔄 Processing
- ⏭️ Skipped
- 🔍 Dry-run mode
- 📝 User processing

## Next Steps After Migration

1. **Review the summary report** to ensure acceptable success rate
2. **Check error details** for any failed users
3. **Verify in database** that accounts were created:
   ```javascript
   db.accounts.find({ paymentpointAccountReference: { $exists: true } }).count()
   ```
4. **Test in dashboard** that users can see their virtual accounts
5. **Monitor webhook** to ensure payments are being processed correctly
