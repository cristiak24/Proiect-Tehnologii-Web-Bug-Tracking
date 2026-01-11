// src/config.js

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isLocal 
    ? 'http://localhost:3000' 
    : 'https://proiect-tehnologii-web-bug-tracking.onrender.com';