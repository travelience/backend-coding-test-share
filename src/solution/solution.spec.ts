import { validateMessage, MessageInput } from './solution';
import { TEST_MESSAGE } from '../testData';

describe('Customer', () => {
  it('Customer with Booking', () => {
    const input: MessageInput = {
      sender: 'customer',
      message: TEST_MESSAGE,
      hasConfirmedBooking: true,
    };

    const res = validateMessage(input);
    expect(res.sender).toBe('customer');
    expect(res.hasConfirmedBooking).toBe(true);
    // With confirmed booking, emails still get blocked unless whitelisted
    expect(res.blocked).toEqual(expect.arrayContaining(['email']));
    // Some masking should be present for blocked content
    expect(res.message).toEqual(expect.stringContaining('******'));
  });

  it('Customer without Booking', () => {
    const input: MessageInput = {
      sender: 'customer',
      message: TEST_MESSAGE,
      hasConfirmedBooking: false,
    };

    const res = validateMessage(input);
    expect(res.sender).toBe('customer');
    expect(res.hasConfirmedBooking).toBe(false);
    // When booking is not confirmed, multiple content types should be blocked
    expect(res.blocked).toEqual(expect.arrayContaining(['email', 'link', 'phone', 'keyword']));
    expect(res.message).toEqual(expect.stringContaining('******'));
  });
});

describe('Supplier', () => {
  it('Supplier with Booking', () => {
    const input: MessageInput = {
      sender: 'supplier',
      message: TEST_MESSAGE,
      hasConfirmedBooking: true,
    };

    const res = validateMessage(input);
    expect(res.sender).toBe('supplier');
    expect(res.hasConfirmedBooking).toBe(true);
    // Suppliers still have emails blocked and links restricted even after booking
    expect(res.blocked).toEqual(expect.arrayContaining(['email', 'link']));
    expect(res.message).toEqual(expect.stringContaining('******'));
  });

  it('Supplier without Booking', () => {
    const input: MessageInput = {
      sender: 'supplier',
      message: TEST_MESSAGE,
      hasConfirmedBooking: false,
    };

    const res = validateMessage(input);
    expect(res.sender).toBe('supplier');
    expect(res.hasConfirmedBooking).toBe(false);
    expect(res.blocked).toEqual(expect.arrayContaining(['email', 'link', 'phone', 'keyword']));
    expect(res.message).toEqual(expect.stringContaining('******'));
  });
});
