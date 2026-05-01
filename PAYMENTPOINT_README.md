# PaymentPoint Integration

## Quick Start

### 1. Install Dependencies
```bash
cd wisper-reseller-api
npm install
```

### 2. Configure Environment
Add to `.env`:
```env
PAYMENTPOINT_BASE_URL=https://api.paymentpoint.co
PAYMENTPOINT_API_KEY=your_api_key_here
PAYMENTPOINT_SECRET_KEY=your_secret_key_here
```

### 3. Verify Setup
```bash
node setup-paymentpoint.js
```

### 4. Start Server
```bash
npm start
```

### 5. Configure Webhook
Set webhook URL on PaymentPoint dashboard:
```
https://your-domain.com/api/paymentpoint/webhook
```

## Features

✅ **Virtual Account Creation** - Each user gets dedicated bank accounts  
✅ **Automatic Crediting** - Wallet funded automatically via webhooks  
✅ **Transaction History** - Complete audit trail of all transactions  
✅ **Admin Controls** - Manual credit/debit functions  
✅ **Processing Fee** - Automatic ₦50 fee deduction  
✅ **Security** - Webhook signature verification  
✅ **Duplicate Prevention** - No double-crediting  

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/paymentpoint/create-account` | Create virtual account | User |
| GET | `/api/paymentpoint/account-details` | Get account details | User |
| GET | `/api/paymentpoint/history` | Get transaction history | User |
| POST | `/api/paymentpoint/webhook` | Receive payment notifications | Public |
| POST | `/api/paymentpoint/admin/credit` | Manual credit | Admin |
| POST | `/api/paymentpoint/admin/debit` | Manual debit | Admin |
| GET | `/api/paymentpoint/admin/history/:userId` | Get user history | Admin |

## Frontend Access

Navigate to: `/paymentpointWallet`

Or add to sidebar navigation:
```javascript
{
  title: "PaymentPoint Wallet",
  href: "/paymentpointWallet",
  icon: "bi bi-wallet2",
}
```

## Testing

### Test Account Creation
```bash
curl -X POST http://localhost:5000/api/paymentpoint/create-account \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"accountName": "Test User"}'
```

### Test Webhook
```bash
curl -X POST http://localhost:5000/api/paymentpoint/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_reference": "TEST-123",
    "account_reference": "USER_ID",
    "amount": 5000,
    "customer_name": "Test User",
    "status": "successful"
  }'
```

## Documentation

See [PAYMENTPOINT_INTEGRATION_GUIDE.md](./PAYMENTPOINT_INTEGRATION_GUIDE.md) for complete documentation.

## Code Quality

✅ **Clean Code** - Well-structured, commented, and maintainable  
✅ **Error Handling** - Comprehensive try-catch blocks  
✅ **Logging** - Detailed console logs for debugging  
✅ **Validation** - Input validation on all endpoints  
✅ **Security** - Signature verification and duplicate prevention  
✅ **Documentation** - JSDoc comments on all functions  

## Support

- Check logs: `pm2 logs` or `railway logs`
- Review [PAYMENTPOINT_INTEGRATION_GUIDE.md](./PAYMENTPOINT_INTEGRATION_GUIDE.md)
- PaymentPoint docs: https://paymentpoint.gitbook.io/paymentpoint.co

## License

MIT
