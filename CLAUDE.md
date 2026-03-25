# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack real-time chat application with user auth, multiple chatrooms, and Socket.IO messaging. PostgreSQL via Prisma, Express backend, React frontend.

## Commands

### Backend (`/backend`)
```bash
npm run dev          # Dev server with hot reload (ts-node-dev)
npm run build        # Compile TypeScript
npm start            # Run compiled server
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Regenerate Prisma client
npm run db:studio    # Open Prisma Studio GUI
```

### Frontend (`/frontend`)
```bash
npm run dev      # Vite dev server
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Infrastructure
```bash
cd backend && docker-compose up -d   # Start PostgreSQL (port 5432)
```

## Architecture

### Backend
- **Entry**: `server.ts` → creates Express app (`app.ts`) and attaches Socket.IO
- **Modules**: `src/modules/{auth,chatrooms,messages}/` — each has router, controller, service
- **Sockets**: `src/sockets/handlers/` — `joinRoom`, `leaveRoom`, `sendMessage`; token auth on handshake
- **Auth**: JWT middleware in `src/middleware/auth.ts`; tokens verified on both HTTP and socket connections
- **Error handling**: Custom `AppError` class + centralized handler in `src/middleware/errorHandler.ts`
- **Logging**: Pino logger (`src/utils/logger.ts`)

### Frontend
- **State**: Redux Toolkit slices in `src/features/{auth,chat,chatrooms}/`
- **Routing**: React Router v7 with `PrivateRoute` guard in `src/routes/`
- **Socket**: `src/features/chat/socketService.ts` + `useSocket` hook managing lifecycle
- **API**: Axios-based utilities in `src/api/`

### Database Schema (Prisma)
- `User`: id, firstName, lastName, email, passwordHash, timestamps
- `Chatroom`: id, name, creatorId, participants (many-to-many with User), messages
- `Message`: id, content, senderId, chatroomId, createdAt

### Socket Events
- Client emits: `room:join`, `room:leave`, `message:send`
- Server broadcasts: `room:user_joined`, `room:user_left`, `message:new`

## Environment

**Backend** (`.env`): `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN` (7d), `PORT` (4000), `BCRYPT_ROUNDS` (10), `FRONTEND_ORIGIN` (http://localhost:3000)

**Frontend** (`.env`): `VITE_API_BASE_URL` (http://localhost:4000/api/v1), `VITE_SOCKET_URL` (http://localhost:4000)
