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

// const BLOCKED_CONTENT: Array<string> = [`tourhq`, `toursbylocals`, `withlocals`, `facebook`, `twitter`, `instagram`, `gmail`, `email`, `skype`, `cash`, `recruiter`];
// const WHITELISTED_DOMAINS: Array<string> = [`gowithguide.com`, `travelience.co.jp`, `zoom.us`];
  
  
function parseMessage(message: string, bookingStatus: 'unconfirmed' | 'confirmed', sender: 'customer' | 'supplier'): string {
  let parsedMessage: string = message;

  if(bookingStatus==='unconfirmed' && sender==='supplier'){
    let phoneRegex: RegExp = /^\+?[0-9\s.\-()]{7,25}$/; 
    let emailRegex: RegExp = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;;
    let linkRegex: RegExp = /\b(?:https?:\/\/|www\.)?[\w-]+\.[\w-]{2,}(?:\/[\w\-\.\/]*)*\b/;

    let combinedRegex: RegExp = new RegExp(phoneRegex.source + '|' + emailRegex.source + '|' + linkRegex.source, 'gi');

    // check for whitelisted stuff
    // Check for the match : phone, email, link

    parsedMessage = message.replace(combinedRegex,(match)=>{
      const isAllowed = match.includes('zoom.us') ||  match.includes('gowithguide.com') || match.includes('travelience.co.jp');
      if (isAllowed) {
        return match;
      } else {
        return '*'.repeat(match.length);
      }
    });

  } 
  return parsedMessage;
}

// ToDo: implement business logic from README.md
export function validateMessage(input: MessageInput): MessageOutput {
  // let messsage: string = input.message;

  let parsedMessage: string;
  // let blocked: Array<string> = [];

  if(!input.hasConfirmedBooking){
    // Block the messages including any contact info
    
    parsedMessage = parseMessage(input.message, 'unconfirmed', input.sender);
  } else {
    parsedMessage = parseMessage(input.message, 'confirmed', input.sender);
  }

  return {
    sender: input.sender,
    message: parsedMessage,
    hasConfirmedBooking: input.hasConfirmedBooking,
    blocked: [],
  };
}
