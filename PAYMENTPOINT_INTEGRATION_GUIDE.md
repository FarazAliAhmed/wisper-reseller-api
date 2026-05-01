# PaymentPoint Integration Guide

## Overview
This guide explains how to integrate and use PaymentPoint for wallet funding in the Wisper Reseller API.

## Features
- ✅ Virtual account creation for each user
- ✅ Automatic wallet crediting via webhooks
- ✅ Transaction history tracking
- ✅ Admin manual credit/debit functions
- ✅ Processing fee deduction (₦50 per transaction)
- ✅ Multiple bank account support

## Setup Instructions

### 1. Get PaymentPoint Credentials
1. Sign up at [https://www.paymentpoint.co](https://www.paymentpoint.co)
2. Navigate to your dashboard
3. Get your API Key and Secret Key
4. Copy your webhook URL: `https://your-domain.com/api/paymentpoint/webhook`

### 2. Configure Environment Variables
Add these to your `.env` file:

```env
PAYMENTPOINT_BASE_URL=https://api.paymentpoint.co
PAYMENTPOINT_API_KEY=your_api_key_here
PAYMENTPOINT_SECRET_KEY=your_secret_key_here
```

### 3. Set Up Webhook on PaymentPoint Dashboard
1. Go to PaymentPoint Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/paymentpoint/webhook`
3. Select events: `payment.successful`
4. Save webhook configuration

### 4. Database Schema Updates
The integration automatically creates a new collection: `paymentpointhistories`

No manual database changes required.

## API Endpoints

### User Endpoints

#### 1. Create Virtual Account
```http
POST /api/paymentpoint/create-account
Authorization: Bearer {user_token}
Content-Type: application/json

{
  "accountName": "John Doe",
  "bvn": "22222222222",  // Optional
  "nin": "12345678901"   // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Virtual account created successfully",
  "data": {
    "account_reference": "user_id_here",
    "accounts": [
      {
        "bankName": "Wema Bank",
        "accountNumber": "1234567890",
        "accountName": "John Doe"
      }
    ]
  }
}
```

#### 2. Get Account Details
```http
GET /api/paymentpoint/account-details
Authorization: Bearer {user_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "account_reference": "user_id_here",
    "status": "active",
    "accounts": [...]
  }
}
```

#### 3. Get Transaction History
```http
GET /api/paymentpoint/history?limit=50
Authorization: Bearer {user_token}
```

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "...",
      "business_name": "John Doe",
      "amount": 4950,
      "payment_ref": "PP-TXN-123456",
      "date_of_payment": "2026-05-01T10:30:00Z",
      "payment_status": "successful"
    }
  ]
}
```

### Admin Endpoints

#### 1. Manual Credit
```http
POST /api/paymentpoint/admin/credit
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "business_id": "user_id_here",
  "amount": 5000,
  "reason": "Bonus credit"
}
```

#### 2. Manual Debit
```http
POST /api/paymentpoint/admin/debit
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "business_id": "user_id_here",
  "amount": 1000,
  "reason": "Refund reversal"
}
```

#### 3. Get User Transaction History
```http
GET /api/paymentpoint/admin/history/{userId}?limit=100
Authorization: Bearer {admin_token}
```

### Webhook Endpoint

#### Payment Notification
```http
POST /api/paymentpoint/webhook
Content-Type: application/json
X-PaymentPoint-Signature: {signature}

{
  "transaction_reference": "PP-TXN-123456",
  "account_reference": "user_id_here",
  "amount": 5000,
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "payment_date": "2026-05-01T10:30:00Z",
  "status": "successful",
  "bank_name": "Wema Bank",
  "account_number": "1234567890"
}
```

## How It Works

### 1. Account Creation Flow
```
User → Frontend → POST /api/paymentpoint/create-account
                ↓
         PaymentPoint API
                ↓
         Virtual Account Created
                ↓
         Account Details Saved to DB
                ↓
         User sees bank account details
```

### 2. Payment Flow
```
User transfers money to virtual account
                ↓
         PaymentPoint receives payment
                ↓
         PaymentPoint sends webhook
                ↓
         POST /api/paymentpoint/webhook
                ↓
         Verify transaction (not duplicate)
                ↓
         Deduct ₦50 processing fee
                ↓
         Credit user wallet
                ↓
         Save transaction history
                ↓
         User sees updated balance
```

### 3. Processing Fee
- Every deposit has a ₦50 processing fee
- If user deposits ₦5,000, they receive ₦4,950
- Fee is automatically deducted in webhook processing
- Minimum deposit: ₦51 (to credit at least ₦1)

## Frontend Integration

### 1. Add to Navigation Menu
Update `wisper-dashboard/src/layouts/Sidebar.js`:

```javascript
{
  title: "PaymentPoint Wallet",
  href: "/paymentpointWallet",
  icon: "bi bi-wallet2",
},
```

### 2. Access PaymentPoint Wallet
Navigate to: `/paymentpointWallet`

### 3. Component Usage
```javascript
import PaymentPointHistory from "../components/PaymentPointHistory";

function MyComponent() {
  return <PaymentPointHistory />;
}
```

## Testing

### 1. Test Account Creation
```bash
curl -X POST https://your-domain.com/api/paymentpoint/create-account \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Test User"
  }'
```

### 2. Test Webhook (Local)
```bash
curl -X POST http://localhost:5000/api/paymentpoint/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_reference": "TEST-123",
    "account_reference": "USER_ID_HERE",
    "amount": 5000,
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "status": "successful",
    "bank_name": "Test Bank",
    "account_number": "1234567890"
  }'
```

### 3. Verify Wallet Credit
Check user's balance in database or via API:
```bash
curl -X GET https://your-domain.com/api/paymentpoint/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Security Best Practices

### 1. Webhook Signature Verification
The service includes signature verification:
```javascript
const isValid = paymentpointService.verifyWebhookSignature(webhookData, signature);
```

### 2. Duplicate Transaction Prevention
```javascript
const existingTransaction = await paymentpointHistory.findOne({
  payment_ref: transaction_reference,
});
```

### 3. Environment Variables
Never commit `.env` file to version control.

## Troubleshooting

### Issue: Virtual Account Not Created
**Solution:**
- Check API credentials in `.env`
- Verify PaymentPoint API is accessible
- Check server logs for error messages

### Issue: Webhook Not Received
**Solution:**
- Verify webhook URL is publicly accessible
- Check PaymentPoint dashboard webhook configuration
- Test webhook endpoint manually
- Check server logs

### Issue: Wallet Not Credited
**Solution:**
- Check webhook payload in logs
- Verify transaction reference is unique
- Check if payment status is "successful"
- Verify user's balance record exists

### Issue: Wrong Amount Credited
**Solution:**
- Verify processing fee calculation (₦50)
- Check webhook payload amount field
- Review transaction history in database

## Database Collections

### paymentpointhistories
```javascript
{
  business_name: String,
  business_id: ObjectId,
  amount: Number,
  resolvedAmount: Number,
  new_bal: String,
  old_bal: Number,
  purpose: String,
  desc: String,
  bankAccountNum: String,
  bank: String,
  pay_type: String, // "credit" or "debit"
  date_of_payment: Date,
  payment_ref: String, // Unique
  payment_status: String, // "pending", "successful", "failed"
  metadata: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

### accounts (Updated)
```javascript
{
  // ... existing fields
  paymentpointAccounts: [
    {
      bankName: String,
      accountNumber: String,
      accountName: String
    }
  ],
  paymentpointAccountReference: String
}
```

## Support

For issues or questions:
1. Check server logs: `pm2 logs` or `railway logs`
2. Review PaymentPoint documentation: https://paymentpoint.gitbook.io/paymentpoint.co
3. Contact PaymentPoint support for API issues
4. Check this guide for common solutions

## Changelog

### Version 1.0.0 (May 2026)
- Initial PaymentPoint integration
- Virtual account creation
- Webhook processing
- Transaction history
- Admin functions
- Frontend components
