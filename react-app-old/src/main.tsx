import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';

// Styles reused from the Task 2 version (plus pages.css for the not-found page).
import './styles/variables.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/states.css';
import './styles/forms.css';
import './styles/pages.css';
import './styles/responsive.css';

const container = document.getElementById('root');
if (container === null) throw new Error('Root element #root was not found in index.html');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
