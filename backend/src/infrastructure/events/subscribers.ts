import axios from 'axios';
import { appEmitter, EVENTS } from './emitter';
import { prisma } from '../../config/database';
import { CandidateMovedEvent } from '../../domain/types';

const WEBHOOK_URL = process.env.WEBHOOK_URL ?? 'https://webhook.site/your-unique-url-here';
const MAX_ATTEMPTS = 3;

// ─── Subscriber 1: NEW → REVIEWING ────────────────────────────────────────────
// Simulates sending a welcome questionnaire email to the candidate.

async function handleWelcomeQuestionnaire(data: CandidateMovedEvent): Promise<void> {
  const log = await prisma.actionLog.create({
    data: {
      transitionId: data.transitionId,
      actionName: 'Welcome Questionnaire Sent',
      status: 'PENDING',
      attemptCount: 1,
    },
  });

  try {
    // Simulate email dispatch (replace with real email provider as needed)
    console.log(
      `[Action] Welcome questionnaire sent to ${data.candidateName} <${data.candidateEmail}>`,
    );

    await prisma.actionLog.update({
      where: { id: log.id },
      data: { status: 'SUCCESS', attemptCount: 1 },
    });
  } catch (err) {
    await prisma.actionLog.update({
      where: { id: log.id },
      data: {
        status: 'FAILED',
        errorMessage: err instanceof Error ? err.message : String(err),
        attemptCount: 1,
      },
    });
  }
}

// ─── Subscriber 2: REVIEWING → ACCEPTED ───────────────────────────────────────
// Fires an HTTP POST to a webhook with up to 3 attempts (exponential backoff).

async function fireWebhook(
  data: CandidateMovedEvent,
  logId: string,
  attempt: number,
): Promise<void> {
  try {
    await axios.post(
      WEBHOOK_URL,
      {
        event: 'candidate.accepted',
        candidate: {
          id: data.candidateId,
          name: data.candidateName,
          email: data.candidateEmail,
        },
        organizationId: data.organizationId,
        timestamp: new Date().toISOString(),
      },
      { timeout: 5000 },
    );

    await prisma.actionLog.update({
      where: { id: logId },
      data: { status: 'SUCCESS', attemptCount: attempt },
    });

    console.log(
      `[Webhook] Fired successfully for ${data.candidateName} (attempt ${attempt})`,
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.warn(`[Webhook] Attempt ${attempt} failed for ${data.candidateName}: ${errorMessage}`);

    if (attempt < MAX_ATTEMPTS) {
      // Exponential backoff: 1 s → 2 s → 4 s
      const delay = 1000 * Math.pow(2, attempt - 1);
      await prisma.actionLog.update({
        where: { id: logId },
        data: { attemptCount: attempt, errorMessage },
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
      await fireWebhook(data, logId, attempt + 1);
    } else {
      console.error(`[Webhook] All ${MAX_ATTEMPTS} attempts exhausted for ${data.candidateName}`);
      await prisma.actionLog.update({
        where: { id: logId },
        data: { status: 'FAILED', attemptCount: attempt, errorMessage },
      });
    }
  }
}

async function handleAcceptanceWebhook(data: CandidateMovedEvent): Promise<void> {
  const log = await prisma.actionLog.create({
    data: {
      transitionId: data.transitionId,
      actionName: 'Acceptance Webhook Fired',
      status: 'PENDING',
    },
  });

  await fireWebhook(data, log.id, 1);
}

// ─── Register all subscribers ──────────────────────────────────────────────────

export function registerSubscribers(): void {
  appEmitter.on(EVENTS.CANDIDATE_MOVED, (data: CandidateMovedEvent) => {
    if (data.fromStageKey === 'NEW' && data.toStageKey === 'REVIEWING') {
      handleWelcomeQuestionnaire(data).catch((err) =>
        console.error('[Subscriber 1] Unhandled error:', err),
      );
    }

    if (data.fromStageKey === 'REVIEWING' && data.toStageKey === 'ACCEPTED') {
      handleAcceptanceWebhook(data).catch((err) =>
        console.error('[Subscriber 2] Unhandled error:', err),
      );
    }
  });

  console.log('[Events] Subscribers registered');
}
