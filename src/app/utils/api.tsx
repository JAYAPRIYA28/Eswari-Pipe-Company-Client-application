import { authService } from './auth';

// const API_BASE = import.meta.env.VITE_API_URL;

const API_BASE = "https://eswari-pipe-company-server-application.onrender.com";

async function fetchApi(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = await authService.getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || 'API request failed'
    );
  }

  return data;
}

// ─────────────────────────────────────────────
// PRODUCT API
// ─────────────────────────────────────────────

export const productApi = {
  async getAll() {
    return fetchApi('/products');
  },

  async getById(id: string) {
    return fetchApi(`/products/${id}`);
  },

  async create(product: any) {
    return fetchApi('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async update(id: string, updates: any) {
    return fetchApi(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string) {
    return fetchApi(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// ─────────────────────────────────────────────
// ORDER API
// ─────────────────────────────────────────────

export const orderApi = {
  async getAll() {
    return fetchApi('/orders');
  },

  async getById(id: string) {
    return fetchApi(`/orders/${id}`);
  },

  async create(order: any) {
    return fetchApi('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  async updateStatus(
    id: string,
    status: string,
    reason?: string
  ) {
    return fetchApi(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        reason,
      }),
    });
  },

  async requestApproval(id: string) {
    return fetchApi(
      `/orders/${id}/request-approval`,
      {
        method: 'POST',
      }
    );
  },

  async approve(
    id: string,
    requirePayment: boolean
  ) {
    return fetchApi(`/orders/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({
        requirePayment,
      }),
    });
  },

  async processPayment(
    id: string,
    paymentMethod: string
  ) {
    return fetchApi(`/orders/${id}/payment`, {
      method: 'POST',
      body: JSON.stringify({
        paymentMethod,
      }),
    });
  },

  async assignDelivery(
    id: string,
    deliveryPersonEmail: string,
    deliveryPersonName: string
  ) {
    return fetchApi(
      `/orders/${id}/assign-delivery`,
      {
        method: 'POST',
        body: JSON.stringify({
          deliveryPersonEmail,
          deliveryPersonName,
        }),
      }
    );
  },

  async updateDeliveryStatus(
    id: string,
    delivered: boolean,
    reason?: string
  ) {
    return fetchApi(
      `/orders/${id}/delivery-status`,
      {
        method: 'POST',
        body: JSON.stringify({
          delivered,
          reason,
        }),
      }
    );
  },

  async processRefund(id: string) {
    return fetchApi(`/orders/${id}/refund`, {
      method: 'POST',
    });
  },

  async getMonthlyHistory(
    month: number,
    year: number
  ) {
    return fetchApi(
      `/orders/history/${month}/${year}`
    );
  },
};

// ─────────────────────────────────────────────
// QUOTATION API
// ─────────────────────────────────────────────

export const quotationApi = {
  async create(quotation: any) {
    return fetchApi('/quotations', {
      method: 'POST',
      body: JSON.stringify(quotation),
    });
  },

  async getById(id: string) {
    return fetchApi(`/quotations/${id}`);
  },
};