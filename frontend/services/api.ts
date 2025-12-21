import {
  PipelineStatus,
  BackendService,
  BackendCategory,
  MetaToken,
  MetaPage,
  UserProfile,
} from "../types";

const BASE_URL = "http://localhost:8000/api";

const getHeaders = () => {
  const token = localStorage.getItem("accessToken");
  // DEV: log token presence to help debug missing Authorization headers
  try {
    // avoid logging actual token in production; show masked form
    if (token)
      console.debug(
        "api.getHeaders: accessToken present (masked)",
        `${token.substring(0, 6)}...${token.slice(-6)}`
      );
    else console.debug("api.getHeaders: no accessToken in localStorage");
  } catch (e) {}
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Attempt to refresh access token using stored refresh token.
const refreshAccessToken = async (): Promise<string | null> => {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const newAccess = data.access || data.token || null;
    const newRefresh = data.refresh || null;
    if (newAccess) localStorage.setItem("accessToken", newAccess);
    if (newRefresh) localStorage.setItem("refreshToken", newRefresh);
    return newAccess;
  } catch (e) {
    return null;
  }
};

// Generic helper for requests
const request = async <T>(
  endpoint: string,
  options: RequestInit & { _retry?: boolean } = {}
): Promise<T> => {
  const doFetch = async () =>
    fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      // ensure CORS mode and credentials are set when needed
      mode: "cors",
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

  let response = await doFetch();

  // If unauthorized, try to refresh once and retry
  if (response.status === 401 && !options._retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // retry original request with _retry flag to avoid loops
      const retryOptions = { ...options, _retry: true } as RequestInit & {
        _retry?: boolean;
      };
      response = await fetch(`${BASE_URL}${endpoint}`, {
        ...retryOptions,
        headers: {
          ...getHeaders(),
          ...retryOptions.headers,
        },
      });
    }
  }

  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const errorData = await response.json();
        // Preferred shapes:
        // 1) { detail: 'message' }
        // 2) { errors: { field: ['msg'] } }
        // 3) { success: false, errors: { ... } }
        // 4) { error: { field: 'msg' } }
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.errors) {
          try {
            const firstKey = Object.keys(errorData.errors)[0];
            const val = errorData.errors[firstKey];
            errorMessage = Array.isArray(val)
              ? `${firstKey}: ${val[0]}`
              : `${firstKey}: ${val}`;
          } catch (e) {
            errorMessage = JSON.stringify(errorData.errors);
          }
        } else if (errorData.error) {
          // backend may return single `error` key with dict or string
          if (typeof errorData.error === "string")
            errorMessage = errorData.error;
          else if (typeof errorData.error === "object") {
            const k = Object.keys(errorData.error)[0];
            const v = errorData.error[k];
            errorMessage = Array.isArray(v) ? `${k}: ${v[0]}` : `${k}: ${v}`;
          }
        } else if (errorData.success === false && errorData.errors) {
          const k = Object.keys(errorData.errors)[0];
          const v = errorData.errors[k];
          errorMessage = Array.isArray(v) ? `${k}: ${v[0]}` : `${k}: ${v}`;
        } else if (typeof errorData === "object") {
          // Fallback - get first field message
          const firstKey = Object.keys(errorData)[0];
          const val = errorData[firstKey];
          errorMessage = Array.isArray(val)
            ? `${firstKey}: ${val[0]}`
            : `${firstKey}: ${val}`;
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
    login: (data: any) =>
      request<any>("/auth/signin/", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    // Client Signup Flow
    signupClientInitiate: (data: any) =>
      request<any>("/signup/client/initiate/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    signupClientVerify: (data: any) =>
      request<any>("/signup/client/verify/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    signupClientResend: (data: any) =>
      request<any>("/signup/client/resend/", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    // Password Reset Flow
    resetPasswordInitiate: (data: any) =>
      request<any>("/auth/reset/initiate/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    resetPasswordVerify: (data: any) =>
      request<any>("/auth/reset/verify/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    resetPasswordResend: (data: any) =>
      request<any>("/auth/reset/resend/", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    sendOtp: (data: any) =>
      request<any>("/auth/send_otp/", {
        method: "POST",
        body: JSON.stringify(data),
      }), // Deprecated, kept for compat if needed
    verifyPassword: (data: any) =>
      request<any>("/auth/verify_password/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  admin: {
    createEmployee: (data: any) =>
      request<any>("/signup/employee/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  employee: {
    list: () => request<any[]>("/employee/", { method: "GET" }),
    create: (data: any) =>
      request<any>("/employee/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string | number, data: any) =>
      request<any>(`/employee/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string | number) =>
      request<void>(`/employee/${id}/`, { method: "DELETE" }),
  },
  clients: {
    list: () => request<any[]>("/clients/", { method: "GET" }),
    create: (data: any) =>
      request<any>("/clients/", { method: "POST", body: JSON.stringify(data) }),
    get: (id: string | number) =>
      request<any>(`/clients/${id}/`, { method: "GET" }),
    // Fetch a single client and map to the frontend `UserProfile` shape
    getProfileMapped: (id: string | number) =>
      request<any>(`/clients/${id}/`, { method: "GET" }).then(
        mapClientToUserProfile
      ),
    initiateContactEmailChange: (id: string | number, data: any) =>
      request<any>(`/clients/${id}/initiate_contact_email_change/`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    verifyContactEmailChange: (id: string | number, data: any) =>
      request<any>(`/clients/${id}/verify_contact_email_change/`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string | number, data: any) =>
      request<any>(`/clients/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    replace: (id: string | number, data: any) =>
      request<any>(`/clients/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string | number) =>
      request<void>(`/clients/${id}/`, { method: "DELETE" }),
  },
  core: {
    getProfile: () => request<any[]>("/core/profiles/", { method: "GET" }), // Returns array, we usually take the first one for the user
    updateProfile: (id: number, data: any) =>
      request<any>(`/core/profiles/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    createProfile: (data: any) =>
      request<any>("/core/profiles/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  services: {
    list: () => request<BackendService[]>("/services/", { method: "GET" }),
    create: (data: any) =>
      request<BackendService>("/services/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      request<BackendService>(`/services/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/services/${id}/`, { method: "DELETE" }),
  },
  categories: {
    list: () => request<BackendCategory[]>("/categories/", { method: "GET" }),
    create: (data: any) =>
      request<BackendCategory>("/categories/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      request<BackendCategory>(`/categories/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/categories/${id}/`, { method: "DELETE" }),
  },
  invoice: {
    list: () => request<any>("/invoice/invoices/", { method: "GET" }),
    create: (data: any) =>
      request<any>("/invoice/invoices/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getSenderInfo: () =>
      request<any>("/invoice/senderinfo/", { method: "GET" }),
    preview: (id: number | string) =>
      request<{ id: number; html: string }>(
        `/invoice/invoices/${id}/preview/`,
        { method: "GET" }
      ),
    downloadPdf: (id: number | string) =>
      request<Blob>(`/invoice/invoices/${id}/generate_pdf/`, { method: "GET" }),

    startPipeline: (id: number | string) =>
      request<any>(`/invoice/invoices/${id}/start_pipeline/`, {
        method: "POST",
      }),

    recordPayment: (data: {
      invoice: number | string;
      amount: number;
      payment_mode?: number | null;
      reference?: string;
    }) =>
      request<any>("/invoice/payments/", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    // Dropdowns
    getDropdownClients: () =>
      request<any[]>("/invoice/dropdowns/clients/", { method: "GET" }),
    getDropdownPaymentModes: () =>
      request<any[]>("/invoice/dropdowns/payment-modes/", { method: "GET" }),
    createPaymentMode: (data: any) =>
      request<any>("/invoice/payment-modes/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    deletePaymentMode: (id: number) =>
      request<void>(`/invoice/payment-modes/${id}/`, {
        method: "DELETE",
      }),

    getDropdownPaymentTerms: () =>
      request<any[]>("/invoice/dropdowns/payment-terms/", { method: "GET" }),
    createPaymentTerm: (data: any) =>
      request<any>("/invoice/payment-terms/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    deletePaymentTerm: (id: number) =>
      request<void>(`/invoice/payment-terms/${id}/`, {
        method: "DELETE",
      }),
  },
  kanban: {
    // Backend endpoint exposes content items at /kanban/content-items/
    list: () => request<any[]>("/kanban/content-items/", { method: "GET" }),
    move: (id: number, target_column: string) =>
      request<any>(`/kanban/content-items/${id}/move/`, {
        method: "POST",
        body: JSON.stringify({ target_column }),
      }),
    approve: (id: number, action: "approve" | "revise") =>
      request<any>(`/kanban/content-items/${id}/approve/`, {
        method: "POST",
        body: JSON.stringify({ action }),
      }),
  },
  meta: {
    getInstagram: (clientId: string | number) =>
      request<any>(`/meta/instagram/${clientId}/`, { method: "GET" }),
    listTokens: () =>
      request<{ tokens: MetaToken[]; total_count: number }>("/meta/tokens/", {
        method: "GET",
      }),
    sendTokenOtp: () =>
      request<{ detail: string }>("/meta/tokens/send_otp/", { method: "POST" }),
    createToken: (data: {
      account_label: string;
      access_token: string;
      otp: string;
    }) =>
      request<MetaToken>("/meta/tokens/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    listPages: () =>
      request<{ pages: MetaPage[] }>("/meta/pages/", { method: "GET" }),
  },
};

// Mappers to translate Backend Enum to Frontend Types
export const mapBackendColumnToStatus = (col: string): PipelineStatus => {
  const map: Record<string, PipelineStatus> = {
    backlog: "backlog",
    content_writing: "writing",
    design_creative: "design",
    internal_review: "review",
    client_approval: "approval",
    scheduled: "scheduled",
    posted: "posted",
  };
  return map[col] || "backlog";
};

export const mapStatusToBackendColumn = (status: PipelineStatus): string => {
  const map: Record<string, string> = {
    backlog: "backlog",
    writing: "content_writing",
    design: "design_creative",
    review: "internal_review",
    approval: "client_approval",
    scheduled: "scheduled",
    posted: "posted",
  };
  return map[status] || "backlog";
};

// Map backend client object to frontend `UserProfile` shape
export const mapClientToUserProfile = (client: any): UserProfile => {
  const user = client?.user_detail || {};
  const businessEmail = client.business_email || user.email || "";
  const businessPhone = client.business_phone || user.phone || "";
  const businessPhoneCountry =
    client.business_phone_country_code || user.country_code || "";

  const joinCountryPhone = (country: string, phone: string) => {
    if (!phone) return "";
    if (!country) return phone;
    // if phone already has a leading +, assume it's complete
    if (phone.startsWith("+")) return phone;
    const normCountry = country.replace(/^\+/, "");
    if (phone.startsWith(normCountry)) return `+${phone}`;
    // ensure country includes +
    const pref = country.startsWith("+") ? country : `+${country}`;
    return `${pref}${phone}`;
  };

  const contactPhone = joinCountryPhone(
    user.country_code || businessPhoneCountry || "",
    user.phone || businessPhone || ""
  );

  const profile: UserProfile = {
    id: client.id,
    business: {
      name: client.company_name || "",
      address: client.billing_address || "",
      gstin: client.gstin || "",
      hsn: "",
      email: businessEmail,
      phone: joinCountryPhone(
        businessPhoneCountry,
        client.business_phone || ""
      ),
      whatsappConsent: !!client.whatsapp_updates,
    },
    contactPerson: {
      salutation: user.salutation || "",
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      email: user.email || businessEmail,
      phone: contactPhone,
      whatsappConsent: !!client.whatsapp_updates,
    },
  };

  return profile;
};
