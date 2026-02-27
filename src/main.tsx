import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/index.css';
import './styles/honeypot.css';

createRoot(document.getElementById('root')!).render(<App />);
