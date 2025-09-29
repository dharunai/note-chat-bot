import React from 'react';
import { renderToString } from 'react-dom/server';

// Minimal DOM globals
(globalThis as any).window = {
  matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
  addEventListener: () => {},
  removeEventListener: () => {},
  navigator: { userAgent: 'node' },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
  },
};
(globalThis as any).document = {
  createElement: () => ({ style: {} }),
  getElementById: () => null,
  body: { classList: { add: () => {}, remove: () => {} } },
};
(globalThis as any).navigator = { onLine: true };
(globalThis as any).localStorage = window.localStorage;

import App from '../client/src/App';

try {
  const html = renderToString(React.createElement(App));
  console.log('Rendered successfully. HTML length:', html.length);
} catch (error) {
  console.error('App render failed:', error);
  process.exit(1);
}
