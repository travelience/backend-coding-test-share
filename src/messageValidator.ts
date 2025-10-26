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

// Regex patterns for phone formats
const phonePatterns = [
  /\b\d{3}[- ]\d{3}[- ]\d{4}\b/g,
  /\b\d{4}[- ]\d{4}\b/g,
  /\b\+\d{2} ?\d{3}[- ]\d{3}[- ]\d{3}\b/g,
];

const emailPattern = /\b[\w.+-]+@([\w-]+\.)+[\w-]{2,63}\b/gi;

// Domains
const allowedEmailDomains = ['gowithguide.com', 'travelience.co.jp'];
const allowedUrlDomains = ['gowithguide.com', 'zoom.us'];
const blockedKeywords = [
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

// Simple URL matcher (protocol optional)
const urlPattern = /((https?:\/\/)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(\/[\w/#?&=.-]*)?/gi;

// ToDo: implement business logic from README.md
export function validateMessage(input: MessageInput): MessageOutput {
  const { sender, hasConfirmedBooking } = input;
  let message = input.message;
  const blocked: string[] = [];

  // 1. Mask phone numbers
  phonePatterns.forEach(pattern => {
    if (pattern.test(message)) blocked.push('phone');
    message = message.replace(pattern, '******');
  });

  // 2. Mask email addresses
  const emailMatches = message.match(emailPattern);
  if (emailMatches) {
    emailMatches.forEach(email => {
      const domain = email.split('@')[1];
      const isAllowed = allowedEmailDomains.some(allowed => domain === allowed);
      if (!isAllowed) {
        message = message.replace(
          new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
          '******'
        );
        if (!blocked.includes('email')) blocked.push('email');
      }
    });
  }

  //  3. Mask blocked emails by pattern again for domains not allowed
  message = message.replace(emailPattern, email => {
    let domain = email.split('@')[1];
    domain = domain as string;
    return allowedEmailDomains.includes(domain) ? email : '******';
  });

  //  4. Mask links/URLs
  const linkMatches: RegExpMatchArray | null = message.match(urlPattern);
  if (linkMatches) {
    linkMatches.forEach(url => {
      // Extract domain
      const domainMatch = url.match(/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      let domain = domainMatch ? domainMatch[1] : '';
      domain = domain as string;
      const isWhitelisted = allowedUrlDomains.some(allowed => domain.endsWith(allowed));
      if (sender === 'supplier') {
        if (!isWhitelisted) {
          message = message.replace(
            new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
            '******'
          );
          if (!blocked.includes('link')) blocked.push('link');
        }
      } else {
        if (!hasConfirmedBooking) {
          message = message.replace(
            new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
            '******'
          );
          if (!blocked.includes('link')) blocked.push('link');
        }
      }
    });
  }

  // 5. Mask blocked keywords (whole word, case-insensitive)
  blockedKeywords.forEach(keyword => {
    const pattern = new RegExp(`\\b${keyword}\\b`, 'gi');
    if (pattern.test(message) && !hasConfirmedBooking) {
      message = message.replace(pattern, '******');
      if (!blocked.includes('keyword')) blocked.push('keyword');
    }
  });

  return {
    sender: input.sender,
    message: input.message,
    hasConfirmedBooking: input.hasConfirmedBooking,
    blocked: [],
  };
}
