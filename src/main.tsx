import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
// @ts-ignore: allow side-effect import of CSS without explicit type declarations
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App /> 
  </StrictMode>, 
);
