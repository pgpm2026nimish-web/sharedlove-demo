// Two dummy accounts for demo/testing — simple numeric passwords on purpose,
// same client-side-only caveat as the admin password: fine for a demo, not
// real security. `role` is just a display label here (anyone can browse,
// sell, and buy regardless of role, matching how the real marketplace works
// peer-to-peer); it's not an access-control boundary.
//
// `name` is the public display name (shown as "Seller"/"Buyer" everywhere,
// Steam-style) — `realName` is private account info, only ever shown back
// to the account holder on their own profile.
// `paymentMethods` (buyer-side, checkout) and `payoutMethod` (seller-side,
// where sale proceeds go) are simulated — no real gateway, just display-safe
// strings, seeded here so the demo can show the "already saved, auto-filled"
// state without a judge having to add one live first.
export const SEED_USERS = [
  {
    id: 'u-buyer',
    realName: 'Demo Buyer Account',
    name: 'Demo Buyer',
    email: 'buyer@demo.com',
    password: '1111',
    role: 'buyer',
    paymentMethods: [{ id: 'pm-demo', type: 'upi', upiId: 'demo.buyer@okhdfc' }],
    payoutMethod: null,
  },
  {
    id: 'u-seller',
    realName: 'Demo Seller Account',
    name: 'Demo Seller',
    email: 'seller@demo.com',
    password: '2222',
    role: 'seller',
    paymentMethods: [],
    payoutMethod: { type: 'upi', upiId: 'demo.seller@okicici' },
  },
]
