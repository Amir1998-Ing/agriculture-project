export const environment = {
  production: false,
  
  // URLs API
  apiUrl: 'http://localhost:8888/api',
  authApi: 'http://localhost:8888/api/auth',
  agriculteurApi: 'http://localhost:8888/api/agriculteurs',
  equipementApi: 'http://localhost:8888/api/equipements',
  supervisionApi: 'http://localhost:8888/api/supervision',
  
  // Configuration JWT
  tokenKey: 'auth_token',
  userKey: 'auth_user',
  
  // Timeout
  requestTimeout: 30000,
  
  // Pagination
  pageSize: 10,
  pageSizeOptions: [5, 10, 25, 50]
};