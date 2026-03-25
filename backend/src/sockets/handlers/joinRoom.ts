import { Socket } from 'socket.io';
import { prisma } from '../../db/client';
import { getMessages } from '../../modules/messages/message.service';
import type { JoinRoomPayload } from '../types';

export function handleJoinRoom(socket: Socket) {
  return async (payload: JoinRoomPayload, callback?: (data: unknown) => void) => {
    const { roomId } = payload;
    const user = socket.data.user as { id: string; email: string };

    const room = await prisma.chatroom.findUnique({
      where: { id: roomId },
      include: { participants: { where: { id: user.id }, select: { id: true } } },
    }).catch(() => null);

    if (!room) {
      socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
      return;
    }

    if (room.participants.length === 0) {
      socket.emit('error', { code: 'NOT_PARTICIPANT', message: 'You are not a participant of this room' });
      return;
    }

    await socket.join(roomId);

    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { firstName: true, lastName: true },
    });

    socket.to(roomId).emit('room:user_joined', {
      roomId,
      userId: user.id,
      userName: userRecord ? `${userRecord.firstName} ${userRecord.lastName}` : user.email,
    });

    const history = await getMessages(roomId, 50);

    if (callback) {
      callback({ messages: history.messages });
    }
  };
}
