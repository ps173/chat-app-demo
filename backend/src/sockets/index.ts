import { Server } from 'socket.io';
import http from 'http';
import { config } from '../config';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { handleJoinRoom } from './handlers/joinRoom';
import { handleSendMessage } from './handlers/sendMessage';
import { handleLeaveRoom } from './handlers/leaveRoom';

export function initSocketServer(server: http.Server) {
  const io = new Server(server, {
    cors: { origin: config.frontendOrigin },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined;
    if (!token) {
      return next(new Error('INVALID_TOKEN'));
    }
    try {
      const payload = verifyToken(token);
      socket.data.user = { id: payload.id, email: payload.email };
      next();
    } catch {
      next(new Error('INVALID_TOKEN'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as { id: string; email: string };
    logger.info({ userId: user.id }, 'Socket connected');

    socket.on('room:join', handleJoinRoom(socket));
    socket.on('message:send', handleSendMessage(socket));
    socket.on('room:leave', handleLeaveRoom(socket));

    socket.on('disconnect', () => {
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      for (const roomId of rooms) {
        socket.to(roomId).emit('room:user_left', { roomId, userId: user.id });
      }
      logger.info({ userId: user.id }, 'Socket disconnected');
    });
  });

  return io;
}
