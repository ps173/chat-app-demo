import { prisma } from '../../db/client';
import { AppError } from '../../utils/AppError';

export async function listChatrooms() {
  return prisma.chatroom.findMany({
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
      _count: { select: { participants: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createChatroom(userId: string, roomName: string) {
  return prisma.chatroom.create({
    data: {
      roomName,
      createdById: userId,
      participants: { connect: { id: userId } },
    },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
      _count: { select: { participants: true } },
    },
  });
}

export async function joinChatroom(userId: string, roomId: string) {
  const room = await prisma.chatroom.findUnique({ where: { id: roomId } });
  if (!room) throw new AppError('Room not found', 404);

  return prisma.chatroom.update({
    where: { id: roomId },
    data: { participants: { connect: { id: userId } } },
  });
}

export async function leaveChatroom(userId: string, roomId: string) {
  const room = await prisma.chatroom.findUnique({ where: { id: roomId } });
  if (!room) throw new AppError('Room not found', 404);

  return prisma.chatroom.update({
    where: { id: roomId },
    data: { participants: { disconnect: { id: userId } } },
  });
}
