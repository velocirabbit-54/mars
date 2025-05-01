import '@testing-library/jest-dom';

declare global {
  interface Window {
    fetch: jest.Mock;
  }
}
