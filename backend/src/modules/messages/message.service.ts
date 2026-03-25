import { prisma } from '../../db/client';
import { AppError } from '../../utils/AppError';

export async function getMessages(roomId: string, limit: number, cursor?: string) {
  const room = await prisma.chatroom.findUnique({ where: { id: roomId } });
  if (!room) throw new AppError('Room not found', 404);

  const messages = await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor
      ? { cursor: { id: cursor }, skip: 1 }
      : {}),
    include: {
      sender: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  const hasMore = messages.length > limit;
  const result = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor = hasMore ? result[result.length - 1]!.id : null;

  return {
    messages: result.map((m) => ({
      messageId: m.id,
      senderId: m.senderId,
      senderName: `${m.sender.firstName} ${m.sender.lastName}`,
      roomId: m.roomId,
      content: m.content,
      timestamp: m.createdAt.toISOString(),
    })),
    nextCursor,
  };
}

export async function createMessage(senderId: string, roomId: string, content: string) {
  const message = await prisma.message.create({
    data: { content, senderId, roomId },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return {
    messageId: message.id,
    senderId: message.senderId,
    senderName: `${message.sender.firstName} ${message.sender.lastName}`,
    roomId: message.roomId,
    content: message.content,
    timestamp: message.createdAt.toISOString(),
  };
}
