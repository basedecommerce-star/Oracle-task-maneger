export interface FaqItemModel {
  id: string;
  question: string;
  answer: string;
}

export interface FaqScreenModel {
  title: string;
  subtitle: string;
  items: FaqItemModel[];
}

export function buildFaqScreenModel(): FaqScreenModel {
  return {
    title: 'FAQ',
    subtitle: 'Key exam information, document requirements, and practical preparation tips.',
    items: [
      {
        id: 'documents-school',
        question: 'What documents are needed for driving school enrollment?',
        answer:
          'Identity document, required medical certificates, and the supporting documents required by the driving school or ASP procedures.',
      },
      {
        id: 'documents-theory',
        question: 'What do I need for the theory exam?',
        answer:
          'Identity document, training completion proof, required medical documents, and payment confirmation when applicable.',
      },
      {
        id: 'repeat-exam',
        question: 'When can I repeat the exam?',
        answer:
          'Theory and practical retake windows must follow the official ASP rules for waiting periods and scheduling.',
      },
      {
        id: 'practical-mistakes',
        question: 'What are common mistakes during practical preparation?',
        answer:
          'Priority errors, missed signals, clutch control issues, and weak observation during maneuvers are among the most common risks.',
      },
    ],
  };
}
