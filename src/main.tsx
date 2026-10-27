import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Defer non-critical Firebase connectivity verification until the browser is idle
if (typeof window !== 'undefined') {
  const scheduleIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 3000));
  scheduleIdle(() => {
    import('./lib/firebase').then(({ testtConnection }) => {
      testFirestoreConnection().catch(() => {});
    }).catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
