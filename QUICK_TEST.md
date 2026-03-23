# 🚀 Quick Test Guide - MTN Data Transfer

## Option 1: Run Automated Test Script (EASIEST)

```bash
cd wisper-reseller-api
node test-autopilot.js
```

**What it does:**
- ✅ Checks if API key is configured
- ✅ Tests connection to Autopilot
- ✅ Verifies MTN Data Transfer is available
- ✅ Lists all available data plans
- ✅ Shows prices for each plan

**Expected Output:**
```
🚀 Starting MTN Data Transfer Integration Tests

📋 Test 1: Checking Environment Variables
✅ AUTOPILOT_API_KEY found: live_3c29d7292692b4b7...
✅ AUTOPILOT_URL found: https://autopilotng.com/api/live

📋 Test 2: Testing API Connection
✅ API Connection Successful
📊 Available Networks: MTN, AIRTEL, GLO, 9MOBILE

📋 Test 3: Checking MTN Data Types
✅ MTN Data Types Retrieved Successfully
📊 Available Data Types:
   - SME
   - DATA TRANSFER
   - CORPORATE GIFTING
✅ DATA TRANSFER is available!

📋 Test 4: Checking MTN Data Transfer Plans
✅ MTN Data Transfer Plans Retrieved Successfully
📊 Available Plans:
   - 100MB [DATA TRANSFER] (MTN_DT_100MB) - ₦50
   - 500MB [DATA TRANSFER] (MTN_DT_500MB) - ₦135
   - 1GB [DATA TRANSFER] (MTN_DT_1GB) - ₦270
   ...

🎉 All Tests Completed!
✅ MTN Data Transfer Integration is READY!
```

---

## Option 2: Manual API Test with cURL

### Step 1: Test Autopilot Connection
```bash
curl -X POST https://autopilotng.com/api/live/v1/load/networks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer live_3c29d7292692b4b738d8f6bfffe13293enpwkaq58" \
  -d '{"networks":"all"}'
```

**Success Response:**
```json
{
  "status": true,
  "code": 200,
  "data": {
    "product": [
      {"network": "MTN", "networkId": 1},
      {"network": "AIRTEL", "networkId": 2}
    ]
  }
}
```

### Step 2: Check MTN Data Transfer Plans
```bash
curl -X POST https://autopilotng.com/api/live/v1/load/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer live_3c29d7292692b4b738d8f6bfffe13293enpwkaq58" \
  -d '{"networkId":"1","dataType":"DATA TRANSFER"}'
```

---

## Option 3: Test Through Your API

### Step 1: Start Your Server
```bash
cd wisper-reseller-api
npm start
```

### Step 2: Login to Get Token
```bash
curl -X POST http://localhost:YOUR_PORT/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

### Step 3: Make Test Purchase (SMALL AMOUNT!)
```bash
curl -X POST http://localhost:YOUR_PORT/buy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "network": "mtn",
    "plan_id": YOUR_PLAN_ID,
    "phone_number": "08030000000"
  }'
```

---

## ✅ Success Indicators

Your integration is working if you see:

1. **In test script:**
   - All tests show ✅ green checkmarks
   - "MTN Data Transfer Integration is READY!" message

2. **In server logs:**
   - "AUTOPILOT REQUEST" with correct data
   - "MTN DATA TRANSFER SUCCESSFUL"
   - No error messages

3. **In API response:**
   - `"status": "success"`
   - `"message": "Transaction Successful!"`
   - Transaction reference returned

4. **In Autopilot Dashboard:**
   - Transaction appears in history
   - Wallet balance deducted

5. **On Recipient Phone:**
   - Data received (check *131# on MTN)

---

## ❌ Common Errors & Fixes

### Error: "Cannot find module 'axios'"
**Fix:**
```bash
cd wisper-reseller-api
npm install axios
```

### Error: "AUTOPILOT_API_KEY is missing"
**Fix:**
- Check `.env` file exists in `wisper-reseller-api/` folder
- Restart your server after creating `.env`

### Error: "Unauthorized" (401)
**Fix:**
- API key might be wrong
- Check Autopilot dashboard for correct key
- Update `.env` file

### Error: "This data plan is currently not available"
**Fix:**
- Check plan_id exists in your database
- Verify plan size is supported (100MB-20GB)

---

## 🎯 Recommended Testing Order

1. ✅ Run `node test-autopilot.js` first
2. ✅ If all tests pass, try a real purchase with small amount
3. ✅ Check Autopilot dashboard for transaction
4. ✅ Verify data received on phone
5. ✅ If successful, integration is complete!

---

## 📞 Support

If tests fail:
- Check console logs for detailed errors
- Verify API key in Autopilot dashboard
- Ensure sufficient balance in Autopilot wallet
- Contact Autopilot support via Skype
