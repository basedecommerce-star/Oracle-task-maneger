export interface TicketCardModel {
  category: 'AB' | 'BE' | 'C' | 'CE' | 'D' | 'DE' | 'F';
  ticketNumber: number;
  questionCount: number;
  route: string;
}

export interface TicketsScreenModel {
  title: string;
  subtitle: string;
  tickets: TicketCardModel[];
}

export function buildTicketsScreenModel(input: {
  category: 'AB' | 'BE' | 'C' | 'CE' | 'D' | 'DE' | 'F';
  ticketCount: number;
  questionCount: number;
}): TicketsScreenModel {
  const tickets: TicketCardModel[] = [];

  for (let ticketNumber = 1; ticketNumber <= input.ticketCount; ticketNumber += 1) {
    tickets.push({
      category: input.category,
      ticketNumber,
      questionCount: input.questionCount,
      route: `/tickets/${input.category}/${ticketNumber}`,
    });
  }

  return {
    title: 'Tickets',
    subtitle: 'Choose a ticket and study it in sequence or simulate an exam-style pass.',
    tickets,
  };
}
