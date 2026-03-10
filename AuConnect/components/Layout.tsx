
import React, { useState } from 'react';
import { User, UserRole, Notification } from '../types';
import { Avatar } from './Avatar';
import { 
  Home, 
  MessageSquare, 
  Library, 
  Utensils, 
  AlertCircle, 
  LogOut,
  Bell,
  X,
  CheckCircle2,
  Info,
  Users as UsersIcon,
  ShoppingBag
} from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  user, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  notifications, 
  onMarkRead,
  onClearAll,
  children 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: Object.values(UserRole) },
    { id: 'users', label: 'Manage Users', icon: UsersIcon, roles: [UserRole.ADMIN] },
    { id: 'reports', label: 'Issue Reports', icon: AlertCircle, roles: Object.values(UserRole) },
    { id: 'library', label: 'Library', icon: Library, roles: Object.values(UserRole) },
    { id: 'mess', label: 'Mess & Food', icon: Utensils, roles: [UserRole.STUDENT, UserRole.ADMIN] },
    { id: 'canteen', label: 'Canteen Management', icon: ShoppingBag, roles: [UserRole.STAFF, UserRole.ADMIN] },
    { id: 'communication', label: 'Messages', icon: MessageSquare, roles: [UserRole.STUDENT, UserRole.FACULTY, UserRole.ADMIN] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="text-xl font-bold text-slate-800">AU Connect</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <Avatar name={user.name} size="md" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Toast Notification */}
        {unreadCount > 0 && notifications[notifications.length - 1] && !notifications[notifications.length - 1].read && (
          <div className="fixed top-6 right-6 z-[60] animate-in slide-in-from-right duration-300">
            <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 flex items-start space-x-4 max-w-sm">
              <div className={`p-2 rounded-xl shrink-0 ${
                notifications[notifications.length - 1].type === 'success' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'
              }`}>
                {notifications[notifications.length - 1].type === 'success' ? <CheckCircle2 size={20} /> : <Info size={20} />}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-sm">{notifications[notifications.length - 1].title}</h4>
                <p className="text-slate-500 text-xs mt-0.5">{notifications[notifications.length - 1].message}</p>
              </div>
              <button onClick={() => onMarkRead(notifications[notifications.length - 1].id)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 md:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
            <span className="font-bold text-slate-800">AU Connect</span>
          </div>
          <div className="hidden md:block"></div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl relative transition-colors"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800">Notifications</h3>
                      <button onClick={onClearAll} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Clear all</button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                          <Bell size={32} className="mx-auto mb-2 opacity-20" />
                          <p className="text-sm">All caught up!</p>
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            className={`p-4 border-b border-slate-50 flex space-x-3 transition-colors ${notif.read ? 'opacity-60' : 'bg-slate-50/50'}`}
                            onClick={() => onMarkRead(notif.id)}
                          >
                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.read ? 'bg-transparent' : 'bg-indigo-600'}`}></div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                              <p className="text-[10px] text-slate-400 mt-2">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <Avatar name={user.name} size="sm" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {children}
        </div>

        <nav className="md:hidden bg-white border-t border-slate-200 flex justify-around p-2">
           {filteredNavItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 ${
                activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
