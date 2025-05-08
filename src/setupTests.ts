
// Arquivo de configuração para o ambiente de testes
import '@testing-library/jest-dom';

// Mock para o localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => {
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => {
      return Object.keys(store)[index] || null;
    },
    length: 0,
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock básico para matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Silenciar avisos de console durante os testes
const originalConsole = { ...console };

// Configurar mocks para console
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Adaptar getItem e setItem do localStorage para testes
jest.spyOn(localStorageMock, 'getItem');
jest.spyOn(localStorageMock, 'setItem');
jest.spyOn(localStorageMock, 'removeItem');
