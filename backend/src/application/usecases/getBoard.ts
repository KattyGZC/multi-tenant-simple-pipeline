import { prisma } from '../../config/database';

export async function getBoard(organizationId: string) {
  const [stages, allowedTransitions] = await Promise.all([
    // Stages with candidates belonging to this org
    prisma.stage.findMany({
      orderBy: { order: 'asc' },
      include: {
        candidates: {
          where: { orgId: organizationId },
          orderBy: { createdAt: 'asc' },
          select: { id: true, name: true, email: true, stageId: true },
        },
      },
    }),
    // Allowed transitions for this org
    prisma.allowedTransition.findMany({
      where: { organizationId },
      include: {
        fromStage: { select: { id: true, key: true } },
        toStage: { select: { id: true, key: true, title: true } },
      },
    }),
  ]);

  return {
    stages: stages.map((s) => ({
      id: s.id,
      key: s.key,
      title: s.title,
      order: s.order,
      candidates: s.candidates,
    })),
    allowedTransitions: allowedTransitions.map((t) => ({
      fromStageId: t.fromStageId,
      toStageId: t.toStageId,
      fromStageKey: t.fromStage.key,
      toStageKey: t.toStage.key,
      toStageTitle: t.toStage.title,
    })),
  };
}
