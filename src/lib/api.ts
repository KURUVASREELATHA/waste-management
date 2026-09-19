import { API_BASE_URL } from './apiConfig';

export { API_BASE_URL };

// Add connection status tracking
let isOnline = true;
let lastConnectionCheck = Date.now();

// Check connection status
const checkConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      timeout: 5000 
    });
    isOnline = response.ok;
    lastConnectionCheck = Date.now();
    return isOnline;
  } catch {
    isOnline = false;
    lastConnectionCheck = Date.now();
    return false;
  }
};

// Auto-check connection every 30 seconds
setInterval(checkConnection, 30000);

// Export connection status
export const getConnectionStatus = () => ({ isOnline, lastCheck: lastConnectionCheck });

class ApiService {
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
  private getHeaders(includeAuth = false, contentType = 'application/json') {
    const headers: Record<string, string> = {};
    
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    
    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  async post(endpoint: string, data: any, options?: { headers?: Record<string, string> }) {
    try {
      const isFormData = data instanceof FormData;
      const headers = options?.headers || this.getHeaders(true);
      
      // Don't set Content-Type for FormData, let browser set it with boundary
      if (isFormData) {
        delete headers['Content-Type'];
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: isFormData ? data : JSON.stringify(data),
      });

      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch {
          error = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(error.message || 'Request failed');
      }

      return response.json();
    } catch (fetchError: any) {
      if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      throw fetchError;
    }
  }

  async get(endpoint: string, includeAuth = true) {
    if (includeAuth && !localStorage.getItem('token')) {
      throw new Error('No token, authorization denied');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(includeAuth),
        timeout: 10000, // 10 second timeout
      });

      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch {
          error = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(error.message || 'Request failed');
      }

      return response.json();
    } catch (fetchError: any) {
      if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      throw fetchError;
    }
  }

  async patch(endpoint: string, data?: any, includeAuth = true, customHeaders?: Record<string, string>) {
    const isFormData = data instanceof FormData;
    const headers = { ...this.getHeaders(includeAuth), ...customHeaders };
    
    // Don't set Content-Type for FormData, let browser set it with boundary
    if (isFormData) {
      delete headers['Content-Type'];
    }
    
    const requestOptions: RequestInit = {
      method: 'PATCH',
      headers,
    };
    
    if (data !== undefined) {
      requestOptions.body = isFormData ? data : JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        error = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async delete(endpoint: string, includeAuth = true) {
    try {
      console.log('DELETE request to:', `${API_BASE_URL}${endpoint}`);
      console.log('Headers:', this.getHeaders(includeAuth));
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(includeAuth),
      });

      console.log('DELETE response status:', response.status);
      
      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch {
          error = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('DELETE error:', error);
        throw new Error(error.message || 'Request failed');
      }

      const result = await response.json();
      console.log('DELETE success:', result);
      return result;
    } catch (fetchError: any) {
      console.error('DELETE fetch error:', fetchError);
      if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      throw fetchError;
    }
  }
}

export const api = new ApiService();