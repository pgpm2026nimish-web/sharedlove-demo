import { createContext, useContext, useEffect, useState } from 'react'
import { SEED_LISTINGS } from '../lib/seed.js'
import { ADMIN_PASSWORD } from '../lib/auth.js'
import { SEED_USERS } from '../lib/users.js'
import { POINTS_PER_PURCHASE, POINTS_PER_SALE } from '../lib/impact.js'
import { loadActivityLog, saveActivityLog } from '../lib/activityLog.js'

const AppContext = createContext(null)

const SETTINGS_KEY = 'sharedlove.settings.v1'
const ADMIN_KEY = 'sharedlove.isAdmin.v1'
const THEME_KEY = 'sharedlove.theme.v1'
const USER_KEY = 'sharedlove.currentUserId.v1'

function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // ignore
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const DEFAULT_SETTINGS = {
  providerId: 'simulated',
  apiKeys: { gemini: '', openai: '', claude: '', openrouter: '' },
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'llava',
  openrouterModel: 'meta-llama/llama-3.2-11b-vision-instruct:free',
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    // Merge onto the defaults rather than replacing them outright, so a
    // browser that saved settings before some field existed (e.g. Ollama
    // was added after someone had already configured Gemini) still gets
    // that field's default instead of silently ending up undefined.
    if (raw) {
      const saved = JSON.parse(raw)
      return { ...DEFAULT_SETTINGS, ...saved, apiKeys: { ...DEFAULT_SETTINGS.apiKeys, ...saved.apiKeys } }
    }
  } catch {
    // ignore — private browsing / blocked storage
  }
  return DEFAULT_SETTINGS
}

function loadIsAdmin() {
  try {
    return sessionStorage.getItem(ADMIN_KEY) === 'true'
  } catch {
    return false
  }
}

function loadCurrentUserId() {
  try {
    return sessionStorage.getItem(USER_KEY)
  } catch {
    return null
  }
}

export function AppProvider({ children }) {
  const [listings, setListings] = useState(SEED_LISTINGS)
  const [orders, setOrders] = useState([])
  const [cart, setCart] = useState([]) // array of listing ids
  const [wishlist, setWishlist] = useState([]) // array of listing ids
  const [points, setPoints] = useState({}) // { displayName: points } — both buyers and sellers earn into this
  const [impactEvents, setImpactEvents] = useState([]) // trees planted log
  const [settings, setSettings] = useState(loadSettings)
  const [isAdmin, setIsAdmin] = useState(loadIsAdmin)
  const [theme, setTheme] = useState(loadTheme)
  const [users, setUsers] = useState(SEED_USERS)
  const [currentUserId, setCurrentUserId] = useState(loadCurrentUserId)
  const [activityLog, setActivityLog] = useState(loadActivityLog)

  const currentUser = users.find((u) => u.id === currentUserId) ?? null

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch {
      // ignore
    }
  }, [settings])

  // Admin-visible activity log (logins, purchases, exit surveys). Persisted
  // to localStorage, unlike most app state, since the point is to survive
  // refresh so it's actually reportable from Admin.
  useEffect(() => {
    saveActivityLog(activityLog)
  }, [activityLog])

  function logEvent(type, data) {
    setActivityLog((prev) => [...prev, { id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type, timestamp: Date.now(), ...data }])
  }

  function clearActivityLog() {
    setActivityLog([])
  }

  function removeActivityEvent(eventId) {
    setActivityLog((prev) => prev.filter((e) => e.id !== eventId))
  }

  // Shown to a user right before they log out; skippable. Logged as its own
  // event type alongside logins and purchases so Admin can see satisfaction
  // trends, not just usage counts.
  function submitExitSurvey(stars, comment) {
    if (!currentUser) return
    logEvent('survey', { user: currentUser.name, stars, comment: comment?.trim() || '' })
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // ignore
    }
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  // Admin unlock is per-tab (sessionStorage), not persisted long-term, so a
  // shared/public device doesn't stay unlocked after the browser is closed.
  function loginAdmin(password) {
    const ok = password === ADMIN_PASSWORD
    if (ok) {
      setIsAdmin(true)
      try {
        sessionStorage.setItem(ADMIN_KEY, 'true')
      } catch {
        // ignore
      }
    }
    return ok
  }

  function logoutAdmin() {
    setIsAdmin(false)
    try {
      sessionStorage.removeItem(ADMIN_KEY)
    } catch {
      // ignore
    }
  }

  // Session is per-tab (sessionStorage), same pattern as admin: closing the
  // browser signs out on a shared/public device.
  function setSession(userId) {
    setCurrentUserId(userId)
    try {
      if (userId) sessionStorage.setItem(USER_KEY, userId)
      else sessionStorage.removeItem(USER_KEY)
    } catch {
      // ignore
    }
  }

  // Accepts either the account's email or its public display name as the
  // identifier, so someone who forgets which they signed up with can still
  // get in; same password check either way.
  function login(identifier, password) {
    const trimmed = identifier.trim().toLowerCase()
    const user = users.find((u) => (u.email.toLowerCase() === trimmed || u.name.toLowerCase() === trimmed) && u.password === password)
    if (user) {
      setSession(user.id)
      logEvent('login', { user: user.name, email: user.email })
    }
    return !!user
  }

  function register(realName, displayName, email, password) {
    const trimmedEmail = email.trim().toLowerCase()
    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      return { ok: false, error: 'An account with this email already exists.' }
    }
    if (users.some((u) => u.name.toLowerCase() === displayName.trim().toLowerCase())) {
      return { ok: false, error: 'That display name is already taken.' }
    }
    const user = {
      id: `u-${Date.now()}`,
      realName: realName.trim(),
      name: displayName.trim(),
      email: trimmedEmail,
      password,
      role: 'buyer',
      paymentMethods: [],
      payoutMethod: null,
    }
    setUsers((prev) => [...prev, user])
    setSession(user.id)
    return { ok: true }
  }

  function logout() {
    setSession(null)
  }

  // Requires the current password so a shared/public device can't have its
  // password changed by someone who isn't actually the account holder.
  function changePassword(currentPassword, newPassword) {
    if (!currentUser) return { ok: false, error: 'Not logged in.' }
    if (currentUser.password !== currentPassword) return { ok: false, error: 'Current password is incorrect.' }
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, password: newPassword } : u)))
    return { ok: true }
  }

  // Simulated only — no real gateway. Stored on the buyer's own account so
  // it's there next time they check out, same as a real saved-card list.
  function addPaymentMethod(method) {
    if (!currentUser) return null
    const withId = { ...method, id: `pm-${Date.now()}` }
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, paymentMethods: [...(u.paymentMethods ?? []), withId] } : u)))
    return withId.id
  }

  function removePaymentMethod(methodId) {
    if (!currentUser) return
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, paymentMethods: (u.paymentMethods ?? []).filter((m) => m.id !== methodId) } : u)))
  }

  // Seller payout destination — set once on first listing, then reused
  // (shown auto-filled with a "change" option) on every listing after.
  function setPayoutMethod(method) {
    if (!currentUser) return
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, payoutMethod: method } : u)))
  }

  function addListing(listing) {
    setListings((prev) => [listing, ...prev])
  }

  function toggleWishlist(listingId) {
    setWishlist((prev) => (prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId]))
  }

  function addToCart(listingId) {
    setCart((prev) => (prev.includes(listingId) ? prev : [...prev, listingId]))
  }

  function removeFromCart(listingId) {
    setCart((prev) => prev.filter((id) => id !== listingId))
  }

  function clearCart() {
    setCart([])
  }

  function placeOrder(listingId, paymentMethod) {
    const order = {
      id: `o-${Date.now()}-${listingId}`,
      listingId,
      status: 'out-for-delivery',
      paymentMethod,
      createdAt: Date.now(),
      dispute: null,
    }
    setOrders((prev) => [order, ...prev])
    setListings((prev) => prev.map((l) => (l.id === listingId ? { ...l, status: 'sold' } : l)))
    return order
  }

  // Places one order per cart item (payment "held" until the buyer accepts
  // at open-box), then empties the cart. Returns the created order ids.
  function checkout(paymentMethod) {
    const createdIds = cart.map((listingId) => placeOrder(listingId, paymentMethod).id)
    clearCart()
    return createdIds
  }

  // Undoes testing/demo state without a page refresh: listings back to
  // "listed" (nothing marked sold), orders/cart/wishlist/points/impact
  // cleared. Doesn't touch accounts, session, or settings.
  function resetDemoData() {
    setListings(SEED_LISTINGS)
    setOrders([])
    setCart([])
    setWishlist([])
    setPoints({})
    setImpactEvents([])
  }

  function updateOrder(orderId, patch) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...patch } : o)))
  }

  // Called when a buyer accepts a delivered item: the sale is final, so
  // both sides earn points and a tree is logged as planted in both names.
  function completeOrder(orderId, listing) {
    const buyerName = currentUser?.name ?? 'You'
    updateOrder(orderId, { status: 'accepted' })
    setPoints((prev) => ({
      ...prev,
      [listing.seller]: (prev[listing.seller] ?? 0) + POINTS_PER_SALE,
      [buyerName]: (prev[buyerName] ?? 0) + POINTS_PER_PURCHASE,
    }))
    setImpactEvents((prev) => [...prev, { orderId, seller: listing.seller, buyer: buyerName, createdAt: Date.now() }])
    logEvent('purchase', { buyer: buyerName, seller: listing.seller, title: listing.title, price: listing.grade.price, orderId })
  }

  const value = {
    listings,
    addListing,
    orders,
    placeOrder,
    checkout,
    updateOrder,
    completeOrder,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    wishlist,
    toggleWishlist,
    points,
    impactEvents,
    settings,
    setSettings,
    isAdmin,
    loginAdmin,
    logoutAdmin,
    theme,
    toggleTheme,
    currentUser,
    login,
    register,
    logout,
    changePassword,
    addPaymentMethod,
    removePaymentMethod,
    setPayoutMethod,
    resetDemoData,
    activityLog,
    clearActivityLog,
    removeActivityEvent,
    submitExitSurvey,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
