
export enum UserRole {
  STUDENT = 'STUDENT',
  FACULTY = 'FACULTY',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department?: string;
}

export interface IssueReport {
  id: string;
  title: string;
  description: string;
  category: 'College' | 'Hostel';
  status: 'Pending' | 'In Progress' | 'Resolved';
  reportedBy: string;
  assignedTo?: string;
  createdAt: string;
  priority?: string;
  department?: string;
}

export interface LibraryStatus {
  id: string;
  name: string;
  totalSeats: number;
  occupiedSeats: number;
  lastUpdated: string;
}

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  category: 'Snack' | 'Meal' | 'Drink';
  image: string;
}

export interface FoodOrder {
  id: string;
  userId: string;
  userName: string; // Added to help staff identify orders
  items: { itemId: string; quantity: number }[];
  totalPrice: number;
  pickupTime: string;
  status: 'Ordered' | 'Confirmed' | 'Ready' | 'Picked Up';
  createdAt: string;
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
  read: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'Academic' | 'Event' | 'Info';
  timestamp: string;
  authorId: string;
}
