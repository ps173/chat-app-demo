import { Socket } from 'socket.io';
import type { LeaveRoomPayload } from '../types';

export function handleLeaveRoom(socket: Socket) {
  return async (payload: LeaveRoomPayload) => {
    const { roomId } = payload;
    const user = socket.data.user as { id: string; email: string };

    await socket.leave(roomId);

    socket.to(roomId).emit('room:user_left', { roomId, userId: user.id });
  };
}
