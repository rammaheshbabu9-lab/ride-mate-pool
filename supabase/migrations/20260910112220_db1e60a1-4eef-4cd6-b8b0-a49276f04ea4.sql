-- ENUMS
create type public.app_role as enum ('customer','driver','admin');
create type public.ride_status as enum ('searching','matched','driver_arriving','started','completed','cancelled');
create type public.ride_kind as enum ('normal','pool');
create type public.driver_status as enum ('available','busy','offline');
create type public.passenger_status as enum ('active','cancelled','completed');
create type public.payment_status as enum ('pending','paid','failed');

-- UPDATED_AT HELPER
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

-- USER ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

-- VEHICLES
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references auth.users(id) on delete cascade,
  vehicle_number text not null,
  vehicle_type text not null default 'auto',
  seat_capacity int not null default 3 check (seat_capacity between 1 and 8),
  created_at timestamptz not null default now()
);
create index vehicles_driver_idx on public.vehicles(driver_id);
grant select, insert, update, delete on public.vehicles to authenticated;
grant all on public.vehicles to service_role;
alter table public.vehicles enable row level security;

-- DRIVERS
create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  city text,
  status public.driver_status not null default 'offline',
  rating numeric(2,1) not null default 5.0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index drivers_status_idx on public.drivers(status, city);
grant select, insert, update on public.drivers to authenticated;
grant all on public.drivers to service_role;
alter table public.drivers enable row level security;
create trigger drivers_updated before update on public.drivers for each row execute function public.set_updated_at();
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

-- FARE SETTINGS
create table public.fare_settings (
  id uuid primary key default gen_random_uuid(),
  base_fare numeric(10,2) not null default 30,
  price_per_km numeric(10,2) not null default 14,
  minimum_fare numeric(10,2) not null default 50,
  pool_discount_percent numeric(5,2) not null default 30,
  platform_fee numeric(10,2) not null default 2,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
grant select on public.fare_settings to authenticated, anon;
grant insert, update on public.fare_settings to authenticated;
grant all on public.fare_settings to service_role;
alter table public.fare_settings enable row level security;
insert into public.fare_settings (base_fare, price_per_km, minimum_fare, pool_discount_percent, platform_fee, active)
values (30, 14, 50, 30, 2, true);

-- ADMIN SETTINGS
create table public.admin_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.admin_settings to authenticated;
grant all on public.admin_settings to service_role;
alter table public.admin_settings enable row level security;
insert into public.admin_settings (key, value) values
  ('matching', '{"pickup_radius_km": 2.5, "destination_radius_km": 3.0}'::jsonb);

-- RIDES
create table public.rides (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  driver_id uuid references auth.users(id) on delete set null,
  pickup_lat double precision not null,
  pickup_lng double precision not null,
  pickup_address text not null,
  destination_lat double precision not null,
  destination_lng double precision not null,
  destination_address text not null,
  city text,
  estimated_distance_km numeric(8,2) not null,
  estimated_fare numeric(10,2) not null,
  pooled_fare numeric(10,2) not null,
  seat_capacity int not null default 3,
  status public.ride_status not null default 'searching',
  ride_type public.ride_kind not null default 'pool',
  payment_status public.payment_status not null default 'pending',
  platform_fee numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);
create index rides_status_idx on public.rides(status, ride_type, created_at desc);
create index rides_customer_idx on public.rides(customer_id, created_at desc);
create index rides_driver_idx on public.rides(driver_id, created_at desc);
grant select, insert, update on public.rides to authenticated;
grant all on public.rides to service_role;
alter table public.rides enable row level security;

-- RIDE PASSENGERS
create table public.ride_passengers (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  pickup_lat double precision,
  pickup_lng double precision,
  pickup_address text,
  destination_lat double precision,
  destination_lng double precision,
  destination_address text,
  distance_km numeric(8,2),
  pickup_order int not null default 1,
  drop_order int not null default 1,
  individual_fare numeric(10,2) not null default 0,
  status public.passenger_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (ride_id, customer_id)
);
create index ride_passengers_ride_idx on public.ride_passengers(ride_id);
create index ride_passengers_customer_idx on public.ride_passengers(customer_id);
grant select, insert, update on public.ride_passengers to authenticated;
grant all on public.ride_passengers to service_role;
alter table public.ride_passengers enable row level security;

-- RIDE MATCHES
create table public.ride_matches (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  matched_ride_id uuid references public.rides(id) on delete cascade,
  match_score numeric(5,2) not null default 0,
  status text not null default 'accepted',
  created_at timestamptz not null default now()
);
create index ride_matches_ride_idx on public.ride_matches(ride_id);
grant select, insert on public.ride_matches to authenticated;
grant all on public.ride_matches to service_role;
alter table public.ride_matches enable row level security;

-- RIDE EVENTS
create table public.ride_events (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  event_type text not null,
  latitude double precision,
  longitude double precision,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index ride_events_ride_idx on public.ride_events(ride_id, created_at desc);
grant select, insert on public.ride_events to authenticated;
grant all on public.ride_events to service_role;
alter table public.ride_events enable row level security;

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, created_at desc);
grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;

-- HELPER: can view ride
create or replace function public.can_view_ride(_ride_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.rides r
    where r.id = _ride_id
      and (r.customer_id = auth.uid()
           or r.driver_id = auth.uid()
           or exists (select 1 from public.ride_passengers p where p.ride_id = r.id and p.customer_id = auth.uid()))
  ) or public.has_role(auth.uid(), 'admin');
$$;

create or replace function public.shares_ride_with(_other uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.rides r
    left join public.ride_passengers p on p.ride_id = r.id
    where r.status not in ('completed','cancelled')
      and (r.customer_id = auth.uid() or r.driver_id = auth.uid() or p.customer_id = auth.uid())
      and (r.customer_id = _other or r.driver_id = _other
           or exists (select 1 from public.ride_passengers p2 where p2.ride_id = r.id and p2.customer_id = _other))
  );
$$;

-- POLICIES
create policy "profiles_select" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin') or public.shares_ride_with(id));
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'))
  with check (id = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy "user_roles_select" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "user_roles_admin_all" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "vehicles_select" on public.vehicles for select to authenticated using (true);
create policy "vehicles_manage_own" on public.vehicles for all to authenticated
  using (driver_id = auth.uid() or public.has_role(auth.uid(),'admin'))
  with check (driver_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy "drivers_select" on public.drivers for select to authenticated using (true);
create policy "drivers_insert_own" on public.drivers for insert to authenticated
  with check (profile_id = auth.uid() and public.has_role(auth.uid(),'driver'));
create policy "drivers_update_own" on public.drivers for update to authenticated
  using (profile_id = auth.uid() or public.has_role(auth.uid(),'admin'))
  with check (profile_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy "fare_settings_select" on public.fare_settings for select to authenticated, anon using (true);
create policy "fare_settings_admin_write" on public.fare_settings for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "admin_settings_admin_all" on public.admin_settings for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "rides_select" on public.rides for select to authenticated
  using (
    customer_id = auth.uid() or driver_id = auth.uid()
    or exists (select 1 from public.ride_passengers p where p.ride_id = rides.id and p.customer_id = auth.uid())
    or (public.has_role(auth.uid(),'driver') and driver_id is null and status = 'searching')
    or public.has_role(auth.uid(),'admin')
  );
create policy "rides_insert_own" on public.rides for insert to authenticated with check (customer_id = auth.uid());
create policy "rides_update" on public.rides for update to authenticated
  using (
    customer_id = auth.uid() or driver_id = auth.uid()
    or (public.has_role(auth.uid(),'driver') and driver_id is null and status = 'searching')
    or public.has_role(auth.uid(),'admin')
  )
  with check (
    customer_id = auth.uid() or driver_id = auth.uid() or public.has_role(auth.uid(),'admin')
  );

create policy "ride_passengers_select" on public.ride_passengers for select to authenticated
  using (customer_id = auth.uid() or public.can_view_ride(ride_id));
create policy "ride_passengers_insert" on public.ride_passengers for insert to authenticated
  with check (customer_id = auth.uid());
create policy "ride_passengers_update" on public.ride_passengers for update to authenticated
  using (customer_id = auth.uid() or public.can_view_ride(ride_id))
  with check (customer_id = auth.uid() or public.can_view_ride(ride_id));

create policy "ride_matches_select" on public.ride_matches for select to authenticated using (public.can_view_ride(ride_id));
create policy "ride_matches_insert" on public.ride_matches for insert to authenticated with check (public.can_view_ride(ride_id));

create policy "ride_events_select" on public.ride_events for select to authenticated using (public.can_view_ride(ride_id));
create policy "ride_events_insert" on public.ride_events for insert to authenticated with check (public.can_view_ride(ride_id));

create policy "notifications_own" on public.notifications for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- SIGNUP TRIGGER
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), coalesce(new.raw_user_meta_data->>'phone',''), new.email)
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- DISTANCE (haversine, km)
create or replace function public.distance_km(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
returns double precision language sql immutable set search_path = public as $$
  select 6371 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;

-- FARE QUOTE
create or replace function public.quote_fare(_distance_km double precision)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare fs public.fare_settings; normal numeric; pooled numeric;
begin
  select * into fs from public.fare_settings where active order by updated_at desc limit 1;
  if fs is null then raise exception 'Fare settings unavailable'; end if;
  normal := greatest(fs.minimum_fare, round((fs.base_fare + fs.price_per_km * _distance_km)::numeric, 0));
  pooled := greatest(round(fs.minimum_fare * 0.6, 0), round(normal * (1 - fs.pool_discount_percent / 100.0), 0));
  return jsonb_build_object('normal_fare', normal, 'pooled_fare', pooled, 'distance_km', round(_distance_km::numeric, 2));
end; $$;

-- REQUEST RIDE + POOL MATCHING
create or replace function public.request_ride(
  _pickup_lat double precision, _pickup_lng double precision, _pickup_address text,
  _dest_lat double precision, _dest_lng double precision, _dest_address text,
  _ride_type public.ride_kind, _city text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  dist double precision;
  quote jsonb;
  target public.rides;
  new_ride_id uuid;
  seats_used int;
  pickup_r double precision := 2.5;
  dest_r double precision := 3.0;
  score numeric;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  if exists (select 1 from public.ride_passengers p join public.rides r on r.id = p.ride_id
             where p.customer_id = uid and p.status = 'active'
               and r.status in ('searching','matched','driver_arriving','started'))
  then raise exception 'You already have an active ride'; end if;

  dist := public.distance_km(_pickup_lat, _pickup_lng, _dest_lat, _dest_lng);
  if dist is null or dist <= 0.1 then raise exception 'Pickup and destination are too close'; end if;
  quote := public.quote_fare(dist);

  if _ride_type = 'pool' then
    select r.* into target
    from public.rides r
    where r.ride_type = 'pool'
      and r.status in ('searching','matched')
      and r.customer_id <> uid
      and public.distance_km(r.pickup_lat, r.pickup_lng, _pickup_lat, _pickup_lng) <= pickup_r
      and public.distance_km(r.destination_lat, r.destination_lng, _dest_lat, _dest_lng) <= dest_r
      and (select count(*) from public.ride_passengers p where p.ride_id = r.id and p.status = 'active') < r.seat_capacity
    order by public.distance_km(r.pickup_lat, r.pickup_lng, _pickup_lat, _pickup_lng)
           + public.distance_km(r.destination_lat, r.destination_lng, _dest_lat, _dest_lng)
    limit 1;
  end if;

  if target.id is not null then
    select count(*) into seats_used from public.ride_passengers where ride_id = target.id and status = 'active';
    insert into public.ride_passengers (ride_id, customer_id, pickup_lat, pickup_lng, pickup_address,
      destination_lat, destination_lng, destination_address, distance_km, pickup_order, drop_order, individual_fare)
    values (target.id, uid, _pickup_lat, _pickup_lng, _pickup_address, _dest_lat, _dest_lng, _dest_address,
      round(dist::numeric,2), seats_used + 1, seats_used + 1, (quote->>'pooled_fare')::numeric);

    score := greatest(0, 100 - (public.distance_km(target.pickup_lat, target.pickup_lng, _pickup_lat, _pickup_lng)
          + public.distance_km(target.destination_lat, target.destination_lng, _dest_lat, _dest_lng)) * 10)::numeric(5,2);
    insert into public.ride_matches (ride_id, matched_ride_id, match_score) values (target.id, null, score);
    insert into public.ride_events (ride_id, event_type, metadata) values (target.id, 'passenger_joined', jsonb_build_object('customer_id', uid));

    update public.ride_passengers p
      set individual_fare = round((target.estimated_fare * (1 - 0.30))::numeric, 0)
      where p.ride_id = target.id and p.status = 'active';

    if target.status = 'searching' then
      update public.rides set status = 'matched' where id = target.id;
    end if;

    insert into public.notifications (user_id, title, message, type)
    select p.customer_id, 'Pool matched', 'A co-passenger joined your pool. Your fare is now lower.', 'match'
    from public.ride_passengers p where p.ride_id = target.id and p.status = 'active';

    return target.id;
  end if;

  insert into public.rides (customer_id, pickup_lat, pickup_lng, pickup_address, destination_lat, destination_lng,
    destination_address, city, estimated_distance_km, estimated_fare, pooled_fare, ride_type, status)
  values (uid, _pickup_lat, _pickup_lng, _pickup_address, _dest_lat, _dest_lng, _dest_address, _city,
    (quote->>'distance_km')::numeric, (quote->>'normal_fare')::numeric, (quote->>'pooled_fare')::numeric, _ride_type, 'searching')
  returning id into new_ride_id;

  insert into public.ride_passengers (ride_id, customer_id, pickup_lat, pickup_lng, pickup_address,
    destination_lat, destination_lng, destination_address, distance_km, pickup_order, drop_order, individual_fare)
  values (new_ride_id, uid, _pickup_lat, _pickup_lng, _pickup_address, _dest_lat, _dest_lng, _dest_address,
    round(dist::numeric,2), 1, 1,
    case when _ride_type = 'pool' then (quote->>'pooled_fare')::numeric else (quote->>'normal_fare')::numeric end);

  insert into public.ride_events (ride_id, event_type, latitude, longitude)
  values (new_ride_id, 'ride_requested', _pickup_lat, _pickup_lng);

  return new_ride_id;
end; $$;

-- DRIVER ACCEPT
create or replace function public.accept_ride(_ride_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); cap int;
begin
  if not public.has_role(uid, 'driver') then raise exception 'Only drivers can accept rides'; end if;
  select coalesce(v.seat_capacity, 3) into cap from public.drivers d
    left join public.vehicles v on v.id = d.vehicle_id where d.profile_id = uid;
  update public.rides set driver_id = uid, status = 'driver_arriving', seat_capacity = coalesce(cap, seat_capacity)
    where id = _ride_id and driver_id is null and status in ('searching','matched');
  if not found then raise exception 'This ride is no longer available'; end if;
  update public.drivers set status = 'busy' where profile_id = uid;
  insert into public.ride_events (ride_id, event_type) values (_ride_id, 'driver_accepted');
  insert into public.notifications (user_id, title, message, type)
  select p.customer_id, 'Driver on the way', 'Your driver has accepted the ride and is arriving.', 'ride'
  from public.ride_passengers p where p.ride_id = _ride_id and p.status = 'active';
end; $$;

-- RIDE STATUS UPDATE BY DRIVER
create or replace function public.update_ride_status(_ride_id uuid, _status public.ride_status)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); fee numeric;
begin
  if not exists (select 1 from public.rides where id = _ride_id and driver_id = uid) then
    raise exception 'Ride not assigned to you';
  end if;
  select platform_fee into fee from public.fare_settings where active order by updated_at desc limit 1;
  update public.rides set status = _status,
    started_at = case when _status = 'started' then now() else started_at end,
    completed_at = case when _status = 'completed' then now() else completed_at end,
    platform_fee = case when _status = 'completed' then coalesce(fee, 2) else platform_fee end
  where id = _ride_id;
  if _status = 'completed' then
    update public.ride_passengers set status = 'completed' where ride_id = _ride_id and status = 'active';
    update public.drivers set status = 'available' where profile_id = uid;
  end if;
  insert into public.ride_events (ride_id, event_type) values (_ride_id, 'status_' || _status::text);
  insert into public.notifications (user_id, title, message, type)
  select p.customer_id, 'Ride update', 'Your ride status is now ' || replace(_status::text,'_',' ') || '.', 'ride'
  from public.ride_passengers p where p.ride_id = _ride_id;
end; $$;

-- CANCEL RIDE (passenger)
create or replace function public.cancel_my_ride(_ride_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); remaining int;
begin
  update public.ride_passengers set status = 'cancelled' where ride_id = _ride_id and customer_id = uid and status = 'active';
  if not found then raise exception 'You are not on this ride'; end if;
  select count(*) into remaining from public.ride_passengers where ride_id = _ride_id and status = 'active';
  if remaining = 0 then
    update public.rides set status = 'cancelled' where id = _ride_id;
    update public.drivers d set status = 'available'
      where d.profile_id = (select driver_id from public.rides where id = _ride_id);
  end if;
  insert into public.ride_events (ride_id, event_type, metadata) values (_ride_id, 'passenger_cancelled', jsonb_build_object('customer_id', uid));
end; $$;

-- ADMIN STATS
create or replace function public.admin_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Not allowed'; end if;
  return jsonb_build_object(
    'customers', (select count(*) from public.user_roles where role = 'customer'),
    'drivers', (select count(*) from public.drivers),
    'active_rides', (select count(*) from public.rides where status in ('searching','matched','driver_arriving','started')),
    'completed_rides', (select count(*) from public.rides where status = 'completed'),
    'cancelled_rides', (select count(*) from public.rides where status = 'cancelled'),
    'pooled_rides', (select count(*) from public.rides where ride_type = 'pool'),
    'platform_fees', (select coalesce(sum(platform_fee),0) from public.rides where status = 'completed'),
    'gross_fares', (select coalesce(sum(individual_fare),0) from public.ride_passengers where status = 'completed')
  );
end; $$;

-- REALTIME
alter table public.rides replica identity full;
alter table public.ride_passengers replica identity full;
alter table public.drivers replica identity full;
alter table public.notifications replica identity full;
alter publication supabase_realtime add table public.rides;
alter publication supabase_realtime add table public.ride_passengers;
alter publication supabase_realtime add table public.drivers;
alter publication supabase_realtime add table public.notifications;