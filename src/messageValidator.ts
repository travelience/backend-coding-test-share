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

/*
  Code Flow:
  BOOKING STATUS = false
  - block/mask the phone number
  - block email always,only allow email from goWithGuide and travelience
  - block all links, always allow links from goWithGuide and travelience (both supplier/customer)

  BOOKING STATUS = true
  - allow the phone number
  - block email always, only allow email from goWithGuide and travelience
  - block all links, always allow links from goWithGuide, zoom (Supplier)
  - Allow all links (Customer)




  BLOCKING RULES
  - Replace blocked content with `******`
  - Preserve message structure and spacing
  - Track what was blocked in the `blocked` array

  BLOCKED/RESTRICTED CONTENT
  - Keywords: `tourhq`, `toursbylocals`, `withlocals`, `facebook`, `twitter`, `instagram`, `gmail`, `email`, `skype`, `cash`, `recruiter`

*/



// ToDo: implement business logic from README.md
export function validateMessage(input: MessageInput): MessageOutput {
  return {
    sender: input.sender,
    message: input.message,
    hasConfirmedBooking: input.hasConfirmedBooking,
    blocked: [],
  };
}
