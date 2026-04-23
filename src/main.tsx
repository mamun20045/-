/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Safety guard for sandboxed environments where window.fetch might be read-only.
// We use a Proxy for 'global' to intercept and silenty ignore attempts to overwrite 'fetch'.
if (typeof window !== 'undefined') {
  if (!(window as any).global) {
    (window as any).global = new Proxy(window, {
      set(target, prop, value) {
        if (prop === 'fetch') {
          // If the property is read-only on window, attempting to set it on the proxy 
          // would normally throw a TypeError if we don't handle it.
          // By returning true here, we pretend the assignment succeeded.
          return true;
        }
        (target as any)[prop] = value;
        return true;
      },
      get(target, prop) {
        const val = (target as any)[prop];
        if (typeof val === 'function') {
          return val.bind(target);
        }
        return val;
      }
    });
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
