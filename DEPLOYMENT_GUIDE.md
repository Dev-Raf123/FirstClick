# Deploy FirstClick to Vercel

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Supabase project set up
- All environment variables ready

## Step 1: Prepare Your Repository

1. **Commit all changes:**
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

2. **Verify `.gitignore` includes:**
```
.env
.env.local
.vercel
node_modules
```

## Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** (leave default)
   - **Output Directory:** (leave default)

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Step 3: Configure Environment Variables

In Vercel dashboard → Your Project → Settings → Environment Variables

Add these variables for **Production**, **Preview**, and **Development**:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

### Where to find these values:

**Supabase:**
- Go to your Supabase project
- Settings → API
- Copy URL and anon key
- Copy service_role key (keep this secret!)

**Cloudinary:**
- Go to cloudinary.com dashboard
- Copy Cloud Name
- Settings → Upload → Upload Presets → Copy preset name

**Site URL:**
- Your Vercel deployment URL
- Or your custom domain

## Step 4: Supabase Configuration

Update Supabase authentication settings:

1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Add your Vercel URL to:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** 
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/auth/confirm`

## Step 5: Run Database Migrations

Execute these SQL scripts in Supabase SQL Editor (in order):

1. **create_user_designs.sql**
2. **add_equipped_design.sql**
3. **add_platform_column.sql**
4. **add_onboarding_column.sql**

Or run them all at once:

```sql
-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

## Step 6: Post-Deployment Checks

### Test These Features:

✅ **Landing page loads**
- Visit your Vercel URL
- Check hero section displays
- Verify images load
- Test navigation links

✅ **Authentication**
- Sign up with email
- Check email confirmation
- Log in
- Log out

✅ **Dashboard**
- Dashboard loads after login
- Can navigate tabs
- No console errors

✅ **Create Project**
- Platform selection works
- Can proceed to details
- Project creates successfully
- Success screen shows

✅ **Trending Page**
- Loads without errors
- Cards display correctly
- Handles empty state

✅ **Library Page**
- Shows design library
- Can preview designs

✅ **Onboarding**
- Shows for new users
- Can be completed/skipped
- Doesn't show again

## Step 7: Custom Domain (Optional)

1. Buy domain (e.g., firstclick.com)
2. In Vercel → Settings → Domains
3. Add your domain
4. Update nameservers or add DNS records
5. Wait for DNS propagation (up to 48 hours)

Update environment variables:
```env
NEXT_PUBLIC_SITE_URL=https://firstclick.com
```

Update Supabase redirect URLs with new domain.

## Step 8: Performance Optimization

### Enable Analytics
```bash
# In your project
npm install @vercel/analytics

# Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Speed Insights (Optional)
```bash
npm install @vercel/speed-insights

# Add to app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
```

## Step 9: Monitoring

### Set up Error Tracking (Optional)

**Sentry:**
```bash
npm install @sentry/nextjs

# Follow setup wizard
npx @sentry/wizard -i nextjs
```

### Monitor Vercel Logs
- Vercel Dashboard → Your Project → Logs
- Real-time error tracking
- Performance metrics

## Troubleshooting

### Build Fails
```bash
# Test build locally first
npm run build

# Check for:
# - TypeScript errors
# - Missing dependencies
# - Environment variable usage
```

### Authentication Issues
- Verify Supabase URLs in environment variables
- Check redirect URLs match exactly
- Ensure service role key is set

### Images Not Loading
- Check Cloudinary environment variables
- Verify public folder images exist
- Check Next.js Image optimization settings

### Database Errors
- Run migrations in Supabase
- Verify RLS policies are set
- Check user_settings table exists

### Hydration Errors
- Check for server/client mismatch
- Verify "use client" directives
- Look for date/time formatting issues

## Rollback Procedure

If something goes wrong:

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click ••• → "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

## Continuous Deployment

Every push to `main` branch will auto-deploy:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically deploys
```

Create a staging environment:
```bash
# Deploy to preview
git checkout -b staging
git push origin staging

# Vercel creates preview deployment
```

## Environment-Specific Settings

**Production:**
- Use production Supabase project
- Enable error tracking
- Use CDN for images

**Preview/Staging:**
- Use separate Supabase project (optional)
- Enable debug logging
- Test new features

## Security Checklist

- [ ] All secrets in environment variables
- [ ] No API keys in code
- [ ] RLS enabled on all tables
- [ ] Auth redirects configured
- [ ] CORS properly configured
- [ ] Rate limiting (if needed)

## Final Launch Commands

```bash
# Final commit
git add .
git commit -m "🚀 Launch FirstClick"
git push origin main

# Verify deployment
open https://your-app.vercel.app

# Monitor logs
vercel logs --follow
```

---

## Post-Launch Maintenance

### Weekly
- Check error logs
- Monitor performance metrics
- Review user feedback
- Plan feature updates

### Monthly
- Review costs (Vercel, Supabase, Cloudinary)
- Update dependencies
- Security audits
- Backup database

### As Needed
- Scale database (if needed)
- Upgrade Vercel plan (if needed)
- Optimize images
- Add features

---

🎉 **Congratulations!** Your app is now live!

Monitor: https://vercel.com/dashboard
Status: https://vercel-status.com
Docs: https://vercel.com/docs
