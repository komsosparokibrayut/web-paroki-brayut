# Web Paroki Brayut — Paroki Brayut Church Website

**Version:** 1.2.0 | **Stack:** Next.js 15 (App Router) + TypeScript + shadcn/ui + Firebase Auth + GitHub JSON (content) + Vercel

---

## 1. Project Overview

Web Paroki Brayut is a bilingual (Indonesian/English) church website for Paroki Brayut, managed through a role-based admin panel. Content is stored in GitHub JSON files, and authentication uses Firebase session cookies.

**Key differences from a standard blog CMS:**
- **GitHub as content storage** — all structured content (jadwal misa, bookings, pastor tim, wilayah, etc.) lives in JSON files in a GitHub repository
- **Firebase Auth** — not NextAuth; session cookies for stateless server-side validation
- **Role-based access** — `admin_paroki` (full access) vs `admin_wilayah` (scoped per wilayah)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, RSC) |
| Language | TypeScript (strict) |
| UI | shadcn/ui + Radix + Tailwind CSS |
| Auth | Firebase Auth (session cookies) |
| Content storage | GitHub JSON files (via GitHub App) |
| Database | Firestore (booking waitlist, contact submissions) |
| Hosting | Vercel |
| Testing | Vitest 3 |

---

## 3. Features

### Public Site
- **Home** — hero banner, info card, quick links
- **Misa & Seremoni** — weekly mass schedule + special masses (multi-language: Indonesia, Latin, English, Jawa)
- **Pelayanan** — pastor profile, organizational structure (seksi & tim kerja)
- **Lingkungan** — list of lingkungan/worship communities by wilayah
- **Galeri** — photo gallery with album support
- **Booking** — meeting room & facility reservation system with availability check
- **Contact** — contact form, WhatsApp link, sekretariat hours
- **Blog/News** — articles, pastor reflections, announcements
- **UMKM** — church community business directory

### Admin Panel (`/admin`)
Accessible at `/admin/login` — restricted to authenticated admins only.

#### Role: `admin_paroki` (full access)
All CRUD operations across all modules.

#### Role: `admin_wilayah` (scoped)
Limited to data within their assigned wilayah:

| Module | admin_wilayah Access |
|---|---|
| **Bookings** | View all bookings; manage (confirm/cancel) scoped to their wilayah |
| **Gereja** | View all churches; edit only churches in their wilayah; cannot add new |
| **Wilayah & Lingkungan** | Edit their own wilayah data (except name); manage lingkungan within it; cannot add new wilayah |
| **Pastor & Tim** | View only — no create/update/delete |
| **Jadwal Misa** | View only — no create/update/delete |
| **Galeri, Blog, UMKM, dll.** | View only — no create/update/delete |

---

## 4. Authentication & Authorization

### Firebase Session Cookie Auth
- Login at `/admin/login` — email + password via Firebase Auth
- Session cookie (30-day) issued on successful login
- Middleware validates session cookie on every `/admin/*` request
- No NextAuth dependency

### Roles
- `admin_paroki` — full CRUD across all content modules
- `admin_wilayah` — CRUD scoped to assigned `wilayah_id`

### RBAC Implementation
- **UI layer** — buttons/actions conditionally rendered based on `useAdminRole()`
- **Server layer** — every server action validates `currentUser.role` before committing
- **Defense in depth** — UI hiding is cosmetic; server-side guards are authoritative

---

## 5. Content Architecture (GitHub JSON)

All content stored as JSON in the configured GitHub repository:

| File | Content |
|---|---|
| `content/booking/meeting-rooms.json` | Meeting room inventory |
| `content/pastor-tim/pastor-tim.json` | Pastor profiles + organizational structure |
| `content/gereja/gereja.json` | Church list with wilayah mapping |
| `content/wilayah/wilayah.json` | Wilayah + lingkungan data |
| `content/landing/home.json` | Homepage content |
| `content/landing/contact.json` | Contact settings, WhatsApp, hours |
| `content/blog/posts/*.md` | Blog articles (markdown) |
| `content/galeri/*.json` | Gallery albums |
| `content/misa/*.json` | Mass schedules |
| `content/kategori/*.json` | Blog categories |
| `content/users.json` | Admin user list |

### Firestore Collections
- `bookings` — facility reservation requests (status tracking, conflict detection)
- `contact_submissions` — visitor contact form submissions
- `waiting_list` — queued booking requests when all slots are full

---

## 6. Project Structure

```
src/
├── actions/              # Server Actions (authoritative RBAC guards)
│   ├── auth.ts           # Firebase session cookie auth
│   ├── bookings.ts       # Booking CRUD + availability checks
│   └── data.ts           # Bulk content save (gereja, wilayah, pastor-tim, dll.)
├── app/
│   ├── (public)/         # Public pages (no auth required)
│   │   ├── jadwal-misa/
│   │   ├── pastor-tim/
│   │   ├── lingkungan/
│   │   ├── galeri/
│   │   ├── booking/
│   │   └── blog/
│   └── admin/(protected)/ # Admin panel (session cookie required)
│       ├── data/         # Content management (gereja, wilayah, pastor-tim, dll.)
│       ├── bookings/     # Booking management
│       └── settings/
├── components/
│   ├── ui/               # shadcn/ui components
│   └── admin/            # Admin-specific components (role guards, dialogs)
├── features/             # Feature-scoped modules
│   ├── auth/             # Firebase auth helpers
│   ├── booking/          # Booking schema, actions, types
│   └── gereja/           # Gereja types + actions
├── lib/
│   ├── firebase/         # Firebase client + admin SDK
│   ├── github/           # GitHub API helpers (Octokit)
│   ├── roles.ts          # 13 role permission functions
│   └── password-validation.ts
└── types/                # Shared TypeScript interfaces

tests/
├── lib/                  # Unit tests (roles, schemas, utils)
├── schemas/              # Zod schema validation tests
└── integration/          # Server action integration tests
```

---

## 7. Setup & Installation

### Prerequisites
- Node.js 20+
- GitHub App installed on the content repository
- Firebase project (Auth + Firestore)

### Environment Variables

```env
# Firebase Admin
FIREBASE_PROJECT_ID=your_project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# GitHub App (content storage)
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
GITHUB_APP_INSTALLATION_ID=12345678
CONTENT_REPO_OWNER=your_username
CONTENT_REPO_NAME=web-paroki-content

# HMAC Secret (session cookie signing)
HMAC_SECRET=your_32char_minimum_secret

# Admin accounts (add _2, _3, etc. for multiple admins)
ADMIN_EMAIL_1=admin@brayut.org
ADMIN_PASSWORD_1=plain_password_for_first_login_will_be_hashed
ADMIN_NAME_1=Pastor Paroki
ADMIN_ROLE_1=admin_paroki
```

### Local Development

```bash
npm install
npm run dev
# Visit http://localhost:3000
# Admin at http://localhost:3000/admin/login
```

### Build & Test

```bash
npm run build    # Next.js production build
npm test          # Vitest test suite (136 tests)
```

---

## 8. Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy — `vercel.json` runs `npm run build && npm test` as the build command

**Build command:** `npm run build && npm test`  
**Node version:** 20.x

---

## 9. Testing

Vitest 3 with TypeScript strict mode disabled for test environment compatibility.

```
npm test          # Run all tests (4 files, 136 tests)
npm run test:watch # Watch mode for development
```

| Test File | Coverage |
|---|---|
| `tests/lib/roles.test.ts` | 13 role functions, 83 assertions |
| `tests/lib/password-validation.test.ts` | Password rules, requirements |
| `tests/schemas/booking.test.ts` | Zod schemas for booking/event |
| `tests/integration/users.test.ts` | User invite + profile server actions |

---

## 10. Security

- **Session cookies** — Firebase Auth session cookies (30-day), signed with HMAC secret
- **RBAC** — server-side role validation on every action
- **XSS** — DOMPurify on all markdown/rich text rendering
- **Input validation** — Zod schemas on all server action payloads
- **`error: unknown`** — no bare `catch (e: any)`, all catch blocks use proper type narrowing

---

## 11. Version History

| Version | Date | Summary |
|---|---|---|
| 1.2.0 | 2026-05-14 | admin_wilayah RBAC hardening: Gereja, Wilayah, pastor-tim scoped access |
| 1.1.3 | 2026-05-13 | Booking conflict prevention, audit trails, permission fixes |
| 1.1.2 | 2026-05-12 | Firebase session cookie migration (replaced previous auth) |
| 1.1.1 | 2026-05-10 | Booking system, meeting room inventory |
| 1.1.0 | 2026-05-08 | Bilingual support (ID/EN/Latin), multi-language mass schedule |
| 1.0.0 | 2026-05-01 | Initial release |

---

**Last Updated:** 2026-05-14  
**Maintainer:** Paroki Brayut Dev Team