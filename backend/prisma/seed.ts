import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Idempotency guard — skip if already seeded
  const existingStages = await prisma.stage.count();
  if (existingStages > 0) {
    console.log('[Seed] Database already seeded. Skipping.');
    return;
  }

  console.log('[Seed] Seeding database...');

  // ── Stages (global, shared across orgs) ────────────────────────────────────
  const stageNew = await prisma.stage.create({
    data: { key: 'NEW', title: 'New', order: 1 },
  });
  const stageReviewing = await prisma.stage.create({
    data: { key: 'REVIEWING', title: 'Reviewing', order: 2 },
  });
  const stageAccepted = await prisma.stage.create({
    data: { key: 'ACCEPTED', title: 'Accepted', order: 3 },
  });
  const stageRejected = await prisma.stage.create({
    data: { key: 'REJECTED', title: 'Rejected', order: 4 },
  });

  // ── Organization 1: TechCorp ───────────────────────────────────────────────
  const techcorp = await prisma.organization.create({
    data: { name: 'TechCorp' },
  });

  // Standard linear flow + fast-track rejection from NEW
  await prisma.allowedTransition.createMany({
    data: [
      { organizationId: techcorp.id, fromStageId: stageNew.id, toStageId: stageReviewing.id },
      { organizationId: techcorp.id, fromStageId: stageReviewing.id, toStageId: stageAccepted.id },
      { organizationId: techcorp.id, fromStageId: stageReviewing.id, toStageId: stageRejected.id },
      { organizationId: techcorp.id, fromStageId: stageNew.id, toStageId: stageRejected.id },
    ],
  });

  await prisma.candidate.createMany({
    data: [
      { name: 'Alice Johnson', email: 'alice@example.com', orgId: techcorp.id, stageId: stageNew.id },
      { name: 'Bob Smith', email: 'bob@example.com', orgId: techcorp.id, stageId: stageNew.id },
      { name: 'Carol Williams', email: 'carol@example.com', orgId: techcorp.id, stageId: stageReviewing.id },
      { name: 'David Brown', email: 'david@example.com', orgId: techcorp.id, stageId: stageReviewing.id },
      { name: 'Eve Davis', email: 'eve@example.com', orgId: techcorp.id, stageId: stageAccepted.id },
      { name: 'Frank Miller', email: 'frank@example.com', orgId: techcorp.id, stageId: stageRejected.id },
    ],
  });

  // ── Organization 2: StartupHub ─────────────────────────────────────────────
  const startuphub = await prisma.organization.create({
    data: { name: 'StartupHub' },
  });

  // Extended flow: can send back to NEW from REVIEWING, late rejection after ACCEPTED
  await prisma.allowedTransition.createMany({
    data: [
      { organizationId: startuphub.id, fromStageId: stageNew.id, toStageId: stageReviewing.id },
      { organizationId: startuphub.id, fromStageId: stageReviewing.id, toStageId: stageAccepted.id },
      { organizationId: startuphub.id, fromStageId: stageReviewing.id, toStageId: stageRejected.id },
      // Unique to StartupHub: send back for more info
      { organizationId: startuphub.id, fromStageId: stageReviewing.id, toStageId: stageNew.id },
      // Unique to StartupHub: late rejection after accepted
      { organizationId: startuphub.id, fromStageId: stageAccepted.id, toStageId: stageRejected.id },
    ],
  });

  await prisma.candidate.createMany({
    data: [
      { name: 'Grace Wilson', email: 'grace@example.com', orgId: startuphub.id, stageId: stageNew.id },
      { name: 'Henry Moore', email: 'henry@example.com', orgId: startuphub.id, stageId: stageNew.id },
      { name: 'Iris Taylor', email: 'iris@example.com', orgId: startuphub.id, stageId: stageReviewing.id },
      { name: 'Jack Anderson', email: 'jack@example.com', orgId: startuphub.id, stageId: stageAccepted.id },
      { name: 'Kate Thomas', email: 'kate@example.com', orgId: startuphub.id, stageId: stageRejected.id },
    ],
  });

  console.log('[Seed] Done! Created 2 organizations, 4 stages, and 11 candidates.');
}

main()
  .catch((err) => {
    console.error('[Seed] Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
