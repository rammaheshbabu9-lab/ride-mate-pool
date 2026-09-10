# Ride Together

Build a complete production-ready MVP called “RidePool”.

CORE IDEA:

RidePool connects passengers who are traveling in the same direction so they can share one auto/cab ride and split the fare.

IMPORTANT:

Do not build a generic Uber/Rapido clone.

The main product differentiator is ROUTE-BASED RIDE POOLING.

TECH STACK:

- Frontend: HTML/CSS/JavaScript or React if required by Lovable

- Backend/database: Supabase

- Supabase Auth

- Supabase PostgreSQL

- Supabase Row Level Security (RLS)

- Supabase Realtime

- Mobile-first responsive design

- PWA-ready architecture

ROLES:

1. Customer

2. Driver

3. Admin

CUSTOMER FLOW:

- Sign up / Login

- Select pickup location

- Select destination

- Show estimated distance

- Show estimated normal fare

- Show estimated pooled fare

- Option: “Pool Ride”

- Create pool request

- Show matching passengers/rides when available

- Confirm ride

- Show driver details

- Show ride status:

  Searching → Matched → Driver arriving → Started → Completed

- Show fare/share amount

- Ride history

- Profile

- Cancel ride

DRIVER FLOW:

- Sign up / Login

- Driver profile

- Add vehicle/auto number

- Select city

- Driver status:

  Available / Busy / Offline

- See nearby pool requests

- Accept suitable pooled ride

- Show pickup sequence

- Start ride

- Update ride status

- Complete ride

- Show total fare and driver earnings

- Ride history

POOL MATCHING:

Implement a simple and reliable first version.

Match customers primarily using:

- Same/similar pickup area

- Same/similar destination direction

- Reasonable distance difference

- Compatible ride status

- Available vehicle capacity

Do NOT attempt complicated AI routing in MVP.

Create a clean matching algorithm that can later be improved.

FARE:

Create configurable fare settings in database.

Admin can configure:

- Base fare

- Price per KM

- Minimum fare

- Pool discount

- Platform fee

For MVP, default platform fee can be ₹2 per completed ride.

Never expose admin fee configuration unnecessarily to customers/drivers.

DATABASE:

Create all required Supabase tables, relationships, indexes and constraints.

Suggested tables:

- profiles

- drivers

- vehicles

- fare_settings

- rides

- ride_passengers

- ride_matches

- ride_events

- notifications

- admin_settings

Use UUID primary keys.

profiles:

- id

- full_name

- phone

- email

- role

- avatar_url

- created_at

- updated_at

roles:

customer

driver

admin

drivers:

- id

- profile_id

- vehicle_id

- city

- status

- rating

- created_at

- updated_at

vehicles:

- id

- driver_id

- vehicle_number

- vehicle_type

- seat_capacity

- created_at

rides:

- id

- customer_id

- driver_id

- pickup_lat

- pickup_lng

- pickup_address

- destination_lat

- destination_lng

- destination_address

- estimated_distance_km

- estimated_fare

- pooled_fare

- status

- ride_type

- created_at

- started_at

- completed_at

ride_passengers:

- id

- ride_id

- customer_id

- pickup_order

- drop_order

- individual_fare

- status

- created_at

ride_matches:

- id

- ride_id

- matched_ride_id

- match_score

- status

- created_at

ride_events:

- id

- ride_id

- event_type

- latitude

- longitude

- metadata

- created_at

notifications:

- id

- user_id

- title

- message

- type

- read

- created_at

fare_settings:

- id

- base_fare

- price_per_km

- minimum_fare

- pool_discount_percent

- platform_fee

- active

- updated_at

SECURITY:

Implement proper Supabase RLS.

Customers can:

- Read/update their own profile

- Create their own rides

- Read their own rides

- Read information required for their active ride

Drivers can:

- Read/update their own driver profile

- Read eligible ride requests

- Accept rides

- Update rides assigned to them

- Read their ride history

Admin can manage everything.

Never expose service_role keys in frontend code.

Use only the Supabase anon/publishable key in frontend where appropriate.

AUTH:

Implement Supabase email/password authentication.

After signup:

- create profile automatically

- default role = customer

- driver/admin roles must NOT be freely selectable by users

Admin role must be controlled securely.

LOCATION:

For MVP implement browser Geolocation API.

Ask user for location permission only when location is required.

Show:

- current location

- pickup

- destination

Keep map integration modular so Google Maps/Mapbox can be added later.

Do not make paid map APIs mandatory for the first MVP.

REALTIME:

Use Supabase Realtime for:

- ride status

- driver status

- active ride updates

- matching updates

- notifications

UI:

Create a premium, modern, simple mobile-first design.

Design philosophy:

- Very easy for Indian users

- Large buttons

- Clear prices

- Minimal screens

- Fast loading

- Clean typography

- Professional startup appearance

CUSTOMER HOME:

Show:

“Where are you going?”

Pickup

Destination

Then:

Normal Ride

Pool Ride

Pool Ride should clearly communicate:

“Share your route. Pay less.”

DRIVER HOME:

Show:

Driver status toggle

Available

Busy

Offline

When Available:

Show nearby pool requests as cards.

ADMIN DASHBOARD:

Show:

- Total customers

- Total drivers

- Active rides

- Completed rides

- Cancelled rides

- Total platform fees

- Ride statistics

- Fare settings

- Driver management

- Customer management

ERROR HANDLING:

Handle:

- GPS permission denied

- Invalid locations

- No matching ride

- Driver unavailable

- Ride cancelled

- Network failure

- Authentication errors

- Database errors

- Duplicate ride requests

Show user-friendly messages.

Do not show raw database errors to users.

IMPORTANT PRODUCT RULE:

The MVP must remain simple.

Do NOT add:

- Wallet

- complicated AI

- unnecessary social features

- complicated loyalty system

- crypto

- unnecessary subscriptions

- complicated payment system initially

Build the core ride pooling experience first.

PAYMENTS:

Keep payment architecture modular.

For MVP:

- calculate fare

- display fare

- record payment status

Do not hard-code fake successful payments.

Prepare the architecture so Razorpay/UPI/payment gateway can be integrated later.

TESTING:

After implementation:

1. Check all routes

2. Check authentication

3. Check customer flow

4. Check driver flow

5. Check admin flow

6. Check database queries

7. Check RLS

8. Check realtime updates

9. Check mobile responsiveness

10. Check console errors

11. Fix all obvious errors

12. Verify no secrets are exposed

IMPORTANT:

Do not stop after generating the UI.

Actually implement the database integration and application logic.

If Supabase connection is not yet available, create the complete application structure and clearly identify the exact Supabase connection step required.

Generate the required SQL migrations/schema through the Lovable Supabase integration where supported.

Keep all database operations organized and secure.

FINAL REQUIREMENT:

Build the application end-to-end as a working RidePool MVP, not a static demo.

The final result should allow:

Customer → Login → Pickup → Destination → Pool Ride → Request → Match → Driver → Start Ride → Complete Ride → Fare

Driver → Login → Available → Ride Request → Accept → Pickup → Start → Complete → Earnings

Admin → Login → Dashboard → Manage Customers/Drivers/Rides/Fares

Make the code clean, maintainable and ready for future scaling.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/81c9c5c4-daff-43de-b7a9-58dc999890c6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
