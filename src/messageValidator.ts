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

  - Email/Link- Common Blocking 
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
  // Phone patterns per README: XXX-XXX-XXXX, XXX XXX XXXX, XXXX-XXXX, XXXX XXXX, +CC XXX-XXX-XXXX
  const phoneRegexPattern =
    '(\\b\\d{3}[-\\s]\\d{3}[-\\s]\\d{4}\\b)|(\\b\\d{4}[-\\s]\\d{4}\\b)|(\\+\\d{1,3}[-\\s]?\\d{3}[-\\s]?\\d{3}[-\\s]?\\d{4}\\b)';
  const phoneRegex: RegExp = new RegExp(phoneRegexPattern, 'gi');
  const emailRegex: RegExp = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;
  const linkRegex: RegExp =
    /\b(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;
  const keywordRegex: RegExp = new RegExp(`\\b(${BLOCKED_KEYWORDS.join('|')})\\b`, 'gi');

  // CASE: Booking Unconfirmed
  if (bookingStatus === 'unconfirmed') {
    // Mask emails (allow only specific whitelisted domains)
    parsedMessage = parsedMessage.replace(emailRegex, match => {
      const lowered = match.toLowerCase();
      if (lowered.endsWith('@gowithguide.com') || lowered.endsWith('@travelience.co.jp')) {
        return match;
      }
      blockedContentFound.add('email');
      return '******';
    });

    // Mask links (allow only whitelisted domains)
    parsedMessage = parsedMessage.replace(linkRegex, match => {
      const lowered = match.toLowerCase();
      if (lowered.includes('gowithguide.com') || lowered.includes('zoom.us')) {
        return match;
      }
      blockedContentFound.add('link');
      return '******';
    });

    // Mask phone numbers before booking is confirmed
    parsedMessage = parsedMessage.replace(phoneRegex, match => {
      // Avoid masking date-like strings such as YYYY-MM-DD
      if (/\b\d{4}-\d{2}-\d{2}\b/.test(match)) {
        return match;
      }
      blockedContentFound.add('phone');
      return '******';
    });

    // Mask blocked keywords (case-insensitive, whole-word)
    parsedMessage = parsedMessage.replace(keywordRegex, () => {
      blockedContentFound.add('keyword');
      return '******';
    });
  } else {
    // CASE: Booking confirmed
    // Allow phone numbers & mask emails that are not whitelisted
    parsedMessage = parsedMessage.replace(emailRegex, match => {
      const lowered = match.toLowerCase();
      if (lowered.endsWith('@gowithguide.com') || lowered.endsWith('@travelience.co.jp')) {
        return match;
      }
      blockedContentFound.add('email');
      return '******';
    });

    // Suppliers: even after booking, only allow whitelisted links
    if (sender === 'supplier') {
      parsedMessage = parsedMessage.replace(linkRegex, match => {
        const lowered = match.toLowerCase();
        if (lowered.includes('gowithguide.com') || lowered.includes('zoom.us')) {
          return match;
        }
        blockedContentFound.add('link');
        return '******';
      });
    }
    // Customers with confirmed booking: links, keywords allowed
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
