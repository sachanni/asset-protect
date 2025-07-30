// Updated api.ts for your Windows machine
// Replace localhost with your actual Windows IP address

// STEP 1: Find your Windows IP address
// Open Command Prompt and run: ipconfig | findstr "IPv4"
// Look for something like: IPv4 Address. . . . . . . . . . . : 192.168.1.XXX

// STEP 2: Replace XXX with your actual IP
const API_BASE_URL = 'http://192.168.1.XXX:5000'; // UPDATE THIS LINE

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

// Example of how to find your IP:
// C:\Users\hp>ipconfig | findstr "IPv4"
//    IPv4 Address. . . . . . . . . . . : 192.168.1.105
// 
// Then your API_BASE_URL should be: 'http://192.168.1.105:5000'