export type ModerationAction = 'approve' | 'reject' | 'needs_fix' | 'publish' | 'archive';

export interface ModerationEvent {
  entityType: 'question' | 'answer' | 'rule' | 'sign' | 'source_snapshot';
  entityId: string;
  action: ModerationAction;
  moderatorId: string;
  comment?: string;
  createdAt: Date;
}

export interface ModerationState {
  entityId: string;
  approved: boolean;
  rejected: boolean;
  needsFix: boolean;
  published: boolean;
  archived: boolean;
  lastAction?: ModerationAction;
}

export function reduceModerationState(entityId: string, events: ModerationEvent[]): ModerationState {
  const state: ModerationState = {
    entityId,
    approved: false,
    rejected: false,
    needsFix: false,
    published: false,
    archived: false,
  };

  for (const event of events.filter((item) => item.entityId === entityId)) {
    state.lastAction = event.action;

    if (event.action === 'approve') {
      state.approved = true;
      state.rejected = false;
      state.needsFix = false;
    }

    if (event.action === 'reject') {
      state.rejected = true;
      state.approved = false;
      state.published = false;
    }

    if (event.action === 'needs_fix') {
      state.needsFix = true;
      state.published = false;
    }

    if (event.action === 'publish') {
      state.published = true;
      state.approved = true;
      state.rejected = false;
      state.needsFix = false;
    }

    if (event.action === 'archive') {
      state.archived = true;
      state.published = false;
    }
  }

  return state;
}
