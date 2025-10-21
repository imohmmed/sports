# دليل رفع AlAli Sport على VPS عن طريق Termux

## 📋 المتطلبات الأساسية

قبل البدء، تأكد من توفر:
- ✅ VPS يعمل على Ubuntu/Debian
- ✅ صلاحيات SSH للوصول للـ VPS
- ✅ Termux مثبت على جهازك

---

## 🚀 الخطوات الكاملة

### الخطوة 1️⃣: تحميل الكود من Replit

في Replit، افتح Shell واكتب:

```bash
# إنشاء أرشيف لكل ملفات المشروع
tar -czf alali-sport.tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  --exclude=attached_assets \
  .
```

بعدها حمل الملف `alali-sport.tar.gz` من Replit Files

---

### الخطوة 2️⃣: رفع الملف على VPS

**في Termux على جهازك:**

```bash
# الاتصال بالـ VPS (استبدل المعلومات بمعلوماتك)
ssh root@YOUR_VPS_IP

# أو إذا عندك username محدد
ssh your_username@YOUR_VPS_IP
```

**بعد الدخول للـ VPS:**

```bash
# إنشاء مجلد للمشروع
mkdir -p /var/www/alali-sport
cd /var/www/alali-sport

# نقل الملف من جهازك للـ VPS
# (افتح Termux جديد وأكتب)
scp alali-sport.tar.gz root@YOUR_VPS_IP:/var/www/alali-sport/

# الرجوع للـ VPS وفك الضغط
cd /var/www/alali-sport
tar -xzf alali-sport.tar.gz
```

---

### الخطوة 3️⃣: تثبيت المتطلبات على VPS

```bash
# تحديث النظام
apt update && apt upgrade -y

# تثبيت Node.js v20 (مطلوب)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# تثبيت PostgreSQL
apt install -y postgresql postgresql-contrib

# التأكد من التثبيت
node -v    # يجب يطلع v20.x.x
npm -v     # يجب يطلع 10.x.x
psql --version  # يجب يطلع PostgreSQL 14+
```

---

### الخطوة 4️⃣: إعداد قاعدة البيانات PostgreSQL

```bash
# بدء خدمة PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# الدخول لـ PostgreSQL
sudo -u postgres psql

# داخل PostgreSQL، أنشئ قاعدة البيانات والمستخدم
CREATE DATABASE alali_sport;
CREATE USER alali_user WITH PASSWORD 'كلمة_سر_قوية_هنا';
GRANT ALL PRIVILEGES ON DATABASE alali_sport TO alali_user;
\q

# للخروج اضغط Ctrl+D أو اكتب \q
```

---

### الخطوة 5️⃣: إعداد متغيرات البيئة

```bash
cd /var/www/alali-sport

# إنشاء ملف .env
cat > .env << 'EOF'
# قاعدة البيانات
DATABASE_URL=postgresql://alali_user:كلمة_سر_قوية_هنا@localhost:5432/alali_sport

# مفتاح الجلسة (غيره لمفتاح عشوائي قوي)
SESSION_SECRET=your-super-secret-key-change-this-to-random-string

# بيئة العمل
NODE_ENV=production

# المنفذ (Port)
PORT=5000
EOF
```

**⚠️ مهم جداً:**
- غيّر `كلمة_سر_قوية_هنا` بكلمة سر قوية
- غيّر `SESSION_SECRET` لنص عشوائي طويل

---

### الخطوة 6️⃣: تثبيت المكتبات

```bash
cd /var/www/alali-sport

# تثبيت جميع المكتبات المطلوبة
npm install

# قد تأخذ 2-5 دقائق
```

---

### الخطوة 7️⃣: إعداد الجداول في قاعدة البيانات

```bash
# تطبيق الـ Schema على قاعدة البيانات
npm run db:push
```

---

### الخطوة 8️⃣: إضافة بيانات القنوات

```bash
# تشغيل السيرفر مؤقتاً
npm run dev &

# الانتظار 10 ثواني
sleep 10

# إضافة قنوات بي ان سبورت
curl -X POST http://localhost:5000/api/seed-sports

# إضافة القنوات الإخبارية
curl -X POST http://localhost:5000/api/seed-news

# إيقاف السيرفر المؤقت
pkill -f "tsx server/index.ts"
```

---

### الخطوة 9️⃣: بناء التطبيق للإنتاج

```bash
cd /var/www/alali-sport

# بناء Frontend و Backend
npm run build

# يجب تظهر رسالة نجاح
```

---

### الخطوة 🔟: تشغيل التطبيق

#### أ) تشغيل عادي (للاختبار):

```bash
npm start

# الموقع الآن يعمل على http://YOUR_VPS_IP:5000
# للإيقاف: Ctrl+C
```

#### ب) تشغيل دائم باستخدام PM2 (مُوصى به):

```bash
# تثبيت PM2
npm install -g pm2

# تشغيل التطبيق
pm2 start dist/index.js --name alali-sport

# التأكد من العمل
pm2 status

# جعل PM2 يعمل تلقائياً عند إعادة تشغيل السيرفر
pm2 startup
pm2 save
```

**أوامر PM2 المفيدة:**
```bash
pm2 logs alali-sport    # عرض اللوجز
pm2 restart alali-sport # إعادة تشغيل
pm2 stop alali-sport    # إيقاف
pm2 delete alali-sport  # حذف من PM2
```

---

### الخطوة 1️⃣1️⃣: إعداد Nginx (Reverse Proxy)

```bash
# تثبيت Nginx
apt install -y nginx

# إنشاء ملف التكوين
cat > /etc/nginx/sites-available/alali-sport << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN.COM;  # أو YOUR_VPS_IP

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # زيادة الـ timeout للبث المباشر
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF

# تفعيل التكوين
ln -s /etc/nginx/sites-available/alali-sport /etc/nginx/sites-enabled/

# حذف التكوين الافتراضي
rm /etc/nginx/sites-enabled/default

# اختبار التكوين
nginx -t

# إعادة تشغيل Nginx
systemctl restart nginx
systemctl enable nginx
```

---

### الخطوة 1️⃣2️⃣: إعداد SSL (اختياري - مُوصى به)

```bash
# تثبيت Certbot
apt install -y certbot python3-certbot-nginx

# الحصول على شهادة SSL (استبدل بـ domain الخاص بك)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# التجديد التلقائي
certbot renew --dry-run
```

---

### الخطوة 1️⃣3️⃣: إعداد Firewall

```bash
# السماح بـ HTTP و HTTPS و SSH
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# تفعيل Firewall
ufw enable

# التحقق
ufw status
```

---

## 🎉 الموقع الآن يعمل!

افتح المتصفح واذهب إلى:
- **بدون Domain**: `http://YOUR_VPS_IP`
- **مع Domain**: `http://yourdomain.com`
- **مع SSL**: `https://yourdomain.com`

---

## 🔧 صيانة وإدارة

### تحديث التطبيق:

```bash
cd /var/www/alali-sport

# إيقاف التطبيق
pm2 stop alali-sport

# سحب التحديثات (أو رفع ملف جديد)
# ... رفع الكود الجديد ...

# إعادة تثبيت المكتبات (إذا تغيرت)
npm install

# إعادة البناء
npm run build

# تشغيل التطبيق
pm2 restart alali-sport
```

### مراقبة الأداء:

```bash
# عرض استخدام الموارد
pm2 monit

# عرض اللوجز المباشرة
pm2 logs alali-sport --lines 100
```

### نسخ احتياطي لقاعدة البيانات:

```bash
# إنشاء نسخة احتياطية
pg_dump -U alali_user alali_sport > backup-$(date +%Y%m%d).sql

# استعادة النسخة الاحتياطية
psql -U alali_user alali_sport < backup-20250121.sql
```

---

## ⚠️ استكشاف الأخطاء

### إذا الموقع ما يفتح:

```bash
# تحقق من حالة التطبيق
pm2 status
pm2 logs alali-sport

# تحقق من Nginx
systemctl status nginx
nginx -t

# تحقق من PostgreSQL
systemctl status postgresql

# تحقق من المنفذ
netstat -tlnp | grep 5000
```

### إذا قاعدة البيانات ما تشتغل:

```bash
# تحقق من الاتصال
psql -U alali_user -d alali_sport -h localhost

# تحقق من .env
cat .env | grep DATABASE_URL
```

---

## 📞 معلومات مهمة

- **المنفذ الافتراضي**: 5000
- **قاعدة البيانات**: PostgreSQL على localhost:5432
- **ملفات اللوجز**: يمكن عرضها عبر `pm2 logs`
- **ملفات التطبيق**: `/var/www/alali-sport`

---

## ✅ الخلاصة السريعة

```bash
# 1. تحميل الكود
tar -czf alali-sport.tar.gz --exclude=node_modules .

# 2. رفعه للـ VPS
scp alali-sport.tar.gz root@VPS_IP:/var/www/alali-sport/

# 3. على VPS
cd /var/www/alali-sport
tar -xzf alali-sport.tar.gz
npm install
npm run db:push
npm run build

# 4. تشغيل
pm2 start dist/index.js --name alali-sport
pm2 save
```

---

**🎯 كل شيء جاهز! الموقع الآن يعمل على VPS الخاص بك**

إذا واجهت أي مشكلة، تحقق من اللوجز:
```bash
pm2 logs alali-sport
```
