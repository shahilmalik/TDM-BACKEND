
import { PipelineStatus, BackendService, BackendCategory, MetaToken, MetaPage } from '../types';

const BASE_URL = 'https://prod.tarvizdigimart.com/api';

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Generic helper for requests
const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type");
  
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorData = await response.json();
            // Handle DRF error format
            if (errorData.detail) errorMessage = errorData.detail;
            else if (errorData.errors) errorMessage = JSON.stringify(errorData.errors);
            else if (typeof errorData === 'object') {
                // Get first value of first key
                const firstKey = Object.keys(errorData)[0];
                errorMessage = `${firstKey}: ${Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey]}`;
            }
        } else {
             errorMessage = response.statusText;
        }
    } catch (e) {
        errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
      return {} as T;
  }
  
  if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
  }
  
  // Return blob for PDF etc
  if (contentType && contentType.indexOf("application/pdf") !== -1) {
      return response.blob() as unknown as T;
  }

  return response.text() as unknown as T;
};

export const api = {
  auth: {
    login: (data: any) => request<any>('/auth/signin/', { method: 'POST', body: JSON.stringify(data) }),
    
    // Client Signup Flow
    signupClientInitiate: (data: any) => request<any>('/signup/client/initiate/', { method: 'POST', body: JSON.stringify(data) }),
    signupClientVerify: (data: any) => request<any>('/signup/client/verify/', { method: 'POST', body: JSON.stringify(data) }),
    signupClientResend: (data: any) => request<any>('/signup/client/resend/', { method: 'POST', body: JSON.stringify(data) }),
    
    // Password Reset Flow
    resetPasswordInitiate: (data: any) => request<any>('/auth/reset/initiate/', { method: 'POST', body: JSON.stringify(data) }),
    resetPasswordVerify: (data: any) => request<any>('/auth/reset/verify/', { method: 'POST', body: JSON.stringify(data) }),
    resetPasswordResend: (data: any) => request<any>('/auth/reset/resend/', { method: 'POST', body: JSON.stringify(data) }),
    
    sendOtp: (data: any) => request<any>('/auth/send_otp/', { method: 'POST', body: JSON.stringify(data) }), // Deprecated, kept for compat if needed
  },
  admin: {
    createEmployee: (data: any) => request<any>('/signup/employee/', { method: 'POST', body: JSON.stringify(data) }),
  },
  employee: {
    list: () => request<any[]>('/employee/', { method: 'GET' }),
    create: (data: any) => request<any>('/employee/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string | number, data: any) => request<any>(`/employee/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string | number) => request<void>(`/employee/${id}/`, { method: 'DELETE' }),
  },
  clients: {
    list: () => request<any[]>('/clients/', { method: 'GET' }),
    create: (data: any) => request<any>('/clients/', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string | number) => request<any>(`/clients/${id}/`, { method: 'GET' }),
    update: (id: string | number, data: any) => request<any>(`/clients/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    replace: (id: string | number, data: any) => request<any>(`/clients/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string | number) => request<void>(`/clients/${id}/`, { method: 'DELETE' }),
  },
  core: {
    getProfile: () => request<any[]>('/core/profiles/', { method: 'GET' }), // Returns array, we usually take the first one for the user
    updateProfile: (id: number, data: any) => request<any>(`/core/profiles/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    createProfile: (data: any) => request<any>('/core/profiles/', { method: 'POST', body: JSON.stringify(data) }),
  },
  services: {
    list: () => request<BackendService[]>('/services/', { method: 'GET' }),
    create: (data: any) => request<BackendService>('/services/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<BackendService>(`/services/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/services/${id}/`, { method: 'DELETE' }),
  },
  categories: {
    list: () => request<BackendCategory[]>('/categories/', { method: 'GET' }),
    create: (data: any) => request<BackendCategory>('/categories/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<BackendCategory>(`/categories/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/categories/${id}/`, { method: 'DELETE' }),
  },
  invoice: {
    list: () => request<any>('/invoice/invoices/', { method: 'GET' }),
    create: (data: any) => request<any>('/invoice/invoices/', { method: 'POST', body: JSON.stringify(data) }),
    preview: (id: number | string) => request<{id: number, html: string}>(`/invoice/invoices/${id}/preview/`, { method: 'GET' }),
    downloadPdf: (id: number | string) => request<Blob>(`/invoice/invoices/${id}/generate_pdf/`, { method: 'GET' }),
    
    // Dropdowns
    getDropdownClients: () => request<any[]>('/invoice/dropdowns/clients/', { method: 'GET' }),
    getDropdownPaymentModes: () => request<any[]>('/invoice/dropdowns/payment-modes/', { method: 'GET' }),
    createPaymentMode: (data: any) => request<any>('/invoice/dropdowns/payment-modes/', { method: 'POST', body: JSON.stringify(data) }),
    deletePaymentMode: (id: number) => request<void>(`/invoice/dropdowns/payment-modes/${id}/`, { method: 'DELETE' }),
    
    getDropdownPaymentTerms: () => request<any[]>('/invoice/dropdowns/payment-terms/', { method: 'GET' }),
    createPaymentTerm: (data: any) => request<any>('/invoice/dropdowns/payment-terms/', { method: 'POST', body: JSON.stringify(data) }),
    deletePaymentTerm: (id: number) => request<void>(`/invoice/dropdowns/payment-terms/${id}/`, { method: 'DELETE' }),
  },
  kanban: {
    // Note: Backend endpoint is defined as /kanban/invoices/ based on the provided configuration, though it returns content items
    list: () => request<any[]>('/kanban/invoices/', { method: 'GET' }), 
    move: (id: number, target_column: string) => request<any>(`/kanban/invoices/${id}/move/`, { method: 'POST', body: JSON.stringify({ target_column }) }),
    approve: (id: number, action: 'approve' | 'revise') => request<any>(`/kanban/invoices/${id}/approve/`, { method: 'POST', body: JSON.stringify({ action }) }),
  },
  meta: {
    getInstagram: (clientId: string | number) => request<any>(`/meta/instagram/${clientId}/`, { method: 'GET' }),
    listTokens: () => request<{ tokens: MetaToken[], total_count: number }>('/meta/tokens/', { method: 'GET' }),
    sendTokenOtp: () => request<{ detail: string }>('/meta/tokens/send_otp/', { method: 'POST' }),
    createToken: (data: { account_label: string, access_token: string, otp: string }) => request<MetaToken>('/meta/tokens/', { method: 'POST', body: JSON.stringify(data) }),
    listPages: () => request<{ pages: MetaPage[] }>('/meta/pages/', { method: 'GET' }),
  }
};

// Mappers to translate Backend Enum to Frontend Types
export const mapBackendColumnToStatus = (col: string): PipelineStatus => {
    const map: Record<string, PipelineStatus> = {
        'backlog': 'backlog',
        'content_writing': 'writing',
        'design_creative': 'design',
        'internal_review': 'review',
        'client_approval': 'approval',
        'scheduled': 'scheduled',
        'posted': 'posted'
    };
    return map[col] || 'backlog';
};

export const mapStatusToBackendColumn = (status: PipelineStatus): string => {
    const map: Record<string, string> = {
        'backlog': 'backlog',
        'writing': 'content_writing',
        'design': 'design_creative',
        'review': 'internal_review',
        'approval': 'client_approval',
        'scheduled': 'scheduled',
        'posted': 'posted'
    };
    return map[status] || 'backlog';
};
