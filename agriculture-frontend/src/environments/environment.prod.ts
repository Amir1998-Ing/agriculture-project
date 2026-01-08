export const environment = {
  production: true,
  
  // URLs API Production (à modifier)
  apiUrl: 'https://votre-domaine.com/api',
  authApi: 'https://votre-domaine.com/api/auth',
  agriculteurApi: 'https://votre-domaine.com/api/agriculteurs',
  equipementApi: 'https://votre-domaine.com/api/equipements',
  supervisionApi: 'https://votre-domaine.com/api/supervision',
  
  tokenKey: 'auth_token',
  userKey: 'auth_user',
  
  requestTimeout: 30000,
  pageSize: 10,
  pageSizeOptions: [5, 10, 25, 50]
};