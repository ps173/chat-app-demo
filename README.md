# Chat App Demo

A full-stack real-time chat application with user authentication, multiple chatrooms, and live messaging via Socket.IO.

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd chat-app-demo
   ```

2. **Start the database**
   ```bash
   cd backend && docker-compose up -d
   ```

3. **Set up the backend**
   ```bash
   cd backend
   cp .env.example .env   # fill in values (see backend/README.md)
   npm install
   npm run db:migrate
   npm run dev
   ```

4. **Set up the frontend** (in a new terminal)
   ```bash
   cd frontend
   cp .env.example .env   # fill in values (see frontend/README.md)
   npm install
   npm run dev
   ```

The app runs at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api/v1

## Architecture

```
chat-app-demo/
├── backend/    # Express + Socket.IO + Prisma API server
└── frontend/   # React + Redux + Vite SPA
```

### How it fits together

1. The frontend authenticates via REST (`/api/v1/auth`), receiving a JWT.
2. The JWT is passed as a handshake credential when opening a Socket.IO connection.
3. The backend verifies the token on the socket handshake, then authorizes `room:join`, `room:leave`, and `message:send` events.
4. Incoming messages are persisted to PostgreSQL and broadcast to all room members via `message:new`.

See [`backend/README.md`](./backend/README.md) and [`frontend/README.md`](./frontend/README.md) for service-specific details.

## Features

### Implemented

- **User authentication** — register and login with JWT-based session management
- **Public chatrooms** — create named rooms; only rooms the user has joined appear in their sidebar
- **Room discovery** — browse and search all available rooms the user hasn't joined yet via a dedicated modal, triggered from the sidebar
- **Direct messages** — start a private 1-to-1 conversation with any user via search
- **Real-time messaging** — messages are delivered instantly to all room members via Socket.IO
- **Message history** — previous messages are loaded when entering a room
- **Last message preview** — each room in the sidebar shows the most recent message and its timestamp

### Not Yet Implemented

- **Unread message count** — no badge or counter showing how many unread messages exist per room
- **Chat notifications** — no in-app notification when a new message arrives in a room the user isn't currently viewing
- **Leave a room** — users cannot voluntarily leave a chatroom they have joined
