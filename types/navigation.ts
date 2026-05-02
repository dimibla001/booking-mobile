import { HotelDto, BookingDto, RoomDto } from '../services/api';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Results: { searchQuery?: string };
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
};
