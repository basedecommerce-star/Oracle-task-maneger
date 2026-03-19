export interface ModerationActionOption {
  id: 'approve' | 'reject' | 'needs_fix' | 'publish' | 'archive';
  title: string;
  description: string;
}

export interface ModerationActionsScreenModel {
  title: string;
  subtitle: string;
  options: ModerationActionOption[];
}

export function buildModerationActionsScreenModel(): ModerationActionsScreenModel {
  return {
    title: 'Moderation actions',
    subtitle: 'Choose how the selected entity should move through the verification workflow.',
    options: [
      {
        id: 'approve',
        title: 'Approve',
        description: 'Mark the entity as reviewed and approved by a moderator.',
      },
      {
        id: 'reject',
        title: 'Reject',
        description: 'Block publication and mark the entity as rejected.',
      },
      {
        id: 'needs_fix',
        title: 'Needs fix',
        description: 'Return the entity for corrections before it can be approved.',
      },
      {
        id: 'publish',
        title: 'Publish',
        description: 'Allow verified content to become publicly visible.',
      },
      {
        id: 'archive',
        title: 'Archive',
        description: 'Remove content from public visibility while preserving history.',
      },
    ],
  };
}
