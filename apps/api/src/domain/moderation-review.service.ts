import {
  reduceModerationState,
  type ModerationAction,
  type ModerationEvent,
} from '../../../../packages/shared/src/moderation';

export interface CreateModerationEventInput {
  questionId: string;
  moderatorId: string;
  action: ModerationAction;
  comment?: string;
  createdAt?: Date;
}

export interface CreateModerationEventResult {
  event: ModerationEvent;
  state: ReturnType<typeof reduceModerationState>;
}

export function createModerationEvent(
  existingEvents: ModerationEvent[],
  input: CreateModerationEventInput,
): CreateModerationEventResult {
  const event: ModerationEvent = {
    entityType: 'question',
    entityId: input.questionId,
    moderatorId: input.moderatorId,
    action: input.action,
    comment: input.comment,
    createdAt: input.createdAt ?? new Date(),
  };

  const nextEvents = [...existingEvents, event];
  const state = reduceModerationState(input.questionId, nextEvents);

  return {
    event,
    state,
  };
}
