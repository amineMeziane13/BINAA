# Binaa - Project Map

> **Date:** 2026-05-16
> **Status:** Planning Phase — Awaiting Approval

---

## [TECH_STACK]

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Mobile** | Expo SDK | 55.0.0 (stable) | SDK 56 is beta; 55 ships RN 0.83 + React 19.2, proven stability |
| **React** | React | 19.2.x | Bundled with Expo SDK 55 |
| **Navigation** | React Navigation | 7.x (core 7.17.4) | Latest stable; Static API, native stack perf improvements |
| **State** | Zustand | 5.0.12+ | ~2KB, hook-based, no boilerplate. v5 stable since 2024 |
| **HTTP** | Axios | 1.x | Interceptors for auth token injection, base URL config |
| **Backend** | Node.js + Express | 20 LTS+ | Port 3000, local dev with `10.0.2.2` for Android emulator |
| **ORM** | Prisma | 7.8.0 | Rust-free, TypeScript-native, faster query execution |
| **Database** | Supabase (PostgreSQL) | PG 15.x | Supabase-managed; PG 14 deprecated July 2026 |
| **i18n** | i18next / react-i18next | latest | Arabic + French + English with RTL support |
| **Styling** | Custom neumorphic | — | Shadows, elevation, depth via RN `StyleSheet` |

### Deprecation Warnings
- React Native 0.82.x → Unsupported (upgrade through SDK)
- Prisma `prisma-client-js` → Use `prisma-client` in Prisma 7
- Postgres 14 → EOL July 2026 (use PG 15+)
- React Navigation v6 → v7 broke `navigate` back-stack behavior

---

## [ARCHITECTURE]

```
binaa/
├── server/                          # Express API (port 3000)
│   ├── prisma/
│   │   └── schema.prisma            # Single source of truth for DB
│   ├── src/
│   │   ├── index.ts                 # Entry: Express app bootstrap
│   │   ├── config/
│   │   │   ├── db.ts                # PrismaClient singleton
│   │   │   └── env.ts               # Env vars (DATABASE_URL, JWT_SECRET, PORT)
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT verification (CLIENT/FOURNISSEUR/ARTISAN/ADMIN)
│   │   │   ├── roleGuard.ts         # Role-based access control
│   │   │   ├── errorHandler.ts      # Global error handler
│   │   │   └── logger.ts            # Async structured logger
│   │   ├── modules/
│   │   │   ├── assignment/
│   │   │   │   └── assignment.engine.ts    # Smart scoring algorithm
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── products/
│   │   │   │   ├── products.routes.ts
│   │   │   │   ├── products.controller.ts
│   │   │   │   └── products.service.ts
│   │   │   ├── artisans/
│   │   │   │   ├── artisans.routes.ts
│   │   │   │   ├── artisans.controller.ts
│   │   │   │   └── artisans.service.ts
│   │   │   ├── orders/
│   │   │   │   ├── orders.routes.ts
│   │   │   │   ├── orders.controller.ts
│   │   │   │   └── orders.service.ts
│   │   │   ├── reviews/
│   │   │   │   ├── reviews.routes.ts
│   │   │   │   ├── reviews.controller.ts
│   │   │   │   └── reviews.service.ts
│   │   │   └── admin/
│   │   │       ├── admin.routes.ts
│   │   │       ├── admin.controller.ts
│   │   │       └── admin.service.ts
│   │   └── shared/
│   │       ├── errors.ts            # Custom error classes
│   │       └── types.ts             # Shared TS types
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/                          # React Native (Expo)
│   ├── app.json
│   ├── App.tsx
│   ├── src/
│   │   ├── core/                    # Shared layer (ONLY if reused 2+ times)
│   │   │   ├── api/
│   │   │   │   └── axios.ts         # Axios instance: baseURL = http://10.0.2.2:3000/api
│   │   │   ├── theme/
│   │   │   │   ├── colors.ts        # Blue (#1E3A8A) & Orange (#F97316)
│   │   │   │   ├── neumorphism.ts   # 3D shadow/elevation utilities
│   │   │   │   └── typography.ts
│   │   │   ├── i18n/
│   │   │   │   ├── i18n.ts          # i18next config
│   │   │   │   ├── ar.json
│   │   │   │   ├── fr.json
│   │   │   │   └── en.json
│   │   │   ├── components/          # Reusable UI components
│   │   │   │   ├── Button3D.tsx
│   │   │   │   ├── Card3D.tsx
│   │   │   │   ├── Modal3D.tsx
│   │   │   │   ├── Star3D.tsx
│   │   │   │   ├── Dropdown.tsx     # Commune dropdown + profession picker
│   │   │   │   └── LoadingOverlay.tsx
│   │   │   └── hooks/
│   │   │       ├── useAuth.ts       # Zustand auth store hook
│   │   │       └── useLocalize.ts   # RTL direction hook
│   │   ├── features/                # Feature modules (Domain-Driven)
│   │   │   ├── auth/
│   │   │   │   ├── screens/
│   │   │   │   │   ├── LoginScreen.tsx
│   │   │   │   │   └── RegisterScreen.tsx
│   │   │   │   └── store.ts         # Zustand auth store slice
│   │   │   ├── home/
│   │   │   │   ├── screens/
│   │   │   │   │   └── HomeScreen.tsx   # 4-section catalog hub
│   │   │   │   └── components/
│   │   │   │       ├── MaterialCatalog.tsx
│   │   │   │       ├── ArtisanCatalog.tsx
│   │   │   │       ├── EquipmentCatalog.tsx
│   │   │   │       └── Calculator.tsx
│   │   │   ├── profile/
│   │   │   │   └── screens/
│   │   │   │       └── ProviderProfileScreen.tsx
│   │   │   ├── orders/
│   │   │   │   └── screens/
│   │   │   │       └── OrderScreen.tsx
│   │   │   ├── admin/
│   │   │   │   └── screens/
│   │   │   │       └── AdminDashboardScreen.tsx
│   │   │   └── payment/
│   │   │       └── components/
│   │   │           └── PaymentDialog.tsx  # 3D modal, Edahabia + CIB
│   │   └── navigation/
│   │       ├── RootNavigator.tsx     # Auth check → role-based redirect
│   │       ├── AuthStack.tsx         # Login/Register
│   │       ├── MainTabs.tsx          # Home + Orders + Profile tabs
│   │       └── AdminStack.tsx        # Admin dashboard stack
│   ├── package.json
│   └── tsconfig.json
│
└── PROJECT_MAP.md
```

### Core Architectural Decisions

1. **No micro-files**: Modules combine routes, controllers, services in `/modules/X/`. Each module is 3 files max unless warranted.
2. **Zustand over Context**: Lighter, selective re-renders, no Provider nesting. Separate stores for auth, cart, orders.
3. **No Expo Router**: Using React Navigation v7 directly for explicit role-based routing control.
4. **No direct Supabase client**: Prisma ORM as sole DB interface; Supabase is just the PG host.
5. **Neumorphism via StyleSheet**: Shadow/elevation objects defined once in `core/theme/`, no extra library.
6. **i18next**: Industry standard for RN RTL. `I18nextProvider` wraps the app.

---

## [SYSTEM_FLOW]

### Authentication Flow
```
[Login Screen] → POST /api/auth/login → JWT → Zustand store → 
  ├─ role=ADMIN → AdminStack
  └─ role=CLIENT|FOURNISSEUR|ARTISAN → MainTabs
```

### Client Order Flow (Smart Assignment)
```
[Browse Catalog] → [Démarrer un projet btn (CLIENT only)]
  → POST /api/orders { type, baseAmount, requestedProfession?, requestedProductType? }
  → status=PENDING_ASSIGNMENT
  → [Smart Assignment Engine triggers]
       ├─ PRODUCT type:
       │    finds FOURNISSEUR providers → scores: rating(40%) + stock(30%) + price(30%)
       │    → best match auto-assigned → status=PENDING_PAYMENT
       └─ ARTISAN_SERVICE type:
            finds subscribed ARTISAN providers by profession match
            → scores: rating(40%) + experience(30%) + subscription(30%) + exact match(+10)
            → best match auto-assigned → status=PENDING_PAYMENT
  → [If no match found] → status=PENDING_ASSIGNMENT (admin override)
  → [PaymentDialog: Edahabia/CIB] → POST /api/orders/:id/pay → status=PAID
  → [Provider completes] → status=COMPLETED → [Client rates → POST /api/reviews]
```

### Artisan Subscription Flow
```
[Artisan Profile] → [Pay Subscription btn]
  → PaymentDialog (1500 DZD/mo or 3000 DZD/qtr)
  → POST /api/artisans/subscribe → isSubscribed=true
```

### Admin Override Flow
```
[Admin Dashboard] → sees orders with status=PENDING_ASSIGNMENT (no auto-match found)
  → [Click order] → [Select provider dropdown]
  → PATCH /api/orders/:id/assign { providerId } → status=PENDING_PAYMENT
  → If order already assigned, admin can reassign manually
```

### API Route Map
```
POST   /api/auth/register          # Create user (all roles)
POST   /api/auth/login             # Returns JWT
GET    /api/products?type=MATERIAL # Browse materials
GET    /api/products?type=EQUIPMENT # Browse equipment
GET    /api/artisans               # Browse artisans
GET    /api/artisans/:id           # Artisan profile + rating
POST   /api/artisans/subscribe      # Artisan pays subscription (auth: ARTISAN, uses own token)
GET    /api/orders                  # Client sees own orders; Admin sees all
POST   /api/orders                  # Client creates order (auth: CLIENT)
PATCH  /api/orders/:id/assign       # Admin assigns provider (auth: ADMIN)
POST   /api/orders/:id/pay          # Client pays for order (auth: CLIENT)
GET    /api/reviews/:targetProviderId  # Get reviews for a provider
POST   /api/reviews                 # Client creates review (auth: CLIENT)
GET    /api/admin/providers         # List all providers (auth: ADMIN)
GET    /api/settings                # Get platform settings
PUT    /api/settings/commission     # Set commission rate (auth: ADMIN)
```

---

## [DATA_MODEL]

```
User {
  id        String  @id @default(uuid())
  email     String  @unique
  password  String  // bcrypt hash
  role      Role    // CLIENT, FOURNISSEUR, ARTISAN, ADMIN
  fullName  String
  phone     String
  commune   String  // 1 of 26 Oran communes
  provider  Provider?  // exists if role=FOURNISSEUR or ARTISAN
  orders    Commande[]  // as client
  reviews   Review[]    // as reviewer (client)
  createdAt DateTime
}

Provider {
  id                String      @id @default(uuid())
  userId            String      @unique
  user              User        @relation
  type              ProviderType  // FOURNISSEUR | ARTISAN
  profession        String?     // Dropdown + "Autre" free text
  experienceYears   Int?
  isSubscribed      Boolean     @default(false)
  subscriptionExpiry DateTime?
  rating            Float       @default(0)  // avg of Review.score
  products          Product[]
  assignments       Commande[]    // orders assigned to this provider
  reviews           Review[]      // ratings received
  createdAt         DateTime
}

Product {
  id            String      @id @default(uuid())
  providerId    String
  provider      Provider    @relation
  title         String
  description   String
  price         Float
  stockQuantity Int
  type          ProductType   // MATERIAL | EQUIPMENT
  rating        Float         @default(0)
  createdAt     DateTime
}

Commande {
  id                 String      @id @default(uuid())
  clientId           String
  client             User        @relation("clientOrders")
  assignedProviderId String?
  assignedProvider   Provider?   @relation
  type               OrderType   // PRODUCT | ARTISAN_SERVICE
  status             OrderStatus
  // PENDING_ASSIGNMENT → PENDING_PAYMENT → PAID → COMPLETED → CANCELLED
  baseAmount         Float
  commissionRate     Float       @default(0.1)
  totalAmount        Float
  createdAt          DateTime
}

PlatformSetting {
  key   String @id   // 'COMMISSION_RATE'
  value String
}

Review {
  id                String @id @default(uuid())
  clientId          String
  client            User   @relation("reviewer")
  targetProviderId  String
  targetProvider    Provider @relation
  score             Int    // 1-5
  comment           String?
  createdAt         DateTime

  @@unique([clientId, targetProviderId])
}

ArtisanProfile {
  id              String  @id @default(uuid())
  userId          String  @unique
  user            User    @relation
  profession      String  // Dropdown + "Autre" free text
  experienceYears Int
  isSubscribed    Boolean @default(false)
  subscriptionExpiry DateTime?
  rating          Float   @default(0)  // avg of Review.score
}

Product {
  id            String  @id @default(uuid())
  providerId    String
  provider      User    @relation
  title         String
  description   String
  price         Float
  stockQuantity Int
  type          ProductType  // MATERIAL | EQUIPMENT
  rating        Float   @default(0)
}

Commande {
  id                String    @id @default(uuid())
  clientId          String
  client            User      @relation("clientOrders")
  assignedProviderId String?
  assignedProvider  User?     @relation("providerAssignments")
  type              OrderType // PRODUCT | ARTISAN_SERVICE
  status            OrderStatus
  // PENDING_ASSIGNMENT → PENDING_PAYMENT → PAID → COMPLETED → CANCELLED
  baseAmount        Float
  commissionRate    Float     @default(0.1)
  totalAmount       Float
  createdAt         DateTime
}

PlatformSetting {
  key   String @id   // 'COMMISSION_RATE'
  value String
}

Review {
  id          String @id @default(uuid())
  clientId    String
  client      User   @relation("reviewer")
  targetUserId String
  targetUser  User   @relation("target")
  score       Int    // 1-5
  comment     String?
  createdAt   DateTime

  @@unique([clientId, targetProviderId])
}
```

---

## [LOGGING_SYSTEM]

```
core/logger.ts (Server-side, async, non-blocking)
  - Level: ERROR | WARN | INFO | DEBUG
  - Transport: Console + rotating file (logs/app-%DATE%.log)
  - Structured: { timestamp, level, module, message, meta? }
  - No third-party lib; uses fs.createWriteStream (append)
  
Usage:
  logger.info('AuthService', 'User registered', { userId, role });
  logger.error('OrdersService', 'Payment failed', { orderId, error });
```

---

## [ORPHANS & PENDING]

| Item | Status | Notes |
|------|--------|-------|
| Smart Assignment Engine | COMPLETED | Score-based auto-assign for PRODUCT & ARTISAN_SERVICE |
| Provider table & refactor | COMPLETED | Replaced ArtisanProfile; Provider covers both Fournisseurs & Artisans |
| Android emulator testing | NOT YET | After initial build |
| E2E integration tests | NOT YET | To verify complete smart assignment lifecycle |
| Seed data (communes, professions) | NOT YET | For dev/testing |

---

## [MILESTONES]

### M1 — Foundation (Verifiable: server starts, Prisma migrates)
- `schema.prisma` with all 6 models
- Express server with CORS, JSON, auth middleware
- Prisma migration + Supabase connection
- Async logger
- **Verify:** `npx prisma migrate dev` succeeds, `GET /api/health` returns 200

### M2 — Auth (Verifiable: register + login + role routing complete)
- `POST /api/auth/register` with role + commune
- `POST /api/auth/login` returning JWT
- Login/Register screens with 3D modals
- Role-based navigation redirect
- Commune dropdown (26 Oran communes)
- **Verify:** Register client → login → lands on MainTabs

### M3 — Catalogs (Verifiable: 3 catalogs display + calculator)
- Products API (MATERIAL + EQUIPMENT)
- Artisans API (with rating)
- 4-section HomeScreen
- "Démarrer un projet" button visible for CLIENT only
- **Verify:** Client sees "Démarrer un projet"; provider does not

### M4 — Smart Assignment & Payment (Verifiable: full order lifecycle)
- Order creation (CLIENT) with `requestedProfession` / `requestedProductType`
- **Smart Assignment Engine** triggers on creation:
  - PRODUCT type: scores FOURNISSEUR providers by rating(40%) + stock(30%) + price(30%)
  - ARTISAN_SERVICE type: scores subscribed ARTISANs by rating(40%) + experience(30%) + subscription(30%) + profession match(+10)
  - Auto-assigns best match → PENDING_PAYMENT
  - Falls back to PENDING_ASSIGNMENT if no match (admin override)
- PaymentDialog (Edahabia + CIB inputs)
- Artisan subscription payment
- Order state machine
- **Verify:** Client creates order for "plumber" → smart engine finds best subscribed artisan → auto-assigns → PENDING_PAYMENT

### M5 — Admin & Reviews (Verifiable: admin can override, client can rate)
- Admin dashboard with order list
- Manual assignment modal for fallback (PENDING_ASSIGNMENT orders)
- Commission rate setting
- Review creation (1-5 stars)
- Rating aggregation on provider profiles
- **Verify:** Admin sees auto-assigned orders + can manually assign unmatched ones → Client rates → rating updates

### M6 — i18n & Polish (Verifiable: RTL works, 3 languages)
- Arabic, French, English translations
- RTL layout support
- Neumorphic polish on all screens
- **Verify:** Switch locale → UI flips RTL with correct language
