# دليل سريع - رفع الموقع من Termux

## 📱 خطوات سريعة للرفع من Termux

### 1️⃣ في Replit - تجهيز الملف

افتح Shell في Replit:

```bash
tar -czf alali-sport.tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  .
```

ثم حمل الملف `alali-sport.tar.gz`

---

### 2️⃣ في Termux - رفع الملف

```bash
# الاتصال بالـ VPS
ssh root@YOUR_VPS_IP

# أو
ssh username@YOUR_VPS_IP
```

بعد الدخول:

```bash
# تثبيت Node.js و PostgreSQL
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs postgresql postgresql-contrib nginx

# إنشاء المجلد
mkdir -p /var/www/alali-sport
cd /var/www/alali-sport
```

---

### 3️⃣ نقل الملف من جهازك

**افتح Termux جديد** (Session ثانية):

```bash
# انسخ الملف للـ VPS
scp alali-sport.tar.gz root@YOUR_VPS_IP:/var/www/alali-sport/
```

---

### 4️⃣ في VPS - فك الضغط والإعداد

```bash
cd /var/www/alali-sport
tar -xzf alali-sport.tar.gz

# إعداد PostgreSQL
systemctl start postgresql
sudo -u postgres psql -c "CREATE DATABASE alali_sport;"
sudo -u postgres psql -c "CREATE USER alali_user WITH PASSWORD 'قوي123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE alali_sport TO alali_user;"

# إنشاء .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://alali_user:قوي123@localhost:5432/alali_sport
SESSION_SECRET=change-this-to-random-long-string
NODE_ENV=production
PORT=5000
EOF

# تثبيت وبناء
npm install
npm run db:push
npm run build

# تشغيل مع PM2
npm install -g pm2
pm2 start dist/index.js --name alali-sport
pm2 save
pm2 startup
```

---

### 5️⃣ إعداد Nginx

```bash
cat > /etc/nginx/sites-available/alali-sport << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/alali-sport /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

---

### 6️⃣ إضافة القنوات

```bash
# بعد التشغيل
sleep 5
curl -X POST http://localhost:5000/api/seed-sports
curl -X POST http://localhost:5000/api/seed-news
```

---

## ✅ الموقع جاهز!

افتح المتصفح: `http://YOUR_VPS_IP`

---

## 🔧 أوامر مفيدة

```bash
# عرض الحالة
pm2 status

# عرض اللوجز
pm2 logs alali-sport

# إعادة التشغيل
pm2 restart alali-sport

# إيقاف
pm2 stop alali-sport
```

---

## 📋 ملاحظات

- **المنفذ**: 5000
- **المتصفح**: `http://VPS_IP`
- **اللوجز**: `pm2 logs alali-sport`

---

**🎉 انتهى! الموقع يعمل على VPS**
