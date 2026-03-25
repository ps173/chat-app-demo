# Frontend

React SPA with Redux Toolkit, React Router v7, and Socket.IO client.

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running (see [`../backend/README.md`](../backend/README.md))

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment** — create a `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:4000/api/v1
   VITE_SOCKET_URL=http://localhost:4000
   ```

3. **Start the dev server**
   ```bash
   npm run dev
   ```

The app runs at http://localhost:3000.

### Commands

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview the production build locally |

## Architecture

### State Management

Redux Toolkit slices in `src/features/`:

| Slice | Responsibility |
|---|---|
| `auth` | Current user, JWT token, login/register state |
| `chat` | Active room, messages, socket connection status |
| `chatrooms` | Chatroom list, selected room |

### Routing

React Router v7 configured in `src/routes/`. A `PrivateRoute` guard redirects unauthenticated users to `/login`.

### Socket Lifecycle

- `src/features/chat/socketService.ts` — singleton Socket.IO client, connects with the JWT token as a handshake credential
- `src/features/chat/useSocket.ts` — React hook that manages connect/disconnect with component lifecycle and dispatches incoming socket events to the Redux store

### API Layer

Axios-based utilities in `src/api/` map to backend REST endpoints. The auth token is injected via a request interceptor.

### Feature Structure

```
src/features/
├── auth/       # Login, register forms + auth slice
├── chat/       # ChatPanel, message list, socket service + hook
├── chatrooms/  # Chatroom list, creation
└── users/      # User profile
```
