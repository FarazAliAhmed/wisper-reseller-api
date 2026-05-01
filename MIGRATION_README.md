# PaymentPoint Virtual Account Migration

This document explains how to use the migration script to assign PaymentPoint virtual accounts to all existing users.

## Overview

The `migrate-users-to-paymentpoint.js` script automates the process of creating PaymentPoint virtual accounts for all users in the system who don't already have one.

## Features

✅ **Safe Migration**: Checks for existing PaymentPoint accounts before creating new ones  
✅ **Dry-Run Mode**: Test the migration without making any changes  
✅ **Rate Limiting**: 500ms delay between API calls to avoid rate limiting  
✅ **Error Handling**: Continues processing even if individual users fail  
✅ **Detailed Logging**: Console output with colors + log file generation  
✅ **Summary Report**: JSON report with complete migration statistics  
✅ **BVN/NIN Support**: Uses BVN or NIN if available (optional)  

## Prerequisites

1. **Environment Variables**: Ensure your `.env` file contains:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PAYMENTPOINT_API_KEY=your_api_key
   PAYMENTPOINT_SECRET_KEY=your_secret_key
   PAYMENTPOINT_BASE_URL=https://api.paymentpoint.co
   ```

2. **Dependencies**: All required packages should already be installed via `npm install`

3. **Database Access**: Ensure the MongoDB connection string has read/write access to the `accounts` collection

## Usage

### Dry-Run Mode (Recommended First)

Test the migration without creating any accounts:

```bash
node migrate-users-to-paymentpoint.js --dry-run
```

This will:
- Connect to the database
- Fetch all users
- Show what would happen for each user
- Generate a summary report
- **NOT create any PaymentPoint accounts**

### Production Migration

Once you've verified the dry-run results, run the actual migration:

```bash
node migrate-users-to-paymentpoint.js
```

This will:
- Create PaymentPoint virtual accounts for users who don't have one
- Skip users who already have accounts
- Log all operations to console and file
- Generate a detailed summary report

## What the Script Does

### For Each User:

1. **Check Existing Account**: Verifies if user already has `paymentpointAccountReference`
2. **Validate Data**: Ensures user has required fields (email, name/username)
3. **Prepare Parameters**:
   - Uses user ID as `accountReference`
   - Uses name/username as `accountName`
   - Uses email address
   - Includes BVN or NIN if available (optional)
4. **Create Account**: Calls PaymentPoint API to create virtual account
5. **Update Database**: Stores account details in user record
6. **Rate Limit**: Waits 500ms before processing next user

### Users That Are Skipped:

- ✅ Users who already have PaymentPoint accounts
- ⚠️ Users missing email address
- ⚠️ Users missing both name and username

## Output

### Console Output

The script provides colored, real-time console output:

```
================================================================================
PaymentPoint Virtual Account Migration Script
================================================================================
[2024-01-15T10:30:00.000Z] ✓ PaymentPoint configuration validated
[2024-01-15T10:30:01.000Z] ✓ Connected to MongoDB successfully

================================================================================
Fetching Users from Database
================================================================================
[2024-01-15T10:30:02.000Z] Found 150 users in database

================================================================================
Starting Migration Process
================================================================================

[1/150]
📝 Processing user: John Doe (john@example.com)
   ℹ️  BVN available: 123********
   🔄 Creating PaymentPoint virtual account...
   ✅ SUCCESS: Virtual account created
      Account Reference: 507f1f77bcf86cd799439011
      Bank Accounts: 2
      Bank 1: Wema Bank - 1234567890
      Bank 2: Sterling Bank - 0987654321

[2/150]
📝 Processing user: Jane Smith (jane@example.com)
   ⏭️  User already has PaymentPoint account - SKIPPED

...

================================================================================
Migration Summary
================================================================================
Total Users:              150
Already Migrated:         45 (skipped)
Successfully Migrated:    100
Failed:                   3
Skipped (missing data):   2
```

### Log Files

Two files are generated:

1. **Migration Log** (`migration-log-[timestamp].txt`):
   - Complete log of all operations
   - Timestamps for each action
   - Error details

2. **Summary Report** (`migration-report-[timestamp].json`):
   ```json
   {
     "timestamp": "2024-01-15T10:35:00.000Z",
     "dryRun": false,
     "statistics": {
       "totalUsers": 150,
       "alreadyMigrated": 45,
       "successfullyMigrated": 100,
       "failed": 3,
       "skipped": 2,
       "errors": [...]
     },
     "configuration": {
       "delayMs": 500,
       "mongoUri": "***configured***",
       "paymentPointConfigured": true
     }
   }
   ```

## Error Handling

The script handles errors gracefully:

- **Individual User Failures**: Script continues processing other users
- **API Errors**: Logged with full error details
- **Database Errors**: Logged and script exits safely
- **Configuration Errors**: Validated before migration starts

## Common Issues

### Issue: "MONGODB_URI not found in .env file"
**Solution**: Ensure `.env` file exists in `wisper-reseller-api/` directory with valid MongoDB connection string

### Issue: "PaymentPoint API credentials not found"
**Solution**: Add `PAYMENTPOINT_API_KEY` and `PAYMENTPOINT_SECRET_KEY` to `.env` file

### Issue: Rate limiting errors from PaymentPoint
**Solution**: Increase `DELAY_MS` constant in the script (default is 500ms)

### Issue: User missing required fields
**Solution**: These users are automatically skipped. Check the log file for details.

## Best Practices

1. **Always run dry-run first**: Verify the migration plan before executing
2. **Backup database**: Create a database backup before running production migration
3. **Monitor logs**: Watch the console output during migration
4. **Review errors**: Check error details in log files after completion
5. **Off-peak hours**: Run during low-traffic periods to minimize impact

## Rollback

If you need to rollback the migration:

1. The script doesn't delete any data, only adds PaymentPoint account information
2. To remove PaymentPoint accounts from users:
   ```javascript
   // Run in MongoDB shell or create a rollback script
   db.accounts.updateMany(
     {},
     {
       $unset: {
         paymentpointAccountReference: "",
         paymentpointAccounts: ""
       }
     }
   )
   ```

## Support

For issues or questions:
1. Check the log files for detailed error information
2. Review the PaymentPoint service documentation
3. Contact the development team with the migration report JSON

## Script Modifications

To customize the script behavior, you can modify these constants:

```javascript
const DELAY_MS = 500;  // Delay between API calls (milliseconds)
```

To change which users are processed, modify the query in:
```javascript
const users = await Account.find({}).select(...)
```

For example, to only migrate users of a specific type:
```javascript
const users = await Account.find({ type: 'mega' }).select(...)
```
