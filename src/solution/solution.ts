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

const KEYWORDS = [
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
];

const EMAIL_WHITELIST = ['gowithguide.com', 'travelience.co.jp'] as const;
const LINK_WHITELIST = ['gowithguide.com', 'zoom.us'] as const;

function parseMessage(
  message: string,
  bookingStatus: 'confirmed' | 'unconfirmed',
  sender: 'customer' | 'supplier'
): { parsedMessage: string; blocked: string[] } {
  let parsed = message;
  const blocked = new Set<string>();

  // Emails: always evaluated; only whitelist domains are allowed through
  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  parsed = parsed.replace(emailRegex, m => {
    const domain = m.slice(m.lastIndexOf('@') + 1).toLowerCase();
    if (EMAIL_WHITELIST.some(w => domain === w || domain.endsWith(`.${w}`))) return m;
    blocked.add('email');
    return '******';
  });

  // Links: suppliers always blocked (except whitelist). Customers blocked only when booking is unconfirmed.
  const linkRegex = /(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:\/[^\s<>"')\]]*)?/g;
  parsed = parsed.replace(linkRegex, raw => {
    const token = raw.replace(/[),.;:!?]+$/g, '');
    const trailing = raw.slice(token.length);
    if (!token) return raw;
    const lower = token.toLowerCase();
    if (LINK_WHITELIST.some(w => lower.includes(w))) return raw;

    const shouldBlock = sender === 'supplier' || bookingStatus === 'unconfirmed';
    if (!shouldBlock) return raw;

    blocked.add('link');
    return `******${trailing}`;
  });

  if (bookingStatus === 'unconfirmed') {
    // Phones: block for everyone when booking is unconfirmed
    const phoneRegex =
      /(?<!\d)(\+\d{2}\s*\d{3}[- ]\d{3}[- ]\d{4}|\d{3}[- ]\d{3}[- ]\d{4}|\d{4}[- ]\d{4}|\d{3}[- ]\d{4}[- ]\d{4}|\d{3}[- ]\d{3}[- ]\d{5}|\d{5}[- ]\d{5}[- ]\d{4})(?!\d)/g;
    parsed = parsed.replace(phoneRegex, m => {
      if (/\b\d{4}-\d{2}-\d{2}\b/.test(m)) return m; // don't mask dates
      blocked.add('phone');
      return '******';
    });
    // Keywords: block for everyone when booking is unconfirmed
    const restrictedKeywordsRegex = new RegExp(
      `\\b(${KEYWORDS.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
      'gi'
    );
    parsed = parsed.replace(restrictedKeywordsRegex, () => {
      blocked.add('keyword');
      return '******';
    });
  }

  return { parsedMessage: parsed, blocked: Array.from(blocked) };
}

export function validateMessage(input: MessageInput): MessageOutput {
  const bookingStatus = input.hasConfirmedBooking ? 'confirmed' : 'unconfirmed';
  const result = parseMessage(input.message, bookingStatus, input.sender);
  // keep ordering predictable
  const order = ['email', 'phone', 'keyword', 'link'];
  const blockedOrdered = order.filter(k => result.blocked.includes(k));

  return {
    sender: input.sender,
    message: result.parsedMessage,
    hasConfirmedBooking: input.hasConfirmedBooking,
    blocked: blockedOrdered,
  };
}
