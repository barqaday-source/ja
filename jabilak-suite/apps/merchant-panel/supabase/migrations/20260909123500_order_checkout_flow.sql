alter table public.companies
  add column if not exists delivery_inside_province bigint,
  add column if not exists delivery_outside_province bigint;

alter table public.orders
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists delivery_region text not null default 'inside_province';

create or replace function public.create_order_from_cart(
  p_company_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_delivery_region text,
  p_delivery_address text,
  p_items jsonb,
  p_subtotal bigint,
  p_delivery_fee bigint,
  p_discount bigint,
  p_total bigint
)
returns json
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_order_id uuid;
  v_expected_subtotal bigint;
  v_expected_delivery bigint;
  v_expected_total bigint;
  v_delivery_inside bigint;
  v_delivery_outside bigint;
  item jsonb;
  product_row record;
begin
  if auth.uid() is null then raise exception 'يجب تسجيل الدخول لإرسال الطلب'; end if;
  if p_customer_name is null or length(trim(p_customer_name)) < 2 then raise exception 'اسم العميل غير مكتمل'; end if;
  if p_customer_phone is null or length(trim(p_customer_phone)) < 7 then raise exception 'رقم الهاتف غير مكتمل'; end if;
  if p_delivery_region not in ('inside_province', 'outside_province') then raise exception 'منطقة التوصيل غير صحيحة'; end if;

  select delivery_inside_province, delivery_outside_province
    into v_delivery_inside, v_delivery_outside
  from public.companies where id = p_company_id;
  if not found then raise exception 'المتجر غير موجود'; end if;
  if (p_delivery_region = 'inside_province' and v_delivery_inside is null)
    or (p_delivery_region = 'outside_province' and v_delivery_outside is null) then
    raise exception 'لم يحدد التاجر أجور التوصيل لهذه المنطقة بعد';
  end if;

  v_expected_subtotal := 0;
  for item in select * from jsonb_array_elements(p_items) loop
    select id, name, price, quantity into product_row
    from public.products
    where id = (item->>'product_id')::uuid and company_id = p_company_id and publication_status = 'published'
    for update;
    if not found then raise exception 'أحد المنتجات لم يعد متاحاً'; end if;
    if product_row.quantity < (item->>'quantity')::int then raise exception 'الكمية المطلوبة غير متوفرة للمنتج %', product_row.name; end if;
    v_expected_subtotal := v_expected_subtotal + product_row.price * (item->>'quantity')::int;
  end loop;

  v_expected_delivery := case when p_delivery_region = 'inside_province' then v_delivery_inside else v_delivery_outside end;
  v_expected_total := v_expected_subtotal + v_expected_delivery - greatest(p_discount, 0);
  if p_subtotal <> v_expected_subtotal or p_delivery_fee <> v_expected_delivery or p_total <> greatest(v_expected_total, 0) then
    raise exception 'تم تغيير الأسعار، أعد مراجعة السلة قبل التأكيد';
  end if;

  insert into public.orders (company_id, customer_id, customer_name, customer_phone, delivery_region, status, subtotal, delivery_fee, discount, total, delivery_address)
  values (p_company_id, auth.uid(), trim(p_customer_name), trim(p_customer_phone), p_delivery_region, 'pending', v_expected_subtotal, v_expected_delivery, greatest(p_discount, 0), greatest(v_expected_total, 0), p_delivery_address)
  returning id into v_order_id;

  for item in select * from jsonb_array_elements(p_items) loop
    select name, price into product_row from public.products where id = (item->>'product_id')::uuid;
    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
    values (v_order_id, (item->>'product_id')::uuid, product_row.name, product_row.price, (item->>'quantity')::int, product_row.price * (item->>'quantity')::int);
    update public.products set quantity = quantity - (item->>'quantity')::int, updated_at = now() where id = (item->>'product_id')::uuid;
  end loop;

  insert into public.notifications (user_id, title, body, type)
  select c.owner_id, 'طلب جديد', 'وصل طلب جديد بقيمة ' || greatest(v_expected_total, 0)::text || ' د.ع', 'new_order'
  from public.companies c where c.id = p_company_id;

  return json_build_object('order_id', v_order_id, 'status', 'pending', 'total', greatest(v_expected_total, 0));
end;
$$;

grant execute on function public.create_order_from_cart(uuid, text, text, text, text, jsonb, bigint, bigint, bigint, bigint) to authenticated;

create or replace function public.mark_order_item_unavailable(p_order_id uuid, p_product_id uuid)
returns json
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_order public.orders;
  v_removed_name text;
  v_removed_total bigint;
  v_new_total bigint;
begin
  select * into v_order from public.orders where id = p_order_id and public.is_company_owner(company_id) for update;
  if not found then raise exception 'الطلب غير موجود أو لا تملك صلاحية تعديله'; end if;

  select product_name, line_total into v_removed_name, v_removed_total from public.order_items where order_id = p_order_id and product_id = p_product_id;
  if not found then raise exception 'العنصر غير موجود في الطلب'; end if;

  delete from public.order_items where order_id = p_order_id and product_id = p_product_id;
  v_new_total := greatest(v_order.total - v_removed_total, 0);
  update public.orders set subtotal = greatest(subtotal - v_removed_total, 0), total = v_new_total, updated_at = now() where id = p_order_id;
  insert into public.notifications (user_id, title, body, type)
  values (v_order.customer_id, 'تم تعديل طلبك', 'تم حذف ' || v_removed_name || ' لعدم توفره. المجموع الجديد ' || v_new_total::text || ' د.ع', 'order_updated');

  return json_build_object('order_id', p_order_id, 'removed_product_id', p_product_id, 'new_total', v_new_total, 'message', 'تم تحديث الطلب وإشعار الزبون');
end;
$$;

grant execute on function public.mark_order_item_unavailable(uuid, uuid) to authenticated;
