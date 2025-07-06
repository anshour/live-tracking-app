# 🚀 Live Tracking Application

A fullstack real-time location tracking system built using **Turborepo**, **NestJS**, and **NextJS + Google Map**. This project demonstrates real-time updates, efficient architecture, and a clean monorepo setup.

---

## 📁 Monorepo Structure

This project uses **Turborepo** with PNPM Workspaces to manage multiple packages in a monorepo setup:

```

live-tracking-app/
├── apps/
│   ├── frontend/     # NextJS app with google maps for map UI
│   └── backend/      # NestJS server with WebSocket + REST API
├── packages/
│   └── shared/       # Shared types and utilities
├── .env.example
├── turbo.json
├── package.json
└── README.md

```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 18+ (check with `node --version`)
- **PNPM** 9+ (install with `npm install -g pnpm`)
- **Google Maps API Key** (get from [Google Cloud Console](https://console.cloud.google.com/))

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment Variables

Create environment files for both frontend and backend:

**Backend Environment (`apps/backend/.env`):**

```bash
PORT=3001
JWT_SECRET=your_super_secret_jwt_key_here
```

**Frontend Environment (`apps/frontend/.env`):**

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

> **Note**: You can copy from `apps/backend/.env.example` as a template

### 3. Configure Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Create an API key and add it to your frontend environment
5. (Optional) Restrict the API key to your domain for security

### 4. Run the Application

**Development mode (recommended):**

```bash
pnpm dev
```

**Or run individually:**

```bash
# Backend only
pnpm --filter @livetracking/backend dev

# Frontend only
pnpm --filter @livetracking/frontend dev

# Shared package (watch mode)
pnpm --filter @livetracking/shared dev
```

### 5. Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001/api](http://localhost:3001/api)
- **WebSocket**: `ws://localhost:3001/socket`

### 6. Test the Application

**Default Login Credentials:**

- **Email**: `demo@example.com`
- **Password**: `password`

**Quick Test Steps:**

1. Open the frontend at [http://localhost:3000](http://localhost:3000)
2. Login with the default credentials
3. Navigate to "Track Me" to share your location
4. Open another tab and go to "Find Trackers" to see real-time updates
5. (Optional) Use the simulation controls to test with mock data

---

## 🧠 Technical Decisions

| Area                        | Tech / Reasoning                                                                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo**                | [Turborepo](https://turbo.build/) with PNPM workspaces for efficient dependency management and build orchestration                              |
| **Frontend**                | [Next.js](https://nextjs.org/) with [React Google Maps API](https://github.com/JustFly1984/react-google-maps-api) for interactive map rendering |
| **Backend**                 | [NestJS](https://nestjs.com/) with WebSocket gateway and REST endpoints for scalable server architecture                                        |
| **Real-time Communication** | [Socket.io](https://socket.io/) for reliable, event-based WebSocket communication with automatic reconnection                                   |
| **Map Services**            | [Google Maps API](https://developers.google.com/maps) with Google Maps Services for geocoding and map rendering                                 |
| **Authentication**          | JWT-based authentication with guards for both HTTP and WebSocket connections                                                                    |
| **State Management**        | [TanStack Query](https://tanstack.com/query) for server state management and caching                                                            |
| **Styling**                 | [Tailwind CSS](https://tailwindcss.com/) for utility-first styling approach                                                                     |
| **Validation**              | [Zod](https://zod.dev/) for TypeScript-first schema validation on both client and server                                                        |
| **Data Storage**            | In-memory storage for tracker and user data (for demonstration purposes only)                                                                   |
| **Package Management**      | [PNPM](https://pnpm.io/) for efficient package management and workspace support                                                                 |
| **Shared Code**             | TypeScript interfaces and utility functions shared via `@livetracking/shared` package                                                           |

---

## 🧪 Features

### ✅ Backend (NestJS)

**REST API Endpoints:**

- `POST /api/auth/login` → User authentication with JWT
- `GET /api/auth/profile` → Get current user profile
- `GET /api/trackers` → Retrieve all active trackers
- `GET /api/trackers/:id/histories` → Get tracker location history
- `POST /api/trackers/simulation/start` → Start tracker simulation
- `POST /api/trackers/simulation/stop` → Stop tracker simulation
- `GET /api/trackers/simulation/status` → Check simulation status

**WebSocket Gateway (Real-time):**

- `tracker:subscribe` → Subscribe to tracker updates
- `tracker:unsubscribe` → Unsubscribe from tracker updates
- `tracker:register` → Register new tracker with location
- `tracker:update` → Update tracker location
- `tracker:stop` → Stop tracker broadcasting
- `tracker:remove` → Remove tracker from system

**Core Features:**

- JWT authentication for both HTTP and WebSocket connections
- Real-time location broadcasting with Socket.io
- Tracker simulation service for testing
- In-memory storage for tracker state and history
- Zod validation for request/response schemas

### ✅ Frontend (Next.js)

**Interactive Map Interface:**

- Google Maps integration with real-time marker updates
- Live tracking with automatic location updates
- Manual tracker registration and location sharing
- Interactive map controls (zoom, pan, center)
- Distance-based location filtering (minimum 10m movement)

**User Interface:**

- Responsive design with Tailwind CSS
- Real-time connection status indicator
- Tracker list with search/filter functionality
- Last seen timestamps for offline trackers
- Toast notifications for user feedback
- Authentication flow with login/logout

**Real-time Features:**

- WebSocket connection with automatic reconnection
- Live tracker position updates
- Connection status monitoring
- Error handling with user-friendly messages

### ✅ Shared Package (`@livetracking/shared`)

**TypeScript Interfaces:**

- `Tracker` → Tracker entity with location and status
- `TrackerHistory` → Historical location data
- `Coordinate` → Latitude/longitude coordinates
- `User` → User authentication data

**Utility Functions:**

- `calculateDistance()` → Haversine distance calculation
- `TrackingEvents` → WebSocket event constants
- Type definitions for API requests/responses

**Features:**

- Shared validation schemas with Zod
- Common utility functions for distance calculations
- Centralized type definitions for type safety
- Event constants for WebSocket communication

---

## 💻 Commands

| Command      | Description                            |
| ------------ | -------------------------------------- |
| `pnpm dev`   | Run all apps in dev mode via Turborepo |
| `pnpm build` | Build all apps and packages            |
| `pnpm lint`  | Run linting                            |
| `pnpm test`  | Run tests (unit)                       |

---

## 🚧 Known Limitations

- No persistent database; all data is in-memory
- Simple WebSocket auth using JWT (no refresh tokens strategy)
- History data reset on server restart

---
