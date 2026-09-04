# جَايَبْلَك — Web + Android React Native

هذه الحزمة تضم مصدر تطبيق Expo/React Native وإعداداته اللازمة للويب وأندرويد. لا تتضمن `node_modules` أو مجلدات البناء أو الكاش أو ملفات iOS الأصلية، لتبقى خفيفة وقابلة للنقل.

## التشغيل

```bash
pnpm install
pnpm dev
```

للمتصفح استخدم خادم Expo Web. لأندرويد استخدم `pnpm android` أو افتح المشروع عبر Expo Go.

## Supabase

يقرأ أبو العريف `EXPO_PUBLIC_SUPABASE_URL` و`EXPO_PUBLIC_SUPABASE_ANON_KEY`. شغّل `supabase/abu-al-ereef-products.sql` في SQL Editor أولاً؛ الملف ينشئ علاقات `companies` و`products` و`product_images` وRPC البحث وسياسات RLS، ولا يضيف بيانات تجريبية.

## ما تم تضمينه

تتضمن النسخة حفظ جلسة أبو العريف، اقتراح التنسيقات بصور المنتجات، ربط المنتج بمعرّف المتجر وفتح تفاصيله، واستعلامات Supabase المتدرجة مع fallback محلي للمعاينة.
