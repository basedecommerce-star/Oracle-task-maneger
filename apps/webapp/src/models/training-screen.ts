export interface TrainingOptionModel {
  id: 'new' | 'mistakes' | 'difficult' | 'ticket' | 'topic';
  title: string;
  description: string;
}

export interface TrainingScreenModel {
  title: string;
  subtitle: string;
  options: TrainingOptionModel[];
}

export function buildTrainingScreenModel(): TrainingScreenModel {
  return {
    title: 'Training mode',
    subtitle: 'Choose how you want to practice the Moldova theory questions.',
    options: [
      {
        id: 'new',
        title: 'New questions',
        description: 'Focus on unseen verified questions in your selected category.',
      },
      {
        id: 'mistakes',
        title: 'My mistakes',
        description: 'Repeat the questions you answered incorrectly before.',
      },
      {
        id: 'difficult',
        title: 'Difficult questions',
        description: 'Work through questions marked difficult or reported often.',
      },
      {
        id: 'ticket',
        title: 'By ticket',
        description: 'Open a specific ticket and study it from start to finish.',
      },
      {
        id: 'topic',
        title: 'By topic',
        description: 'Train on road signs, intersections, parking, priority, and more.',
      },
    ],
  };
}
