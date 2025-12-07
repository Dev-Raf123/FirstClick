
# Paddle Integration Removed

As of the recent refactor, the Paddle payment integration and the Flex Store have been removed from the project.
If you need to restore payment support in the future, refer to previous commits or reach out to maintainers for guidance.

### 1. Package Installation
- ✅ Installed `@paddle/paddle-js` for client-side checkout

### 2. Configuration Files
- ✅ Created `lib/paddle/client.ts` - Paddle SDK initialization
- ✅ Added Paddle environment variables to `.env.local`
- ✅ Created database migration for `user_designs` table

### 3. Database Schema
The `user_designs` table tracks purchases:
- `user_id` - References authenticated user
- `design_id` - The flex card design ID
- `transaction_id` - Paddle transaction reference
- `price_paid` - Amount paid
- RLS policies enabled for security

### 4. Flex Store Features
- ✅ Purchase buttons with Paddle checkout
- ✅ "Owned" badge for purchased designs
- ✅ Free designs can be selected instantly
- ✅ Loading states during purchase

### 5. Webhook Handler
- ✅ Created `app/api/paddle-webhook/route.ts`
- ✅ Verifies webhook signatures
- ✅ Automatically saves purchases to database

## Next Steps to Go Live:

### 1. Set Up Paddle Account
1. Sign up at https://vendors.paddle.com/
2. Complete business verification
3. Get your Vendor ID from Settings → Developer Tools

### 2. Update Environment Variables
Replace placeholder values in `.env.local`:
```env
NEXT_PUBLIC_PADDLE_VENDOR_ID=your_actual_vendor_id
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox  # Use 'production' when ready
PADDLE_API_KEY=your_actual_api_key
PADDLE_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Create Products in Paddle Dashboard
For each paid design, create a product with these IDs:
- `price_chrome-metal` - Chrome Metal ($7.99)
- `price_gold-metal` - Gold Metal ($9.99)
- `price_frosted-glass` - Frosted Glass ($8.99)
- `price_aurora-glass` - Aurora Glass ($12.99)
- `price_carbon-fiber` - Carbon Fiber ($9.99)
- `price_holographic` - Holographic ($14.99)
- `price_neon-glass` - Neon Glass ($10.99)
- `price_rose-gold` - Rose Gold ($9.99)

### 4. Configure Webhook in Paddle
1. Go to Developer Tools → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/paddle-webhook`
3. Copy the webhook secret to `.env.local`
4. Subscribe to: `transaction.completed`

### 5. Run Database Migration
Execute the SQL in `supabase/migrations/create_user_designs.sql` in your Supabase SQL editor

### 6. Test in Sandbox Mode
1. Use Paddle's test card numbers
2. Verify purchases appear in database
3. Check "Owned" badges display correctly

### 7. Go to Production
1. Change `NEXT_PUBLIC_PADDLE_ENVIRONMENT=production`
2. Update webhook URL to production domain
3. Test with real payment methods

This file is retained as a historical reference for the project but the payment integration itself is disabled and the related code has been removed.
