// Changer cette URL pour pointer vers votre serveur de production
// Exemple: 'binaa-server.up.railway.app'
const API_HOST = '192.168.1.11';

// Mettre à true une fois le serveur déployé avec HTTPS
const USE_HTTPS = false;

export const API_BASE_URL = `http${USE_HTTPS ? 's' : ''}://${API_HOST}:3000/api`;
