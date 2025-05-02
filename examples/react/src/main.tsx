import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import StepsExample from './StepsExample.tsx';
import DisclosuresExample from './DisclosuresExample.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StepsExample />
    <DisclosuresExample />
  </StrictMode>
);
