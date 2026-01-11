const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isLocal 
    // Aici pui link-ul de Render, NU localhost, pentru că vrei să testezi serverul live
    // Sau, dacă vrei să detecteze automat:
    ? 'https://proiect-tehnologii-web-bug-tracking.onrender.com' 
    : 'https://proiect-tehnologii-web-bug-tracking.onrender.com';