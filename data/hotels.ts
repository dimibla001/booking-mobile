export type Hotel = {
  id: string;
  name: string;
  city: string;
  rating: number;
  price: number;
  reviewCount: number;
  distance: string;
  description: string;
  image: string;
  tags: string[];
};

export const hotels: Hotel[] = [
  {
    id: '1',
    name: 'Hotel Sunrise',
    city: 'Одеса',
    rating: 4.8,
    price: 4500,
    reviewCount: 120,
    distance: '300 м від центру',
    description: 'Затишний готель з видом на море і швидким доступом до пляжу.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    tags: ['Wi-Fi', 'сніданок', 'паркування'],
  },
  {
    id: '2',
    name: 'City Comfort',
    city: 'Київ',
    rating: 4.5,
    price: 6200,
    reviewCount: 340,
    distance: '1.2 км від Майдану',
    description: 'Сучасний міський готель з гарним розташуванням і сніданком включено.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    tags: ['Wi-Fi', 'сніданок', 'спортзал'],
  },
  {
    id: '3',
    name: 'Ocean View Inn',
    city: 'Одеса',
    rating: 4.9,
    price: 7100,
    reviewCount: 220,
    distance: '50 м від пляжу',
    description: 'Комфортні номери з видом на море та прямий доступ до набережної.',
    image: 'https://images.unsplash.com/photo-1501117716987-c8e2d5d2d7f9?auto=format&fit=crop&w=800&q=80',
    tags: ['Wi-Fi', 'сніданок', 'пляж'],
  },
  {
    id: '4',
    name: 'Forest Retreat',
    city: 'Красная Поляна',
    rating: 4.6,
    price: 5200,
    reviewCount: 89,
    distance: '2.5 км от лыжных трасс',
    description: 'Тихий отель среди сосен, идеален для отдыха после горных прогулок.',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    tags: ['Wi-Fi', 'сауна', 'завтрак'],
  },
];
