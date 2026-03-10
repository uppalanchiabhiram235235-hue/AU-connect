
import React, { useState, useEffect } from 'react';
import { User, UserRole, LibraryStatus, IssueReport, FoodOrder as OrderType, Message, Notification, Announcement } from './types';
import { api } from './services/api';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import IssueReports from './views/IssueReports';
import Library from './views/Library';
import FoodOrder from './views/FoodOrder';
import Communication from './views/Communication';
import AdminUsers from './views/AdminUsers';
import CanteenManagement from './views/CanteenManagement';
import { ShieldCheck, User as UserIcon, Lock, Wifi, ChevronRight, AlertCircle, Mail, UserPlus } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form States
  const [formRole, setFormRole] = useState<UserRole>(UserRole.STUDENT);
  const [formName, setFormName] = useState('');
  const [formId, setFormId] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formError, setFormError] = useState('');

  // App State
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [libraries, setLibraries] = useState<LibraryStatus[]>([]);
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]); 

  // Initialize and Sync Local Data
  useEffect(() => {
    const performInit = async () => {
      setIsSyncing(true);
      await api.seedInitialData();
      setIsSyncing(false);
    };
    performInit();

    const unsubUsers = api.subscribeToUsers(setAllUsers);
    return () => unsubUsers();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const unsubLibs = api.subscribeToLibraries(setLibraries);
    const unsubAnns = api.subscribeToAnnouncements(setAnnouncements);
    const unsubIssues = api.subscribeToIssues(currentUser, setIssues);
    const unsubOrders = api.subscribeToOrders(currentUser.id, currentUser.role, setOrders);

    return () => {
      unsubLibs();
      unsubAnns();
      unsubIssues();
      unsubOrders();
    };
  }, [currentUser]);

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const detectRoleFromId = (id: string): UserRole | null => {
    const idTrim = id.trim();
    const idLower = idTrim.toLowerCase();
    const studentPrefixes = ['22', '23', '24', '25', '26'];
    
    if (studentPrefixes.some(prefix => idTrim.startsWith(prefix))) return UserRole.STUDENT;
    if (idLower.startsWith('fa')) return UserRole.FACULTY;
    if (idLower.startsWith('sf')) return UserRole.STAFF;
    if (idLower.startsWith('ad')) return UserRole.ADMIN;
    return null;
  };

  // Auth Handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const detectedRole = detectRoleFromId(formId);

    if (detectedRole !== formRole) {
      setFormError(`The ID provided is for ${detectedRole || 'an unknown role'}, but you selected ${formRole.toLowerCase()}.`);
      return;
    }

    const user = (allUsers as (User & {password?: string})[]).find(u => 
      u.role === formRole && 
      u.id.toLowerCase() === formId.trim().toLowerCase() &&
      u.name.toLowerCase() === formName.toLowerCase().trim() &&
      (formRole === UserRole.STAFF || u.password === formPassword)
    );

    if (user) {
      setCurrentUser(user);
      resetForms();
    } else {
      setFormError('Invalid credentials. Check your name, ID, and password.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const detectedRole = detectRoleFromId(formId);
    if (!detectedRole) {
      setFormError('Invalid ID prefix. Use 22-26 for Students, FA for Faculty, sf for Staff, or ad for Admin.');
      return;
    }
    
    if (detectedRole !== formRole) {
       setFormError(`ID prefix mismatch. You selected ${formRole}, but the ID provided has a ${detectedRole} prefix.`);
       return;
    }

    const exists = allUsers.some(u => u.id.toLowerCase() === formId.trim().toLowerCase());
    if (exists) {
      setFormError('An account with this ID already exists. Please login.');
      return;
    }

    const newUser: User & { password?: string } = {
      id: formId.trim(),
      name: formName.trim(),
      email: formEmail.trim(),
      role: formRole,
      avatar: '', 
      password: formPassword
    };

    await api.addUser(newUser);
    addNotification("Success!", "Account created. You can now login.", "success");
    setIsRegistering(false);
    resetForms();
  };

  const resetForms = () => {
    setFormName('');
    setFormId('');
    setFormEmail('');
    setFormPassword('');
    setFormError('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    setNotifications([]);
  };

  // Global Handlers
  const handleUpdateLibrary = (id: string, seats: number) => api.updateLibrary(id, seats);
  const handleAddIssue = async (data: Partial<IssueReport>) => {
    await api.createIssue(data);
    addNotification("Report Logged", "Campus facilities will review it shortly.", "success");
  };
  const handleUpdateStatus = (id: string, status: string) => api.updateIssueStatus(id, status);
  
  const handlePlaceOrder = async (data: Partial<OrderType>) => {
    await api.placeOrder(data);
    addNotification("Order Sent", "Canteen staff will confirm your order soon.", "success");
  };

  const handleUpdateOrderStatus = async (id: string, status: OrderType['status']) => {
    await api.updateOrderStatus(id, status);
    const order = orders.find(o => o.id === id);
    if (order && status === 'Confirmed') {
      addNotification("Order Confirmed", `Order #${id.split('-')[1]} has been confirmed.`, "success");
    } else if (order && status === 'Ready') {
      addNotification("Order Ready", `Order #${id.split('-')[1]} is ready for pickup!`, "success");
    }
  };

  const handleCreateAnnouncement = async (data: Partial<Announcement>) => {
    await api.createAnnouncement(data);
    addNotification("Posted", "The announcement is live for all users.", "success");
  };
  const handleAddUser = async (user: User & { password?: string }) => {
    await api.addUser(user);
    addNotification("User Added", `${user.name} created successfully.`, "success");
  };
  const handleDeleteUser = async (id: string) => {
    await api.deleteUser(id);
    addNotification("Removed", "User account deactivated.", "warning");
  };

  const handleSendMessage = (toId: string, content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      fromId: currentUser!.id,
      toId,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, newMessage]);
    
    const recipient = allUsers.find(u => u.id === toId);
    if (currentUser?.role === UserRole.STUDENT && recipient?.role === UserRole.FACULTY) {
      setTimeout(() => {
        const reply: Message = {
          id: `msg-reply-${Date.now()}`,
          fromId: recipient.id,
          toId: currentUser.id,
          content: `Thank you for reaching out. I will respond properly during my office hours.`,
          timestamp: new Date().toISOString(),
          read: false
        };
        setMessages(prev => [...prev, reply]);
        addNotification(`Reply from ${recipient.name}`, "Check your messages.", "info");
      }, 3000);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="hidden lg:flex flex-col justify-between p-12 bg-indigo-600 text-white">
            <div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-2xl mb-8">A</div>
              <h1 className="text-4xl font-black leading-tight">Welcome to<br/>AU Connect.</h1>
              <p className="mt-6 text-indigo-100/80 leading-relaxed text-lg">The official smart gateway for AU campus services. Report, Track, Order, and Connect.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm font-medium text-indigo-100 bg-white/10 p-4 rounded-2xl">
                <ShieldCheck size={20} />
                <span>Automatic identity detection enabled.</span>
              </div>
            </div>
          </div>
          <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-2xl font-black text-slate-800">{isRegistering ? 'Campus Registration' : 'Campus Portal'}</h2>
              <p className="text-slate-500 mt-2">{isRegistering ? 'Join AU Digitally' : 'Sign in to access services'}</p>
            </div>
            <div className="flex p-1 bg-slate-100 rounded-2xl mb-8 overflow-x-auto">
              {[UserRole.STUDENT, UserRole.FACULTY, UserRole.STAFF, UserRole.ADMIN].map((role) => (
                <button
                  key={role}
                  onClick={() => { setFormRole(role); setFormError(''); }}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all min-w-[70px] ${
                    formRole === role ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-start space-x-3 text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}
            <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Member Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Full Name" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Identity ID</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" value={formId} onChange={(e) => setFormId(e.target.value)} placeholder={formRole === UserRole.STUDENT ? 'e.g. 24eg105p33' : 'e.g. FA001, sf001, ad001'} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm" required />
                </div>
              </div>
              {isRegistering && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="name@au.edu" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm" required />
                  </div>
                </div>
              )}
              {formRole !== UserRole.STAFF && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm" required />
                  </div>
                </div>
              )}
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-[1.25rem] font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center group">
                <span>{isRegistering ? 'Register Account' : 'Sign In'}</span>
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => { setIsRegistering(!isRegistering); resetForms(); }} className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
                {isRegistering ? "Already registered? Login here" : "Don't have an account? Register now"}
              </button>
            </div>
            {!isRegistering && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                   <div className="text-[9px] bg-slate-50 p-2 rounded-lg"><span className="font-bold">Student:</span> Alex Student / 23eg105p01</div>
                   <div className="text-[9px] bg-slate-50 p-2 rounded-lg"><span className="font-bold">Faculty:</span> Mr. Nagaraj / FA001</div>
                   <div className="text-[9px] bg-slate-50 p-2 rounded-lg"><span className="font-bold">Staff:</span> John Staff / sf001 (No Pwd)</div>
                   <div className="text-[9px] bg-slate-50 p-2 rounded-lg"><span className="font-bold">Admin:</span> Admin User / ad001</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={currentUser} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} notifications={notifications} onMarkRead={(id) => setNotifications(n => n.map(notif => notif.id === id ? {...notif, read: true} : notif))} onClearAll={() => setNotifications([])}>
      {isSyncing && (
        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center space-x-2 text-indigo-700 text-xs font-bold">
          <Wifi size={14} className="animate-pulse" />
          <span>Syncing Real-time Campus Data...</span>
        </div>
      )}
      {activeTab === 'dashboard' && <Dashboard user={currentUser} libraries={libraries} issues={issues} announcements={announcements} onCreateAnnouncement={handleCreateAnnouncement} />}
      {activeTab === 'users' && currentUser.role === UserRole.ADMIN && <AdminUsers users={allUsers} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} />}
      {activeTab === 'reports' && <IssueReports user={currentUser} issues={issues} staffUsers={allUsers.filter(u => u.role === UserRole.STAFF)} onAddIssue={handleAddIssue} onUpdateStatus={handleUpdateStatus as any} />}
      {activeTab === 'library' && <Library user={currentUser} libraries={libraries} onUpdateLibrary={handleUpdateLibrary} />}
      {activeTab === 'mess' && <FoodOrder user={currentUser} onPlaceOrder={handlePlaceOrder} orders={orders} />}
      {activeTab === 'canteen' && (currentUser.role === UserRole.STAFF || currentUser.role === UserRole.ADMIN) && <CanteenManagement user={currentUser} orders={orders} onUpdateStatus={handleUpdateOrderStatus} />}
      {activeTab === 'communication' && <Communication user={currentUser} allUsers={allUsers} messages={messages} onSendMessage={handleSendMessage} />}
    </Layout>
  );
};

export default App;
