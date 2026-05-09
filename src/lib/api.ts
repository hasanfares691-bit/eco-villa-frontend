const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://220fdb02-6cca-4add-87ac-a06672b4c066-00-ub7pyb0o0yo0.picard.replit.dev/api';export interface ApiError {
  message: string;
  statusCode: number;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      cache: 'no-store', // 🔴 هاد هو السطر السحري اللي بيمنع تخزين البيانات القديمة!
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
        ...options.headers,
      },
    });
// ... باقي الكود مثل ما هو بدون تغيير
// ... باقي الكود كما هو
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error(`[API Error] Failed to parse JSON from ${url}`);
      const err = new Error('السيرفر لا يستجيب ببيانات صحيحة');
      (err as any).statusCode = response.status;
      throw err;
    }

    if (!response.ok) {
      const err = new Error(data.message || data.error || 'API Request Failed');
      (err as any).statusCode = response.status;
      throw err;
    }

    return data.data !== undefined ? data.data : data;
  } catch (error: any) {
    // تم التعديل هنا لطباعة الخطأ الحقيقي بدلاً من كائن فارغ
    console.error(`[API Client Fetch Error] (${endpoint}):`, error.message || error);
    throw error;
  }
}

export const api = {
  // -- دوال المستأجر --
  getFarms: (params?: { startDate?: string; endDate?: string }) => {
    let url = '/farms';
    if (params?.startDate && params?.endDate) {
      url = `/farms/available?startDate=${params.startDate}&endDate=${params.endDate}`;
    }
    return fetchApi<any[]>(url);
  },

  getFarmDetails: (id: string | number) => {
    return fetchApi<any>(`/farms/${id}`);
  },

  calculatePrice: (farmId: string | number, checkinDate: string, nights: number) => {
    return fetchApi<any>('/bookings/calculate-price', {
      method: 'POST',
      body: JSON.stringify({ farmId: String(farmId), checkinDate, nights }),
    });
  },

  // -- دوال المالك (Owner) --
  getMyFarms: (token: string) => {
    return fetchApi<any[]>('/farms/my-farms', {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  getFarmCalendar: (id: string | number, token?: string) => {
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetchApi<any[]>(`/farms/${id}/calendar`, { headers });
  },

  toggleCalendarDay: (farmId: string | number, date: string, status: string, token: string) => {
    return fetchApi<any>(`/farms/${farmId}/calendar/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ date, status }),
    });
  },

  login: (credentials: { phoneWa: string; password: string }) => {
    return fetchApi<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // -- دوال الإدارة (Admin APIs) --
  getAdminBookings: (token: string) => {
    return fetchApi<any[]>('/admin/bookings', {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  confirmPayment: (bookingId: string, referenceId: string, token: string, adminUserId: string) => {
    return fetchApi<any>(`/bookings/${bookingId}/confirm-payment`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ referenceId, adminUserId }),
    });
  },

  // --- دوال إنشاء المزارع والحجوزات (المضافة حديثاً) ---
  createFarmAdmin: (farmData: any, token: string) => {
    return fetchApi<any>('/farms', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(farmData),
    });
  },

  updateFarmAdmin: (id: string | number, farmData: any, token: string) => {
    return fetchApi<any>(`/farms/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(farmData),
    });
  },

  deleteFarmAdmin: (id: string | number, token: string) => {
    return fetchApi<any>(`/farms/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  reactivateFarmAdmin: (id: string | number, token: string) => {
    return fetchApi<any>(`/farms/${id}/reactivate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  getFarmReviewsAdmin: (farmId: string | number, token: string) => {
    return fetchApi<any[]>(`/reviews/farm/${farmId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  createReviewAdmin: (data: any, token: string) => {
    return fetchApi<any>('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  deleteReviewAdmin: (id: string | number, token: string) => {
    return fetchApi<any>(`/reviews/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  updateReviewAdmin: (id: string | number, data: any, token: string) => {
    return fetchApi<any>(`/reviews/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  // 🚀 الدوال المفقودة التي تسبب الخطأ في واجهة الحجوزات 
  createBookingAdmin: (bookingData: any, token?: string) => {
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    return fetchApi<any>('/admin/bookings', {
      method: 'POST',
      headers,
      body: JSON.stringify(bookingData),
    });
  },

  updateBookingAdmin: (id: string | number, bookingData: any, token?: string) => {
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    return fetchApi<any>(`/admin/bookings/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(bookingData),
    });
  },

  submitPublicReview: (data: any) => {
    return fetchApi<any>('/reviews/public', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
  },
  getFarmReviewsPublic: (farmId: string | number) => {
    return fetchApi<any[]>(`/reviews/public/${farmId}`);
  },


}