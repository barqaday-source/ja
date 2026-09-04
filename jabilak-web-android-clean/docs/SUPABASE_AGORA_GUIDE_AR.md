# دليل الربط المستقبلي للدردشة والمكالمات

## الحالة الحالية

واجهة جَايَبْلَك تعمل حالياً ببيانات محلية تجريبية. أضيفت شاشة قائمة المحادثات، شاشة المحادثة، شاشة المكالمة الصوتية، ومحرر صورة البروفايل للمستخدم والتاجر. لم تُفعّل مفاتيح Supabase أو Agora، ولم تُرسل أي صورة أو رسالة إلى خدمة خارجية.

## توزيع المسؤوليات

| المجال | الخدمة المقترحة | ما يفعله التطبيق بعد الربط |
|---|---|---|
| الحساب وصورة البروفايل | Supabase Auth + Storage | حفظ `profiles.avatar_url` ورفع الصورة داخل bucket `avatars` |
| الرسائل النصية والصور والصوت | Supabase Database + Storage + Realtime | تخزين الرسائل والمرفقات، ثم بث الرسائل والحضور ومؤشر الكتابة |
| الحضور ومؤشر الكتابة | Supabase Realtime Presence/Broadcast | إظهار متصل الآن، يكتب الآن، وحالة القراءة |
| المكالمات الصوتية | Agora Voice | إنشاء جلسة، الانضمام إلى channel، الكتم والسماعة والخروج |
| إصدار توكن المكالمة | خادم المشروع أو Edge Function | إصدار توكن Agora قصير العمر وعدم وضع App Certificate داخل التطبيق |

## جداول Supabase المضافة إلى المخطط التحضيري

تمت إضافة جداول `conversations` و`conversation_members` و`messages` و`call_sessions` إلى `supabase/schema.sql`، مع فهارس وسياسات RLS مقترحة. يجب مراجعة السياسات في مشروع Supabase قبل تشغيلها، ثم تفعيل جدول `messages` في منشور Realtime.

يُفضل حفظ مرفقات الدردشة في bucket خاص باسم `chat-media` وفق المسار `{conversation_id}/{sender_id}/{uuid}.{extension}`. أما صور البروفايل فتستخدم bucket `avatars`، ويُمنح المستخدم صلاحية الكتابة داخل مجلد يحمل `auth.uid()` فقط.

## العقود البرمجية

يحتوي `lib/data/realtime-contracts.ts` على عقود مستقلة لـ `ProfileMediaRepository` و`ChatRepository` و`VoiceCallProvider`. تعتمد الواجهات عليها بدلاً من استيراد Supabase أو Agora مباشرة، ولذلك يمكن تبديل المزود أو الاختبار بمزوّد وهمي دون إعادة بناء الشاشات.

## مسار Agora الآمن

عند بدء المكالمة، يرسل التطبيق هوية المتصل والمستقبل إلى خادم موثوق. يعيد الخادم `callId` و`channelName` و`token` مؤقتاً، ثم ينضم العميل إلى القناة. عند اقتراب انتهاء الرمز يطلب التطبيق رمزاً جديداً ويجدده دون كشف App Certificate داخل Expo.[3] [4]

> لا تضع `AGORA_APP_CERTIFICATE` أو أي مفتاح خادم في تطبيق الهاتف أو في متغيرات `EXPO_PUBLIC_*`. تبقى هذه القيم على الخادم فقط.

## خطوات التفعيل لاحقاً

ابدأ بإنشاء buckets `avatars` و`chat-media` ومراجعة سياسات RLS. بعد ذلك أنشئ مستودع Supabase يطبّق عقود المحادثات والملف الشخصي، واشترك في Realtime للرسائل والحضور. أخيراً أضف خادم إصدار Agora Token، ثم طبّق `VoiceCallProvider` داخل build أصلي مناسب بدلاً من الاعتماد على المعاينة الوهمية.

## ملاحظات الخطط المجانية

الخطة المجانية لأي مزود لا تعني سعة غير محدودة؛ يجب مراجعة حدود التخزين، النقل، عدد الاتصالات، مدة المكالمات، ورسوم الاستخدام في لوحة الحساب قبل الإطلاق. ينبغي أيضاً إضافة حدود لحجم الصور والصوت وسياسة حذف للمرفقات القديمة.

## المراجع

[1]: https://supabase.com/docs/guides/realtime "Supabase Realtime"
[2]: https://supabase.com/docs/guides/storage "Supabase Storage"
[3]: https://docs.agora.io/en/realtime-media/voice "Agora Voice Calling overview"
[4]: https://docs.agora.io/en/realtime-media/voice/build/set-up-token-authentication/use-tokens "Agora Use tokens"
