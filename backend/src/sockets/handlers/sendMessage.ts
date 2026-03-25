import { Socket } from 'socket.io';
import { createMessage } from '../../modules/messages/message.service';
import type { SendMessagePayload } from '../types';

export function handleSendMessage(socket: Socket) {
  return async (payload: SendMessagePayload) => {
    const { roomId, content } = payload;
    const user = socket.data.user as { id: string; email: string };

    if (!socket.rooms.has(roomId)) {
      socket.emit('error', { code: 'NOT_PARTICIPANT', message: 'Join the room first' });
      return;
    }

    try {
      const message = await createMessage(user.id, roomId, content);
      socket.to(roomId).emit('message:receive', message);
      socket.emit('message:receive', message);
    } catch {
      socket.emit('error', { code: 'INTERNAL_ERROR', message: 'Failed to send message' });
    }
  };
}
