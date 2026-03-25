# Backend

Express + Socket.IO API server with Prisma ORM and PostgreSQL.

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

### Installation

1. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** — create a `.env` file:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatapp
   JWT_SECRET=your_secret_here
   JWT_EXPIRES_IN=7d
   PORT=4000
   BCRYPT_ROUNDS=10
   FRONTEND_ORIGIN=http://localhost:3000
   ```

4. **Run migrations and start**
   ```bash
   npm run db:migrate
   npm run dev
   ```

### Commands

| Command | Description |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:studio` | Open Prisma Studio GUI |

## Architecture

### Entry Points

- `src/server.ts` — creates the HTTP server, attaches Socket.IO, starts listening
- `src/app.ts` — configures Express: CORS, body parsing, routes, error handler

### Module Structure

Each feature lives in `src/modules/<name>/` with three files:

```
src/modules/
├── auth/           # Register, login, JWT issuance
├── chatrooms/      # Create, list, join chatrooms
├── messages/       # Fetch message history
└── users/          # User profile
```

Every module exports a router (wired in `app.ts`) and separates concerns into `router → controller → service`.

### Socket Events

Handlers live in `src/sockets/handlers/`. The token is verified on the socket handshake before any event is processed.

| Direction | Event | Description |
|---|---|---|
| Client → Server | `room:join` | Join a chatroom |
| Client → Server | `room:leave` | Leave a chatroom |
| Client → Server | `message:send` | Send a message |
| Server → Client | `room:user_joined` | Broadcast when a user joins |
| Server → Client | `room:user_left` | Broadcast when a user leaves |
| Server → Client | `message:new` | Broadcast new message to room |

### Database Schema

Managed by Prisma (`prisma/schema.prisma`):

- **User** — id, firstName, lastName, email, passwordHash, timestamps
- **Chatroom** — id, name, creatorId, many-to-many with User
- **Message** — id, content, senderId, chatroomId, createdAt

### Key Utilities

- `src/middleware/auth.ts` — JWT verification middleware for HTTP routes
- `src/middleware/errorHandler.ts` — centralized error handler using `AppError`
- `src/utils/logger.ts` — Pino logger instance
