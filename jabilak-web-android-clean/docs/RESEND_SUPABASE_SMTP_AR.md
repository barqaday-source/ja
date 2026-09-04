# تجهيز Resend مع Supabase Auth SMTP

هذا الملف يجهّز الإعداد فقط. التطبيق الحالي يعمل ببيانات وهمية، ولا ينفذ اتصالاً بـ Resend أو Supabase، ولا يحتوي على مفتاح حقيقي.

## إعدادات SMTP في Supabase

من لوحة Supabase افتح: **Authentication → Settings → SMTP Settings**، ثم استخدم القيم التالية:

| الحقل | القيمة |
|---|---|
| Sender email | `onboarding@resend.dev` للتجربة، أو بريد من نطاق موثق في Resend |
| SMTP host | `smtp.resend.com` |
| SMTP port | `465` مع SSL، أو `587` مع TLS/STARTTLS |
| SMTP user | `resend` |
| SMTP password | قيمة `RESEND_API_KEY` من Resend، وتُدخل في لوحة Supabase فقط |
| Sender name | `تاجر` |

يجب عدم وضع قيمة `RESEND_API_KEY` في React Native أو في أي ملف يبدأ بـ `EXPO_PUBLIC_`، لأن هذه القيم تصل إلى العميل. تُحفظ القيمة كسِرّ في إعدادات Supabase أو بيئة الخادم فقط، ولا تُرفع إلى GitHub.

## قالب البيئة

انسخ القيم الاسمية إلى بيئة الخادم عند الربط مستقبلاً، ولا تستبدلها بمفتاح حقيقي داخل المستودع:

```env
# لا تضع قيمة حقيقية هنا في المستودع
RESEND_API_KEY=replace_with_resend_api_key

# يستخدمها عميل Supabase العام فقط بعد تركيب مكتبة Supabase.
# لا تستخدم RESEND_API_KEY في العميل.
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=replace_with_anon_key
```

## الرسائل التي يغطيها SMTP

بعد حفظ SMTP في Supabase يمكن استخدامه لإرسال تأكيد البريد، رابط إعادة تعيين كلمة المرور، دعوات المستخدمين، وتغيير البريد الإلكتروني. قوالب الرسائل تُعدّل من **Authentication → Email Templates**، ويجب إبقاء الروابط متوافقة مع deep link الخاص بالتطبيق.

## ربط التطبيق مستقبلاً

أضف مكتبة `@supabase/supabase-js` فقط عند بدء الربط، ثم أنشئ ملفاً مثل `lib/integrations/supabase-client.ts` باستخدام `EXPO_PUBLIC_SUPABASE_URL` و`EXPO_PUBLIC_SUPABASE_ANON_KEY`. لا تستورد `RESEND_API_KEY` في هذا الملف. استبدل تنفيذ `AuthRepository` في `lib/data/repositories.ts` بتنفيذ Supabase، واترك الشاشات تستعمل العقد نفسها.

## فحص سريع قبل التفعيل

تحقق من نطاق المرسل، جرّب رسالة تأكيد وتغيير كلمة المرور، راجع مجلد Spam، وفعّل قيود Redirect URLs في Supabase. في الإنتاج استخدم نطاقاً موثقاً بدلاً من `onboarding@resend.dev`.
