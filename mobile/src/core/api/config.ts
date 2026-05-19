// URL locale pour tests rapides sans attendre Render
const LOCAL_API_URL = 'http://192.168.1.11:3000/api';
const PROD_API_URL = 'https://binaa-backend-fpss.onrender.com/api';

const isProdWeb = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1' && 
  !window.location.hostname.startsWith('192.168.');

export const API_BASE_URL = isProdWeb ? PROD_API_URL : LOCAL_API_URL;
