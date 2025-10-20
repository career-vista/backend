# CareerVista AI Backend Deployment Guide

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare backend for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign up with GitHub
   - Click "New Project" and import your backend repository
   - Configure environment variables in Vercel dashboard
   - Deploy!

3. **Environment Variables to Add in Vercel**:
   ```
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   OPENAI_API_KEY=your-openai-api-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   NODE_ENV=production
   ```

### Option 2: Railway

1. **Push to GitHub** (same as above)
2. **Go to [railway.app](https://railway.app)**
3. **Connect GitHub repository**
4. **Add environment variables**
5. **Deploy**

### Option 3: Render

1. **Push to GitHub** (same as above)
2. **Go to [render.com](https://render.com)**
3. **Create new web service**
4. **Connect GitHub repository**
5. **Add environment variables**
6. **Deploy**

## After Deployment

1. **Update CORS Configuration**:
   - Replace `yourusername.github.io` in `src/index.ts` with your actual GitHub Pages URL
   - Redeploy the backend

2. **Update Frontend Configuration**:
   - Update your frontend's API base URL to point to your deployed backend
   - Example: `https://your-backend.vercel.app/api`

3. **Test the Connection**:
   - Visit your deployed backend URL
   - Test API endpoints
   - Verify frontend can connect to backend

## Environment Variables Checklist

- [ ] MONGODB_URI (MongoDB Atlas connection string)
- [ ] JWT_SECRET (Strong secret key)
- [ ] GOOGLE_CLIENT_ID (Google OAuth)
- [ ] GOOGLE_CLIENT_SECRET (Google OAuth)
- [ ] OPENAI_API_KEY (Optional, for AI features)
- [ ] EMAIL_USER (For OTP emails)
- [ ] EMAIL_PASS (App password for email)
- [ ] NODE_ENV=production

## Troubleshooting

1. **CORS Errors**: Update the CORS origins in `src/index.ts`
2. **Database Connection**: Ensure MongoDB Atlas allows connections from all IPs (0.0.0.0/0)
3. **Environment Variables**: Double-check all required env vars are set in your deployment platform

## Security Notes

- Never commit `.env` file to GitHub
- Use strong, unique JWT secret
- Enable MongoDB Atlas IP whitelist in production
- Use app passwords for email authentication