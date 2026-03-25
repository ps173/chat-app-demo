import { prisma } from '../../db/client';
import { AppError } from '../../utils/AppError';

export async function listChatrooms() {
  return prisma.chatroom.findMany({
    where: { isDirect: false },
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
  const room = await prisma.chatroom.findUnique({
    where: { id: roomId },
    include: { participants: { where: { id: userId }, select: { id: true } } },
  });
  if (!room) throw new AppError('Room not found', 404);

  // DM rooms: only pre-added participants may join
  if (room.isDirect && room.participants.length === 0) {
    throw new AppError('Room not found', 404);
  }

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

export async function listDirectRooms(userId: string) {
  return prisma.chatroom.findMany({
    where: {
      isDirect: true,
      participants: { some: { id: userId } },
    },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
      _count: { select: { participants: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findOrCreateDirectRoom(userId: string, targetUserId: string) {
  // Find existing DM between exactly these two users
  const existing = await prisma.chatroom.findFirst({
    where: {
      isDirect: true,
      participants: { every: { id: { in: [userId, targetUserId] } } },
    },
    include: {
      participants: { select: { id: true } },
      createdBy: { select: { firstName: true, lastName: true } },
      _count: { select: { participants: true } },
    },
  });

  // The `every+in` Prisma query matches subsets too, so confirm exactly 2 participants
  if (existing && existing.participants.length === 2) {
    const { participants: _, ...room } = existing;
    return room;
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { firstName: true },
  });
  if (!target) throw new AppError('User not found', 404);

  const self = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true },
  });

  const roomName = `${self?.firstName ?? 'User'} & ${target.firstName}`;

  return prisma.chatroom.create({
    data: {
      roomName,
      isDirect: true,
      createdById: userId,
      participants: { connect: [{ id: userId }, { id: targetUserId }] },
    },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
      _count: { select: { participants: true } },
    },
  });
}
