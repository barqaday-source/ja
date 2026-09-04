# دليل ربط تاجر مع Supabase لاحقاً

> هذه التهيئة لا تتصل بـ Supabase ولا تحتاج مفاتيح حالياً. الواجهات الحالية تبقى قابلة للمعاينة ببيانات محلية، بينما يوضح هذا الدليل مكان وضع الربط عندما يصبح مشروع Supabase جاهزاً.

## 1. الفكرة العامة

لا تضع استدعاءات Supabase داخل مكونات الشاشة مباشرة. الشاشة يجب أن تعرف نموذج البيانات ودالة Repository فقط. بهذه الطريقة يمكن استبدال البيانات المحلية ببيانات Supabase دون إعادة تصميم الواجهات.

| الطبقة | مكانها | مسؤوليتها |
|---|---|---|
| نموذج المجال | `lib/data/models.ts` | أنواع المستخدم والشركة والمنتج والطلب والدين والإعلان والتوثيق |
| عقود البيانات | `lib/data/repositories.ts` | أسماء الدوال التي تحتاجها الواجهات مثل `products.list` و`products.create` |
| مصدر البيانات الحالي | الشاشات الحالية | بيانات معاينة محلية، ولن تتصل بخدمة خارجية الآن |
| مصدر البيانات المستقبلي | Repository جديد | تنفيذ العقود باستخدام Supabase |
| مخطط قاعدة البيانات | `supabase/schema.sql` | الجداول والعلاقات والفهارس وRLS وStorage المقترحة |

## 2. تثبيت الحزمة عند بدء الربط

عند اتخاذ قرار الربط، ثبّت الحزمة من جذر المشروع:

```bash
pnpm add @supabase/supabase-js
```

لا تضف قيم المفاتيح إلى Git. استخدم متغيرين في إعدادات المشروع:

```text
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

المفتاح `anon` مخصص لتطبيق الهاتف مع RLS. لا تضع `service_role` داخل التطبيق أو في أي ملف يبدأ بـ `EXPO_PUBLIC_`؛ هذا المفتاح يبقى على الخادم فقط.

## 3. عميل Supabase

أنشئ الملف `lib/supabase/client.ts` عند بدء الربط. لا تنشئه الآن حتى تبقى النسخة الحالية بلا اتصال:

```ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error("Supabase environment variables are missing");
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
```

## 4. التسجيل وتسجيل الدخول والخروج

المثال التالي يوضح المكان الذي يُستبدل فيه `AuthRepository` الموجود في `lib/data/repositories.ts`:

```ts
import { supabase } from "@/lib/supabase/client";

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  displayName: string;
  role: "customer" | "merchant";
}) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { display_name: input.displayName, role: input.role },
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

بعد التسجيل، أنشئ صفاً في `profiles` من Hook آمن أو Trigger في Supabase، ولا تسمح للمستخدم بتعيين دور `admin` من التطبيق.

## 5. قراءة المنتجات وإضافتها وتعديلها وحذفها

```ts
import { supabase } from "@/lib/supabase/client";

export async function listProducts(companyId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createProduct(input: {
  companyId: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  category?: string;
  sku?: string;
  options?: Record<string, string[]>;
}) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      company_id: input.companyId,
      name: input.name.trim(),
      price: input.price,
      quantity: input.quantity,
      description: input.description?.trim() || null,
      category: input.category || null,
      sku: input.sku || null,
      options: input.options || {},
      publication_status: "draft",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, patch: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("products")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
```

سيمنع RLS المستخدم من تعديل منتج شركة لا يملكها حتى لو حاول تغيير الطلب يدوياً. لا تعتمد على إخفاء زر الحذف في الواجهة كوسيلة أمان.

## 6. رفع الصور وحذفها

الترتيب الصحيح هو: اختيار الملف من الهاتف، تحويله إلى Blob أو ArrayBuffer، رفعه إلى Bucket، ثم حفظ مسار الملف في `product_images` أو `companies`.

```ts
import { supabase } from "@/lib/supabase/client";

export async function uploadProductImage(input: {
  companyId: string;
  productId: string;
  uri: string;
  contentType: string;
}) {
  const response = await fetch(input.uri);
  const file = await response.blob();
  const extension = input.contentType.split("/")[1] || "jpg";
  const path = `${input.companyId}/${input.productId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("product-media")
    .upload(path, file, { contentType: input.contentType, upsert: false });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("product-media").getPublicUrl(path);
  const { error: imageError } = await supabase.from("product_images").insert({
    product_id: input.productId,
    storage_path: path,
    public_url: data.publicUrl,
  });
  if (imageError) throw imageError;

  return { path, publicUrl: data.publicUrl };
}

export async function deleteProductImage(path: string, imageId: string) {
  const { error: storageError } = await supabase.storage.from("product-media").remove([path]);
  if (storageError) throw storageError;
  const { error: rowError } = await supabase.from("product_images").delete().eq("id", imageId);
  if (rowError) throw rowError;
}
```

بالنسبة لمستندات التوثيق، استخدم Bucket خاصاً وروابط موقعة قصيرة العمر بدلاً من `getPublicUrl`. لا تعرض المستندات في صفحة عامة.

## 7. الطلبات والمخزون والديون

أنشئ الطلب داخل Transaction أو RPC على الخادم حتى لا تصبح الكمية سالبة عند طلبين في الوقت نفسه. لا تخصم الكمية اعتماداً على حساب الهاتف فقط. يجب أن يتحقق الخادم من الكمية والسعر ثم ينشئ `orders` و`order_items` ويحدث `products.quantity` بشكل ذري.

بالنسبة للديون، لا تعدل `paid_amount` من الهاتف مباشرة. أنشئ صفاً في `debt_payments`، ثم احسب المبلغ المدفوع والمتبقي على الخادم أو من View محمية.

## 8. RLS وStorage

شغّل `supabase/schema.sql` بعد مراجعته داخل SQL Editor فقط. الملف لا يُنفذ تلقائياً من التطبيق. أهم القواعد:

1. العميل يقرأ المنتجات المنشورة والبيانات العامة فقط.
2. صاحب الشركة يقرأ ويعدل بيانات شركته ومنتجاتها وطلباتها وديونها.
3. مستندات التوثيق لا تكون عامة.
4. لا يُستخدم `service_role` في الهاتف.
5. اختبر كل سياسة بمستخدم عميل ومستخدم تاجر ومستخدم غير مالك.

## 9. استبدال البيانات المحلية داخل الشاشة

بعد تجهيز Repository، لا تستبدل كل الشاشة دفعة واحدة. ابدأ بقائمة المنتجات:

```ts
const productsRepository = new SupabaseProductRepository(supabase);

const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["products", companyId],
  queryFn: () => productsRepository.list({ companyId }),
});
```

ثم غيّر `onSave` ليستخدم `create` أو `update`، و`onDelete` ليستخدم `delete`، وبعد نجاح العملية نفّذ `refetch`. اعرض حالات التحميل والخطأ وإعادة المحاولة بدلاً من أرقام وهمية.

## 10. ترتيب التنفيذ المقترح

ابدأ بالمصادقة والدور، ثم الشركات، ثم المنتجات والصور، ثم السلة والطلبات، ثم المخزون والديون، ثم الإعلانات والدفع، ثم التوثيق والإشعارات والتقارير. بعد كل مرحلة شغّل TypeScript والاختبارات واختبر RLS بمستخدمين مختلفين.

## 11. متى يصبح التطبيق جاهزاً للنشر؟

لا تعتبر النسخة إنتاجية قبل إزالة كل البيانات المحلية من مسارات الاستخدام، تفعيل المصادقة، تطبيق مخطط قاعدة البيانات، اختبار الحذف والرفع والصلاحيات، ربط مزود الدفع، إضافة معالجة فشل الشبكة، اختبار iOS وAndroid والويب، وتحديث إعدادات الإنتاج دون أسرار داخل المستودع. هذه التهيئة الحالية تحقق فصل العقود والمخطط والتوثيق، لكنها لا تدّعي أن الربط الفعلي قد تم.
