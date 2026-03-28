# API Testing Guide for Railway Deployment

## ✅ Your API is WORKING! 

The Railway logs show:
- ✅ Server running on PORT: 5000
- ✅ Connected to DB
- ✅ Plans loaded

The "Cannot GET" error is because you're trying to access POST endpoints with GET requests.

---

## 🔍 How to Test Your API Properly

### 1. Health Check (Browser OK ✅)
```
GET https://web-production-a07e9.up.railway.app/
```
**Expected Response:**
```json
{"status": "healthy"}
```

### 2. Get All Plans (Browser OK ✅)
```
GET https://web-production-a07e9.up.railway.app/api/plans
```
**Expected Response:** Array of all available data plans

---

## 🚫 Common Mistakes

### ❌ WRONG: Testing Login in Browser
```
https://web-production-a07e9.up.railway.app/api/auth
```
**Result:** "Cannot GET /api/auth" - Because login is POST, not GET!

### ❌ WRONG: Testing Buy in Browser
```
https://web-production-a07e9.up.railway.app/api/buy
```
**Result:** "Cannot GET /api/buy" - Because buy is POST, not GET!

---

## ✅ How to Test POST Endpoints (Use Postman)

### Login Endpoint
**Method:** POST  
**URL:** `https://web-production-a07e9.up.railway.app/api/auth`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "email": "your_email@example.com",
  "password": "your_password"
}
```

### Buy Data Endpoint
**Method:** POST  
**URL:** `https://web-production-a07e9.up.railway.app/api/buy`  
**Headers:**
```
Content-Type: application/json
Authorization: YOUR_API_KEY_HERE
```
**Body (raw JSON):**
```json
{
  "network": "mtn",
  "phone": "08012345678",
  "plan_id": "52",
  "bypass": false
}
```

---

## 📱 How to Get Your API Key

1. Login to your dashboard at: https://wisper-dashboard.vercel.app
2. Go to **Settings** → **Developer**
3. Copy your API key
4. Use it in the `Authorization` header for API requests

---

## 🧪 Quick Postman Test Steps

1. Open Postman
2. Create new request
3. Set method to **POST**
4. Enter URL: `https://web-production-a07e9.up.railway.app/api/auth`
5. Go to **Headers** tab, add:
   - Key: `Content-Type`
   - Value: `application/json`
6. Go to **Body** tab:
   - Select **raw**
   - Select **JSON** from dropdown
   - Enter your login credentials
7. Click **Send**

---

## 📊 Available Endpoints

### Public Endpoints (No Auth Required)
- `GET /` - Health check
- `GET /api/plans` - Get all plans
- `POST /api/auth` - Login
- `POST /api/users` - Register
- `POST /api/forgot_password` - Forgot password

### Protected Endpoints (Require API Key)
- `POST /api/buy` - Purchase data
- `GET /api/balance` - Check balance
- `GET /api/transactions` - Get transactions
- `GET /api/wallet` - Get wallet balance

---

## 🎯 Summary

**Your API is working perfectly!** The issue is just testing method:

- ✅ Browser: Use for GET endpoints only (`/`, `/api/plans`)
- ✅ Postman: Use for POST endpoints (`/api/auth`, `/api/buy`)
- ❌ Browser: Cannot test POST endpoints (will show "Cannot GET")

**Railway URL:** `https://web-production-a07e9.up.railway.app`  
**Frontend URL:** `https://wisper-dashboard.vercel.app`  
**Status:** Both are properly connected! ✅
