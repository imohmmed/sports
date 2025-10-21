# 🚀 دليل تنصيب AlAli Sport على VPS عن طريق Termux

## 📱 المتطلبات

- ✅ VPS يعمل بنظام Ubuntu أو Debian
- ✅ Termux مثبت على جهازك
- ✅ معلومات الاتصال بالـ VPS (IP, Username, Password)

---

## 📋 الخطوات الكاملة بالتفصيل

### 🔥 المرحلة الأولى: تحميل ملفات المشروع من Replit

**1. في Replit، افتح Shell واكتب:**

```bash
# إنشاء ملف مضغوط لكل المشروع (بدون المجلدات الثقيلة)
tar -czf alali-sport.tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  --exclude=attached_assets/generated_images \
  --exclude=attached_assets/stock_images \
  .

# التأكد من إنشاء الملف
ls -lh alali-sport.tar.gz
```

**2. حمل الملف `alali-sport.tar.gz` من Replit:**
- اضغط على Files (الملفات) في Replit
- ابحث عن `alali-sport.tar.gz`
- اضغط عليه بالزر الأيمن → Download

**3. انقل الملف لجهازك:**
- انقل `alali-sport.tar.gz` لمجلد Download في جهازك

---

### 📱 المرحلة الثانية: تثبيت Termux وإعداده

**1. افتح Termux على جهازك:**

```bash
# تحديث Termux
pkg update && pkg upgrade -y

# تثبيت الأدوات الأساسية
pkg install -y openssh wget curl tar

# إعطاء صلاحيات الوصول للملفات
termux-setup-storage
```

**2. نقل الملف المضغوط لـ Termux:**

```bash
# الذهاب لمجلد التحميلات
cd ~/storage/downloads

# التأكد من وجود الملف
ls -lh alali-sport.tar.gz

# نسخ الملف لمجلد home في Termux
cp alali-sport.tar.gz ~/
cd ~
```

---

### 🌐 المرحلة الثالثة: الاتصال بالـ VPS ورفع الملف

**1. الاتصال بالـ VPS من Termux:**

```bash
# الاتصال (استبدل المعلومات بمعلوماتك)
ssh root@رقم_IP_للسيرفر

# مثال:
# ssh root@192.168.1.100
# أو
# ssh username@192.168.1.100
```

**ملاحظة:** 
- راح يطلب منك كلمة السر، اكتبها واضغط Enter
- إذا طلع لك سؤال `Are you sure (yes/no)?` اكتب `yes`

**2. بعد الدخول للـ VPS، سوي الخطوات التالية:**

```bash
# إنشاء مجلد للمشروع
mkdir -p /var/www/alali-sport

# إعطاء صلاحيات للمجلد
chmod 755 /var/www/alali-sport

# الخروج من VPS مؤقتاً
exit
```

**3. في Termux، ارفع الملف للـ VPS:**

```bash
# نقل الملف من Termux للـ VPS (استبدل IP_ADDRESS)
scp ~/alali-sport.tar.gz root@IP_ADDRESS:/var/www/alali-sport/

# مثال:
# scp ~/alali-sport.tar.gz root@192.168.1.100:/var/www/alali-sport/
```

**ملاحظة:** قد تأخذ من 1-5 دقائق حسب حجم الملف وسرعة الإنترنت

---

### ⚙️ المرحلة الرابعة: تثبيت المتطلبات على VPS

**1. الاتصال بالـ VPS مرة ثانية:**

```bash
ssh root@IP_ADDRESS
```

**2. تحديث النظام:**

```bash
# تحديث قائمة الحزم
apt update

# ترقية الحزم المثبتة
apt upgrade -y

# تثبيت الأدوات الأساسية
apt install -y curl wget git build-essential
```

**3. تثبيت Node.js النسخة 20:**

```bash
# إضافة مصدر Node.js الرسمي
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# تثبيت Node.js و npm
apt install -y nodejs

# التأكد من التثبيت
node -v     # يجب يطلع: v20.x.x
npm -v      # يجب يطلع: 10.x.x أو أعلى
```

**4. تثبيت PostgreSQL:**

```bash
# تثبيت PostgreSQL
apt install -y postgresql postgresql-contrib

# بدء خدمة PostgreSQL
systemctl start postgresql

# جعل PostgreSQL يعمل تلقائياً عند تشغيل السيرفر
systemctl enable postgresql

# التأكد من التثبيت
psql --version    # يجب يطلع: PostgreSQL 14.x أو أعلى
```

**5. تثبيت Nginx:**

```bash
# تثبيت Nginx
apt install -y nginx

# بدء خدمة Nginx
systemctl start nginx

# جعل Nginx يعمل تلقائياً
systemctl enable nginx

# التأكد من التثبيت
nginx -v    # يجب يطلع: nginx version
```

---

### 🗄️ المرحلة الخامسة: إعداد قاعدة البيانات

**1. إنشاء قاعدة بيانات ومستخدم:**

```bash
# الدخول لـ PostgreSQL كمستخدم postgres
sudo -u postgres psql

# الآن أنت داخل PostgreSQL، اكتب الأوامر التالية واحدة واحدة:
```

```sql
-- إنشاء قاعدة البيانات
CREATE DATABASE alali_sport;

-- إنشاء مستخدم جديد (غير كلمة السر لشي قوي - تجنب استخدام @ في كلمة السر)
CREATE USER alali_user WITH PASSWORD 'MySecurePassword2025';

-- إعطاء جميع الصلاحيات للمستخدم
GRANT ALL PRIVILEGES ON DATABASE alali_sport TO alali_user;

-- منح صلاحيات على السكيما
\c alali_sport
GRANT ALL ON SCHEMA public TO alali_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO alali_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO alali_user;

-- الخروج من PostgreSQL
\q
```

**2. التأكد من إعداد قاعدة البيانات:**

```bash
# اختبار الاتصال بقاعدة البيانات
psql -U alali_user -d alali_sport -h localhost -c "SELECT version();"

# إذا طلب كلمة السر، اكتب الكلمة اللي حطيتها فوق
```

---

### 📦 المرحلة السادسة: إعداد المشروع

**1. الذهاب لمجلد المشروع:**

```bash
cd /var/www/alali-sport
```

**2. فك ضغط الملف:**

```bash
# فك الضغط
tar -xzf alali-sport.tar.gz

# التأكد من فك الضغط
ls -la

# يجب تشوف: client, server, shared, package.json, وملفات أخرى
```

**3. إنشاء ملف المتغيرات البيئية (.env):**

```bash
# إنشاء ملف .env
cat > .env << 'EOF'
# قاعدة البيانات - غير المعلومات حسب ما حطيت فوق
DATABASE_URL=postgresql://alali_user:MySecurePassword2025@localhost:5432/alali_sport

# مفتاح الجلسة - غيره لنص عشوائي طويل
SESSION_SECRET=your-very-long-random-secret-key-change-this-12345678901234567890

# بيئة العمل
NODE_ENV=production

# المنفذ
PORT=5000
EOF

# عرض محتوى الملف للتأكد
cat .env
```

**⚠️ مهم جداً:**
- غير `MySecurePassword2025` بنفس الكلمة اللي حطيتها في PostgreSQL
- **لا تستخدم** الرموز `@` أو `:` في كلمة السر لأنها تسبب مشاكل في DATABASE_URL
- استخدم أحرف وأرقام ورموز مثل `!#$%^&*-_=+`
- غير `SESSION_SECRET` لنص عشوائي طويل (على الأقل 32 حرف)

---

### 🔧 المرحلة السابعة: تثبيت المكتبات وبناء المشروع

**1. تثبيت جميع المكتبات المطلوبة:**

```bash
# التأكد من أنك في المجلد الصحيح
cd /var/www/alali-sport

# تثبيت المكتبات (قد يأخذ 3-10 دقائق)
npm install

# انتظر حتى ينتهي التثبيت تماماً
```

**2. إعداد جداول قاعدة البيانات:**

```bash
# تطبيق الـ Schema على قاعدة البيانات
npm run db:push

# إذا طلع خطأ، جرب:
# npm run db:push --force
```

**3. بناء المشروع للإنتاج:**

```bash
# بناء Frontend و Backend
npm run build

# يجب تطلع رسائل نجاح وتتكون مجلد dist
ls -la dist/
```

---

### 📊 المرحلة الثامنة: إضافة بيانات القنوات

**1. تشغيل السيرفر مؤقتاً للإضافة:**

```bash
# تشغيل في الخلفية
npm run dev &

# الانتظار 10 ثواني
sleep 10
```

**2. إضافة قنوات بي ان سبورت:**

```bash
curl -X POST http://localhost:5000/api/seed-sports
```

**3. إضافة القنوات الإخبارية:**

```bash
curl -X POST http://localhost:5000/api/seed-news
```

**4. إيقاف السيرفر المؤقت:**

```bash
# إيقاف السيرفر
pkill -f "tsx server/index.ts"

# أو
pkill node
```

---

### 🚀 المرحلة التاسعة: تشغيل الموقع بشكل دائم (PM2)

**1. تثبيت PM2:**

```bash
# تثبيت PM2 عالمياً
npm install -g pm2

# التأكد من التثبيت
pm2 -v
```

**2. تشغيل الموقع:**

```bash
# الذهاب لمجلد المشروع
cd /var/www/alali-sport

# تشغيل التطبيق
pm2 start dist/index.js --name alali-sport

# التأكد من التشغيل
pm2 status

# يجب تشوف alali-sport وحالته online
```

**3. جعل PM2 يعمل تلقائياً عند إعادة تشغيل السيرفر:**

```bash
# إعداد بدء تلقائي
pm2 startup

# نسخ الأمر اللي يطلع لك وشغله
# مثال: sudo env PATH=$PATH:/usr/bin ...

# حفظ التطبيقات الحالية
pm2 save
```

**أوامر PM2 المفيدة:**

```bash
# عرض حالة التطبيقات
pm2 status

# عرض اللوجز المباشرة
pm2 logs alali-sport

# إعادة تشغيل
pm2 restart alali-sport

# إيقاف
pm2 stop alali-sport

# بدء
pm2 start alali-sport

# حذف من PM2
pm2 delete alali-sport

# عرض معلومات مفصلة
pm2 info alali-sport

# مراقبة الأداء
pm2 monit
```

---

### 🌍 المرحلة العاشرة: إعداد Nginx (الوصول من المتصفح)

**1. إنشاء ملف تكوين Nginx:**

```bash
# إنشاء ملف التكوين
cat > /etc/nginx/sites-available/alali-sport << 'EOF'
server {
    listen 80;
    listen [::]:80;
    
    # استبدل هذا بـ Domain الخاص بك، أو اتركه _ للـ IP
    server_name _;
    
    # حجم الملفات المسموح برفعها
    client_max_body_size 100M;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        
        # Headers مهمة للبث
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # زيادة الـ Timeout للبث المباشر
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
        send_timeout 600s;
    }
}
EOF
```

**2. تفعيل التكوين:**

```bash
# إنشاء رابط رمزي
ln -sf /etc/nginx/sites-available/alali-sport /etc/nginx/sites-enabled/

# حذف التكوين الافتراضي
rm -f /etc/nginx/sites-enabled/default

# اختبار التكوين
nginx -t

# يجب تطلع: syntax is ok, test is successful
```

**3. إعادة تشغيل Nginx:**

```bash
# إعادة تشغيل Nginx
systemctl restart nginx

# التأكد من التشغيل
systemctl status nginx

# يجب تشوف: active (running)
```

---

### 🔒 المرحلة الحادية عشر: إعداد Firewall

**1. تثبيت وإعداد UFW:**

```bash
# تثبيت UFW (إذا مو مثبت)
apt install -y ufw

# السماح بـ SSH (مهم جداً!)
ufw allow 22/tcp

# السماح بـ HTTP
ufw allow 80/tcp

# السماح بـ HTTPS (للمستقبل)
ufw allow 443/tcp

# تفعيل Firewall
ufw --force enable

# التحقق من القواعد
ufw status verbose
```

**⚠️ تحذير مهم:**
- **لا تنسى** تسمح بـ Port 22 (SSH) قبل تفعيل Firewall، وإلا راح تنقطع عن السيرفر!

---

### 🎉 المرحلة الثانية عشر: اختبار الموقع

**1. افتح المتصفح على جهازك:**

```
http://IP_ADDRESS_للسيرفر
```

مثال:
```
http://192.168.1.100
```

**2. يجب تشوف:**
- ✅ صفحة تسجيل الدخول
- ✅ اكتب كلمة السر: `i love alaliplus`
- ✅ تدخل للموقع وتشوف القنوات

---

## 🔧 الصيانة والإدارة

### تحديث الموقع:

```bash
# 1. الاتصال بالـ VPS
ssh root@IP_ADDRESS

# 2. الذهاب للمجلد
cd /var/www/alali-sport

# 3. إيقاف التطبيق
pm2 stop alali-sport

# 4. رفع الكود الجديد (نفس طريقة الرفع الأولى)
# ... ارفع ملف جديد وفك الضغط ...

# 5. إعادة تثبيت المكتبات (إذا تغيرت)
npm install

# 6. إعادة البناء
npm run build

# 7. تشغيل
pm2 restart alali-sport

# 8. التحقق
pm2 logs alali-sport
```

### مراقبة الموقع:

```bash
# عرض استهلاك الموارد
pm2 monit

# عرض آخر 100 سطر من اللوجز
pm2 logs alali-sport --lines 100

# عرض اللوجز المباشرة
pm2 logs alali-sport

# لإيقاف عرض اللوجز: Ctrl+C
```

### نسخ احتياطي لقاعدة البيانات:

```bash
# إنشاء نسخة احتياطية
pg_dump -U alali_user -h localhost alali_sport > backup-$(date +%Y%m%d-%H%M%S).sql

# عرض النسخ الاحتياطية
ls -lh backup-*.sql

# استعادة نسخة احتياطية (احذر - يحذف البيانات الحالية!)
# psql -U alali_user -h localhost alali_sport < backup-20250121-123456.sql
```

### تنظيف المساحة:

```bash
# حذف الملفات المضغوطة القديمة
cd /var/www/alali-sport
rm -f *.tar.gz

# تنظيف npm cache
npm cache clean --force

# حذف node_modules القديمة (احذر!)
# rm -rf node_modules
# npm install
```

---

## 🆘 حل المشاكل الشائعة

### المشكلة 1: الموقع ما يفتح

```bash
# 1. تحقق من PM2
pm2 status
pm2 logs alali-sport

# 2. تحقق من Nginx
systemctl status nginx
nginx -t

# 3. تحقق من المنفذ
netstat -tlnp | grep 5000

# 4. تحقق من Firewall
ufw status

# 5. أعد تشغيل كل شي
pm2 restart alali-sport
systemctl restart nginx
```

### المشكلة 2: خطأ في قاعدة البيانات

```bash
# 1. تحقق من PostgreSQL
systemctl status postgresql

# 2. اختبر الاتصال
psql -U alali_user -d alali_sport -h localhost

# 3. تحقق من ملف .env
cat /var/www/alali-sport/.env | grep DATABASE_URL

# 4. أعد تطبيق Schema
cd /var/www/alali-sport
npm run db:push --force
```

### المشكلة 3: البث ما يشتغل

```bash
# 1. شف اللوجز
pm2 logs alali-sport --lines 200

# 2. تأكد من SESSION_SECRET
cat .env | grep SESSION_SECRET

# 3. أعد تشغيل
pm2 restart alali-sport
```

### المشكلة 4: نفذت المساحة

```bash
# تحقق من المساحة
df -h

# تنظيف
apt autoremove -y
apt clean
npm cache clean --force
pm2 flush  # حذف اللوجز القديمة
```

---

## 📞 معلومات مهمة للمرجع

### المسارات المهمة:
- **المشروع**: `/var/www/alali-sport`
- **ملف .env**: `/var/www/alali-sport/.env`
- **ملفات البناء**: `/var/www/alali-sport/dist`
- **تكوين Nginx**: `/etc/nginx/sites-available/alali-sport`

### الخدمات والمنافذ:
- **التطبيق**: Port 5000
- **Nginx**: Port 80 (HTTP), Port 443 (HTTPS)
- **PostgreSQL**: Port 5432 (localhost فقط)
- **SSH**: Port 22

### قاعدة البيانات:
- **اسم القاعدة**: alali_sport
- **المستخدم**: alali_user
- **Host**: localhost
- **Port**: 5432

### كلمات السر المطلوبة:
1. كلمة سر PostgreSQL (للمستخدم alali_user)
2. SESSION_SECRET (في ملف .env)
3. كلمة سر الموقع: `i love alaliplus`

---

## ✅ قائمة التحقق النهائية

قبل ما تقول "انتهيت"، تأكد من:

- [ ] Node.js v20 مثبت (`node -v`)
- [ ] PostgreSQL يعمل (`systemctl status postgresql`)
- [ ] Nginx يعمل (`systemctl status nginx`)
- [ ] قاعدة البيانات منشأة ومتصلة
- [ ] ملف .env موجود وصحيح
- [ ] المكتبات مثبتة (`node_modules` موجود)
- [ ] المشروع مبني (`dist/` موجود)
- [ ] القنوات مضافة (seed تم تشغيله)
- [ ] PM2 يعمل (`pm2 status`)
- [ ] Firewall مفعل ومسموح بالمنافذ
- [ ] الموقع يفتح من المتصفح
- [ ] كلمة السر `i love alaliplus` تشتغل

---

## 🎯 الخلاصة السريعة (للمراجعة)

```bash
# === على VPS ===
# 1. التثبيت
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs postgresql nginx

# 2. قاعدة البيانات
sudo -u postgres psql
CREATE DATABASE alali_sport;
CREATE USER alali_user WITH PASSWORD 'YOUR_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE alali_sport TO alali_user;
\q

# 3. المشروع
cd /var/www/alali-sport
tar -xzf alali-sport.tar.gz
# أنشئ .env
npm install
npm run db:push
npm run build

# 4. البيانات
npm run dev &
sleep 10
curl -X POST http://localhost:5000/api/seed-sports
curl -X POST http://localhost:5000/api/seed-news
pkill node

# 5. التشغيل
npm install -g pm2
pm2 start dist/index.js --name alali-sport
pm2 startup
pm2 save

# 6. Nginx
# (أنشئ ملف التكوين كما في الأعلى)
ln -sf /etc/nginx/sites-available/alali-sport /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 7. Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw --force enable

# 8. افتح المتصفح
# http://YOUR_VPS_IP
```

---

## 🎊 تم بنجاح!

الآن موقعك يعمل على VPS الخاص بك! 

**للدعم:**
- شف اللوجز: `pm2 logs alali-sport`
- أعد التشغيل: `pm2 restart alali-sport`
- راقب الأداء: `pm2 monit`

**استمتع بموقعك! 🚀**
