export interface HotelDto {
  id: string;
  name: string;
  city: string;
  country: string;
  address?: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  distanceToCenterKm: number;
  tags: string[];
  amenities: string[];
  description: string;
  images: string[];
  scoreItems: ScoreItemDto[];
  facilities: FacilityGroupDto[];
  rooms: RoomDto[];
}

export interface RoomDto {
  id: string;
  image?: string;
  name: string;
  beds: string;
  price: number;
  freeCancellation: boolean;
}

export interface ScoreItemDto {
  label: string;
  value: number;
}

export interface FacilityGroupDto {
  title: string;
  icon: string;
  items: string[];
}

export interface BookingDto {
  id: string;
  userId: string;
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  totalPrice: number;
  currency: string;
  createdAtUtc: string;
}

export interface UserProfileDto {
  id: string;
  fullName: string;
  email: string;
  verified: boolean;
  phone: string;
  country: string;
  preferredCurrency: string;
  birthday: string;
  favorites: string[];
  role?: string;
}

export interface ReviewDto {
  id: string;
  author: string;
  hotelId: string;
  rating: number;
  daysAgo: number;
  text: string;
}

export interface AdminBookingDto {
  id: string;
  userId: string;
  userEmail?: string;
  userFullName?: string;
  hotelId: string;
  hotelName?: string;
  roomId: string;
  roomName?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  totalPrice: number;
  currency: string;
  createdAtUtc: string;
}

export interface AdminUserDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isBlocked: boolean;
  verified: boolean;
  phone: string;
  country: string;
  preferredCurrency: string;
  birthday: string;
  favoritesCount: number;
  createdAtUtc: string;
}

export interface AdminReviewDto {
  id: string;
  hotelId: string;
  hotelName?: string;
  author: string;
  rating: number;
  text: string;
  createdAtUtc: string;
  daysAgo: number;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  country?: string;
  preferredCurrency?: string;
  birthday?: string;
}

export interface CreateBookingRequest {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  currency?: string;
}

export interface ChangeUserRoleRequest {
  role: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface HotelSearchParams {
  query?: string;
  name?: string;
  city?: string;
  country?: string;
  address?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minReviewCount?: number;
  maxDistanceToCenterKm?: number;
  tags?: string;
  amenities?: string;
  facilities?: string;
  scoreLabel?: string;
  minScoreValue?: number;
  roomName?: string;
  roomBeds?: string;
  minRoomPrice?: number;
  maxRoomPrice?: number;
  freeCancellation?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
}

const API_BASE = 'https://booking-api-prod-kr-hwd5g9heexbwf8fw.canadacentral-01.azurewebsites.net/api';

let _token: string | null = null;

function getRoleFromToken(token: string): string | undefined {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const payload = JSON.parse(jsonPayload);
    return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.role;
  } catch (e) {
    return undefined;
  }
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserProfileDto;
}

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (_token) {
    headers['Authorization'] = `Bearer ${_token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `API Error: ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      errorMessage = parsed.message || parsed.details || errorMessage;
    } catch (e) {
      errorMessage = errorBody.substring(0, 100) || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return {} as T;

  // Проверяем, есть ли контент в ответе перед парсингом JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

export const authAPI = {
  async login(email: string, password: string): Promise<AuthResponseDto> {
    const data = await apiCall<AuthResponseDto>('/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.accessToken);
    if (!data.user.role) {
      data.user.role = getRoleFromToken(data.accessToken);
    }
    return data;
  },

  async loginWithGoogle(idToken: string): Promise<AuthResponseDto> {
    return apiCall<AuthResponseDto>('/Auth/google', {
      method: 'POST',
      body: JSON.stringify({ IdToken: idToken }),
    });
  },

  async register(data: RegisterRequest): Promise<AuthResponseDto> {
    const res = await apiCall<AuthResponseDto>('/Auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.accessToken);
    return res;
  },

  setToken(token: string) { _token = token; },
  getToken() { return _token; },
  clearToken() { _token = null; },
};

export const hotelAPI = {
  async getAll(page = 1, pageSize = 20) { return apiCall<PagedResult<HotelDto>>(`/Hotels?page=${page}&pageSize=${pageSize}`); },
  async getById(id: string) { return apiCall<HotelDto>(`/Hotels/${id}`); },
  async search(params: HotelSearchParams) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== false) {
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        queryParams.append(capitalizedKey, value.toString());
      }
    });
    return apiCall<PagedResult<HotelDto>>(`/Hotels/search?${queryParams.toString()}`);
  },
};

export const bookingAPI = {
  async create(data: CreateBookingRequest) {
    return apiCall<BookingDto>('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        hotelId: data.hotelId.toString(),
        roomId: data.roomId.toString(),
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guests: data.guests,
        currency: data.currency || 'USD'
      })
    });
  },
  async getMyBookings() { return apiCall<BookingDto[]>('/bookings/me'); },
  async getUpcoming() { return apiCall<BookingDto[]>('/bookings/me/upcoming'); },
  async getHistory() { return apiCall<BookingDto[]>('/bookings/me/history'); },
  async cancel(id: string) { return apiCall<void>(`/bookings/${id}`, { method: 'DELETE' }); },
};

export const userAPI = {
  async getProfile() { return apiCall<UserProfileDto>('/users/me'); },
  async getFavorites() { return apiCall<HotelDto[]>('/users/me/favorites'); },
  async addFavorite(hotelId: string) { return apiCall<void>(`/users/me/favorites/${hotelId}`, { method: 'POST' }); },
  async removeFavorite(hotelId: string) { return apiCall<void>(`/users/me/favorites/${hotelId}`, { method: 'DELETE' }); },
};

export interface CreateReviewRequest {
  rating: number;
  text: string;
}

export const reviewAPI = {
  async getByHotel(hotelId: string) { return apiCall<ReviewDto[]>(`/hotels/${hotelId}/reviews`); },
  async create(hotelId: string, data: CreateReviewRequest) {
    return apiCall<ReviewDto>(`/hotels/${hotelId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const ownerAPI = {
  async getBookings(page = 1, pageSize = 20) {
    return apiCall<PagedResult<BookingDto>>(`/owner/bookings?page=${page}&pageSize=${pageSize}`);
  },
  async getPending(page = 1, pageSize = 20) {
    return apiCall<PagedResult<BookingDto>>(`/owner/bookings/pending?page=${page}&pageSize=${pageSize}`);
  },
  async accept(id: string) { return apiCall<void>(`/owner/bookings/${id}/accept`, { method: 'PATCH' }); },
  async reject(id: string, reason: string) {
    return apiCall<void>(`/owner/bookings/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ Reason: reason })
    });
  },
};

export const adminHotelAPI = {
  async getAll(page = 1, pageSize = 20) { return apiCall<PagedResult<HotelDto>>(`/admin/hotels?page=${page}&pageSize=${pageSize}`); },
  async getById(id: string) { return apiCall<HotelDto>(`/admin/hotels/${id}`); },
  async create(data: any) { return apiCall<HotelDto>('/admin/hotels', { method: 'POST', body: JSON.stringify(data) }); },
  async update(id: string, data: any) { return apiCall<HotelDto>(`/admin/hotels/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
  async delete(id: string) { return apiCall<void>(`/admin/hotels/${id}`, { method: 'DELETE' }); },
  async addRoom(hotelId: string, data: any) { return apiCall<HotelDto>(`/admin/hotels/${hotelId}/rooms`, { method: 'POST', body: JSON.stringify(data) }); },
  async updateRoom(hotelId: string, roomId: string, data: any) { return apiCall<HotelDto>(`/admin/hotels/${hotelId}/rooms/${roomId}`, { method: 'PUT', body: JSON.stringify(data) }); },
  async deleteRoom(hotelId: string, roomId: string) { return apiCall<void>(`/admin/hotels/${hotelId}/rooms/${roomId}`, { method: 'DELETE' }); },
};

export const adminUserAPI = {
  async getAll(page = 1, pageSize = 20) { return apiCall<PagedResult<AdminUserDto>>(`/admin/users?page=${page}&pageSize=${pageSize}`); },
  async block(id: string) { return apiCall<void>(`/admin/users/${id}/block`, { method: 'PATCH' }); },
  async unblock(id: string) { return apiCall<void>(`/admin/users/${id}/unblock`, { method: 'PATCH' }); },
  async changeRole(id: string, data: ChangeUserRoleRequest) { return apiCall<void>(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify(data) }); },
};

export const adminBookingAPI = {
  async getAll(status?: string, page = 1, pageSize = 20) {
    let url = `/admin/bookings?page=${page}&pageSize=${pageSize}`;
    if (status) url += `&status=${status}`;
    return apiCall<PagedResult<AdminBookingDto>>(url);
  },
  async getById(id: string) { return apiCall<AdminBookingDto>(`/admin/bookings/${id}`); },
  async cancel(id: string) { return apiCall<void>(`/admin/bookings/${id}/cancel`, { method: 'PATCH' }); },
};

export const adminReviewAPI = {
  async getAll(hotelId?: string, page = 1, pageSize = 20) {
    let url = `/admin/reviews?page=${page}&pageSize=${pageSize}`;
    if (hotelId) url += `&hotelId=${hotelId}`;
    return apiCall<PagedResult<AdminReviewDto>>(url);
  },
  async delete(id: string) { return apiCall<void>(`/admin/reviews/${id}`, { method: 'DELETE' }); },
};

export const submissionsAPI = {
  async create(data: any) {
    return apiCall<void>('/hotel-submissions', { method: 'POST', body: JSON.stringify(data) });
  },
  async getMySubmissions() { return apiCall<any[]>('/hotel-submissions/me'); },
  async getMyHotels() { return apiCall<HotelDto[]>('/hotel-submissions/my-hotels'); },
  async requestUpdate(hotelId: string, data: any) {
    // Convert keys to PascalCase for the backend if needed
    const body: any = {};
    Object.entries(data).forEach(([k, v]) => {
      body[k.charAt(0).toUpperCase() + k.slice(1)] = v;
    });
    return apiCall<void>(`/hotel-submissions/my-hotels/${hotelId}/update-request`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  async requestDelete(hotelId: string, reason: string) { return apiCall<void>(`/hotel-submissions/my-hotels/${hotelId}/delete-request`, { method: 'POST', body: JSON.stringify({ reason }) }); },
};

export const adminSubmissionsAPI = {
  async getAll(status?: string, page = 1, pageSize = 20) {
    let url = `/admin/hotel-submissions?page=${page}&pageSize=${pageSize}`;
    if (status) url += `&status=${status}`;
    return apiCall<PagedResult<any>>(url);
  },
  async getById(id: string) { return apiCall<any>(`/admin/hotel-submissions/${id}`); },
  async approve(id: string) { return apiCall<void>(`/admin/hotel-submissions/${id}/approve`, { method: 'PATCH' }); },
  async reject(id: string, adminComment: string) { return apiCall<void>(`/admin/hotel-submissions/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ adminComment }) }); },
};

export interface ChatThreadDto {
  id: string;
  hotelName: string;
  lastMessage?: string;
  lastMessageAtUtc?: string;
  unreadCount: number;
}

export interface ChatMessageDto {
  id: string;
  text: string;
  senderId: string;
  createdAtUtc: string;
}

export const chatAPI = {
  async startChat(bookingId: string) {
    return apiCall<{ id: string }>(`/chats/booking/${bookingId}`, { method: 'POST' });
  },
  async getMyChats(page = 1, pageSize = 20) {
    return apiCall<PagedResult<ChatThreadDto>>(`/chats/me?page=${page}&pageSize=${pageSize}`);
  },
  async getMessages(threadId: string, page = 1, pageSize = 50) {
    return apiCall<PagedResult<ChatMessageDto>>(`/chats/${threadId}/messages?page=${page}&pageSize=${pageSize}`);
  },
  async sendMessage(threadId: string, text: string) {
    return apiCall<ChatMessageDto>(`/chats/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  },
  async markAsRead(threadId: string) {
    return apiCall<void>(`/chats/${threadId}/read`, { method: 'PATCH' });
  }
};

export function getToken() { return _token; }
export function setToken(token: string) { _token = token; }
export function clearToken() { _token = null; }
