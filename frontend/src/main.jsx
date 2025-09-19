import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/page.jsx'; // Adjust the path if needed
import './index.css'; // Assuming you have a main CSS file

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);