# 🚀 دليل نشر AlAli Sport على VPS

## ⚠️ ملاحظات مهمة قبل البدء

### 1. **مشكلة Replit Auth**
- **Replit Auth يعمل فقط على Replit** ولن يعمل على VPS خارجي
- **الحلول البديلة:**
  - استخدام Passport.js مع Google OAuth
  - استخدام Email/Password تقليدي
  - استخدام Auth0 أو Clerk

### 2. **متطلبات VPS**
- Ubuntu 22.04 أو 24.04
- على الأقل 2GB RAM
- 20GB مساحة تخزين
- IP عام (Public IP)
- اسم نطاق (Domain) - اختياري لكن موصى به

---

## 📋 خطوات التثبيت الكاملة

### الخطوة 1️⃣: الاتصال بـ VPS

```bash
ssh root@YOUR_VPS_IP
# أو إذا كان لديك مستخدم آخر:
ssh your_user@YOUR_VPS_IP
```

---

### الخطوة 2️⃣: تحديث النظام وتثبيت الأدوات الأساسية

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت الأدوات الأساسية
sudo apt install -y git curl build-essential ufw
```

---

### الخطوة 3️⃣: تثبيت Node.js 20 LTS

```bash
# إضافة مصدر Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# تثبيت Node.js
sudo apt install -y nodejs

# التحقق من التثبيت
node -v  # يجب أن يظهر v20.x.x
npm -v   # يجب أن يظهر v10.x.x
```

---

### الخطوة 4️⃣: تثبيت PostgreSQL

```bash
# تثبيت PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# بدء الخدمة
sudo systemctl start postgresql
sudo systemctl enable postgresql

# التحقق من التشغيل
sudo systemctl status postgresql
```

#### إنشاء قاعدة البيانات والمستخدم

```bash
# الدخول إلى PostgreSQL
sudo -u postgres psql

# داخل PostgreSQL، قم بتشغيل:
CREATE DATABASE alalisport;
CREATE USER alalisport_user WITH PASSWORD 'YOUR_STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE alalisport TO alalisport_user;

# للنسخ الحديثة من PostgreSQL (15+):
\c alalisport postgres
GRANT ALL ON SCHEMA public TO alalisport_user;

# الخروج
\q
```

---

### الخطوة 5️⃣: رفع الكود إلى VPS

#### الطريقة الأولى: باستخدام Git (موصى بها)

```bash
# إنشاء مجلد للمشروع
sudo mkdir -p /var/www/alalisport
cd /var/www/alalisport

# استنساخ المشروع من Replit
# خيار 1: إذا كان المشروع على GitHub
git clone https://github.com/YOUR_USERNAME/alalisport.git .

# خيار 2: تحميل الملفات يدوياً (انظر الطريقة الثانية)
```

#### الطريقة الثانية: رفع الملفات يدوياً

على جهازك المحلي:
```bash
# على Replit، قم بتصدير المشروع:
# 1. اضغط على الثلاث نقاط
# 2. اختر "Download as zip"
# 3. قم بفك الضغط

# رفع الملفات إلى VPS باستخدام SCP
scp -r /path/to/alalisport root@YOUR_VPS_IP:/var/www/alalisport
```

---

### الخطوة 6️⃣: تثبيت Dependencies

```bash
cd /var/www/alalisport

# تثبيت dependencies
npm install

# بناء الـ Frontend
npm run build
```

---

### الخطوة 7️⃣: إعداد Environment Variables

```bash
# إنشاء ملف .env
nano .env
```

أضف المتغيرات التالية:

```env
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://alalisport_user:YOUR_STRONG_PASSWORD_HERE@localhost:5432/alalisport
PGHOST=localhost
PGPORT=5432
PGDATABASE=alalisport
PGUSER=alalisport_user
PGPASSWORD=YOUR_STRONG_PASSWORD_HERE

# Session Secret (قم بتوليد واحد عشوائي قوي)
SESSION_SECRET=YOUR_RANDOM_SESSION_SECRET_HERE

# ⚠️ IMPORTANT: Authentication
# Replit Auth لن يعمل هنا!
# ستحتاج لإعداد OAuth بديل (انظر ملاحظات المصادقة أدناه)
```

لتوليد session secret عشوائي:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### الخطوة 8️⃣: تشغيل Database Migrations

```bash
# تشغيل migrations لإنشاء الجداول
npm run db:push
```

---

### الخطوة 9️⃣: تثبيت PM2 (Process Manager)

```bash
# تثبيت PM2 عالمياً
sudo npm install -g pm2

# بدء التطبيق
pm2 start npm --name "alalisport" -- run dev

# للتشغيل في production mode:
pm2 start npm --name "alalisport" -- start

# حفظ قائمة العمليات
pm2 save

# إعداد PM2 للتشغيل التلقائي عند إعادة التشغيل
pm2 startup
# قم بنسخ ولصق الأمر الذي سيظهر وتشغيله
```

#### أوامر PM2 المفيدة:

```bash
pm2 list              # عرض جميع التطبيقات
pm2 logs alalisport   # عرض السجلات
pm2 restart alalisport # إعادة تشغيل التطبيق
pm2 stop alalisport   # إيقاف التطبيق
pm2 monit             # مراقبة حية
```

---

### الخطوة 🔟: تثبيت وإعداد Nginx

```bash
# تثبيت Nginx
sudo apt install -y nginx

# بدء الخدمة
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### إنشاء ملف تكوين Nginx:

```bash
sudo nano /etc/nginx/sites-available/alalisport
```

أضف التكوين التالي:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN.com;  # أو YOUR_VPS_IP
    
    # Increase upload size for video streaming
    client_max_body_size 100M;
    
    # Main application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for streaming
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Websocket support (if needed)
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

#### تفعيل الموقع:

```bash
# إنشاء رابط رمزي
sudo ln -s /etc/nginx/sites-available/alalisport /etc/nginx/sites-enabled/

# اختبار التكوين
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl restart nginx
```

---

### الخطوة 1️⃣1️⃣: إعداد Firewall

```bash
# السماح بـ SSH (مهم جداً!)
sudo ufw allow 22/tcp
sudo ufw allow OpenSSH

# السماح بـ HTTP و HTTPS
sudo ufw allow 'Nginx Full'

# تفعيل Firewall
sudo ufw enable

# التحقق من الحالة
sudo ufw status
```

---

### الخطوة 1️⃣2️⃣: إضافة SSL/HTTPS (اختياري لكن موصى به جداً)

```bash
# تثبيت Certbot
sudo apt install -y certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d YOUR_DOMAIN.com -d www.YOUR_DOMAIN.com

# اختبار التجديد التلقائي
sudo certbot renew --dry-run
```

---

## 🔐 تغيير نظام المصادقة

### المشكلة:
Replit Auth يعمل فقط داخل بيئة Replit ولن يعمل على VPS.

### الحلول:

#### الحل 1: استخدام Google OAuth

1. أنشئ مشروع على [Google Cloud Console](https://console.cloud.google.com/)
2. فعّل Google+ API
3. أنشئ OAuth 2.0 credentials
4. أضف redirect URI: `http://YOUR_DOMAIN.com/api/auth/google/callback`

عدّل `server/replitAuth.ts`:

```typescript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    // هنا تحفظ أو تجلب المستخدم من قاعدة البيانات
    const user = await storage.getOrCreateUser({
      id: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName
    });
    return done(null, user);
  }
));
```

أضف إلى `.env`:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### الحل 2: استخدام Email/Password

قم بتثبيت:
```bash
npm install bcrypt
```

أنشئ نظام تسجيل بسيط مع email/password.

---

## 📦 سكريبت Deployment سريع

أنشئ ملف `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# الانتقال إلى مجلد المشروع
cd /var/www/alalisport

# جلب آخر التحديثات
echo "📥 Pulling latest code..."
git pull origin main

# تثبيت dependencies
echo "📦 Installing dependencies..."
npm install

# بناء Frontend
echo "🏗️ Building frontend..."
npm run build

# إعادة تشغيل التطبيق
echo "🔄 Restarting application..."
pm2 restart alalisport

echo "✅ Deployment completed!"
```

اجعل السكريبت قابل للتنفيذ:
```bash
chmod +x deploy.sh
```

الآن يمكنك التحديث بأمر واحد:
```bash
./deploy.sh
```

---

## 🐛 استكشاف الأخطاء

### التطبيق لا يعمل:

```bash
# تحقق من حالة PM2
pm2 list
pm2 logs alalisport

# تحقق من حالة Nginx
sudo systemctl status nginx
sudo nginx -t

# تحقق من البورت
netstat -tuln | grep 5000

# تحقق من قاعدة البيانات
sudo -u postgres psql -d alalisport
```

### خطأ 502 Bad Gateway:

1. تأكد من تشغيل التطبيق: `pm2 list`
2. تأكد من تطابق البورت في Nginx وتطبيقك
3. تحقق من السجلات: `pm2 logs alalisport`

### مشاكل قاعدة البيانات:

```bash
# إعادة تشغيل PostgreSQL
sudo systemctl restart postgresql

# التحقق من الاتصال
psql -U alalisport_user -d alalisport -h localhost
```

---

## 📊 المراقبة والصيانة

### النسخ الاحتياطي لقاعدة البيانات:

```bash
# نسخة احتياطية يدوية
sudo -u postgres pg_dump alalisport > backup_$(date +%Y%m%d).sql

# استعادة من نسخة احتياطية
sudo -u postgres psql alalisport < backup_20250120.sql
```

### النسخ الاحتياطي التلقائي (Cron):

```bash
crontab -e
```

أضف:
```
0 2 * * * sudo -u postgres pg_dump alalisport > /backups/alalisport_$(date +\%Y\%m\%d).sql
```

---

## ✅ قائمة التحقق النهائية

- [ ] Node.js مثبت ويعمل
- [ ] PostgreSQL مثبت وقاعدة البيانات منشأة
- [ ] الكود مرفوع إلى `/var/www/alalisport`
- [ ] Dependencies مثبتة (`npm install`)
- [ ] Frontend مبني (`npm run build`)
- [ ] ملف `.env` منشأ بالمتغيرات الصحيحة
- [ ] Database migrations منفذة (`npm run db:push`)
- [ ] PM2 مثبت والتطبيق يعمل
- [ ] Nginx مثبت ومُعَد
- [ ] Firewall مُعَد (UFW)
- [ ] SSL مثبت (اختياري)
- [ ] نظام المصادقة تم تعديله من Replit Auth
- [ ] النسخ الاحتياطي التلقائي مُعَد

---

## 🆘 الدعم والمساعدة

إذا واجهت أي مشكلة:

1. **تحقق من السجلات:**
   ```bash
   pm2 logs alalisport
   sudo tail -f /var/log/nginx/error.log
   ```

2. **تحقق من الخدمات:**
   ```bash
   sudo systemctl status postgresql
   sudo systemctl status nginx
   pm2 list
   ```

3. **تحقق من المنافذ:**
   ```bash
   netstat -tuln | grep 5000
   ```

---

## 🎉 انتهى!

بعد اتباع جميع الخطوات، يجب أن يكون موقعك متاحاً على:
- `http://YOUR_VPS_IP` (أو `http://YOUR_DOMAIN.com`)
- `https://YOUR_DOMAIN.com` (إذا أضفت SSL)

**ملاحظة أخيرة:** لا تنسَ تعديل نظام المصادقة من Replit Auth إلى نظام آخر!
