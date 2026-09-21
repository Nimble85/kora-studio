-- Run the whole file on the existing Supabase project used by the deployed app. Safe to repeat.
-- ALTER TABLE alone fixes missing-column errors but does not add the 20 catalog products.
alter table public.sales add column if not exists workshop_at date;
alter table public.sales add column if not exists deposit numeric(12,2);
alter table public.sales add column if not exists candle_choices jsonb;
alter table public.sales add column if not exists instagram_url text;

-- Additional coconut candles and editable workshop products
INSERT INTO public.products (id, name, category, price, active, wax_min_grams, wax_max_grams) VALUES
('11111111-1111-1111-1111-000000000041', 'Звичайний кокос · малий', 'coconut', 550, true, 80, 130),
('11111111-1111-1111-1111-000000000042', 'Звичайний кокос · середній', 'coconut', 750, true, 140, 190),
('11111111-1111-1111-1111-000000000043', 'Звичайний кокос · великий', 'coconut', 950, true, 200, 280),
('11111111-1111-1111-1111-000000000044', 'МК індивідуальний', 'workshop', 2000, true, null, null),
('11111111-1111-1111-1111-000000000045', 'МК на двох · з людини', 'workshop', 1850, true, null, null),
('11111111-1111-1111-1111-000000000046', 'МК для 3-х · з людини', 'workshop', 1650, true, null, null),
('11111111-1111-1111-1111-000000000047', 'МК груповий · свічка в дереві', 'workshop', 1600, true, null, null),
('11111111-1111-1111-1111-000000000048', 'МК для своєї компанії (від 4-х) · свічка в дереві', 'workshop', 1400, true, null, null),
('11111111-1111-1111-1111-000000000049', 'МК груповий · свічка в балійському кокосі', 'workshop', 1400, true, null, null),
('11111111-1111-1111-1111-000000000050', 'МК для своєї компанії (від 4-х) · свічка в балійському кокосі', 'workshop', 1200, true, null, null),
('11111111-1111-1111-1111-000000000051', 'МК груповий · свічка в звичайному кокосі', 'workshop', 750, true, null, null),
('11111111-1111-1111-1111-000000000052', 'МК для своєї компанії (від 4-х) · свічка в звичайному кокосі', 'workshop', 650, true, null, null),
('11111111-1111-1111-1111-000000000053', 'МК груповий · свічка в гіпсі', 'workshop', 950, true, null, null),
('11111111-1111-1111-1111-000000000054', 'МК для своєї компанії (від 4-х) · свічка в гіпсі', 'workshop', 850, true, null, null),
('11111111-1111-1111-1111-000000000055', 'МК груповий · свічка в гіпсі АРТ', 'workshop', 1250, true, null, null),
('11111111-1111-1111-1111-000000000056', 'МК для своєї компанії (від 4-х) · свічка в гіпсі АРТ', 'workshop', 1150, true, null, null),
('11111111-1111-1111-1111-000000000057', 'МК груповий · свічка в склі мала', 'workshop', 550, true, null, null),
('11111111-1111-1111-1111-000000000058', 'МК для своєї компанії (від 4-х) · свічка в склі мала', 'workshop', 450, true, null, null),
('11111111-1111-1111-1111-000000000059', 'МК груповий · свічка в склі велика', 'workshop', 750, true, null, null),
('11111111-1111-1111-1111-000000000060', 'МК для своєї компанії (від 4-х) · свічка в склі велика', 'workshop', 650, true, null, null)
ON CONFLICT (id) DO NOTHING;
