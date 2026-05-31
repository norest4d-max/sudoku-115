import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '../style.css';
import '../pattern.css';
import '../crossword.css';
import '../trivia.css';
import '../quote.css';
import './react.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
