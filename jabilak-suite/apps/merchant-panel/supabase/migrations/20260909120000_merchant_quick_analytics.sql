create or replace function public.get_merchant_quick_analytics(p_merchant_id uuid)
returns json
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_month_start timestamptz := date_trunc('month', current_date);
  v_gross_sales numeric := 0;
  v_total_costs numeric := 0;
  v_pending_debts numeric := 0;
  v_net_profit numeric := 0;
  v_peak_hour text;
  v_peak_hours json;
begin
  -- The current schema records completed sales in orders and has no cost ledger.
  select coalesce(sum(o.total), 0)
    into v_gross_sales
  from public.orders o
  where o.company_id = p_merchant_id
    and o.status in ('confirmed', 'preparing', 'shipped', 'delivered')
    and o.created_at >= v_month_start;

  select coalesce(sum(greatest(d.total_amount - d.paid_amount, 0)), 0)
    into v_pending_debts
  from public.debts d
  where d.company_id = p_merchant_id
    and d.status in ('open', 'partially_paid', 'overdue')
    and d.created_at >= v_month_start;

  -- Costs require a future cost ledger; keep the value explicit rather than reading a non-existent table.
  v_total_costs := 0;
  v_net_profit := v_gross_sales - v_total_costs - v_pending_debts;

  select to_char(o.created_at, 'HH12:00 AM')
    into v_peak_hour
  from public.orders o
  where o.company_id = p_merchant_id
    and o.status in ('confirmed', 'preparing', 'shipped', 'delivered')
    and o.created_at >= v_month_start
  group by to_char(o.created_at, 'HH12:00 AM')
  order by count(*) desc, min(o.created_at)
  limit 1;

  select coalesce(json_agg(hour_row order by hour_row.hour), '[]'::json)
    into v_peak_hours
  from (
    select extract(hour from o.created_at)::int as hour,
           to_char(o.created_at, 'HH12:00 AM') as label,
           count(*)::int as sales_count
    from public.orders o
    where o.company_id = p_merchant_id
      and o.status in ('confirmed', 'preparing', 'shipped', 'delivered')
      and o.created_at >= v_month_start
    group by extract(hour from o.created_at), to_char(o.created_at, 'HH12:00 AM')
  ) as hour_row;

  return json_build_object(
    'gross_sales', v_gross_sales,
    'total_costs', v_total_costs,
    'pending_debts', v_pending_debts,
    'net_profit', v_net_profit,
    'peak_hour', coalesce(v_peak_hour, 'لا توجد بيانات كافية'),
    'peak_hours', v_peak_hours
  );
end;
$$;

grant execute on function public.get_merchant_quick_analytics(uuid) to authenticated;
