# Cloudflare Pages Deployment Guide

This guide will help you deploy your resume website to Cloudflare Pages with dynamic weather and visitor functionality.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Domain** (optional): You can use a custom domain or Cloudflare's free subdomain

## Step 1: Prepare Your Repository

Your repository structure should look like this:
```
resume-master/
├── functions/
│   └── api/
│       ├── weather.js
│       ├── visitors.js
│       └── news.js
├── js/
│   └── api-client.js
├── img/
├── index.html
├── testimonials.html
├── _headers
└── other files...
```

## Step 2: Deploy to Cloudflare Pages

### Option A: Deploy via Cloudflare Dashboard

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to "Pages" in the sidebar

2. **Create New Project**
   - Click "Create a project"
   - Choose "Connect to Git"
   - Select your GitHub repository
   - Choose the `resume-master` branch

3. **Configure Build Settings**
   - **Project name**: `your-resume-site` (or your preferred name)
   - **Production branch**: `main` (or your default branch)
   - **Framework preset**: `None` (we're using static files)
   - **Build command**: Leave empty
   - **Build output directory**: Leave empty (root directory)
   - **Root directory**: Leave empty

4. **Environment Variables** (Optional)
   - If you want to use KV for visitor counting:
     - Go to Settings → Environment variables
     - Add `VISITOR_COUNTER` with your KV namespace ID

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for the build to complete

### Option B: Deploy via Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Deploy**
   ```bash
   cd resume-master
   wrangler pages deploy . --project-name=your-resume-site
   ```

## Step 3: Configure KV Namespace (Optional)

For persistent visitor counting:

1. **Create KV Namespace**
   ```bash
   wrangler kv:namespace create "VISITOR_COUNTER"
   ```

2. **Add to Pages Project**
   - Go to your Pages project settings
   - Navigate to "Environment variables"
   - Add `VISITOR_COUNTER` with your KV namespace ID

## Step 4: Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to your Pages project settings
   - Navigate to "Custom domains"
   - Click "Set up a custom domain"
   - Enter your domain name

2. **DNS Configuration**
   - Add a CNAME record pointing to your Pages URL
   - Or use Cloudflare's DNS proxy

## Step 5: Verify Deployment

Your site should now be live at:
- `https://your-resume-site.pages.dev` (Cloudflare subdomain)
- Or your custom domain

### Test the Dynamic Features

1. **Weather Widget**: Should display current Chicago weather
2. **Visitor Counter**: Should show and increment visitor count
3. **News Widget**: Should display industry news from RSS feeds

## API Endpoints

Your site now has these API endpoints:

- `https://your-site.com/api/weather` - Current weather data
- `https://your-site.com/api/visitors` - Visitor counter
- `https://your-site.com/api/news` - Industry news

## Troubleshooting

### Common Issues

1. **Functions Not Working**
   - Check that your `functions/` directory is in the root
   - Verify the function files export `onRequest`
   - Check the deployment logs for errors

2. **CORS Errors**
   - Ensure `_headers` file is in the root directory
   - Verify the CORS headers are properly set

3. **Visitor Counter Not Working**
   - Check if KV namespace is properly configured
   - Verify environment variable name matches code

4. **Weather API Failing**
   - The weather API uses a free service (wttr.in)
   - Check browser console for network errors
   - Fallback data will be shown if API fails

### Debug Steps

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests

2. **Test API Endpoints**
   - Visit `https://your-site.com/api/weather` directly
   - Should return JSON weather data

3. **Check Deployment Logs**
   - In Cloudflare Dashboard → Pages → Your Project → Deployments
   - Check for build errors

## Performance Optimization

1. **Caching**: Static assets are cached for 1 year
2. **CDN**: Cloudflare's global CDN serves your content
3. **Functions**: Serverless functions run at the edge
4. **Images**: Optimize images for web use

## Security

- Security headers are automatically applied
- CORS is properly configured for API endpoints
- No sensitive data is exposed

## Monitoring

1. **Analytics**: Available in Cloudflare Dashboard
2. **Function Logs**: Check in Pages → Functions
3. **Performance**: Monitor in Cloudflare Analytics

## Cost

- **Pages**: Free for personal projects
- **Functions**: Free tier includes 100,000 requests/day
- **KV**: Free tier includes 100,000 reads/day

## Support

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Functions Documentation](https://developers.cloudflare.com/workers/platform/functions/)
- [Community Forum](https://community.cloudflare.com/)

---

Your resume website is now live with dynamic weather and visitor functionality! The site will automatically update weather data and track visitors using Cloudflare's edge infrastructure. 