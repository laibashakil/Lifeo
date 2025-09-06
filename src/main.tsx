import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize font from settings
const savedSettings = localStorage.getItem('app-settings');
if (savedSettings) {
  try {
    const settings = JSON.parse(savedSettings);
    const fontClass = `font-${settings.fontFamily || 'inter'}`;
    document.body.classList.add(fontClass);
  } catch {
    document.body.classList.add('font-inter');
  }
} else {
  document.body.classList.add('font-inter');
}

createRoot(document.getElementById("root")!).render(<App />);
