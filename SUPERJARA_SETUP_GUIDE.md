# Superjara IP Whitelist & API Key Setup Guide

## 🎯 Goal
Enable Superjara as a backup provider for MTN Data Transfer when Autopilot has downtime.

---

## 📋 Current Status

✅ **Code Integration:** 100% complete and ready  
✅ **Railway IP Address:** `208.77.244.47`  
⏳ **IP Whitelist:** Needs to be added in Superjara dashboard  
⏳ **API Key:** Needs to be added to Railway environment variables  

---

## 🔧 Step-by-Step Setup

### Step 1: Whitelist Railway IP in Superjara

1. **Login to Superjara Dashboard**
   - Go to: https://superjara.com
   - Login with your credentials

2. **Navigate to Settings**
   - Click on your profile/settings icon
   - Select "Settings" from menu

3. **Access Whitelist Section**
   - Look for "Whitelist" or "IP Whitelist" option
   - Click on it

4. **Enter Transaction PIN**
   - You'll be prompted to enter your transaction PIN
   - Enter your 4-digit PIN
   - Click "Continue" or "Submit"

5. **Click "Manage IP Whitelist"**
   - You should see a button or link saying "Manage IP whitelist"
   - Click it

6. **Enter OTP**
   - Superjara will send an OTP to your registered email
   - Check your email inbox (and spam folder)
   - Copy the OTP code
   - Enter it in the OTP field

7. **Add Railway IP Address**
   - In the IP address field, enter: `208.77.244.47`
   - Add a label/description (optional): "Railway Production Server"
   - Click "Add" or "Save"

8. **Verify**
   - You should see the IP address listed in your whitelist
   - Status should show as "Active" or "Enabled"

---

### Step 2: Get Superjara API Key

1. **Still in Superjara Dashboard**
   - Look for "API" or "Developer" section
   - Usually under Settings → API Settings

2. **Find Your API Key**
   - You should see your API key displayed
   - It will look something like: `sk_live_xxxxxxxxxxxxx`
   - Click "Copy" or manually copy the entire key

3. **Keep it Safe**
   - Save this key temporarily in a secure note
   - You'll need it for the next step

---

### Step 3: Add API Key to Railway

1. **Login to Railway**
   - Go to: https://railway.app
   - Login to your account

2. **Select Your Project**
   - Find your "wisper-reseller-api" project
   - Click on it

3. **Go to Variables Tab**
   - Click on the "Variables" tab
   - You should see existing environment variables

4. **Add New Variable**
   - Click "New Variable" or "Add Variable"
   - **Variable Name:** `SUPERJARA_AUTH_KEY`
   - **Variable Value:** Paste your Superjara API key
   - Click "Add" or "Save"

5. **Redeploy (Automatic)**
   - Railway will automatically redeploy your app
   - Wait for deployment to complete (usually 1-2 minutes)

---

## 🧪 Step 4: Test Superjara Integration

### Option A: Test via API Endpoint

Use Postman or curl to test:

```bash
curl -X POST https://web-production-a07e9.up.railway.app/api/buy \
  -H "Content-Type: application/json" \
  -H "Authorization: YOUR_API_KEY" \
  -d '{
    "network": "mtn",
    "phone": "08012345678",
    "plan_id": "52",
    "bypass": false
  }'
```

### Option B: Test via Dashboard

1. Login to your dashboard
2. Go to MTN GIFTING section
3. Try to purchase data
4. Check if transaction completes successfully

---

## 🔄 How the Switch Works

### Default Behavior (Autopilot)
```
Customer buys MTN data
    ↓
System checks database switch setting
    ↓
Default = "autopilot"
    ↓
Uses Autopilot API
    ↓
Transaction complete
```

### When Autopilot Has Downtime
```
Admin updates database switch to "superjara"
    ↓
Customer buys MTN data
    ↓
System checks database switch setting
    ↓
Setting = "superjara"
    ↓
Uses Superjara API
    ↓
Transaction complete
```

---

## 🗄️ How to Switch Between Providers

### Method 1: Via MongoDB Compass (Recommended)

1. **Connect to MongoDB**
   - Open MongoDB Compass
   - Connect using your connection string

2. **Navigate to Collection**
   - Database: `resellerAPI`
   - Collection: `dataswitches`

3. **Find MTN Switch Document**
   - Look for document with `network: "mtn"`

4. **Update Switch Value**
   - Change `service: "autopilot"` to `service: "superjara"`
   - Or vice versa
   - Save changes

5. **Immediate Effect**
   - Next MTN purchase will use the new provider
   - No need to restart server

### Method 2: Via API Endpoint (If Available)

If you have an admin endpoint to update switches:
```bash
POST /api/switch/update
{
  "network": "mtn",
  "service": "superjara"
}
```

---

## 📊 Verification Checklist

After completing setup, verify:

- [ ] Railway IP `208.77.244.47` is whitelisted in Superjara
- [ ] Superjara API key is added to Railway environment variables
- [ ] Railway app has redeployed successfully
- [ ] Test purchase works with Autopilot (default)
- [ ] Can switch to Superjara in database
- [ ] Test purchase works with Superjara

---

## 🐛 Troubleshooting

### Issue: "IP not whitelisted" error from Superjara

**Solution:**
- Double-check IP address: `208.77.244.47`
- Verify IP is marked as "Active" in Superjara dashboard
- Wait 5-10 minutes for changes to propagate
- Try test purchase again

### Issue: "Invalid API key" error

**Solution:**
- Verify you copied the complete API key (no spaces)
- Check Railway environment variable name: `SUPERJARA_AUTH_KEY`
- Ensure Railway redeployed after adding variable
- Check Railway logs for any errors

### Issue: Switch not working

**Solution:**
- Verify database connection
- Check `dataswitches` collection exists
- Ensure MTN document has correct format:
  ```json
  {
    "network": "mtn",
    "service": "autopilot" // or "superjara"
  }
  ```

---

## 📞 Support Contacts

**Superjara Support:**
- Email: support@superjara.com
- For IP whitelist issues or API key questions

**Railway Support:**
- Dashboard: https://railway.app
- For deployment or environment variable issues

---

## ✨ Summary

**What you need to do:**
1. Whitelist IP `208.77.244.47` in Superjara (5 minutes)
2. Get Superjara API key (1 minute)
3. Add API key to Railway (2 minutes)
4. Test (5 minutes)

**Total time:** ~15 minutes

**Result:** Full backup system ready for MTN downtime! 🎉

---

## 🎓 Understanding the System

**Current Setup:**
- **Primary:** Autopilot (fast, reliable, currently working)
- **Backup:** Superjara (ready when needed)

**When to switch:**
- Autopilot API is down
- Autopilot has maintenance
- Autopilot rates are too high
- Testing/comparison purposes

**How to switch:**
- Update one field in database
- Takes effect immediately
- No code changes needed
- No server restart required

**This is a professional, production-ready setup!** ✅
