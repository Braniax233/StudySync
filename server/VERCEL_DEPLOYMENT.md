# Vercel Deployment Guide for StudySync

## Overview

This guide will help you deploy your StudySync application to Vercel and resolve common deployment errors.

## Common Errors and Solutions

Based on the error codes you're seeing, you might be encountering one of these issues:

- **FUNCTION_INVOCATION_FAILED (Function500)**: The serverless function is failing to execute properly
- **NO_RESPONSE_FROM_FUNCTION (Function502)**: The function isn't responding within the time limit
- **FUNCTION_INVOCATION_TIMEOUT (Function504)**: The function is timing out

## Pre-Deployment Checklist

1. **Environment Variables**: Make sure all required environment variables are set in Vercel

   - MONGODB_URI (required for database connection)
   - JWT_SECRET (for authentication)
   - All API keys (Google Maps, YouTube, Google Books)

2. **Database Connection**: Ensure your MongoDB Atlas cluster allows connections from Vercel's IP addresses

   - Go to MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

3. **CORS Configuration**: Update the CORS settings in `api.js` to include your Vercel deployment URL

## Deployment Steps

1. **Install Vercel CLI** (optional but helpful for debugging)

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy your application**

   ```bash
   vercel
   ```

4. **Set Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from your `.env` file

## Troubleshooting

### Function Timeouts

If you're experiencing timeouts:

1. Check the `vercel.json` configuration - we've increased memory to 1024MB and maxDuration to 10 seconds
2. Optimize database queries that might be taking too long
3. Consider implementing caching for expensive operations

### Database Connection Issues

If the database connection is failing:

1. Verify your MONGODB_URI is correctly set in Vercel environment variables
2. Check MongoDB Atlas network access settings
3. Ensure your database user has the correct permissions

### API Routes Not Working

If API routes return 404 errors:

1. Make sure the routes in `vercel.json` are correctly configured
2. Check that all API endpoints are properly prefixed with `/api/`
3. Verify that the serverless function is correctly handling the routes

## Monitoring and Logs

To debug deployment issues:

1. Go to Vercel Dashboard → Your Project → Deployments → Select the latest deployment
2. Click on "Functions" to see the serverless functions
3. Click on a function to view its logs and performance metrics

## Additional Resources

- [Vercel Serverless Functions Documentation](https://vercel.com/docs/serverless-functions/introduction)
- [Troubleshooting Vercel Deployments](https://vercel.com/docs/error-handling)
- [MongoDB Atlas Connection Guide](https://docs.atlas.mongodb.com/connect-to-cluster/)
