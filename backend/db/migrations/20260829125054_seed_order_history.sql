-- Recovered from the remote migration history on 2026-09-03.
-- Applied 2026-08-29.

do $$
declare
  v_customer_ids text[] := array['c-1','c-2','c-3','c-4','c-5','c-6'];
  v_product_ids text[] := array['p-1','p-2','p-3','p-4','p-5','p-6','p-7','p-8','p-9','p-10','p-11','p-12'];
  v_pack_sizes pack_size_label[] := array['250g','500g','1kg','2kg']::pack_size_label[];
  v_day date;
  v_orders_today int;
  v_order_id text;
  v_order_seq int := 1;
  v_status order_status;
  v_kind order_kind;
  v_customer text;
  v_placed timestamptz;
  v_items_count int;
  v_i int;
  v_x int;
  v_product text;
  v_pack pack_size_label;
  v_price numeric;
  v_qty int;
  v_eta timestamptz;
  v_packed date;
  v_delivered timestamptz;
  v_address text;
begin
  for v_day in select generate_series(current_date - interval '29 days', current_date, interval '1 day')::date loop
    v_orders_today := 2 + floor(random() * 4)::int;
    for v_i in 1..v_orders_today loop
      v_order_id := 'ORD-' || to_char(v_order_seq + 3000, 'FM0000');
      v_order_seq := v_order_seq + 1;
      v_customer := v_customer_ids[1 + floor(random() * array_length(v_customer_ids, 1))::int];
      select address into v_address from customers where id = v_customer;
      v_placed := v_day + make_interval(hours => 6 + floor(random() * 12)::int, mins => floor(random() * 60)::int);
      v_kind := (array['subscription', 'one_time'])[1 + floor(random() * 2)::int]::order_kind;

      if v_day = current_date then
        v_status := (array['pending', 'processing', 'packed'])[1 + floor(random() * 3)::int]::order_status;
      elsif v_day > current_date - 2 then
        v_status := (array['pending', 'processing', 'packed', 'shipped'])[1 + floor(random() * 4)::int]::order_status;
      else
        if random() < 0.06 then
          v_status := 'cancelled';
        else
          v_status := 'delivered';
        end if;
      end if;

      v_packed := (v_placed + interval '1 day')::date;
      v_eta := v_placed + interval '2 days';
      v_delivered := case when v_status = 'delivered' then v_eta - interval '3 hours' else null end;

      insert into orders (id, customer_id, status, kind, placed_at, packed_date, eta, delivered_at, address)
      values (v_order_id, v_customer, v_status, v_kind, v_placed, v_packed, v_eta, v_delivered, v_address);

      v_items_count := 1 + floor(random() * 2)::int;
      for v_x in 1..v_items_count loop
        v_product := v_product_ids[1 + floor(random() * array_length(v_product_ids, 1))::int];
        v_pack := v_pack_sizes[1 + floor(random() * 4)::int];
        select price into v_price from product_pack_sizes where product_id = v_product and size = v_pack;
        v_qty := 1 + floor(random() * 3)::int;
        insert into order_items (order_id, product_id, pack_size, qty, price)
        values (v_order_id, v_product, v_pack, v_qty, v_price);
      end loop;
    end loop;
  end loop;
end $$;
;
