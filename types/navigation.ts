import { HotelDto, BookingDto, RoomDto, HotelSearchParams } from '../services/api';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Results: { searchQuery?: string; filters?: HotelSearchParams };
  HotelDetail: { hotelId: string };
  Booking: { hotel: HotelDto; room: RoomDto };
  Confirmation: { booking: BookingDto };
  Profile: undefined;
  MyBookings: undefined;
  AdminDashboard: undefined;
  AdminHotels: undefined;
  AdminHotelDetail: { hotelId: string };
  AdminHotelCreate: undefined;
  AdminBookings: undefined;
  AdminUsers: undefined;
  AdminReviews: undefined;
  AdminHotelSubmissions: undefined;
  HotelSubmission: undefined;
  MySubmissions: undefined;
  OwnerBookings: undefined;
  ChatList: undefined;
  ChatDetail: { threadId: string; title: string };
};
