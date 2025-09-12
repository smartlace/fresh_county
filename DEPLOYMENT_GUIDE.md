# 🚀 Complete FreshCounty Application Deployment Guide for Bluehost

## 📋 **Prerequisites & Requirements**

### Bluehost Plan Requirements
- **Recommended**: VPS or Dedicated Server (Node.js applications)
- **Alternative**: Shared hosting with Node.js support (limited functionality)
- **Domain**: Your domain pointed to Bluehost
- **SSL Certificate**: Enable SSL for production security

### Local Preparation Checklist
- ✅ All code committed and tested locally
- ✅ Database schema and data ready
- ✅ Environment variables documented
- ✅ Production configurations prepared

---

## 🗄️ **Phase 1: Database Setup**

### 1.1 Create MySQL Database

**Via Bluehost cPanel:**
1. Login to Bluehost cPanel
2. Navigate to **"MySQL Databases"**
3. Create database: `freshcounty_prod`
4. Create database user: `freshcounty_user`
5. Set strong password and note it down
6. Add user to database with **ALL PRIVILEGES**

### 1.2 Import Database Schema

**Upload your schema file:**
```bash
# Use phpMyAdmin in cPanel or MySQL command line
# Import this file: /database/active-fc-database.sql
```

**Via phpMyAdmin:**
1. Access phpMyAdmin from cPanel
2. Select your database
3. Go to **Import** tab
4. Upload `/database/active-fc-database.sql`
5. Execute import

### 1.3 Database Connection Details
Note these details for backend configuration:
```
DB_HOST=localhost (usually)
DB_NAME=freshcounty_prod
DB_USER=freshcounty_user
DB_PASSWORD=[your_password]
DB_PORT=3306
```

---

## 🖥️ **Phase 2: Backend API Deployment**

### 2.1 Prepare Production Environment Variables

Create `.env` file in backend directory:
```env
# Database Configuration
DB_HOST=localhost
DB_NAME=freshcounty_prod
DB_USER=freshcounty_user
DB_PASSWORD=your_secure_password
DB_PORT=3306

# Server Configuration
NODE_ENV=production
PORT=3001
API_BASE_URL=https://yourdomain.com/api

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_token_secret_different_from_jwt
JWT_EXPIRE_TIME=1h
JWT_REFRESH_EXPIRE_TIME=7d

# Email Configuration (using your email provider)
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_email_password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Fresh County

# Redis Configuration (if available)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Session Configuration
SESSION_SECRET=your_session_secret_minimum_32_characters

# Upload Configuration
UPLOAD_PATH=/home/yourusername/public_html/uploads
MAX_FILE_SIZE=5242880

# CORS Configuration
FRONTEND_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com
```

### 2.2 Upload Backend Files

**Via File Manager or FTP:**
1. Create directory: `/home/yourusername/api/` 
2. Upload entire `/backend` folder contents
3. Upload `.env` file to backend root
4. Set appropriate file permissions:
   ```bash
   chmod 644 .env
   chmod -R 755 src/
   chmod -R 755 uploads/
   ```

### 2.3 Install Dependencies

**Via SSH Terminal (if available):**
```bash
cd /home/yourusername/api
npm ci --production
npm run build
```

**Alternative: Upload node_modules (not recommended):**
- If no SSH access, build locally and upload `dist/` folder

### 2.4 Configure Node.js Application

**In Bluehost cPanel:**
1. Go to **"Node.js"** section
2. Create new Node.js app:
   - **App URL**: `api.yourdomain.com` or `/api`
   - **App Root**: `/home/yourusername/api`
   - **App URI**: `api`
   - **Node.js Version**: 18.x or higher
   - **Application startup file**: `dist/index.js`

### 2.5 Setup Process Manager

**Create ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'freshcounty-api',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M'
  }]
}
```

---

## 🌐 **Phase 3: Frontend Deployment**

### 3.1 Configure Production Environment

**Update `.env.production`:**
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_ENVIRONMENT=production
NODE_ENV=production
```

### 3.2 Build Frontend Application

**Locally prepare the build:**
```bash
cd /frontend
npm ci
npm run build
npm run export  # If using static export
```

### 3.3 Deploy Frontend Files

**Option 1: Static Build (Recommended for Shared Hosting)**
1. Upload `out/` or `.next/` folder to `/public_html/`
2. Configure `.htaccess` for Next.js routing:

```apache
RewriteEngine On

# Handle Next.js static files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Security headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Cache optimization
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

**Option 2: Full Next.js Deployment (VPS/Dedicated)**
```bash
# Upload entire frontend folder
cd /home/yourusername/frontend
npm ci --production
npm run build
pm2 start ecosystem.config.js
```

---

## 👨‍💼 **Phase 4: Admin Panel Deployment**

### 4.1 Setup Admin Subdomain

**In Bluehost cPanel:**
1. Go to **"Subdomains"**
2. Create subdomain: `admin.yourdomain.com`
3. Point to `/home/yourusername/admin/`

### 4.2 Configure Admin Environment

**Create `.env.production`:**
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com/api
NEXT_PUBLIC_APP_NAME=Fresh County Admin
NEXT_PUBLIC_ENV=production
NODE_ENV=production
```

### 4.3 Build and Deploy Admin

**Build locally:**
```bash
cd /admin-react
npm ci
npm run build
```

**Deploy files:**
1. Upload `out/` or `.next/` folder to `/home/yourusername/admin/`
2. Configure admin-specific `.htaccess`:

```apache
RewriteEngine On

# Admin panel security
RewriteCond %{REQUEST_METHOD} ^(TRACE|DELETE) [NC]
RewriteRule .* - [F]

# Admin routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d  
RewriteRule ^(.*)$ /index.html [L]

# Enhanced security for admin
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set Referrer-Policy strict-origin-when-cross-origin
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"

# Admin IP restriction (optional - replace with your IP)
# Require ip 123.456.789.0
```

---

## 🔒 **Phase 5: Security & SSL Configuration**

### 5.1 Enable SSL Certificate

**In Bluehost cPanel:**
1. Go to **"SSL/TLS"**
2. Enable SSL for:
   - `yourdomain.com` (frontend)
   - `admin.yourdomain.com` (admin panel)
   - `api.yourdomain.com` (if separate subdomain)

### 5.2 Configure Security Headers

**Add to main `.htaccess`:**
```apache
# Security Headers
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set X-XSS-Protection "1; mode=block"

# Hide server information
ServerTokens Prod
Header unset X-Powered-By
```

### 5.3 Database Security

**Secure MySQL:**
1. Change default MySQL port if possible
2. Restrict database access to localhost
3. Use strong passwords (minimum 16 characters)
4. Enable MySQL slow query log
5. Regular database backups

---

## ⚙️ **Phase 6: Domain & DNS Configuration**

### 6.1 DNS Records Setup

**Configure these DNS records:**
```
A Record: yourdomain.com → [Bluehost IP]
CNAME: admin.yourdomain.com → yourdomain.com
CNAME: www.yourdomain.com → yourdomain.com
MX Records: [Email routing if needed]
```

### 6.2 URL Redirects

**Configure redirects in cPanel:**
- `www.yourdomain.com` → `https://yourdomain.com` (301 redirect)
- Force HTTPS redirects for all domains

---

## 🧪 **Phase 7: Testing & Verification**

### 7.1 Functionality Testing

**Test these features:**
- ✅ User registration/login
- ✅ Product browsing and cart
- ✅ Admin panel access
- ✅ Order processing
- ✅ Email notifications
- ✅ File uploads
- ✅ Database connectivity

### 7.2 Performance Testing

**Check these metrics:**
- Page load times < 3 seconds
- API response times < 500ms
- Database query performance
- Image optimization
- CDN configuration (if available)

### 7.3 Security Testing

**Verify security measures:**
- SSL certificates working
- Admin panel MFA functioning
- CORS properly configured
- Security headers present
- No sensitive data exposed

---

## 🔄 **Phase 8: Maintenance & Monitoring**

### 8.1 Setup Monitoring

**Monitor these aspects:**
- Server uptime and performance
- Database performance and size
- Error logs and alerts
- SSL certificate expiration
- Security vulnerability scanning

### 8.2 Backup Strategy

**Implement regular backups:**
- Daily database backups
- Weekly full file backups
- Test restore procedures
- Off-site backup storage

### 8.3 Update Procedures

**Plan for regular updates:**
- Security patches
- Dependency updates
- Database schema changes
- Application feature updates

---

## 🚨 **Common Bluehost Deployment Issues & Solutions**

### Issue 1: Node.js Version Compatibility
**Solution:** Use Node.js 18.x or check Bluehost supported versions

### Issue 2: File Permissions
**Solution:** Set correct permissions:
```bash
chmod 755 directories
chmod 644 files
chmod 600 .env files
```

### Issue 3: Memory Limits
**Solution:** Optimize application and consider upgrading hosting plan

### Issue 4: Database Connection Limits
**Solution:** Implement connection pooling and optimize queries

---

## 📁 **Final Directory Structure**

```
/home/yourusername/
├── public_html/          # Main frontend (yourdomain.com)
│   ├── _next/
│   ├── static/
│   ├── uploads/
│   └── .htaccess
├── admin/                # Admin panel (admin.yourdomain.com)  
│   ├── _next/
│   ├── static/
│   └── .htaccess
├── api/                  # Backend API
│   ├── dist/
│   ├── uploads/
│   ├── .env
│   └── ecosystem.config.js
└── logs/                 # Application logs
```

## 🎯 **Deployment Checklist**

**Pre-Deployment:**
- [ ] Code tested locally
- [ ] Environment variables prepared
- [ ] Database schema ready
- [ ] SSL certificates planned
- [ ] Domain DNS configured

**During Deployment:**
- [ ] Database created and imported
- [ ] Backend deployed and configured
- [ ] Frontend built and deployed
- [ ] Admin panel deployed
- [ ] SSL certificates enabled
- [ ] Security headers configured

**Post-Deployment:**
- [ ] All functionality tested
- [ ] Performance verified
- [ ] Security measures confirmed
- [ ] Monitoring setup
- [ ] Backup procedures implemented
- [ ] Documentation updated

---

## 📞 **Support & Troubleshooting**

### Common Commands

**Backend Management:**
```bash
# Check application status
pm2 list

# Restart application
pm2 restart freshcounty-api

# View logs
pm2 logs freshcounty-api

# Monitor resources
pm2 monit
```

**File Permissions Fix:**
```bash
# Set correct permissions for web files
find /path/to/your/files -type d -exec chmod 755 {} \;
find /path/to/your/files -type f -exec chmod 644 {} \;
chmod 600 .env
```

**Database Backup:**
```bash
# Create database backup
mysqldump -u freshcounty_user -p freshcounty_prod > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u freshcounty_user -p freshcounty_prod < backup_file.sql
```

### Emergency Contacts
- **Bluehost Support**: Available 24/7 via cPanel or phone
- **Application Issues**: Check logs in `/logs/` directory
- **Database Issues**: Use phpMyAdmin or MySQL command line

---

**Estimated Deployment Time:** 4-8 hours (depending on hosting plan and complexity)

**Last Updated:** December 2024
**Application Version:** FreshCounty v1.0
**Node.js Version:** 18.x+
**Database:** MySQL 8.0+