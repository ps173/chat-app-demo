import { prisma } from '../../db/client';

export async function searchUsers(query: string, excludeUserId: string) {
  return prisma.user.findMany({
    where: {
      AND: [
        { id: { not: excludeUserId } },
        {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
      ],
    },
    select: { id: true, firstName: true, lastName: true, email: true },
    take: 20,
  });
}
