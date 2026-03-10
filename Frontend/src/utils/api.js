const API_BASE_URL = 'http://localhost:5000/api';

const api = async (endpoint, options = {}) => {
  const { body, method: explicitMethod, ...customConfig } = options;
  const headers = { 'Content-Type': 'application/json' };
  
  const config = {
    method: explicitMethod || (body ? 'POST' : 'GET'),
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // Include credentials (cookies) for session auth
  config.credentials = 'include';

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (response.ok) {
      return data;
    }
    
    throw new Error(data.message || 'Something went wrong');
  } catch (err) {
    return Promise.reject(err.message);
  }
};

export default api;
