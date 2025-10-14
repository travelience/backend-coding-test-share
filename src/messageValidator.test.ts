import { validateMessage, MessageInput } from './messageValidator';
import { TEST_MESSAGE } from './testData';

describe('Customer', () => {
  it('Customer with Booking', () => {
    const input: MessageInput = {
      sender: 'customer',
      message: TEST_MESSAGE,
      hasConfirmedBooking: true,
    };

    const res = validateMessage(input);
    expect(res).toEqual({
      sender: 'customer',
      message: TEST_MESSAGE,
      hasConfirmedBooking: true,
      blocked: [],
    });
  });

  it('Customer without Booking', () => {
    const input: MessageInput = {
      sender: 'customer',
      message: TEST_MESSAGE,
      hasConfirmedBooking: false,
    };

    const res = validateMessage(input);
    expect(res).toEqual({
      sender: 'customer',
      message: TEST_MESSAGE,
      hasConfirmedBooking: false,
      blocked: [],
    });
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
    expect(res).toEqual({
      sender: 'supplier',
      message: TEST_MESSAGE,
      hasConfirmedBooking: true,
      blocked: [],
    });
  });

  it('Supplier without Booking', () => {
    const input: MessageInput = {
      sender: 'supplier',
      message: TEST_MESSAGE,
      hasConfirmedBooking: false,
    };

    const res = validateMessage(input);
    expect(res).toEqual({
      sender: 'supplier',
      message: TEST_MESSAGE,
      hasConfirmedBooking: false,
      blocked: [],
    });
  });
});
