const isLocal = window.location.hostname === 'localhost';
export const API_BASE_URL = isLocal ? 'http://localhost:3000' : 'https://proiect-tehnologii-web-bug-tracking.onrender.com';
