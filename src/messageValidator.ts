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

interface ResultType {
  parsedMessage: string;
  blockedContentFound: string[];
}

function parseMessage(
  message: string,
  bookingStatus: 'unconfirmed' | 'confirmed',
  sender: 'customer' | 'supplier'
): ResultType {
  let parsedMessage: string = message;
  const blockedContentFound = new Set<string>();
  const BLOCKED_KEYWORDS: Array<string> = [
    'tourhq',
    'toursbylocals',
    'withlocals',
    'facebook',
    'twitter',
    'instagram',
    'gmail',
    'email',
    'skype',
    'cash',
    'recruiter',
  ] as const;
  // Regular Expressions for checking against the given rules
  const phoneRegex: RegExp = /^\+?[0-9\s.\-()]{7,25}$/;
  const emailRegex: RegExp = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;
  const linkRegex: RegExp =
    /\b(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;
  const keywordRegex: RegExp = new RegExp(`\\b(${BLOCKED_KEYWORDS.join('|')})\\b`, 'gi');
  // First Pass: Checking for blocked keywords in the message
  if (bookingStatus === 'unconfirmed') {
    if (keywordRegex.test(message)) {
      blockedContentFound.add('keyword');
    }
    // Second Pass: Checking emails and links
    if (sender === 'supplier') {
      parsedMessage = message.replace(emailRegex, match => {
        const lowecasedText = match.toLowerCase();
        if (
          lowecasedText.endsWith('@gowithguide.com') ||
          lowecasedText.endsWith('@travelience.co.jp')
        ) {
          return match;
        }
        blockedContentFound.add('email');
        return '******';
      });

      parsedMessage = message.replace(linkRegex, match => {
        const lowecasedText = match.toLowerCase();
        if (
          lowecasedText.includes('gowithguide.com') ||
          lowecasedText.includes('zoom.us') ||
          lowecasedText.includes('travelience.co.jp')
        ) {
          return match;
        }
        blockedContentFound.add('link');
        return '******';
      });
    }
    // Third Pass: Masking Phone Numbers before booking is confirmed
    parsedMessage = parsedMessage.replace(phoneRegex, match => {
      // Hard fail-safe to prevent date formats like YYYY-MM-DD from being masked as a phone number
      if (/\b\d{4}-\d{2}-\d{2}\b/.test(match)) {
        return match;
      }
      blockedContentFound.add('phone');
      return '******';
    });

    // Fourth Pass: Checking any other sensitive keywords/content
    parsedMessage = parsedMessage.replace(linkRegex, () => {
      blockedContentFound.add('keyword');
      return '******';
    });
  }
  // Returning the end result
  return { parsedMessage, blockedContentFound: Array.from(blockedContentFound) };
}

// ToDo: implement business logic from README.md
export function validateMessage(input: MessageInput): MessageOutput {
  // let messsage: string = input.message;
  const bookingStatus: 'confirmed' | 'unconfirmed' = input.hasConfirmedBooking
    ? 'confirmed'
    : 'unconfirmed';
  const result: ResultType = parseMessage(input.message, bookingStatus, input.sender);

  return {
    sender: input.sender,
    message: result.parsedMessage,
    hasConfirmedBooking: input.hasConfirmedBooking,
    blocked: [...result.blockedContentFound],
  };
}
