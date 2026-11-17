// Creates (or resets) one email/password account for the customer storefront.
//
// The account signs in like anyone else and can never reach the admin panel:
// the on_auth_user_created trigger gives every new user role='customer', and
// the frontend's ProtectedRoute bounces any non-admin to /shop.
//
// The trigger only creates a `customers` row for Google sign-ins, so this
// script creates one too — otherwise the profile page would be empty until
// the first checkout.
//
// No dependencies: it talks to the Auth admin and REST endpoints with fetch,
// so it runs from backend/ without a node_modules folder.
//
// Needs the service-role key (Supabase dashboard → Project Settings → API).
// Pass it on the command line only — never put it in frontend/.env, whose
// VITE_* values ship to the browser.
//
//   SUPABASE_SERVICE_ROLE_KEY=... node backend/scripts/create-demo-customer.mjs
//
// The project URL comes from SUPABASE_URL, or else from VITE_SUPABASE_URL in
// frontend/.env. Optional overrides: DEMO_EMAIL, DEMO_PASSWORD, DEMO_NAME.

import { existsSync, readFileSync } from 'node:fs'

function readFrontendEnv() {
  const file = new URL('../../frontend/.env', import.meta.url)
  if (!existsSync(file)) return {}
  return Object.fromEntries(
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line.includes('=') && !line.trimStart().startsWith('#'))
      .map((line) => [line.slice(0, line.indexOf('=')).trim(), line.slice(line.indexOf('=') + 1).trim()]),
  )
}

const url = (process.env.SUPABASE_URL ?? readFrontendEnv().VITE_SUPABASE_URL)?.replace(/\/$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY (and SUPABASE_URL, or VITE_SUPABASE_URL in frontend/.env).')
  process.exit(1)
}

const email = process.env.DEMO_EMAIL ?? 'demo.customer@ista.test'
const password = process.env.DEMO_PASSWORD ?? 'IstaDemo@2026'
const name = process.env.DEMO_NAME ?? 'Demo Customer'

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  'Content-Type': 'application/json',
}

async function call(path, init = {}) {
  const res = await fetch(`${url}${path}`, { ...init, headers: { ...headers, ...init.headers } })
  const text = await res.text()
  const body = text ? JSON.parse(text) : null
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status}: ${text}`)
  return body
}

async function findUserByEmail(target) {
  for (let page = 1; ; page++) {
    const { users } = await call(`/auth/v1/admin/users?page=${page}&per_page=200`)
    const hit = users.find((u) => u.email?.toLowerCase() === target.toLowerCase())
    if (hit || users.length < 200) return hit ?? null
  }
}

let user = await findUserByEmail(email)
if (user) {
  // Re-running resets the password, so the credentials below always work.
  await call(`/auth/v1/admin/users/${user.id}`, {
    method: 'PUT',
    body: JSON.stringify({ password, email_confirm: true }),
  })
  console.log(`Existing user ${email} — password reset.`)
} else {
  user = await call('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name: name } }),
  })
  console.log(`Created user ${email}.`)
}

const [profile] = await call(`/rest/v1/profiles?id=eq.${user.id}&select=role`)
if (profile?.role === 'admin') {
  console.error(`${email} is an ADMIN account — refusing to treat it as a customer. Pick another DEMO_EMAIL.`)
  process.exit(1)
}
if (!profile) {
  await call('/rest/v1/profiles', { method: 'POST', body: JSON.stringify({ id: user.id, email, role: 'customer' }) })
}

const [existing] = await call(`/rest/v1/customers?user_id=eq.${user.id}&select=id`)
if (!existing) {
  const initials = name.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  await call('/rest/v1/customers', {
    method: 'POST',
    body: JSON.stringify({
      id: `c-${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`,
      user_id: user.id,
      name,
      email,
      initials,
    }),
  })
}

console.log(`\nCustomer login ready (role=customer, admin panel blocked):\n  email:    ${email}\n  password: ${password}`)
