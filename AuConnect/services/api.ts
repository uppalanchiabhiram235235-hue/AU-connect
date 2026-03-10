
import { IssueReport, LibraryStatus, FoodOrder, Announcement, User } from '../types';
import { INITIAL_LIBRARIES, MOCK_USERS } from '../constants';

/**
 * Local Storage Based API
 * Mimics Firestore behavior using window.localStorage and EventListeners
 */

const STORAGE_KEYS = {
  LIBRARIES: 'au_connect_libraries',
  ISSUES: 'au_connect_issues',
  ORDERS: 'au_connect_orders',
  ANNOUNCEMENTS: 'au_connect_announcements',
  USERS: 'au_connect_users'
};

const getStorage = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStorage = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
  // Dispatch a custom event to mimic "real-time" updates in the same window
  window.dispatchEvent(new CustomEvent('au_connect_update', { detail: { key } }));
};

export const api = {
  seedInitialData: async () => {
    if (!localStorage.getItem(STORAGE_KEYS.LIBRARIES)) {
      setStorage(STORAGE_KEYS.LIBRARIES, INITIAL_LIBRARIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      setStorage(STORAGE_KEYS.USERS, MOCK_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
      setStorage(STORAGE_KEYS.ANNOUNCEMENTS, [
        {
          id: 'ann-1',
          title: 'Welcome to AU Connect!',
          content: 'The new smart campus solution is now live. Local storage is enabled.',
          type: 'Info',
          timestamp: new Date().toISOString(),
          authorId: 'system'
        }
      ]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ISSUES)) {
      setStorage(STORAGE_KEYS.ISSUES, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      setStorage(STORAGE_KEYS.ORDERS, []);
    }
  },

  // User Management
  subscribeToUsers: (callback: (users: User[]) => void) => {
    const handler = () => callback(getStorage(STORAGE_KEYS.USERS, MOCK_USERS));
    window.addEventListener('au_connect_update', handler);
    handler();
    return () => window.removeEventListener('au_connect_update', handler);
  },

  addUser: async (user: User & { password?: string }) => {
    const users = getStorage<(User & { password?: string })[]>(STORAGE_KEYS.USERS, MOCK_USERS);
    setStorage(STORAGE_KEYS.USERS, [...users, user]);
  },

  deleteUser: async (id: string) => {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, MOCK_USERS);
    setStorage(STORAGE_KEYS.USERS, users.filter(u => u.id !== id));
  },

  // Library Operations
  subscribeToLibraries: (callback: (libs: LibraryStatus[]) => void) => {
    const handler = () => callback(getStorage(STORAGE_KEYS.LIBRARIES, INITIAL_LIBRARIES));
    window.addEventListener('au_connect_update', handler);
    handler(); // Initial call
    return () => window.removeEventListener('au_connect_update', handler);
  },

  updateLibrary: async (id: string, occupiedSeats: number) => {
    const libs = getStorage<LibraryStatus[]>(STORAGE_KEYS.LIBRARIES, INITIAL_LIBRARIES);
    const updated = libs.map(l => l.id === id ? { ...l, occupiedSeats, lastUpdated: new Date().toISOString() } : l);
    setStorage(STORAGE_KEYS.LIBRARIES, updated);
  },

  // Issue Reporting
  subscribeToIssues: (user: User, callback: (issues: IssueReport[]) => void) => {
    const handler = () => {
      const allIssues = getStorage<IssueReport[]>(STORAGE_KEYS.ISSUES, []);
      const filtered = user.role === 'STUDENT' 
        ? allIssues.filter(i => i.reportedBy === user.id)
        : allIssues;
      callback(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };
    window.addEventListener('au_connect_update', handler);
    handler();
    return () => window.removeEventListener('au_connect_update', handler);
  },

  createIssue: async (data: Partial<IssueReport>) => {
    const issues = getStorage<IssueReport[]>(STORAGE_KEYS.ISSUES, []);
    const newIssue = {
      id: `issue-${Date.now()}`,
      ...data,
      status: data.status || 'Pending',
      createdAt: new Date().toISOString()
    } as IssueReport;
    setStorage(STORAGE_KEYS.ISSUES, [newIssue, ...issues]);
  },

  updateIssueStatus: async (id: string, status: string) => {
    const issues = getStorage<IssueReport[]>(STORAGE_KEYS.ISSUES, []);
    const updated = issues.map(i => i.id === id ? { ...i, status: status as any } : i);
    setStorage(STORAGE_KEYS.ISSUES, updated);
  },

  // Food Orders
  subscribeToOrders: (userId: string, role: string, callback: (orders: FoodOrder[]) => void) => {
    const handler = () => {
      const allOrders = getStorage<FoodOrder[]>(STORAGE_KEYS.ORDERS, []);
      const filtered = (role === 'STAFF' || role === 'ADMIN') 
        ? allOrders 
        : allOrders.filter(o => o.userId === userId);
      callback(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };
    window.addEventListener('au_connect_update', handler);
    handler();
    return () => window.removeEventListener('au_connect_update', handler);
  },

  placeOrder: async (data: Partial<FoodOrder>) => {
    const orders = getStorage<FoodOrder[]>(STORAGE_KEYS.ORDERS, []);
    const newOrder = {
      id: `ord-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      status: 'Ordered',
      createdAt: new Date().toISOString()
    } as FoodOrder;
    setStorage(STORAGE_KEYS.ORDERS, [newOrder, ...orders]);
  },

  updateOrderStatus: async (id: string, status: string) => {
    const orders = getStorage<FoodOrder[]>(STORAGE_KEYS.ORDERS, []);
    const updated = orders.map(o => o.id === id ? { ...o, status: status as any } : o);
    setStorage(STORAGE_KEYS.ORDERS, updated);
  },

  // Announcements
  subscribeToAnnouncements: (callback: (anns: Announcement[]) => void) => {
    const handler = () => {
      const anns = getStorage<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
      callback(anns.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };
    window.addEventListener('au_connect_update', handler);
    handler();
    return () => window.removeEventListener('au_connect_update', handler);
  },

  createAnnouncement: async (data: Partial<Announcement>) => {
    const anns = getStorage<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
    const newAnn = {
      id: `ann-${Date.now()}`,
      ...data,
      timestamp: new Date().toISOString()
    } as Announcement;
    setStorage(STORAGE_KEYS.ANNOUNCEMENTS, [newAnn, ...anns]);
  }
};
