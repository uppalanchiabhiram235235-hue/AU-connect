
import { UserRole, User, LibraryStatus, FoodItem } from './types';

export const MOCK_USERS: (User & { password?: string })[] = [
  { id: '23eg105p01', name: 'Alex Student', email: 'alex@au.edu', role: UserRole.STUDENT, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', password: 'password123' },
  { id: 'FA001', name: 'Mr. Nagaraj', email: 'nagaraj@au.edu', role: UserRole.FACULTY, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nagaraj', department: 'Web Technology', password: 'password123' },
  { id: 'FA002', name: 'Mr. Vera Venkata Shiva Prasad', email: 'shiva@au.edu', role: UserRole.FACULTY, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shiva', department: 'DBMS', password: 'password123' },
  { id: 'FA003', name: 'Mrs. Ashwini', email: 'ashwini@au.edu', role: UserRole.FACULTY, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ashwini', department: 'Fundamentals of Computer Algorithm', password: 'password123' },
  { id: 'sf001', name: 'John Staff', email: 'john@au.edu', role: UserRole.STAFF, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
  { id: 'ad001', name: 'Admin User', email: 'admin@au.edu', role: UserRole.ADMIN, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', password: 'password123' },
];

export const INITIAL_LIBRARIES: LibraryStatus[] = [
  { id: 'lib1', name: 'D Block Library', totalSeats: 100, occupiedSeats: 45, lastUpdated: new Date().toISOString() },
  { id: 'lib2', name: 'G Block Library', totalSeats: 100, occupiedSeats: 82, lastUpdated: new Date().toISOString() },
];

export const FOOD_MENU: FoodItem[] = [
  { id: 'food1', name: 'Classic Burger', price: 80, category: 'Meal', image: 'https://picsum.photos/seed/burger/200' },
  { id: 'food2', name: 'Hot Dog', price: 60, category: 'Meal', image: 'https://picsum.photos/seed/hotdog/200' },
  { id: 'food3', name: 'French Fries', price: 60, category: 'Snack', image: 'https://picsum.photos/seed/fries/200' },
  { id: 'food4', name: 'Maggi', price: 50, category: 'Meal', image: 'https://picsum.photos/seed/maggi/200' },
  { id: 'food5', name: 'Veg Frankie', price: 80, category: 'Meal', image: 'https://picsum.photos/seed/vegfrankie/200' },
  { id: 'food6', name: 'Chicken Frankie', price: 100, category: 'Meal', image: 'https://picsum.photos/seed/chickenfrankie/200' },
  { id: 'food7', name: 'Egg Puff', price: 25, category: 'Snack', image: 'https://picsum.photos/seed/eggpuff/200' },
  { id: 'food8', name: 'Chicken Puff', price: 35, category: 'Snack', image: 'https://picsum.photos/seed/chickenpuff/200' },
  { id: 'drink1', name: 'Coca Cola', price: 40, category: 'Drink', image: 'https://picsum.photos/seed/coke/200' },
  { id: 'drink2', name: 'Pepsi', price: 40, category: 'Drink', image: 'https://picsum.photos/seed/pepsi/200' },
  { id: 'drink3', name: 'Water', price: 20, category: 'Drink', image: 'https://picsum.photos/seed/water/200' },
  { id: 'drink4', name: 'Fruit Juices', price: 50, category: 'Drink', image: 'https://picsum.photos/seed/juice/200' },
];

export const PICKUP_INTERVALS = [
  '12:00 PM - 12:30 PM',
  '12:30 PM - 01:00 PM',
  '01:00 PM - 01:30 PM',
  '01:30 PM - 02:00 PM',
  '05:00 PM - 05:30 PM',
  '05:30 PM - 06:00 PM',
];
