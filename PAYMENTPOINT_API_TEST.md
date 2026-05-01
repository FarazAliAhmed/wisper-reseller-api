# PaymentPoint API Test - Postman Style

## REQUEST

### Method & URL
```
POST https://api.paymentpoint.co/api/v1/createVirtualAccount
```

### Headers
```
Content-Type: application/json
Authorization: Bearer da5c65024d96f819b4ab61cf3861b386973694d4cd9d9f50beb38f8436f47766953ab6d232125f742da11608c0558af8aa85f9d5e214d596409b3c30
api-key: 5961ed06a5718fa07f9c72a5c7fc789a010620b1
```

### Body (JSON)
```json
{
  "email": "test@example.com",
  "name": "Test User",
  "phoneNumber": "09057790907",
  "bankCode": [
    "20946",
    "20897"
  ],
  "businessId": "71e885f182ed5ea4454ef5e1d7e9a2ec40d1b36"
}
```

---

## RESPONSE

### Status
```
403 Forbidden
```

### Headers
```
Connection: Keep-Alive
Keep-Alive: timeout=5, max=100
Cache-Control: no-cache, private
Content-Type: application/json
Access-Control-Allow-Origin: *
Access-Control-Expose-Headers: Content-Disposition
Content-Length: 48
Date: Fri, 01 May 2026 19:06:29 GMT
Server: LiteSpeed
```

### Body (JSON)
```json
{
  "status": "fail",
  "message": "Invalid businessId"
}
```

---

## SUMMARY

**What We're Hitting:**
- API Endpoint: `https://api.paymentpoint.co/api/v1/createVirtualAccount`
- Method: `POST`
- Authentication: Bearer Token + API Key (both provided)

**What We're Sending:**
- Valid JSON payload with all required fields
- Business ID: `71e885f182ed5ea4454ef5e1d7e9a2ec40d1b36`
- Phone Number: `09057790907`
- Bank Codes: Palmpay (20946) and others (20897)

**What We're Getting:**
- HTTP Status: `403 Forbidden`
- Error Message: `"Invalid businessId"`
- Status: `"fail"`

**The Problem:**
The PaymentPoint API is rejecting the business ID. This means the business ID is either:
1. Not registered in PaymentPoint's system
2. Not activated for virtual account creation
3. Belongs to a different PaymentPoint account

**Action Required:**
Contact PaymentPoint support to verify and activate the correct business ID for virtual account creation.
