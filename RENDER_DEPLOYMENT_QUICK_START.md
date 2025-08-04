# 🚀 Quick Start: Deploy to Render (24/7)

## ⚡ 5-Minute Setup

### 1. **Push to GitHub**
```bash
git add .
git commit -m "Add Render deployment files"
git push origin main
```

### 2. **Go to Render Dashboard**
- Visit: https://dashboard.render.com
- Sign up/Login
- Click "New +" → "Web Service"

### 3. **Connect Repository**
- Connect your GitHub account
- Select your repository
- Choose branch: `main`

### 4. **Configure Service**
- **Name**: `kampuskart-backend`
- **Root Directory**: `S72_Gaurav_Capstone/backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 5. **Set Environment Variables**
Go to Environment tab and add:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password_or_app_password
ADMIN_EMAILS=admin@example.com
```

### 6. **Advanced Settings**
- **Health Check Path**: `/api/health`
- **Plan**: Choose "Starter" ($7/month) for 24/7
- **Auto-Deploy**: Enable

### 7. **Deploy!**
- Click "Create Web Service"
- Wait for build to complete
- Your server will be live at: `https://your-app-name.onrender.com`

## 🔧 Update Frontend

Update your frontend config:
```javascript
// frontend/src/config.js
export const API_BASE = 'https://your-app-name.onrender.com';
```

## ✅ Verify Deployment

1. **Health Check**: Visit `/api/health`
2. **Test API**: Try a few endpoints
3. **Check Logs**: Monitor in Render dashboard

## 💰 Cost
- **Free Plan**: 750 hours/month (testing)
- **Starter Plan**: $7/month (24/7 operation)
- **Standard Plan**: $25/month (better performance)

## 🆘 Need Help?
- **Detailed Guide**: See `DEPLOYMENT_GUIDE.md`
- **Render Docs**: https://render.com/docs
- **Support**: https://render.com/support

---

## 🎉 Your server is now running 24/7! 