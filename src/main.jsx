// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'   // اگر داری


// ZoomDesable
document.addEventListener('gesturestart', function (event) {
  event.preventDefault();
  document.body.style.zoom = 1; // برای برخی از مرورگرها
});

document.addEventListener('gesturechange', function (event) {
  event.preventDefault();
  document.body.style.zoom = 1; // برای برخی از مرورگرها
});

document.addEventListener('gestureend', function (event) {
  event.preventDefault();
  document.body.style.zoom = 1; // برای برخی از مرورگرها
});

// فقط جلوگیری از زوم در دستگاه‌های لمسی
document.addEventListener('touchmove', function (event) {
  if (event.scale !== undefined && event.scale !== 1) {
    event.preventDefault();
  }
}, { passive: false });
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

document.addEventListener('dblclick', (e) => {
  e.preventDefault();
}, { passive: false });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)