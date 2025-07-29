// Replace with your actual server URL
const API_BASE_URL = 'http://localhost:5000'; // Change this to your server's IP address

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export async function apiGet(endpoint: string, headers: Record<string, string> = {}) {
  return apiRequest(endpoint, {
    method: 'GET',
    headers,
  });
}

export async function apiPost(endpoint: string, data: any, headers: Record<string, string> = {}) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    headers,
  });
}

export async function apiPut(endpoint: string, data: any, headers: Record<string, string> = {}) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers,
  });
}

export async function apiDelete(endpoint: string, headers: Record<string, string> = {}) {
  return apiRequest(endpoint, {
    method: 'DELETE',
    headers,
  });
}