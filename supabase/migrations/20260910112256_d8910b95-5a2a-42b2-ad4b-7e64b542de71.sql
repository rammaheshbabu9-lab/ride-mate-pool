revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
revoke execute on function public.can_view_ride(uuid) from public, anon;
revoke execute on function public.shares_ride_with(uuid) from public, anon;
revoke execute on function public.distance_km(double precision, double precision, double precision, double precision) from public, anon;
revoke execute on function public.quote_fare(double precision) from public, anon;
revoke execute on function public.request_ride(double precision, double precision, text, double precision, double precision, text, public.ride_kind, text) from public, anon;
revoke execute on function public.accept_ride(uuid) from public, anon;
revoke execute on function public.update_ride_status(uuid, public.ride_status) from public, anon;
revoke execute on function public.cancel_my_ride(uuid) from public, anon;
revoke execute on function public.admin_stats() from public, anon;

grant execute on function public.quote_fare(double precision) to authenticated;
grant execute on function public.request_ride(double precision, double precision, text, double precision, double precision, text, public.ride_kind, text) to authenticated;
grant execute on function public.accept_ride(uuid) to authenticated;
grant execute on function public.update_ride_status(uuid, public.ride_status) to authenticated;
grant execute on function public.cancel_my_ride(uuid) to authenticated;
grant execute on function public.admin_stats() to authenticated;