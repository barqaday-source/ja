# تشغيل المشروع مع Supabase

هذا الإصدار لا يزرع بيانات تجريبية ولا يملك fallback محلياً. بعد إنشاء الجداول وتشغيل migrations في مشروع Supabase، انسخ `.env.example` إلى `.env` داخل كل لوحة، ثم ضع `EXPO_PUBLIC_SUPABASE_URL` و`EXPO_PUBLIC_SUPABASE_ANON_KEY`.

شغّل التثبيت من جذر المشروع:

```bash
pnpm install:all
pnpm check
```

لإنتاج أنواع دقيقة من قاعدة البيانات الفعلية، ثبّت Supabase CLI وسجّل الدخول ثم نفّذ:

```bash
export PROJECT_REF=your-project-ref
pnpm supabase:types
```

بعدها انسخ ملف الأنواع الناتج إلى `lib/supabase/database.types.ts` في اللوحات الأخرى، أو انقله إلى حزمة مشتركة. لا تستخدم `service_role` في تطبيقات Expo.

## ترتيب SQL

1. نفّذ `apps/merchant-panel/supabase/schema.sql` مرة واحدة في مشروع Supabase مركزي.
2. نفّذ migrations الخاصة بالطلبات والمحتوى.
3. لا تنفّذ هجرة التحليلات القديمة قبل تعديلها لتستخدم جداول `orders` و`debts` الموجودة فعلاً، أو إضافة جدول `sales` رسمياً.
4. أنشئ buckets التخزين المذكورة في المخطط، واجعل مستندات التحقق وملفات المحادثة خاصة.
5. أنشئ مستخدماً وسجّل دخوله قبل تجربة عمليات الإدراج والتعديل.

عند غياب المتغيرات أو جلسة المستخدم، يعرض التطبيق حالة خطأ واضحة بدلاً من إنشاء بيانات وهمية.
