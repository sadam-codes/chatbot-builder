import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        style: {
          background: 'linear-gradient(135deg, #1e293b, #0f172a)', // gradient bg
          color: '#fff',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          fontSize: '15px',
          fontWeight: '500',
        },
        success: {
          style: {
            background: 'linear-gradient(135deg, #22c55e, #15803d)',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#16a34a',
          },
        },
        error: {
          style: {
            background: 'linear-gradient(135deg, #ef4444, #991b1b)',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#b91c1c',
          },
        },
        loading: {
          style: {
            background: 'linear-gradient(135deg, #3b82f6, #1e3a8a)',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#1d4ed8',
          },
        },
      }}
    />
  </React.StrictMode>
);
