import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000';

async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

async function makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

export async function apiGet(endpoint: string): Promise<Response> {
  return makeRequest(endpoint, {
    method: 'GET',
  });
}

export async function apiPost(endpoint: string, data: any): Promise<Response> {
  return makeRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiPut(endpoint: string, data: any): Promise<Response> {
  return makeRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiDelete(endpoint: string): Promise<Response> {
  return makeRequest(endpoint, {
    method: 'DELETE',
  });
}