const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

export const environment = {
  production: true,
  apiUrl: hostname.includes('premiumasp.net')
    ? 'https://azs-services.premiumasp.net/api'
    : 'https://api.azs-service.com/api',
  baseUrl: hostname.includes('premiumasp.net')
    ? 'https://azs-service.premiumasp.net'
    : 'https://azs-service.com'
};
