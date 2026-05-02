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
  category: string;
  score: number;
}

export interface FacilityGroupDto {
  name: string;
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
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

export const authAPI = {
  async login(email: string, password: string): Promise<AuthResponseDto> {
    const data = await apiCall<AuthResponseDto>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setToken(data.accessToken);
    if (!data.user.role) {
      data.user.role = getRoleFromToken(data.accessToken);
    }

    return data;
  },

  async register(data: RegisterRequest): Promise<AuthResponseDto> {
    const res = await apiCall<AuthResponseDto>('/auth/register', {
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
  async getAll() { return apiCall<HotelDto[]>('/hotels'); },
  async getById(id: string) { return apiCall<HotelDto>(`/hotels/${id}`); },
  async search(city: string) { return apiCall<HotelDto[]>(`/hotels?city=${city}`); },
};

export const bookingAPI = {
  async create(data: CreateBookingRequest) { return apiCall<BookingDto>('/bookings', { method: 'POST', body: JSON.stringify(data) }); },
  async getMyBookings() { return apiCall<BookingDto[]>('/bookings/me'); },
  async cancel(id: string) { return apiCall<void>(`/bookings/${id}/cancel`, { method: 'PATCH' }); },
};

export const userAPI = {
  async getProfile() { return apiCall<UserProfileDto>('/users/me'); },
  async getFavorites() { return apiCall<HotelDto[]>('/users/me/favorites'); },
  async addFavorite(hotelId: string) { return apiCall<void>(`/users/me/favorites/${hotelId}`, { method: 'POST' }); },
};

export const adminHotelAPI = {
  async getAll() { return apiCall<HotelDto[]>('/admin/hotels'); },
  async delete(id: string) { return apiCall<void>(`/admin/hotels/${id}`, { method: 'DELETE' }); },
};

export const adminUserAPI = {
  async getAll() { return apiCall<AdminUserDto[]>('/admin/users'); },
};

export function getToken() { return _token; }
export function setToken(token: string) { _token = token; }
export function clearToken() { _token = null; }
