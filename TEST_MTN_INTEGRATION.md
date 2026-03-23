# How to Verify MTN Data Transfer Integration

## 🔍 Verification Methods

### Method 1: Check API Logs (Recommended First Step)

1. **Start your API server:**
   ```bash
   cd wisper-reseller-api
   npm start
   # or
   node server.js
   ```

2. **Watch the console logs** - You should see:
   - No errors about missing `AUTOPILOT_API_KEY`
   - Server starting successfully

---

### Method 2: Test with Postman/cURL

#### Step 1: Get Your Access Token

**Login Endpoint:**
```bash
POST {{API_URL}}/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

**Response will contain:**
```json
{
  "access_token": "your_token_here"
}
```

#### Step 2: Test MTN Data Purchase

**Endpoint:** `POST {{API_URL}}/buy`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body:**
```json
{
  "network": "mtn",
  "plan_id": YOUR_PLAN_ID,
  "phone_number": "08012345678"
}
```

**Example cURL Command:**
```bash
curl --location --request POST 'https://web-production-a07e9.up.railway.app/buy' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
--data-raw '{
  "network": "mtn",
  "plan_id": 52,
  "phone_number": "08166000000"
}'
```

#### Expected Success Response:
```json
{
  "status": "success",
  "transaction_ref": "unique_reference",
  "phone_number": "08166000000",
  "network": "mtn",
  "plan_type": "data",
  "size": "1GB",
  "new_balance": 5000,
  "gateway_response": "You have successfully gifted 1GB to 08166000000",
  "message": "Transaction Successful!"
}
```

#### Expected Error Response (if something is wrong):
```json
{
  "error": true,
  "status": "failed",
  "message": "An error occured with data transfer server"
}
```

---

### Method 3: Check Console Logs During Purchase

When a purchase is made, you should see these logs:

**✅ GOOD LOGS (Success):**
```
AUTOPILOT REQUEST: {
  req_body: {
    networkId: '1',
    dataType: 'DATA TRANSFER',
    planId: 'MTN_DT_1GB',
    phone: '08166000000',
    reference: '202403230945...'
  },
  url: 'https://autopilotng.com/api/live/v1/data'
}
TRYING TO PURCHASE MTN DATA TRANSFER VIA AUTOPILOT
AUTOPILOT RESPONSE: {
  response: {
    status: true,
    code: 200,
    data: {
      message: 'You have successfully gifted 1GB to 08166000000'
    }
  }
}
MTN DATA TRANSFER SUCCESSFUL
```

**❌ BAD LOGS (Error):**
```
AUTOPILOT ERROR: {
  error: 'Unauthorized',
  status: 401
}
```
This means API key is wrong or missing.

---

### Method 4: Direct Autopilot API Test

Test the Autopilot API directly to verify credentials:

```bash
curl --location --request POST 'https://autopilotng.com/api/live/v1/load/wallet-balance' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer live_3c29d7292692b4b738d8f6bfffe13293enpwkaq58' \
--data-raw '{
  "email": "your_autopilot_email@example.com"
}'
```

**Expected Response:**
```json
{
  "status": true,
  "code": 200,
  "data": {
    "product": {
      "wallet": "82318.60"
    }
  }
}
```

If this fails, your API key might be wrong or expired.

---

### Method 5: Check Available MTN Data Plans

Test if you can fetch MTN Data Transfer plans:

```bash
curl --location --request POST 'https://autopilotng.com/api/live/v1/load/data-types' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer live_3c29d7292692b4b738d8f6bfffe13293enpwkaq58' \
--data-raw '{
  "networkId": "1"
}'
```

**Expected Response:**
```json
{
  "status": true,
  "code": 200,
  "data": {
    "product": [
      {
        "network": "MTN",
        "networkId": 1,
        "name": "SME"
      },
      {
        "network": "MTN",
        "networkId": 1,
        "name": "DATA TRANSFER"
      },
      {
        "network": "MTN",
        "networkId": 1,
        "name": "CORPORATE GIFTING"
      }
    ]
  }
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Unauthorized" Error
**Cause:** API key is wrong or missing
**Solution:** 
- Check `.env` file has correct API key
- Restart your server after adding `.env`

### Issue 2: "This data plan is currently not available"
**Cause:** Plan size not mapped in `networkData.js`
**Solution:** 
- Check the plan size matches one of: 100MB, 200MB, 500MB, 1GB, 2GB, 3GB, 5GB, 10GB, 15GB, 20GB
- Add more sizes if needed in `autopilot_mtn_size_map` function

### Issue 3: "Network Provider and Phone Number do not match"
**Cause:** Phone number doesn't start with MTN prefix
**Solution:** 
- Use MTN numbers starting with: 0803, 0806, 0703, 0706, 0813, 0816, 0810, 0814, 0903, 0906, 0913, 0916

### Issue 4: Server crashes on startup
**Cause:** Missing environment variables
**Solution:**
- Ensure `.env` file exists in `wisper-reseller-api/` folder
- Check all required variables are set

---

## ✅ Quick Verification Checklist

- [ ] `.env` file exists with `AUTOPILOT_API_KEY` and `AUTOPILOT_URL`
- [ ] Server starts without errors
- [ ] Can login and get access token
- [ ] Can make test purchase with MTN number
- [ ] Console shows "AUTOPILOT REQUEST" and "MTN DATA TRANSFER SUCCESSFUL"
- [ ] Transaction saved in database
- [ ] User balance deducted correctly
- [ ] Autopilot dashboard shows the transaction

---

## 📊 Test Data

**Test MTN Numbers (use your own):**
- 08030000000
- 08060000000
- 07030000000

**Test Plan IDs (check your database for actual IDs):**
- Small plan: 500MB
- Medium plan: 1GB
- Large plan: 5GB

**Test Amount:**
- Start with small amounts to avoid losing money during testing

---

## 🎯 Success Indicators

Your integration is working if:
1. ✅ No errors in console logs
2. ✅ Transaction status is "success"
3. ✅ User balance is deducted
4. ✅ Transaction saved in database
5. ✅ Autopilot dashboard shows the transaction
6. ✅ Recipient receives the data (check on actual MTN number)

---

## 📞 Need Help?

If verification fails:
1. Check all console logs for errors
2. Verify API key is correct in Autopilot dashboard
3. Ensure Autopilot account has sufficient balance
4. Check network connectivity to Autopilot servers
5. Review the implementation files for any typos

**Autopilot Support:** Contact via Skype (check their dashboard for Skype ID)
