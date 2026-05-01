# PaymentPoint Migration Checklist

Use this checklist to ensure a smooth migration process.

## Pre-Migration Checklist

### 1. Environment Setup
- [ ] `.env` file exists in `wisper-reseller-api/` directory
- [ ] `MONGODB_URI` is configured and valid
- [ ] `PAYMENTPOINT_API_KEY` is configured
- [ ] `PAYMENTPOINT_SECRET_KEY` is configured
- [ ] `PAYMENTPOINT_BASE_URL` is configured (default: https://api.paymentpoint.co)

### 2. Database Backup
- [ ] Create MongoDB backup before migration
- [ ] Verify backup is complete and accessible
- [ ] Document backup location and timestamp

### 3. PaymentPoint API Access
- [ ] Verify PaymentPoint API credentials are valid
- [ ] Test API access with a manual request (optional)
- [ ] Confirm API rate limits and quotas
- [ ] Ensure sufficient API credits/balance

### 4. System Requirements
- [ ] Node.js is installed (v12 or higher)
- [ ] All npm dependencies are installed (`npm install`)
- [ ] Sufficient disk space for log files
- [ ] Stable internet connection

### 5. Timing
- [ ] Schedule migration during off-peak hours
- [ ] Notify team members about migration
- [ ] Allocate sufficient time (estimate: 1-2 minutes per 100 users)
- [ ] Plan for monitoring during migration

## Migration Execution Checklist

### Step 1: Dry-Run Test
- [ ] Run dry-run mode: `node migrate-users-to-paymentpoint.js --dry-run`
- [ ] Review console output for any issues
- [ ] Check total users count matches expectations
- [ ] Verify "already migrated" count is reasonable
- [ ] Review any skipped users and reasons
- [ ] Examine dry-run log file
- [ ] Review dry-run summary report JSON

### Step 2: Pre-Production Verification
- [ ] Confirm dry-run results are acceptable
- [ ] Verify no critical errors in dry-run
- [ ] Check that required user data is available
- [ ] Ensure PaymentPoint API is operational
- [ ] Confirm database connection is stable

### Step 3: Production Migration
- [ ] Run production migration: `node migrate-users-to-paymentpoint.js`
- [ ] Monitor console output in real-time
- [ ] Watch for error messages
- [ ] Note any failed users
- [ ] Wait for migration to complete
- [ ] Do not interrupt the process

### Step 4: Post-Migration Verification
- [ ] Review migration summary in console
- [ ] Check success rate is acceptable (>95% recommended)
- [ ] Review error details for failed users
- [ ] Examine migration log file
- [ ] Review migration report JSON
- [ ] Verify log files are saved

## Post-Migration Checklist

### 1. Database Verification
- [ ] Check users have `paymentpointAccountReference` field:
  ```javascript
  db.accounts.find({ paymentpointAccountReference: { $exists: true } }).count()
  ```
- [ ] Verify `paymentpointAccounts` array is populated:
  ```javascript
  db.accounts.findOne({ paymentpointAccountReference: { $exists: true } })
  ```
- [ ] Confirm bank account details are present
- [ ] Spot-check 5-10 random users manually

### 2. Application Testing
- [ ] Test user login to dashboard
- [ ] Verify virtual account details are visible
- [ ] Check bank account numbers are displayed
- [ ] Test funding workflow (small test transaction)
- [ ] Verify webhook processing works
- [ ] Confirm wallet balance updates correctly

### 3. Error Resolution
- [ ] Review all failed users from error log
- [ ] Identify common failure patterns
- [ ] Document reasons for failures
- [ ] Plan remediation for failed users
- [ ] Consider manual account creation for critical users

### 4. Documentation
- [ ] Save all log files to secure location
- [ ] Document migration date and time
- [ ] Record success/failure statistics
- [ ] Note any issues encountered
- [ ] Update internal documentation

### 5. Monitoring
- [ ] Monitor PaymentPoint webhook for incoming payments
- [ ] Check transaction history for test payments
- [ ] Verify wallet credits are working
- [ ] Monitor for user-reported issues
- [ ] Set up alerts for PaymentPoint API errors

## Rollback Checklist (If Needed)

### If Migration Needs to be Rolled Back:
- [ ] Stop any ongoing migration process
- [ ] Document reason for rollback
- [ ] Restore database from backup (if necessary)
- [ ] Or remove PaymentPoint fields:
  ```javascript
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
- [ ] Verify rollback completed successfully
- [ ] Notify team of rollback
- [ ] Investigate and fix root cause
- [ ] Plan re-migration after fixes

## Success Criteria

Migration is considered successful when:
- [ ] ✅ 95%+ of users successfully migrated
- [ ] ✅ All errors are documented and understood
- [ ] ✅ Database records are correct
- [ ] ✅ Users can see virtual accounts in dashboard
- [ ] ✅ Test payment successfully credits wallet
- [ ] ✅ Webhook processing works correctly
- [ ] ✅ No critical errors in logs
- [ ] ✅ Team is satisfied with results

## Failed User Remediation

For users who failed migration:

### Option 1: Manual Account Creation
- [ ] Identify failed users from error log
- [ ] Manually create PaymentPoint accounts via dashboard/API
- [ ] Update database records manually
- [ ] Verify accounts work correctly

### Option 2: Re-run Migration for Failed Users
- [ ] Modify script to only process failed users
- [ ] Fix underlying issues (e.g., data validation)
- [ ] Re-run migration for specific users
- [ ] Verify success

### Option 3: Contact PaymentPoint Support
- [ ] For API-related failures
- [ ] Provide transaction references
- [ ] Request manual account creation
- [ ] Follow up until resolved

## Timeline Estimate

| Phase | Estimated Time |
|-------|----------------|
| Pre-migration setup | 15-30 minutes |
| Dry-run test | 5-10 minutes |
| Review dry-run results | 10-15 minutes |
| Production migration (100 users) | 1-2 minutes |
| Production migration (1000 users) | 10-15 minutes |
| Post-migration verification | 20-30 minutes |
| Total (for 100 users) | ~1 hour |
| Total (for 1000 users) | ~1.5 hours |

*Note: Times vary based on API response times and number of users*

## Emergency Contacts

Document your emergency contacts:

- [ ] Database Administrator: _______________
- [ ] PaymentPoint Support: _______________
- [ ] Development Team Lead: _______________
- [ ] System Administrator: _______________

## Sign-off

- [ ] Migration completed by: _______________ Date: _______________
- [ ] Verified by: _______________ Date: _______________
- [ ] Approved by: _______________ Date: _______________

---

**Remember**: 
- Always run dry-run first
- Never skip the backup
- Monitor the process
- Document everything
