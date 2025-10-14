// Message Validation Types
export interface MessageInput {
  sender: 'customer' | 'supplier';
  message: string;
  hasConfirmedBooking: boolean;
}

export interface MessageOutput {
  sender: 'customer' | 'supplier';
  message: string;
  hasConfirmedBooking: boolean;
  blocked: string[];
}

// ToDo: implement business logic from README.md
export function validateMessage(input: MessageInput): MessageOutput {
  return {
    sender: input.sender,
    message: input.message,
    hasConfirmedBooking: input.hasConfirmedBooking,
    blocked: [],
  };
}
