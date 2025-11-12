import '@testing-library/jest-dom';

// Remove or comment out MSW setup if you're not using it
// import { server } from './mocks/server.js';

// Mock console.log to keep test output clean
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = vi.fn();
  console.error = vi.fn();
  
  // Remove or comment this out
  // server.listen();
});

afterEach(() => {
  // Remove or comment this out
  // server.resetHandlers();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  
  // Remove or comment this out
  // server.close();
});