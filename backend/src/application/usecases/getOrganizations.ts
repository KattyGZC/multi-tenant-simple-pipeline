import { prisma } from '../../config/database';

export async function getOrganizations() {
  return prisma.organization.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}
