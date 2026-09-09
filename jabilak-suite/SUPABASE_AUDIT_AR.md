# تقرير تدقيق ربط تطبيق جِبلك/تاجر مع Supabase

**تاريخ التدقيق:** 9 سبتمبر 2026  
**نطاق التدقيق:** الأرشيف `jabilak-suite-tajer-salix-eas.zip`، بما في ذلك لوحات العميل والتاجر والإدارة، ومخططات Supabase وملفات TypeScript ذات الصلة.

## الخلاصة التنفيذية

المشروع يحتوي مخطط Supabase متقدماً ومفصلاً، وسياسات Row Level Security (RLS) لمعظم الجداول، وعميل Supabase صالحاً من حيث المبدأ. لكنه **لا يعمل حالياً كتطبيق متصل بالكامل بقاعدة البيانات**. السبب ليس غياب أسماء الجداول الأساسية، بل أن طبقة البيانات لم تُنفّذ بعد في معظم الشاشات، ولا توجد قيم بيئة فعلية داخل الأرشيف، ولا يوجد ملف أنواع مولّد من Supabase.

يوجد أيضاً خلل توافق مؤكد في هجرة تحليلات التاجر. الهجرة تستعلم عن جدول `public.sales` وأعمدة `merchant_id` و`amount` و`cost`، بينما المخطط المرفق يعرّف الطلبات في `public.orders`، والديون في `public.debts` بأعمدة `company_id` و`total_amount`. لذلك لن تعمل دالة `get_merchant_quick_analytics` على قاعدة البيانات التي يصفها هذا المشروع إلا بعد تعديل الهجرة أو إضافة مخطط `sales` مستقل.

| المجال | الحالة | التقييم |
|---|---|---|
| وجود مخطط Supabase | موجود في اللوحات الثلاث | جيد، مع حاجة إلى إدارة migrations أفضل |
| تطابق مخططات اللوحات | متطابقة تماماً | جيد |
| عميل Supabase | موجود في `lib/supabase/client.ts` | جزئي |
| إعدادات البيئة الفعلية | غير موجودة؛ الموجود ملفات `.env.example` فقط | مانع تشغيل |
| ربط الشاشات بالبيانات | محدود جداً | مانع تشغيل وظيفي |
| طبقة المستودعات | عقود فقط، و`connected: false` | غير مكتملة |
| RLS | موجود لمعظم الجداول | جيد مبدئياً، يحتاج اختبارات ومراجعة grants |
| أنواع TypeScript من Supabase | غير موجودة | خطر أخطاء نوعية وانحراف المخطط |
| RPC التحليلات | الاستدعاء موجود، لكن SQL غير متوافق | خلل مؤكد |

## ما تم فحصه

تم فحص الملفات التالية ومثيلاتها في اللوحات الثلاث:

- `apps/*/supabase/schema.sql`
- `apps/merchant-panel/supabase/migrations/*.sql`
- `apps/*/lib/supabase/client.ts`
- `apps/*/lib/data/models.ts`
- `apps/*/lib/data/repositories.ts`
- `apps/*/lib/search/product-search.ts`
- `apps/merchant-panel/lib/merchant-analytics.ts`
- ملفات `.env.example` و`package.json` و`tsconfig.json`

مخططات `schema.sql` في اللوحات الثلاث متطابقة وفق مقارنة الملفات وبصمة SHA-256. لم توجد ملفات `.env` فعلية في الأرشيف، ولم يوجد `database.types.ts` أو ملف مشابه مولد من قاعدة Supabase.

## النتائج التفصيلية

### 1. عميل Supabase موجود، لكنه لن يُنشئ اتصالاً دون متغيرات البيئة

يعتمد العميل على:

```ts
process.env.EXPO_PUBLIC_SUPABASE_URL
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
```

وعند غيابهما تكون قيمة `supabase` هي `null`. هذا سلوك آمن، لكنه يعني أن التطبيق سيبقى غير متصل ما لم تُضف القيم إلى ملف بيئة خاص بكل لوحة:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

يجب عدم وضع `service_role` في تطبيق Expo أو React Native. المفتاح العام مخصص للعميل، بينما العمليات الإدارية أو الحساسة يجب أن تمر عبر خادم أو Edge Function محمي.

### 2. طبقة المستودعات معلنة، وليست منفذة

في `apps/merchant-panel/lib/data/repositories.ts` توجد واجهات مثل `ProductRepository` و`OrderRepository` و`DebtRepository`، لكنها لا تحتوي تنفيذاً فعلياً لـ `SupabaseRepository`. كما أن الإعداد يصرّح صراحةً بما يلي:

```ts
backend: "supabase",
supabaseReady: true,
connected: false,
```

التصريح `supabaseReady: true` يعكس وجود العميل أو التصميم، ولا يثبت أن التطبيق متصل أو أن عمليات القراءة والكتابة تعمل.

النتيجة العملية هي أن معظم الشاشات لا تستخدم هذه الواجهات لإرسال البيانات إلى Supabase. ما زالت شاشات متعددة تعتمد على `useMockAction`، ومنها المنتجات، المخزون، الديون، الإعلانات، النشر، وإعدادات التاجر. لذلك قد يبدو التفاعل ناجحاً في المعاينة دون أن تُنشأ صفوف في قاعدة البيانات.

### 3. استدعاءات Supabase الفعلية محدودة

الاستدعاءات المباشرة التي ظهرت في الكود تتركز أساساً في بحث المنتجات:

- `products`
- `companies`
- `product_images`
- RPC باسم `search_products`

كما يوجد استدعاء RPC للتحليلات باسم `get_merchant_quick_analytics`، واستدعاء خدمة الطلبات في `order-service.ts`. لكن وجود الاستدعاء لا يعني أن كل مسارات التطبيق موصولة؛ المسارات الأساسية للإضافة والتعديل والحذف ما زالت غير مكتملة في طبقة المستودعات.

### 4. خلل مؤكد في RPC تحليلات التاجر

الهجرة `20260909120000_merchant_quick_analytics.sql` تحتوي على استعلامات من هذا النوع:

```sql
from public.sales s
where s.merchant_id = p_merchant_id
```

وتستخدم:

```sql
s.amount
s.cost
d.amount
d.merchant_id
```

لكن `schema.sql` لا يعرّف جدول `sales`. كما أن جدول `debts` الحالي يستخدم:

```sql
company_id
customer_id
total_amount
paid_amount
```

ولا يستخدم `merchant_id` أو `amount`. لذلك توجد مساران صحيحان للإصلاح:

| الخيار | الإجراء | الملاحظة |
|---|---|---|
| أ | إعادة كتابة RPC اعتماداً على `orders` و`order_items` و`debts` الحالية | الأنسب للمخطط الموجود، لكنه يحتاج تعريفاً واضحاً لمعنى المبيعات والتكاليف |
| ب | إضافة جدول `sales` وجدول/أعمدة تكلفة متوافقة | مناسب إذا كانت التحليلات تعتمد على سجل مبيعات مستقل، لكنه يوسّع المخطط |

لا ينبغي تشغيل الهجرة الحالية في مشروع Supabase قبل اختيار أحد الخيارين.

### 5. مخطط الطلبات متوافق جزئياً مع خدمة Checkout

المخطط الأساسي يعرّف `orders` بالأعمدة الأساسية مثل `company_id` و`customer_id` و`subtotal` و`total`. هجرة Checkout تضيف:

- `customer_name`
- `customer_phone`
- `delivery_region`
- `delivery_inside_province` و`delivery_outside_province` إلى `companies`

وتستخدم دالة `create_order_from_cart` قيمة `p_items` من نوع `jsonb`. هذا متوافق مع قاعدة Supabase العامة: يجب إرسال مصفوفة JavaScript مباشرة إلى عمود أو وسيط JSONB، وليس `JSON.stringify`، ما لم يكن الهدف تخزين نص صريح.

لكن هذه الإضافات موجودة في migrations الخاصة بلوحة التاجر فقط. إذا كانت قاعدة البيانات ستخدم اللوحات الثلاث، فيجب إدارة migrations على مستوى مشروع Supabase المركزي، لا تشغيل نسخة مختلفة يدوياً لكل تطبيق.

### 6. أنواع البيانات في SQL مناسبة، مع نقاط يجب تثبيتها

المخطط يستخدم أنواعاً منطقية في معظم المواضع:

| نوع SQL | أمثلة في المشروع | ما يجب إرساله من TypeScript |
|---|---|---|
| `uuid` | المعرفات والمفاتيح الأجنبية | نص UUID صالح، مع التحقق قبل الإرسال |
| `jsonb` | `products.options` و`campaigns.interests` و`features` | كائن أو مصفوفة JavaScript مباشرة |
| `timestamptz` | `created_at` و`updated_at` وحقول الاشتراك | ISO string مثل `new Date().toISOString()` أو اترك القيمة الافتراضية في SQL |
| `bigint` | الأسعار والمجاميع والميزانيات | رقم آمن ضمن حدود JavaScript أو معالجة نصية عند القيم الكبيرة جداً |
| `numeric(10,7)` | خطوط الطول والعرض | رقم أو نص مضبوط حسب احتياج الدقة |
| `date` | `debts.due_date` | نص بصيغة `YYYY-MM-DD` |

يوجد اختلاف تسمية بين نماذج المجال والمخطط، لكنه مقصود كتحويل داخلي: `companyId` مقابل `company_id`، و`createdAt` مقابل `created_at`. يجب تنفيذ mappers موثوقة عند بناء المستودع، وعدم تمرير نماذج المجال مباشرة إلى `.insert()`.

### 7. RLS جيد مبدئياً، لكنه يحتاج اختبارات وصلاحيات محددة

المخطط يفعّل RLS على الجداول الأساسية ويستخدم سياسات ملكية الشركة، مثل `public.is_company_owner(company_id)`. هذا أفضل من سياسة عامة تسمح بالكتابة للجميع.

أمثلة جيدة في المخطط:

- المنتجات المنشورة قابلة للقراءة العامة، بينما كتابة المنتجات مقصورة على مالك الشركة.
- الطلبات قابلة للقراءة للعميل أو مالك الشركة.
- الديون والمدفوعات الخاصة بها مقصورة على مالك الشركة.
- الإشعارات مقصورة على صاحب `user_id`.
- ملفات التحقق ليست عامة، والمخطط ينص على استخدام Signed URLs.

لكن توجد نقاط يجب الانتباه إليها:

1. أغلب السياسات لا تحدد `TO authenticated` أو `TO anon` صراحةً، ولذلك يجب مراجعة grants الفعلية في مشروع Supabase وعدم افتراض أن السياسة وحدها كافية.
2. سياسة `companies_public_select using (true)` مقصودة للبيانات العامة، لكنها تعرض كل أعمدة الشركة، بما فيها `email` و`phone` و`address`. إذا كانت هذه البيانات خاصة، استخدم View عامة بأعمدة محدودة أو سياسة/تصميماً مختلفاً.
3. وجود سياسات RLS لا يلغي صلاحيات Postgres الممنوحة للدور. يجب ضبط grants وفق العمليات المطلوبة.
4. يلزم اختبار السماح والمنع لكل جدول وعمليات SELECT وINSERT وUPDATE وDELETE لكل من `anon` و`authenticated`.
5. تشغيل `schema.sql` أكثر من مرة قد يفشل لأن بعض `CREATE POLICY` و`ADD CONSTRAINT` لا تستخدم آلية تمنع التكرار. الأفضل تحويل التغييرات إلى migrations قابلة للتتبع، أو حذف سياسات قديمة صراحةً قبل إعادة إنشائها في بيئة تطوير فقط.

### 8. لا توجد أنواع Supabase مولدة

لا يوجد في الأرشيف `database.types.ts`، كما أن العميل منشأ بصيغة عامة:

```ts
createClient(url, anonKey, { ... })
```

بدون `createClient<Database>`. هذا يحرم المشروع من اكتشاف أخطاء أسماء الأعمدة والجداول أثناء TypeScript. يُنصح بتوليد الأنواع من قاعدة البيانات الفعلية، ثم استخدامها في اللوحات الثلاث أو في حزمة مشتركة:

```bash
npx supabase gen types typescript \
  --project-id "$PROJECT_REF" \
  --schema public > packages/supabase-types/database.types.ts
```

ثم:

```ts
import type { Database } from "@shared/supabase/database.types";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
```

### 9. فحص TypeScript لم يُنفذ بسبب غياب dependencies

لم يحتوي الأرشيف على `node_modules`، لذلك تعذر تشغيل `pnpm check` أو التحقق الكامل من TypeScript. هذه ليست نتيجة فشل في الكود، بل نتيجة بيئية. بعد تثبيت الاعتماديات يجب تشغيل:

```bash
pnpm install
pnpm check
```

ويجب تكرار ذلك للوحات الثلاث، ثم إضافة اختبارات Repository وRLS.

## خطة الإصلاح المقترحة

### أولوية 1: منع التشغيل الخاطئ

1. لا تشغّل هجرة `20260909120000_merchant_quick_analytics.sql` بصيغتها الحالية.
2. اختر هل التحليلات ستُبنى على `orders` أم على جدول `sales` مستقل.
3. ثبّت migrations في مشروع Supabase واحد، واجعل اللوحات الثلاث تشير إلى نفس قاعدة البيانات.
4. أضف القيم الفعلية إلى ملفات البيئة المحلية أو إعدادات EAS السرية، ولا تضعها في Git.

### أولوية 2: إكمال الاتصال

1. أنشئ `database.types.ts` من قاعدة Supabase الفعلية.
2. مرّر النوع إلى `createClient<Database>` في كل لوحة.
3. أنشئ `SupabaseRepository` حقيقياً للعقود: المصادقة، الشركات، المنتجات، الطلبات، الديون، الحملات، التحقق، التخزين.
4. استبدل `useMockAction` بمكالمات repositories في مسارات الحفظ والإنشاء والتعديل والحذف.
5. أضف mappers صريحة بين `snake_case` في قاعدة البيانات و`camelCase` في نماذج التطبيق.

### أولوية 3: الاختبار الأمني والوظيفي

1. اختبر مستخدماً غير مسجل: قراءة المنتجات المنشورة، وعدم إنشاء منتج أو طلب.
2. اختبر عميلاً مسجلاً: إنشاء طلبه وقراءة طلباته، وعدم قراءة ديون أو حملات متجر آخر.
3. اختبر مالك متجر: إنشاء وتعديل منتجاته وديونه وطلباته، وعدم تعديل متجر آخر.
4. اختبر التخزين لكل bucket، مع التأكد من بقاء `verification-documents` خاصاً.
5. اختبر حالات فشل JSONB وUUID والتواريخ والأسعار السالبة والكمية غير المتاحة.
6. شغّل فحوص TypeScript والاختبارات بعد تثبيت الاعتماديات.

## نموذج SQL آمن مبدئي للسياسات الجديدة

لا يُنصح باستخدام سياسة عامة من نوع `USING (true)` للكتابة. مثال لجدول جديد يخص المستخدمين المسجلين:

```sql
alter table public.example_table enable row level security;

create policy example_select_authenticated
on public.example_table
for select
to authenticated
using (owner_id = (select auth.uid()));

create policy example_insert_authenticated
on public.example_table
for insert
to authenticated
with check (owner_id = (select auth.uid()));
```

يجب استبدال `example_table` و`owner_id` بأسماء حقيقية، ثم اختبار السياسة في بيئة Supabase نفسها.

## الحكم النهائي

المشروع **جاهز كقاعدة تصميم وواجهة أولية**، لكنه **غير جاهز للاستخدام المباشر مع Supabase في الإنتاج**. أقوى الأجزاء هي المخطط الموحد، علاقات المفاتيح الأجنبية، أنواع البيانات الأساسية، ووجود RLS مفصل. أكبر العوائق هي عدم تنفيذ repositories، اعتماد شاشات كثيرة على mock actions، غياب إعدادات البيئة، غياب الأنواع المولدة، وعدم توافق RPC التحليلات مع المخطط.

بعد إصلاح RPC، إضافة migrations المركزية، توليد الأنواع، وتنفيذ repositories، يمكن اختبار المسار الكامل من التطبيق إلى Supabase بثقة. لا يكفي نسخ SQL الحالي إلى SQL Editor ثم تشغيل التطبيق؛ ذلك سيترك مسارات الواجهة في وضع المحاكاة، وقد يفشل RPC التحليلات فور استدعائه.

## المراجع

[1]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase Row Level Security documentation"

[2]: https://supabase.com/docs/guides/api/rest/generating-types "Supabase Generating TypeScript Types documentation"

[3]: https://supabase.com/docs/reference/javascript/typescript-support "Supabase JavaScript TypeScript support documentation"

**المؤلف:** Manus AI


## ملحق مهم: تعارض إضافي بين RLS ودوال Checkout

بعد مراجعة دوال الطلبات مع سياسات RLS، توجد مشكلة تشغيلية إضافية يجب إصلاحها قبل اعتماد Checkout:

- الدالة `create_order_from_cart` معرفة بصيغة `security invoker`. وهي تُنشئ الطلب، وتحدّث كمية المنتج، وتضيف إشعاراً إلى مالك الشركة.
- سياسة `products_owner_update` تسمح بتحديث المنتج لمالك الشركة فقط، بينما العميل هو الذي يستدعي الدالة ويحتاج إلى إنقاص المخزون داخل المعاملة.
- سياسة `notifications_self_all` تسمح للمستخدم بإنشاء إشعار لنفسه فقط، بينما الدالة تحاول إنشاء إشعار للمالك نيابة عن العميل.
- الدالة `mark_order_item_unavailable` تحذف من `order_items`، لكن المخطط يعرّف سياسة قراءة وسياسة إدراج فقط، ولا يعرّف سياسة حذف لمالك الشركة.

بالتالي قد تفشل الدوال عند التنفيذ حتى بعد إصلاح أسماء الجداول. الإصلاح الآمن هو إبقاء الدوال `security invoker` عندما يكون ذلك ممكناً، ثم إضافة تصميم صلاحيات واضح، أو تحويل العملية الحساسة إلى `security definer` مضبوط بعناية مع:

1. التحقق داخل الدالة من `auth.uid()` ومن ملكية العميل أو الشركة.
2. تحديد `search_path = public` كما هو موجود بالفعل.
3. منع تمرير معرفات أو كميات غير صالحة.
4. تقليل صلاحيات الدالة إلى العملية المطلوبة فقط.
5. اختبار نجاح وفشل العملية بمستخدم عميل ومستخدم تاجر منفصلين.

لا ينبغي إضافة سياسة عامة تسمح لأي عميل بتحديث `products` أو إنشاء إشعارات لأي مستخدم؛ ذلك سيحوّل إصلاحاً وظيفياً إلى ثغرة صلاحيات.
