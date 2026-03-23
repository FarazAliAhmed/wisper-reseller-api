# 🚀 MTN Data Transfer - Deployment Guide

## ✅ What's Been Changed (Ready to Push)

### Files Modified:
1. ✅ `wisper-reseller-api/.env` - API credentials added
2. ✅ `wisper-reseller-api/src/utils/helpers.js` - Switched to Autopilot
3. ✅ `wisper-reseller-api/src/utils/data/apiDataHelper.js` - Updated API helper
4. ✅ `wisper-reseller-api/src/utils/networkData.js` - Extended plan mappings
5. ✅ `wisper-reseller-api/src/controllers/plans.controller.js` - Added "data_transfer" validation

### Files Created:
1. ✅ `wisper-reseller-api/add-mtn-plans.js` - Script to add plans to database
2. ✅ `wisper-reseller-api/test-autopilot.js` - Test script
3. ✅ Documentation files (*.md)

---

## 🎯 Deployment Steps

### Step 1: Push Code to Repository ✅ SAFE TO PUSH

```bash
cd wisper-dashboard

# Check what files changed
git status

# Add all changes
git add .

# Commit with message
git commit -m "feat: Add MTN Data Transfer integration via Autopilot API

- Integrated Autopilot API for MTN Data Transfer
- Added support for 13 MTN data plans (50MB to 5GB)
- Updated plan validation to include data_transfer type
- Added API configuration and test scripts
- Backend integration tested and working"

# Push to your branch
git push origin your-branch-name
```

**⚠️ IMPORTANT:** The `.env` file contains your API key. Make sure it's in `.gitignore`!

---

### Step 2: Verify .env is NOT Pushed

```bash
# Check if .env is in .gitignore
cat wisper-reseller-api/.gitignore | grep .env

# If not there, add it:
echo ".env" >> wisper-reseller-api/.gitignore
```

**Your API key should NEVER be in git!**

---

### Step 3: Deploy to Production

#### Option A: If Using Railway/Heroku/Vercel

1. **Set Environment Variables in Dashboard:**
   ```
   AUTOPILOT_API_KEY=live_3c29d72926924b738d8f6bfffe13293enpwkaq58
   AUTOPILOT_URL=https://autopilotng.com/api/live
   ```

2. **Deploy:**
   - Railway: Automatic on push
   - Heroku: `git push heroku main`
   - Vercel: Automatic on push

#### Option B: If Using VPS/Server

1. **SSH to your server:**
   ```bash
   ssh user@your-server.com
   ```

2. **Pull latest code:**
   ```bash
   cd /path/to/wisper-reseller-api
   git pull origin main
   ```

3. **Update .env file:**
   ```bash
   nano .env
   # Add:
   AUTOPILOT_API_KEY=live_3c29d72926924b738d8f6bfffe13293enpwkaq58
   AUTOPILOT_URL=https://autopilotng.com/api/live
   ```

4. **Restart server:**
   ```bash
   pm2 restart wisper-api
   # or
   npm restart
   ```

---

### Step 4: Add Plans to Database

**After deploying, run this on your server:**

```bash
# SSH to server (if remote)
ssh user@your-server.com

# Navigate to API folder
cd /path/to/wisper-reseller-api

# Run the script
node add-mtn-plans.js
```

**Expected Output:**
```
🚀 MTN Data Transfer Plans Setup Script

🔌 Connecting to MongoDB...
✅ Connected to MongoDB

🔍 Checking for existing MTN Data Transfer plans...
📝 Adding MTN Data Transfer plans...

✅ Added: 50MB (30 days) - ₦50 [ID: 2001]
✅ Added: 100MB (30 days) - ₦100 [ID: 2002]
✅ Added: 200MB (30 days) - ₦135 [ID: 2003]
...

============================================================
✅ Successfully added: 13 plans
============================================================

🎉 Done! MTN Data Transfer plans are now available in your database.
```

---

### Step 5: Verify Everything Works

#### Test 1: Check API
```bash
curl https://your-api-url.com/api/plans | grep "data_transfer"
```

Should show MTN Data Transfer plans.

#### Test 2: Check Frontend
1. Login to dashboard: `https://your-domain.com/login`
2. Go to: `https://your-domain.com/packages`
3. Should see MTN Data Transfer plans in the table

#### Test 3: Test Purchase (Small Amount!)
1. Go to: `https://your-domain.com/allocate`
2. Select: "MTN SME"
3. Select: "50MB (30 days)"
4. Enter: Your MTN number
5. Click: "Allocate"
6. Check: Transaction successful

---

## 🔧 Troubleshooting

### Issue 1: "Cannot find module 'dotenv'"
```bash
cd wisper-reseller-api
npm install dotenv
```

### Issue 2: "Cannot connect to MongoDB"
Check your MongoDB connection string in `.env`:
```bash
# Add this to .env if missing:
MONGODB_URI=mongodb://localhost:27017/wisper
# or
DATABASE_URL=mongodb://your-mongo-url
```

### Issue 3: Plans not showing in UI
```bash
# Check if plans were added:
mongo
use wisper  # or your database name
db.plans.find({ network: "mtn", plan_type: "data_transfer" })
```

### Issue 4: "Unauthorized" error
- Check API key is correct in production `.env`
- Restart server after updating `.env`

---

## 📋 Pre-Deployment Checklist

- [ ] All code changes committed
- [ ] `.env` is in `.gitignore`
- [ ] API key NOT in git repository
- [ ] Code pushed to repository
- [ ] Environment variables set in production
- [ ] Server restarted
- [ ] Database plans added
- [ ] Frontend tested
- [ ] Test purchase completed

---

## 🎯 What Happens After Deployment

### For Users:
1. ✅ See MTN Data Transfer plans in pricing page
2. ✅ Can select and buy MTN data
3. ✅ Receive data instantly via Autopilot

### For You:
1. ✅ Monitor transactions in Autopilot dashboard
2. ✅ Check your wallet balance
3. ✅ View transaction history
4. ✅ Adjust prices as needed

---

## 💰 Pricing Recommendations

The script uses these default prices (you can change them):

| Size | Monthly | Weekly |
|------|---------|--------|
| 50MB | ₦50 | - |
| 100MB | ₦100 | - |
| 200MB | ₦135 | - |
| 500MB | ₦135 | ₦100 |
| 1GB | ₦270 | ₦200 |
| 2GB | ₦540 | ₦400 |
| 3GB | ₦810 | ₦600 |
| 5GB | ₦1350 | ₦1000 |

**To change prices:**
1. Edit `add-mtn-plans.js` before running
2. Or update in database after adding
3. Or use admin panel to update prices

---

## 🔐 Security Notes

### DO NOT:
- ❌ Push `.env` file to git
- ❌ Share API key publicly
- ❌ Commit API credentials

### DO:
- ✅ Use environment variables
- ✅ Keep API key secure
- ✅ Rotate keys if compromised
- ✅ Monitor API usage in Autopilot dashboard

---

## 📞 Support

If you encounter issues:
1. Check server logs for errors
2. Verify API key in Autopilot dashboard
3. Test with `node test-autopilot.js`
4. Check MongoDB connection
5. Review transaction logs

---

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ No errors in server logs
- ✅ Plans visible in `/packages`
- ✅ Can select plans in `/allocate`
- ✅ Test purchase completes successfully
- ✅ Data received on phone
- ✅ Transaction appears in Autopilot dashboard

---

**Deployment Status:** Ready to deploy! 🚀
