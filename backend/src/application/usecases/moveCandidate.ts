import { z } from 'zod';
import { prisma } from '../../config/database';
import { appEmitter, EVENTS } from '../../infrastructure/events/emitter';

const moveCandidateSchema = z.object({
  targetStageId: z.string().uuid(),
  note: z.string().optional(),
});

export async function moveCandidate(candidateId: string, body: unknown) {
  const { targetStageId, note } = moveCandidateSchema.parse(body);

  // Load candidate with current stage and org
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { stage: true },
  });

  if (!candidate) {
    throw new Error('Candidate not found');
  }

  // Validate transition is allowed for this organization
  const allowedTransition = await prisma.allowedTransition.findUnique({
    where: {
      organizationId_fromStageId_toStageId: {
        organizationId: candidate.orgId,
        fromStageId: candidate.stageId,
        toStageId: targetStageId,
      },
    },
    include: { toStage: true },
  });

  if (!allowedTransition) {
    throw new Error('Transition not allowed for this organization');
  }

  // Atomically update candidate stage + create transition record
  const [updatedCandidate, transition] = await prisma.$transaction([
    prisma.candidate.update({
      where: { id: candidateId },
      data: { stageId: targetStageId },
      include: { stage: true },
    }),
    prisma.transition.create({
      data: {
        candidateId,
        fromStageId: candidate.stageId,
        toStageId: targetStageId,
        note,
      },
    }),
  ]);

  // Emit event — side effects are handled asynchronously by subscribers
  appEmitter.emit(EVENTS.CANDIDATE_MOVED, {
    candidateId: candidate.id,
    candidateName: candidate.name,
    candidateEmail: candidate.email,
    organizationId: candidate.orgId,
    fromStageKey: candidate.stage.key,
    toStageKey: allowedTransition.toStage.key,
    transitionId: transition.id,
  });

  return updatedCandidate;
}
