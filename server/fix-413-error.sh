#!/bin/bash

# سكريبت لحل مشكلة 413 Request Entity Too Large
# استخدم هذا السكريبت في الخادم لتطبيق الحلول

echo "🔧 بدء حل مشكلة 413 Request Entity Too Large..."

# 1. نسخ إعدادات nginx
echo "📝 تطبيق إعدادات nginx..."
if [ -f "nginx.conf" ]; then
    sudo cp nginx.conf /etc/nginx/sites-available/lms-app
    sudo ln -sf /etc/nginx/sites-available/lms-app /etc/nginx/sites-enabled/
    echo "✅ تم نسخ إعدادات nginx"
else
    echo "⚠️  ملف nginx.conf غير موجود"
fi

# 2. اختبار إعدادات nginx
echo "🧪 اختبار إعدادات nginx..."
if sudo nginx -t; then
    echo "✅ إعدادات nginx صحيحة"
else
    echo "❌ خطأ في إعدادات nginx"
    exit 1
fi

# 3. إعادة تشغيل nginx
echo "🔄 إعادة تشغيل nginx..."
sudo systemctl reload nginx
echo "✅ تم إعادة تشغيل nginx"

# 4. إعادة تشغيل Node.js (إذا كان يستخدم PM2)
echo "🔄 إعادة تشغيل Node.js..."
if command -v pm2 &> /dev/null; then
    pm2 restart lms-server || pm2 restart all
    echo "✅ تم إعادة تشغيل PM2"
else
    echo "⚠️  PM2 غير مثبت، يرجى إعادة تشغيل Node.js يدوياً"
fi

# 5. اختبار الاتصال
echo "🧪 اختبار الاتصال..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ الخادم يعمل بشكل صحيح"
else
    echo "⚠️  الخادم قد لا يعمل، تحقق من الـ logs"
fi

echo ""
echo "🎉 تم تطبيق الحلول بنجاح!"
echo ""
echo "📋 الخطوات التالية:"
echo "1. اختبر رفع صورة صغيرة أولاً"
echo "2. راقب الـ logs: sudo tail -f /var/log/nginx/error.log"
echo "3. إذا استمرت المشكلة، تحقق من إعدادات الاستضافة"
echo ""
echo "🔍 لمراقبة الـ logs:"
echo "   sudo tail -f /var/log/nginx/error.log"
echo "   pm2 logs lms-server"
