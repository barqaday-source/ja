# تحقق من خدمة المكالمات اللحظية

بحثت عن اسم «لوغارا» كما ورد في الطلب. لم يظهر مزود واضح بهذا الاسم، بينما ظهرت نتائج موثوقة لخدمة **Agora** للمكالمات الصوتية والوسائط اللحظية، ولـ Agora Chat للمراسلة الفورية. لذلك يجب تأكيد الاسم قبل إضافة أي SDK أو متغيرات بيئة.

المصادر التي ظهرت في البحث:

1. [Agora Voice Calling overview](https://docs.agora.io/en/realtime-media/voice) — توثيق خدمة Agora للصوت اللحظي.
2. [Agora Chat](https://www.agora.io/en/products/chat/) — خدمة مراسلة لحظية قابلة للتكامل مع الصوت والفيديو.

حتى يتم التأكيد، المسار الآمن هو تجهيز واجهة الدردشة وطبقة adapter محلية مع عقود Supabase/RTC، دون إضافة اتصال خارجي أو طلب مفاتيح حقيقية.

## نتائج المصادر الرسمية

توضح وثائق Supabase أن Realtime يوفر Broadcast للرسائل منخفضة التأخير، Presence لتتبع المتصلين وحالتهم، وPostgres Changes للاستماع لتغييرات قاعدة البيانات. كما تذكر أمثلة مباشرة لتطبيقات الدردشة ومؤشر الكتابة والحضور.[1]

وتوضح وثائق Storage أنه يدعم تخزين الصور والفيديو والملفات، والرفع عبر REST وS3 وTUS، وروابط CDN، وتحسين الصور، وسياسات وصول دقيقة عبر RLS.[2]

[1]: https://supabase.com/docs/guides/realtime "Supabase Realtime"
[2]: https://supabase.com/docs/guides/storage "Supabase Storage"

## نتائج Agora الرسمية

تقدم Agora Voice Calling مكالمات صوتية لحظية منخفضة التأخير، وتوفر دورة واضحة للانضمام إلى قناة ومغادرتها، مع إمكانات التسجيل والتحسين الصوتي.[3] وتوصي وثائق Agora بأن يطلب العميل رمزاً مؤقتاً من خادم مصادقة عند الانضمام إلى القناة، وأن تتم إعادة إصدار الرمز وتجديده من الخادم قبل انتهاء صلاحيته؛ لذلك لن يوضع أي App Certificate أو رمز دائم داخل تطبيق Expo.[4]

[3]: https://docs.agora.io/en/realtime-media/voice "Agora Voice Calling overview"
[4]: https://docs.agora.io/en/realtime-media/voice/build/set-up-token-authentication/use-tokens "Agora Use tokens"
