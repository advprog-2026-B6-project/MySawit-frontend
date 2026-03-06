import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  fetch.mockClear();
});

// Mock environment variable
process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:8080';
