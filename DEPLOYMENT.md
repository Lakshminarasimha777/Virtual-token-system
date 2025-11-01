# Online Fee Payment Queue Management System - Netlify Deployment

## 🚀 Netlify Deployment Guide

This system is ready for deployment on Netlify with full client-side functionality using localStorage.

### 📁 Files Required for Deployment

All files in this directory should be uploaded to Netlify:

```
/
├── index.html              # Main landing page
├── user-register.html      # Student registration
├── user-login.html         # Student login
├── user-dashboard.html     # Student dashboard
├── admin-login.html        # Admin login  
├── admin-dashboard.html    # Admin dashboard
├── styles.css              # All styling
├── queue-manager.js        # Shared queue management
├── auth.js                 # User authentication
├── user-dashboard.js       # Student dashboard logic
├── admin-auth.js           # Admin authentication  
├── admin-dashboard.js      # Admin dashboard logic
├── _redirects              # Netlify routing rules
└── netlify.toml            # Netlify configuration
```

### 🔧 Deployment Steps

1. **Prepare Files**: Ensure all files are in the deployment folder
2. **Upload to Netlify**: 
   - Drag and drop the entire folder to Netlify
   - OR connect to GitHub repository
3. **Configure**: No server-side configuration needed
4. **Test**: Verify all functionality works on live site

### 🌐 Live URL Structure

```
https://your-site.netlify.app/                    # Home page
https://your-site.netlify.app/user-register.html  # Registration  
https://your-site.netlify.app/user-login.html     # Student login
https://your-site.netlify.app/admin-login.html    # Admin login
```

### 🔐 Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

### 💾 Data Storage

- Uses browser localStorage (client-side)
- No database required
- Data persists per browser/device
- Clear browser data to reset system

### 🧪 Testing Checklist

- [ ] Student registration works
- [ ] Student login opens dashboard in new tab
- [ ] Token request and queue position updates
- [ ] Admin login opens dashboard in new tab  
- [ ] Admin can notify/complete/delete requests
- [ ] Real-time position updates work
- [ ] Logout functionality works for both portals
- [ ] Responsive design on mobile devices

### 📱 Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox  
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

### 🚨 Important Notes

1. **Data Persistence**: Data is stored locally per browser
2. **Cross-Device**: Users need to use same browser/device  
3. **Admin Access**: Remember default credentials
4. **Notifications**: Allow browser notifications for best experience
5. **Security**: For production, implement server-side authentication

### 🔄 Auto-Refresh Features

- User dashboard: Updates every 3 seconds
- Admin dashboard: Updates every 10 seconds  
- Position notifications: Real-time
- Queue statistics: Live updates

---

**Deployment Date**: November 2025  
**Version**: 1.0.0  
**Technology**: HTML5, CSS3, Vanilla JavaScript  
**Hosting**: Netlify Static Site