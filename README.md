# GoWithGuide - Message Validation Coding Test

> **IMPORTANT: Please FORK this repository to complete the coding test. Do NOT create a Pull Request to this repo.** Submit your work by sharing the link to your forked repository.

## Context

You are an engineering leader, writing code to build a feature that allows all developers to maintain and understand the code for future scalability.

## Overview

This coding test evaluates your ability to implement message validation logic for a communication system between customers and suppliers. The goal is to prevent users from bypassing the platform by sharing contact information or external links inappropriately.

- **Time Expectation:** 2-4 hours
- **Technologies:** TypeScript, Jest
- **Requirements:** No additional libraries needed

## Commands

| Command             | Description               |
| ------------------- | ------------------------- |
| `npm install`       | install dependencies      |
| `npm test`          | run all tests             |
| `npm run lint`      | run eslint checker        |
| `npm run lint:fix`  | auto-fix linting issues   |
| `npm run typecheck` | check TypeScript types    |
| `npm run format`    | format code with prettier |

## Problem Statement

In GoWithGuide, customers and suppliers communicate through our messaging system. To prevent circumvention of our platform, we need to validate and mask certain content based on:
- **User type** (customer vs supplier)
- **Booking status** (confirmed booking vs no booking)
- **Content type** (emails, phone numbers, links, keywords)

## Your Task

### 1. Core Implementation
Implement the `validateMessage` function in `src/messageValidator.ts` that processes messages according to the rules below.

### 2. Test Coverage
The test file `src/messageValidator.test.ts` contains a comprehensive test that validates all business rules using real message examples from `src/testData.ts`.

## Business Rules

### Input Structure
```typescript
interface MessageInput {
  sender: 'customer' | 'supplier';
  message: string;
  hasConfirmedBooking: boolean;
}
```

### Output Structure
```typescript
interface MessageOutput {
  sender: 'customer' | 'supplier';
  message: string; // Masked message
  hasConfirmedBooking: boolean;
  blocked: string[]; // Array of blocked content types
}
```

### Validation Rules

#### Phone Numbers
- **Pattern:** Must match realistic phone formats
  - Format 1: `XXX-XXX-XXXX` or `XXX XXX XXXX`
  - Format 2: `XXXX-XXXX` or `XXXX XXXX`
  - International: `+XX XXX-XXX-XXXX`
- **Rule:** Block for ALL users when `hasConfirmedBooking = false`
- **Rule:** Allow for ALL users when `hasConfirmedBooking = true`

#### Email Addresses
- **Pattern:** Standard email format `user@domain.com`
- **Whitelist:** Always allow `@gowithguide.com`, `@travelience.co.jp`
- **Rule:** Block all other domains regardless of booking status
- **Note:** We don't allow emails even after booking is confirmed, still we allow specific domains

#### Links/URLs
- **Pattern:** Detect URLs with or without protocol (`http://`, `https://`, or domain only)
- **Whitelist:** Always allow `gowithguide.com`, `zoom.us`
- **Suppliers:** Block all links except whitelisted domains, regardless of booking status
- **Customers:** Block all links when `hasConfirmedBooking = false`, allow all links when `hasConfirmedBooking = true`

#### Blocked Keywords
- **Keywords:** `tourhq`, `toursbylocals`, `withlocals`, `facebook`, `twitter`, `instagram`, `gmail`, `email`, `skype`, `cash`, `recruiter`
- **Rule:** Block for ALL users when `hasConfirmedBooking = false`
- **Rule:** Allow for ALL users when `hasConfirmedBooking = true`
- **Matching:** Case-insensitive, whole word matching

### Masking Behavior
- Replace blocked content with `******`
- Preserve message structure and spacing
- Track what was blocked in the `blocked` array

## Example

### Input:
```typescript
{
  sender: 'customer',
  message: 'Hello! Contact me at john@gmail.com or 123-456-7890. Check out facebook.com/mypage',
  hasConfirmedBooking: false
}
```

### Output:
```typescript
{
  sender: 'customer',
  message: 'Hello! Contact me at ****** or ******. Check out ******',
  hasConfirmedBooking: false,
  blocked: ['email', 'phone', 'keyword', 'link']
}
```

## Test Data

The test data is provided in `src/testData.ts` and contains:
- Phone numbers that should be blocked/allowed
- Whitelisted and non-whitelisted email examples
- Customer-restricted and whitelisted links
- Blocked keywords and allowed variations
- Complex messages with multiple violation types

The test suite automatically validates your implementation against all these scenarios.

## AI Assistance Encouraged

We encourage and welcome the use of AI code agents (such as Claude, ChatGPT, GitHub Copilot, etc.) to complete this coding test. These tools are part of modern development workflows, and using them demonstrates practical problem-solving skills.

## Getting Started

1. **Fork this repository** (do NOT clone it directly or create PRs to this repo)
2. Install dependencies: `npm install`
3. Examine the test data in `src/testData.ts`
4. Run the test to see what needs to be implemented: `npm test`
5. Implement your solution in `src/messageValidator.ts`
6. Run tests until they pass: `npm test`
7. Ensure linting passes: `npm run lint`
8. Check types: `npm run type-check`

## Submission

> **Reminder: Do NOT open a Pull Request to this repository. Work on your own fork and share the link to your forked repo.**

Your implementation should include:
- `src/messageValidator.ts` - Main validation logic that passes all tests
- Clean, well-documented TypeScript code following best practices
- All tests passing (`npm test` should show green)
- No linting errors (`npm run lint` should be clean)
- No TypeScript errors (`npm run typecheck` should pass)

Good luck! 🚀