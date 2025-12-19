# Secure Tracking API Implementation

## What Changed

### ✅ Security Improvements

1. **No More Exposed Supabase Keys** - Tracking snippet no longer contains API keys
2. **Server-Side Validation** - All data validated before insertion
3. **Rate Limiting** - Max 100 visits per project per minute
4. **Input Sanitization** - Prevents XSS and SQL injection
5. **Project Verification** - Ensures project exists before tracking
6. **Smaller Snippet** - No Supabase CDN dependency

### 📁 Files Modified

- `app/api/track/route.ts` - New secure API endpoint
- `app/dashboard/SnippetBox.tsx` - Updated tracking snippet
- `supabase/migrations/secure_page_visits_insert.sql` - RLS policy updates

## Deployment Steps

### Step 1: Run Supabase Migration

In your Supabase SQL Editor, run:

```sql
-- Drop the old public INSERT policies
DROP POLICY IF EXISTS "Allow insert for anon" ON "public"."page_visits";
DROP POLICY IF EXISTS "Allow public insert on page_visits" ON "public"."page_visits";
```

### Step 2: Deploy to Vercel/Production

```bash
git add .
git commit -m "Implement secure tracking API with validation and rate limiting"
git push origin main
```

### Step 3: Test the New Tracking

1. Copy the new tracking snippet from your dashboard
2. Add it to a test website
3. Visit the test website
4. Check your FirstClick dashboard - visits should appear
5. Verify in browser console - no errors should appear

### Step 4: Update Existing Snippets (Important!)

⚠️ **Old tracking snippets will STOP WORKING after you run the SQL migration!**

Users who already copied the old snippet will need to:
1. Go to their dashboard
2. Copy the new snippet
3. Replace the old snippet on their websites

## How It Works

### Old Flow (Insecure):
```
Website → Supabase (direct) → page_visits table
```
- Exposed API keys
- No validation
- No rate limiting
- Vulnerable to spam

### New Flow (Secure):
```
Website → /api/track → Validation → Rate Limit Check → Supabase → page_visits table
```
- No exposed keys
- Validates project exists
- Sanitizes input
- Rate limited (100/min per project)
- Server-side only

## Rate Limiting

Current limit: **100 visits per project per minute**

To adjust, edit `app/api/track/route.ts`:

```typescript
// Change this number:
if (count && count > 100) {  // <- Adjust here
```

## Monitoring

Check your API logs in Vercel dashboard for:
- Rate limit violations (429 errors)
- Invalid project IDs (404 errors)
- Validation failures (400 errors)

## Rollback (If Needed)

If something breaks, you can temporarily restore public INSERT:

```sql
CREATE POLICY "Temporary allow public insert"
ON "public"."page_visits"
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
```

Then investigate and fix the issue before removing it again.
