# RoomEase — Complete Technical Documentation

> A full-stack MERN room rental platform connecting tenants and landlords.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack Breakdown](#2-tech-stack-breakdown)
3. [System Architecture](#3-system-architecture)
4. [Frontend Deep Dive](#4-frontend-deep-dive)
5. [Backend Deep Dive](#5-backend-deep-dive)
6. [API Documentation](#6-api-documentation)
7. [Feature-wise Breakdown](#7-feature-wise-breakdown)
8. [Real-time / Advanced Features](#8-real-time--advanced-features)
9. [Environment Setup & Running the Project](#9-environment-setup--running-the-project)
10. [Production Readiness](#10-production-readiness)
11. [Code Quality & Optimization Suggestions](#11-code-quality--optimization-suggestions)
12. [Cleanup Suggestions](#12-cleanup-suggestions)
13. [Future Enhancements](#13-future-enhancements)

---

## 1. Project Overview

### What the Project Does

RoomEase is a web-based room rental platform that allows **landlords** to list and manage rental rooms, and **tenants** to browse, search, and request rooms. It handles the full lifecycle of a rental interaction — from account creation to room booking requests and status management.

### Problem It Solves

Finding and managing rental rooms is traditionally fragmented and manual. RoomEase centralizes:
- Room discovery with city and type filters
- Landlord-tenant communication via a request/approval system
- Profile and document management for both user types
- Photo uploads for rooms and user profiles

### Key Features and Capabilities

- Dual-role authentication: separate flows for tenants and landlords
- Landlords can add, update, and delete room listings with photo uploads
- Tenants can search rooms by city and type, and send booking requests
- Landlords can accept or reject incoming booking requests
- Profile management with photo upload for both roles
- Account deletion that cleans up both role-specific and base user records
- JWT-based stateless authentication across all protected routes
- Single-page application with client-side routing
- Served as a monolithic full-stack app (React build served by Express)

---

## 2. Tech Stack Breakdown

### Frontend

| Technology | Version | Why Used |
|---|---|---|
| React | 18.2.0 | Component-based UI, large ecosystem, hooks-based state management |
| React Router DOM | 6.14.2 | Client-side routing for SPA navigation between pages |
| Axios | 1.6.8 | Promise-based HTTP client; cleaner than raw fetch, supports interceptors |
| Bootstrap 5 | 5.3.2 | Rapid responsive layout and utility classes |
| bootstrap-dark-5 | 1.1.3 | Dark theme variant of Bootstrap applied globally |
| MUI (Material UI) | 5.14.4 | Additional UI components (installed but minimally used) |
| react-modal | 3.16.1 | Accessible modal dialogs for forms (add room, update profile) |
| react-icons | 4.10.1 | Icon library (installed, available for use) |
| react-redux + redux | 9.1.0 / 5.0.1 | Installed but not actively used — state is managed via local component state |
| CSS Modules | built-in | Scoped styles for Auth components to avoid class name collisions |

### Backend

| Technology | Version | Why Used |
|---|---|---|
| Node.js | runtime | Non-blocking I/O, ideal for API servers |
| Express | 4.18.2 | Minimal, flexible web framework for routing and middleware |
| Mongoose | 7.4.3 | ODM for MongoDB — schema validation, model abstraction, query API |
| MongoDB Atlas | cloud | Managed NoSQL database; flexible document model suits rental data |
| bcryptjs | 2.4.3 | Password hashing before storage; never stores plaintext passwords |
| jsonwebtoken | 9.0.1 | Stateless JWT auth — no server-side session storage needed |
| Multer | 1.4.5-lts.1 | Multipart form data handling for file/image uploads |
| dotenv | 16.3.1 | Environment variable management; keeps secrets out of source code |
| cors | 2.8.5 | Cross-Origin Resource Sharing headers for dev-time frontend/backend separation |
| body-parser | built-in | Parses JSON and URL-encoded request bodies |
| nodemon | 3.0.1 | Auto-restarts server on file changes during development |
| express-async-handler | 1.2.0 | Wraps async route handlers to forward errors to Express error middleware |

### Additional Tools

| Tool | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted MongoDB cluster |
| Local `uploads/` folder | Stores uploaded images (profile photos, room photos) on disk |
| React Scripts (CRA) | Build toolchain for the React frontend |
| npm workspaces (manual) | Root `package.json` build script installs and builds the client |

---

## 3. System Architecture

### High-Level Architecture

RoomEase is a **monolithic full-stack application**. The Express server both serves the React SPA (from `client/build`) and exposes the REST API under `/api/*`. There is no separate deployment for frontend and backend in production.

```
Browser
  │
  ▼
Express Server (port 5000)
  ├── Serves React SPA  →  client/build/index.html  (catch-all route)
  ├── /api/auth         →  routes/auth.js
  ├── /api/tenant       →  routes/tenant.js
  ├── /api/landlord     →  routes/landlord.js
  ├── /api/room         →  routes/room.js
  ├── /api/request      →  routes/request.js
  ├── /api/upload       →  routes/upload.js
  └── /uploads          →  static file serving (uploaded images)
        │
        ▼
    MongoDB Atlas (cloud)
```

### Component-Level Breakdown

```
RoomEase
├── Backend (Express + Mongoose)
│   ├── server.js              Entry point, middleware setup, route mounting
│   ├── config/
│   │   ├── db.js              MongoDB connection
│   │   └── jwt.js             JWT helper utilities (generate/verify)
│   ├── middleware/
│   │   └── validateTokenHandler.js   JWT auth guard
│   ├── models/                Mongoose schemas
│   ├── routes/                Express route handlers (controllers inline)
│   └── uploads/               Disk-stored uploaded files
│
└── Frontend (React SPA)
    └── client/src/
        ├── App.js             Route definitions
        ├── components/
        │   ├── Auth/          Login, Register, Profile pages
        │   └── Pages/         Home, RoomSearch, AddRoom, UpdateRoom, Requests, Navbars, Footer
        └── components/css/    Global CSS files per page
```

### How Frontend and Backend Communicate

- In development: React dev server proxies `/api/*` requests to `localhost:5000` (via CRA proxy or direct URL usage).
- In production: Express serves the React build and handles all `/api/*` routes on the same origin — no CORS issues.
- All API calls from the frontend use **Axios** with relative URLs (e.g., `api/auth/login`).
- Protected routes send the JWT token in the `Authorization: Bearer <token>` header.

### Data Flow

```
User Action (e.g., Book Room)
  │
  ▼
React Component (RoomSearch.js)
  │  axios.post("api/request/create", payload, { headers: { Authorization } })
  ▼
Express Route (routes/request.js → POST /create)
  │  validateToken middleware checks JWT
  ▼
Mongoose Model (Request.create)
  │
  ▼
MongoDB Atlas (Request document saved)
  │
  ▼
JSON Response → React updates UI state
```

---

## 4. Frontend Deep Dive

### Folder Structure

```
client/src/
├── App.js                          Route map for the entire SPA
├── index.js                        React DOM entry point
├── App.css                         Global app styles
└── components/
    ├── Auth/
    │   ├── Base.module.css         Shared button styles (CSS Module)
    │   ├── Login/
    │   │   ├── Login.js            Unified login form (tenant + landlord)
    │   │   └── Login.module.css
    │   ├── Register/
    │   │   ├── Register.js         Unified registration form
    │   │   └── Register.module.css
    │   └── Profile/
    │       ├── Profile.js          Generic profile shell (unused in routing)
    │       ├── tenantProfile.js    Tenant dashboard
    │       ├── landlordProfile.js  Landlord dashboard
    │       └── Profile.module.css
    ├── Pages/
    │   ├── homePage.jsx            Landing page with room type sections
    │   ├── navbar.jsx              Tenant navigation bar
    │   ├── llnavbar.jsx            Landlord navigation bar
    │   ├── footer.jsx              Site footer
    │   ├── RoomSearch.js           Room browsing + booking page
    │   ├── addRoom.jsx             Landlord: add new room listing
    │   ├── updateRoom.jsx          Landlord: view and delete own rooms
    │   └── roomRequests.jsx        Landlord: view and manage booking requests
    ├── css/                        Per-page global CSS files
    └── data/                       Static image assets (jpeg/avif)
```

### Key Components and Their Responsibilities

**Login.js**
- Renders a single login form for both roles (tenant/landlord)
- Role is selected via a `<select>` dropdown
- On success: stores `token`, `userId`, `userEmail` in `localStorage`
- Redirects to `/landlordProfile` or `/home` based on role

**Register.js**
- Same dual-role pattern as Login
- Calls `POST /api/auth/register`
- On success: stores auth data and redirects by role

**tenantProfile.js**
- Fetches tenant data from `GET /api/tenant/profile/:id`
- Sidebar navigation switches between "Personal Details" and "Room Details" views using `selectedOption` state
- Modal form for updating profile fields
- File input + upload for profile photo via `POST /api/upload/tenant/profile/photo/:id`
- Account deletion via `DELETE /api/tenant/profile/:email`

**landlordProfile.js**
- Same structure as tenantProfile but for landlord data
- Fetches from `GET /api/landlord/profile/:id`
- Update and delete account functionality
- Profile photo upload

**RoomSearch.js**
- Fetches all rooms from `GET /api/room/all` with optional `?city=` and `?type=` query params
- Dropdown filters for city (Indore, Bhopal) and room type (single, sharing, apartment)
- Each room card has a "Book" button that:
  1. Fetches room details to get the landlord ID
  2. Posts a request to `POST /api/request/create`

**addRoom.jsx**
- Landlord-only page
- Modal form with room type, address, city, status, and photo upload (multiple files)
- Submits as `multipart/form-data` to `POST /api/room/user/:id`

**updateRoom.jsx**
- Fetches all rooms from `GET /api/room/all`
- Filters client-side to show only rooms where `room.landlord === userId`
- Delete button calls `DELETE /api/room/user/:id`

**roomRequests.jsx**
- Fetches all requests from `GET /api/request/all/:id`
- Filters client-side: only shows requests where `request.landlord === userId`
- Accept/Reject buttons call `PUT /api/request/:id` with `{ status: 'accepted' | 'rejected' }`

### State Management Approach

State is managed entirely with **React local component state** (`useState`, `useEffect`). Redux is installed as a dependency but is not wired up or used anywhere in the application. All shared state (user identity) is persisted in `localStorage` and read directly by each component.

### Routing System

Defined in `App.js` using React Router v6 `<Routes>` and `<Route>`:

| Path | Component | Access |
|---|---|---|
| `/` | LoginPage | Public |
| `/signup` | RegisterUser | Public |
| `/home` | Homepage | Tenant |
| `/search` | RoomSearch | Tenant |
| `/tenantProfile` | UserProfile (tenantProfile.js) | Tenant |
| `/landlordProfile` | LandlordDashboard (landlordProfile.js) | Landlord |
| `/addRoom` | AddRoom | Landlord |
| `/updateRoom` | UpdateRoom | Landlord |
| `/roomRequests` | RoomRequests | Landlord |

> Note: Routes are not programmatically protected. Any user can navigate to any URL if they know it. Route guards are not implemented.

### API Integration Layer

There is no centralized API service layer. Each component makes direct Axios calls with inline URLs and headers. The JWT token is retrieved from `localStorage` in every component that needs it:

```js
axios.get(`api/landlord/profile/${userId}`, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
```

### Important UI/UX Flows

**Login Flow:** `/` → select role → enter credentials → POST `/api/auth/login` → store token/userId → redirect by role

**Registration Flow:** `/signup` → select role → fill form → POST `/api/auth/register` → store token/userId → redirect by role

**Room Booking Flow:** `/search` → filter rooms → click "Book" → GET room details → POST request → request stored as "pending"

**Request Management Flow:** `/roomRequests` → view pending requests → click Accept/Reject → PUT request status updated

**Add Room Flow:** `/addRoom` → click "Open Input Box" → fill modal form → POST with multipart data → redirect to `/updateRoom`

---

## 5. Backend Deep Dive

### Folder Structure

```
/
├── server.js                   Express app entry point
├── .env                        Environment variables
├── package.json                Backend dependencies and scripts
├── config/
│   ├── db.js                   MongoDB connection via Mongoose
│   └── jwt.js                  JWT generate/verify helpers (utility, not used by routes directly)
├── middleware/
│   └── validateTokenHandler.js JWT authentication middleware
├── models/
│   ├── userModel.js            Base user schema (name, email, password, role)
│   ├── tenantModel.js          Tenant-specific schema
│   ├── landlordModel.js        Landlord-specific schema
│   ├── roomModel.js            Room listing schema
│   └── requestModel.js         Booking request schema
├── routes/
│   ├── auth.js                 Register and login endpoints
│   ├── tenant.js               Tenant CRUD endpoints
│   ├── landlord.js             Landlord CRUD endpoints
│   ├── room.js                 Room CRUD + search endpoints
│   ├── request.js              Booking request CRUD endpoints
│   └── upload.js               Profile photo upload endpoints
└── uploads/                    Multer disk storage destination
```

### Controllers, Services, and Routes

The project uses a **flat route-as-controller** pattern. There is no separate service layer or controller directory. All business logic lives directly inside route handler callbacks in the `routes/` files. This is common in small Express apps but becomes hard to maintain at scale.

Each route file exports an Express Router and is mounted in `server.js`:

```js
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/tenant',   require('./routes/tenant'));
app.use('/api/landlord', require('./routes/landlord'));
app.use('/api/request',  require('./routes/request'));
app.use('/api/room',     require('./routes/room'));
app.use('/api/upload',   require('./routes/upload'));
```

### Middleware Usage

**validateTokenHandler.js** — Applied to all protected routes:
1. Reads the `Authorization` header
2. Strips the `Bearer ` prefix
3. Verifies the token with `jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)`
4. Attaches the decoded payload to `req.user`
5. Calls `next()` on success, returns 403/500 on failure

**body-parser** — Parses `application/json` and `application/x-www-form-urlencoded` bodies globally.

**cors** — Applied globally with default settings (allows all origins). Needed during development when React dev server runs on a different port.

**express.static** — Serves the React production build from `client/build` and uploaded files from `uploads/`.

**Multer** — Used in `routes/room.js` and `routes/upload.js` for handling `multipart/form-data` file uploads. Configured with disk storage, saving files to the `uploads/` directory.

### Authentication & Authorization Flow

```
Registration:
  POST /api/auth/register
    → Validate email uniqueness in User collection
    → Hash password with bcrypt (salt rounds: 10)
    → Create User document (base record)
    → Create Tenant or Landlord document (role-specific record)
    → Sign JWT with { user: { id } } payload, no expiry set
    → Return { success, authToken, userId }

Login:
  POST /api/auth/login
    → Look up Tenant or Landlord by email (based on role param)
    → Compare submitted password with bcrypt hash
    → Sign JWT with { user: { id } } payload
    → Return { success, authToken, userId }

Protected Request:
  Any route with validateToken middleware
    → Client sends: Authorization: Bearer <token>
    → Middleware verifies token signature
    → req.user = decoded payload
    → Route handler proceeds
```

> Important: The JWT has **no expiry** set in `routes/auth.js`. The `config/jwt.js` utility sets a 1-hour expiry, but it is not used by the auth routes — they call `jwt.sign()` directly without `expiresIn`.

### Database Schema and Models

**User** (`models/userModel.js`)
```
name:     String (required)
email:    String (required, unique)
password: String (required, hashed)
role:     String (enum: 'tenant' | 'landlord', required)
```

**Tenant** (`models/tenantModel.js`)
```
name:          String (required)
email:         String (required, unique)
password:      String (required, hashed)
contactNumber: String
profilePhoto:  String (file path)
aadharNumber:  String
aadharPhoto:   String (file path)
passportPhoto: String (file path)
rentedRoom:    ObjectId → ref: Room
```

**Landlord** (`models/landlordModel.js`)
```
name:          String (required)
email:         String (required, unique)
password:      String (required, hashed)
contactNumber: String
profilePhoto:  String (file path)
rooms:         [ObjectId] → ref: Room
```

**Room** (`models/roomModel.js`)
```
type:     String (required) — 'single' | 'sharing' | 'apartment'
email:    String (required) — landlord's email (denormalized)
photos:   [String] — array of file paths
address:  String (required)
city:     String (required)
landlord: ObjectId → ref: Landlord (required)
status:   String (enum: 'available' | 'occupied', default: 'available')
```

**Request** (`models/requestModel.js`)
```
tenant:   ObjectId → ref: Tenant (required)
landlord: ObjectId → ref: Landlord (required)
room:     ObjectId → ref: Room (required)
status:   String (enum: 'pending' | 'accepted' | 'rejected', default: 'pending')
```

### Business Logic Explanation

- **Dual-collection user pattern**: On registration, a record is created in both the `User` collection (base identity) and either `Tenant` or `Landlord` (role-specific data). The JWT `userId` refers to the role-specific document ID, not the `User` document ID.
- **Room ownership**: Rooms store the landlord's `ObjectId`. The `updateRoom.jsx` page filters rooms client-side by comparing `room.landlord === userId` (string comparison against ObjectId string).
- **Request routing**: When a tenant books a room, the frontend first fetches the room to get `room.landlord`, then creates a request with `{ tenant, room, landlord, status: 'pending' }`. The landlord's request page filters all requests client-side by `request.landlord === userId`.
- **Account deletion**: Deletes from both the role-specific collection and the base `User` collection using the email as the lookup key.

---

## 6. API Documentation

All protected endpoints require the header:
```
Authorization: Bearer <jwt_token>
```

---

### Auth Routes — `/api/auth`

#### POST /api/auth/register

- Purpose: Register a new user (tenant or landlord)
- Auth required: No
- Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "tenant"
}
```
- Response (200):
```json
{
  "success": true,
  "authToken": "<jwt>",
  "userId": "<role_specific_document_id>"
}
```
- Response (400): `{ "message": "User already exists" }`

---

#### POST /api/auth/login

- Purpose: Authenticate an existing user
- Auth required: No
- Request body:
```json
{
  "email": "john@example.com",
  "password": "secret123",
  "role": "tenant"
}
```
- Response (200):
```json
{
  "success": true,
  "authToken": "<jwt>",
  "userId": "<role_specific_document_id>"
}
```
- Response (200, failure): `{ "success": false, "error": "Try Logging in with correct credentials" }`

---

### Tenant Routes — `/api/tenant`

#### GET /api/tenant/profile/:id

- Purpose: Get tenant profile by ID
- Auth required: Yes
- Response (200): Full tenant document

---

#### GET /api/tenant/profile/room/:id

- Purpose: Get the room currently rented by a tenant
- Auth required: Yes
- Response (200): Room document
- Response (404): `{ "message": "Tenants rentedRoom not found" }`

---

#### PUT /api/tenant/profile/:id

- Purpose: Update tenant profile fields
- Auth required: Yes
- Request body (any subset of):
```json
{
  "name": "Jane Doe",
  "contactNumber": "9876543210",
  "aadharNumber": "1234-5678-9012"
}
```
- Response (200): Updated tenant document

---

#### DELETE /api/tenant/profile/:email

- Purpose: Delete tenant account (removes from both Tenant and User collections)
- Auth required: Yes
- Response (200): `{ "status": true, "message": "Tenant deleted successfully" }`

---

### Landlord Routes — `/api/landlord`

#### GET /api/landlord/profile/:id

- Purpose: Get landlord profile by ID
- Auth required: Yes
- Response (200): Full landlord document

---

#### PUT /api/landlord/profile/:id

- Purpose: Update landlord profile fields
- Auth required: Yes
- Request body (any subset of):
```json
{
  "name": "Bob Smith",
  "contactNumber": "9876543210"
}
```
- Response (200): Updated landlord document

---

#### DELETE /api/landlord/profile/:email

- Purpose: Delete landlord account (removes from both Landlord and User collections)
- Auth required: Yes
- Response (200): `{ "status": true, "message": "Landlord deleted successfully" }`

---

### Room Routes — `/api/room`

#### POST /api/room/user/:id

- Purpose: Create a new room listing (landlord only)
- Auth required: Yes
- Content-Type: `multipart/form-data`
- Request body:
```
type:     "single" | "sharing" | "apartment"
email:    landlord's email
address:  "123 Main St"
city:     "indore"
landlord: landlord ObjectId
status:   "available" | "occupied"
photos:   [image files] (up to 5)
```
- Response (201): Created room document

---

#### PUT /api/room/user/:id

- Purpose: Update a room listing by room ID
- Auth required: Yes
- Content-Type: `multipart/form-data`
- Request body: Same fields as POST
- Response (200): Updated room document
- Response (403): Not authorized (landlord mismatch)

---

#### DELETE /api/room/user/:id

- Purpose: Delete a room by room ID
- Auth required: Yes
- Response (200): `{ "message": "Room deleted successfully" }`

---

#### GET /api/room/all

- Purpose: Get all rooms, with optional filters
- Auth required: No
- Query params: `?city=indore&type=single`
- Response (200): Array of room documents

---

#### GET /api/room/:id

- Purpose: Get a single room by ID
- Auth required: Yes
- Response (200): Room document

---

#### GET /api/room/user/:id

- Purpose: Get rooms by user ID (intended for landlord's rooms — has a bug, see section 11)
- Auth required: Yes
- Response (200): `{ "rooms": [...] }`

---

### Request Routes — `/api/request`

#### POST /api/request/create

- Purpose: Create a new booking request
- Auth required: Yes
- Request body:
```json
{
  "tenant": "<tenant_id>",
  "room": "<room_id>",
  "landlord": "<landlord_id>",
  "status": "pending"
}
```
- Response (201): Created request document

---

#### GET /api/request/all

- Purpose: Get all requests (unfiltered)
- Auth required: Yes
- Response (200): Array of all request documents

---

#### GET /api/request/all/:id

- Purpose: Get all requests (`:id` param is accepted but not used in query — returns all requests)
- Auth required: Yes
- Response (200): Array of all request documents

---

#### GET /api/request/:id

- Purpose: Get a single request by ID
- Auth required: Yes
- Response (200): Request document

---

#### PUT /api/request/:id

- Purpose: Update request status (accept/reject)
- Auth required: Yes
- Request body: `{ "status": "accepted" | "rejected" }`
- Response (200): Updated request document

---

#### DELETE /api/request/:id

- Purpose: Delete a request by ID
- Auth required: Yes
- Response (200): `{ "message": "Request deleted successfully" }`

---

### Upload Routes — `/api/upload`

#### POST /api/upload/tenant/profile/photo/:id

- Purpose: Upload a profile photo for a tenant
- Auth required: No (missing validateToken middleware)
- Content-Type: `multipart/form-data`
- Request body: `profilePhoto` (single image file)
- Response (200): `{ "success": true, "filePath": "uploads/filename.jpg" }`

---

#### POST /api/upload/landlord/profile/photo/:id

- Purpose: Upload a profile photo for a landlord
- Auth required: No (missing validateToken middleware)
- Content-Type: `multipart/form-data`
- Request body: `profilePhoto` (single image file)
- Response (200): `{ "success": true, "filePath": "uploads/filename.jpg" }`

---

## 7. Feature-wise Breakdown

### Feature 1: User Registration

**Frontend:** `Register.js` collects name, email, password, and role. On submit, calls `POST /api/auth/register`. On success, stores `token`, `userId`, `userEmail` in `localStorage` and redirects.

**Backend:** `routes/auth.js` checks for duplicate email in `User`, hashes the password, creates a `User` document, then creates either a `Tenant` or `Landlord` document. Returns a JWT signed with the role-specific document's ID.

**Database:** Two documents are created per registration — one in `users` and one in either `tenants` or `landlords`.

---

### Feature 2: User Login

**Frontend:** `Login.js` collects email, password, and role. Calls `POST /api/auth/login`. Stores auth data in `localStorage` and redirects by role.

**Backend:** Looks up the user in the role-specific collection (`Tenant` or `Landlord`), compares the password hash, and returns a new JWT.

**Database:** Read-only — queries `tenants` or `landlords` by email.

---

### Feature 3: Room Listing (Landlord)

**Frontend:** `addRoom.jsx` opens a modal form. On submit, sends `multipart/form-data` to `POST /api/room/user/:id`.

**Backend:** `routes/room.js` verifies the user is a landlord by looking up the ID in the `Landlord` collection. Saves uploaded photos via Multer to `uploads/`. Creates a `Room` document with file paths stored in the `photos` array.

**Database:** New document in `rooms` collection. The `landlord` field stores the landlord's ObjectId.

---

### Feature 4: Room Search and Filtering

**Frontend:** `RoomSearch.js` fetches `GET /api/room/all` on mount and re-fetches when city or type filter changes. Renders room cards with type, address, city, and status.

**Backend:** `routes/room.js` builds a dynamic Mongoose query from `req.query.city` and `req.query.type`. Returns matching rooms. This route has no auth requirement.

**Database:** Queries the `rooms` collection with optional field filters.

---

### Feature 5: Room Booking Request

**Frontend:** In `RoomSearch.js`, clicking "Book" first calls `GET /api/room/:id` to retrieve the landlord ID, then calls `POST /api/request/create` with `{ tenant, room, landlord, status: 'pending' }`.

**Backend:** `routes/request.js` creates a new `Request` document with the provided data.

**Database:** New document in `requests` collection with status `'pending'`.

---

### Feature 6: Request Management (Landlord)

**Frontend:** `roomRequests.jsx` fetches all requests from `GET /api/request/all/:id`, then filters client-side by `request.landlord === userId`. Accept/Reject buttons call `PUT /api/request/:id`.

**Backend:** `routes/request.js` updates the request document's `status` field.

**Database:** Updates the `status` field in the `requests` collection.

---

### Feature 7: Profile Management

**Frontend:** Both `tenantProfile.js` and `landlordProfile.js` fetch profile data on mount, display it, and provide a modal form for updates. A file input handles photo uploads.

**Backend:**
- `GET /api/tenant/profile/:id` or `GET /api/landlord/profile/:id` — fetch profile
- `PUT /api/tenant/profile/:id` or `PUT /api/landlord/profile/:id` — update fields
- `POST /api/upload/tenant/profile/photo/:id` — upload photo, save path to DB

**Database:** Updates the `profilePhoto` field (file path string) and other profile fields in the role-specific collection.

---

### Feature 8: Account Deletion

**Frontend:** "Delete Account" button calls `DELETE /api/tenant/profile/:email` or `DELETE /api/landlord/profile/:email`, then clears `localStorage` and redirects to `/`.

**Backend:** Deletes the document from both the role-specific collection and the base `User` collection using email as the key.

**Database:** Removes documents from two collections atomically (though not in a true transaction).

---

## 8. Real-time / Advanced Features

RoomEase does not implement any real-time features. There is no WebSocket, Socket.io, Server-Sent Events, or collaborative editing (Yjs) in this project.

All data is fetched on component mount or on user action (polling-style). The request status updates (accept/reject) are reflected only after a page refresh or re-fetch.

**Potential for real-time:** The booking request flow is a natural candidate for WebSocket notifications — a landlord could receive a live notification when a tenant books their room.

---

## 9. Environment Setup & Running the Project

### Prerequisites

- Node.js >= 16.x
- npm >= 8.x
- A MongoDB Atlas account (or local MongoDB instance)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd roomease
```

### Step 2: Configure Environment Variables

Create a `.env` file in the project root (already present):

```env
DB_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
ACCESS_TOKEN_SECRET=your_strong_secret_key_here
PORT=5000
```

| Variable | Description |
|---|---|
| `DB_URL` | MongoDB Atlas connection string |
| `ACCESS_TOKEN_SECRET` | Secret key for signing/verifying JWTs. Use a long random string in production. |
| `PORT` | Port the Express server listens on (default: 5000) |

> Warning: The current `.env` contains real credentials. Rotate the `ACCESS_TOKEN_SECRET` and database password before sharing or deploying.

### Step 3: Install Backend Dependencies

```bash
npm install
```

### Step 4: Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### Step 5: Run in Development

Start the backend server (with nodemon auto-reload):
```bash
npm start
```

In a separate terminal, start the React dev server:
```bash
cd client
npm start
```

The React app runs on `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

> Note: The React app does not have a `proxy` field in `client/package.json`. API calls use relative URLs like `api/auth/login`. In development, this resolves to the React dev server port and will fail unless a proxy is configured or the full URL is used. Add `"proxy": "http://localhost:5000"` to `client/package.json` for development.

### Step 6: Build for Production

```bash
npm run build
```

This runs `npm install --prefix ./client && npm run build --prefix ./client && npm install`, which:
1. Installs client dependencies
2. Builds the React app into `client/build`
3. Re-installs backend dependencies

Then start the production server:
```bash
node server.js
```

The Express server serves the React build at `http://localhost:5000`.

### Common Issues and Fixes

| Issue | Cause | Fix |
|---|---|---|
| API calls return 404 in dev | No proxy configured | Add `"proxy": "http://localhost:5000"` to `client/package.json` |
| MongoDB connection error | Wrong `DB_URL` or IP not whitelisted | Check Atlas network access settings; whitelist your IP |
| `uploads/` folder missing | Not created automatically | Create it manually: `mkdir uploads` |
| JWT verification fails | Wrong `ACCESS_TOKEN_SECRET` | Ensure `.env` is loaded and the secret matches what was used to sign tokens |
| CORS errors in dev | Backend not running | Start the backend server before the frontend |

---

## 10. Production Readiness

### What Is Already Production-Ready

- Password hashing with bcrypt (salt rounds: 10) — secure storage
- JWT-based stateless authentication — scalable, no server-side sessions
- MongoDB Atlas — managed, scalable cloud database
- Monolithic deployment model — simple to deploy on a single server or PaaS (Heroku, Render, Railway)
- React production build served by Express — single deployment unit
- Input validation at the model level via Mongoose schema constraints
- Error handling middleware in `server.js` for unhandled errors

### What Needs Improvement

- **JWT has no expiry**: Tokens never expire, meaning a stolen token is valid forever. Add `{ expiresIn: '7d' }` to `jwt.sign()` calls in `routes/auth.js`.
- **No route guards on frontend**: Any URL is accessible without authentication. Implement a `PrivateRoute` wrapper component.
- **Secrets in `.env` are committed**: The `.env` file is in the repository with real credentials. Add `.env` to `.gitignore` immediately.
- **CORS is fully open**: `app.use(cors())` allows all origins. In production, restrict to your frontend domain: `cors({ origin: 'https://yourdomain.com' })`.
- **No input sanitization**: User inputs are passed directly to Mongoose. Add validation middleware (e.g., `express-validator`) to prevent injection and malformed data.
- **File uploads stored on disk**: The `uploads/` folder is local to the server. This breaks in multi-instance deployments and is lost on server restarts. Use cloud storage (AWS S3, Cloudinary) instead.
- **No HTTPS enforcement**: In production, all traffic should be over HTTPS. Use a reverse proxy (Nginx) or a PaaS that handles TLS.
- **No rate limiting**: Auth endpoints (`/login`, `/register`) are vulnerable to brute-force attacks. Add `express-rate-limit`.
- **No helmet.js**: HTTP security headers are not set. Add `helmet` middleware.

### Security Considerations

1. Rotate `ACCESS_TOKEN_SECRET` to a cryptographically random 256-bit string
2. Rotate the MongoDB Atlas password immediately (it is exposed in the committed `.env`)
3. Add `.env` to `.gitignore`
4. Add JWT expiry
5. Restrict CORS to known origins
6. Add rate limiting on auth routes
7. Add `helmet` for security headers
8. Validate and sanitize all user inputs server-side
9. The upload endpoints (`/api/upload/*`) have no auth middleware — anyone can upload files to your server

### Performance Considerations

- Add database indexes on frequently queried fields: `email` (already unique-indexed), `city` and `type` on rooms for search performance
- The `GET /api/room/all` endpoint returns all rooms with no pagination — add pagination for large datasets
- Client-side filtering of requests and rooms (in `roomRequests.jsx` and `updateRoom.jsx`) is inefficient — filter server-side with query params
- Consider adding a CDN for static assets in production

---

## 11. Code Quality & Optimization Suggestions

### Bug: `GET /api/room/user/:id` Does Not Work

In `routes/room.js`, the query is:
```js
const rooms = await Room.find({ userId }); // Wrong — 'userId' is a local variable, not a schema field
```
It should be:
```js
const rooms = await Room.find({ landlord: userId });
```
This is why `updateRoom.jsx` fetches all rooms and filters client-side instead of using this endpoint.

### Bug: `GET /api/request/all/:id` Does Not Filter by ID

The route accepts an `:id` param but ignores it:
```js
const requests = await Request.find(); // Returns ALL requests, not filtered by landlord
```
This means every landlord sees every tenant's requests. The client-side filter (`request.landlord === userId`) is the only thing preventing data leakage in the UI. Fix:
```js
const requests = await Request.find({ landlord: req.params.id });
```

### Bad Pattern: No JWT Expiry

```js
// Current (insecure):
const authToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET);

// Should be:
const authToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
```

### Bad Pattern: Inline Styles Throughout Components

Components like `addRoom.jsx`, `landlordProfile.js`, and `tenantProfile.js` use heavy inline styles:
```jsx
<form style={{ backgroundColor: "pink", display: "flex", ... }}>
```
Move all styles to CSS Modules or the existing CSS files for maintainability.

### Bad Pattern: No Centralized API Service

Every component duplicates the Axios call pattern with inline headers. Create a centralized API client:
```js
// src/api/client.js
import axios from 'axios';
const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
```

### Bad Pattern: Redux Installed but Unused

`react-redux`, `redux`, and `redux-thunk` are in `client/package.json` but not used. Either implement Redux for global state (auth, user data) or remove these dependencies to reduce bundle size.

### Bad Pattern: `body-parser` Is Redundant

`body-parser` is a separate package in `server.js`, but Express 4.16+ includes `express.json()` and `express.urlencoded()` built-in. Replace:
```js
// Remove:
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Replace with:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

### Bad Pattern: Catch-All Route Before API Routes

In `server.js`, the React SPA catch-all is registered **before** the API routes:
```js
app.get('*', (req, res) => res.sendFile(...)); // This intercepts API calls!
app.use('/api/auth', require('./routes/auth')); // Never reached
```
Move the catch-all to **after** all API route registrations.

### Bad Pattern: Duplicate Password Storage

On registration, the password is hashed and stored in both the `User` collection and the `Tenant`/`Landlord` collection. The `User` collection is only used for duplicate-email checking and deletion. Consider whether the `User` collection is necessary, or consolidate.

### Suggestion: Add Loading and Error States

Most components set `loading` and `error` state but only `RoomSearch.js` actually renders them. Add consistent loading spinners and error messages across all data-fetching components.

### Suggestion: Use `useCallback` for Fetch Functions

`useEffect` callbacks that fetch data are redefined on every render. Wrap them in `useCallback` or move them outside the component for better performance.

---

## 12. Cleanup Suggestions

### Files Safe to Delete

| File/Folder | Reason |
|---|---|
| `client/src/components/Auth/Profile/Profile.js` | Generic profile component that is never used in routing or imported anywhere meaningful |
| `client/src/components/css/landlordLogin.css` | Imported in `Login.js` but the class `loginBox` it styles could be consolidated into `Login.module.css` |
| `client/src/components/css/login.css` | Appears to be a duplicate/legacy CSS file alongside `Login.module.css` |
| `client/src/components/css/tp.css` | Tenant profile CSS — verify it is actually imported; if not, safe to remove |
| `client/src/components/css/llp.css` | Landlord profile CSS — same check |
| `uploads/` (old files without extensions) | Files like `02672d4be18c2f584536e06b0c932f68` (no extension) are likely orphaned uploads from old Multer configs. Safe to clean up if not referenced in DB |

### Dependencies Safe to Remove (client)

| Package | Reason |
|---|---|
| `react-redux` | Installed but not used |
| `redux` | Installed but not used |
| `redux-thunk` | Installed but not used |
| `multer` | Listed in `client/package.json` — Multer is a server-side library and should not be in the frontend dependencies |
| `path` | Node.js built-in, should not be in frontend dependencies |
| `boostrap` (typo) | `"boostrap": "^2.0.0"` is a typo/duplicate of `bootstrap`. Remove it. |
| `cdbreact` | CDB React UI kit — not visibly used in any component |
| `mdb-react-ui-kit` | MDB React — not visibly used in any component |

### Commented-Out Code to Clean Up

Multiple files contain large blocks of commented-out code that should be removed:
- `routes/auth.js` — several commented-out Tenant/Landlord creation approaches
- `routes/room.js` — commented-out authorization check and old delete route
- `App.js` — commented-out imports for old separate login components
- `landlordProfile.js` — commented-out `fetchRoomData` call

---

## 13. Future Enhancements

### Features to Add Next

- **Real-time notifications**: Use Socket.io to notify landlords of new booking requests and tenants of status changes without page refresh
- **Room detail page**: A dedicated `/room/:id` page with full photo gallery, amenities, and landlord contact info
- **Search pagination**: Add page-based or infinite scroll pagination to `GET /api/room/all`
- **Tenant-landlord messaging**: In-app chat or messaging thread per booking request
- **Review and rating system**: Allow tenants to rate landlords/rooms after a stay (the UI already shows a placeholder "5 stars" rating)
- **Release Room functionality**: The "Release Room" button in `tenantProfile.js` is rendered but has no handler — implement it to clear `tenant.rentedRoom` and set `room.status` back to `'available'`
- **Email notifications**: Send confirmation emails on registration, booking request, and status change using Nodemailer or a service like SendGrid
- **Aadhar/document verification**: The `Tenant` model has `aadharPhoto` and `passportPhoto` fields — build the upload and admin verification flow
- **Admin dashboard**: A third role for platform administrators to manage users, rooms, and disputes
- **Map integration**: Show room locations on a map using Google Maps or Leaflet

### Scalability Improvements

- **Move file storage to cloud**: Replace local `uploads/` with AWS S3 or Cloudinary. This is critical for horizontal scaling.
- **Add database indexes**: Index `rooms.city`, `rooms.type`, `rooms.landlord`, `requests.landlord`, `requests.tenant` for query performance
- **Implement server-side filtering**: Move all client-side filtering (requests by landlord, rooms by landlord) to the database query layer
- **Add caching**: Cache `GET /api/room/all` responses with Redis for high-traffic room search
- **Pagination**: Add `limit` and `skip` (or cursor-based) pagination to all list endpoints
- **Separate frontend deployment**: Deploy the React app to a CDN (Vercel, Netlify, CloudFront) and the API to a separate server for independent scaling

### Architecture Improvements

- **Introduce a service layer**: Extract business logic from route handlers into dedicated service classes/functions (e.g., `AuthService`, `RoomService`) for testability and separation of concerns
- **Add a controller layer**: Separate route definitions from handler logic
- **Implement refresh tokens**: Add a refresh token mechanism alongside short-lived access tokens
- **Add request validation middleware**: Use `express-validator` or `zod` to validate all incoming request bodies before they reach the database
- **Write tests**: Add unit tests for service functions and integration tests for API endpoints using Jest and Supertest
- **Add API versioning**: Prefix routes with `/api/v1/` to allow future breaking changes without disrupting existing clients
- **Containerize with Docker**: Add a `Dockerfile` and `docker-compose.yml` for consistent development and deployment environments
- **CI/CD pipeline**: Add GitHub Actions for automated testing and deployment on push

---

*Documentation generated for RoomEase — a MERN stack room rental platform.*
