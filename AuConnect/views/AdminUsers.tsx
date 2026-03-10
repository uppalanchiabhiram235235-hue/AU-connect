
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Avatar } from '../components/Avatar';
import { Plus, Trash2, Search, UserPlus, Shield, GraduationCap, Briefcase, Settings, X } from 'lucide-react';

interface AdminUsersProps {
  users: User[];
  onAddUser: (user: User & { password?: string }) => void;
  onDeleteUser: (id: string) => void;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ users, onAddUser, onDeleteUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    id: '',
    email: '',
    role: UserRole.STUDENT,
    department: '',
    password: 'password123'
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({
      ...newUser,
      avatar: '' 
    });
    setShowAddModal(false);
    setNewUser({ name: '', id: '', email: '', role: UserRole.STUDENT, department: '', password: 'password123' });
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return <Shield size={16} className="text-red-500" />;
      case UserRole.FACULTY: return <Briefcase size={16} className="text-indigo-500" />;
      case UserRole.STUDENT: return <GraduationCap size={16} className="text-blue-500" />;
      case UserRole.STAFF: return <Settings size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campus Directory</h1>
          <p className="text-slate-500">Add or remove campus members and manage permissions.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <UserPlus size={20} />
          <span>Register User</span>
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID or role..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Campus ID</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600 uppercase">{u.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 w-fit">
                      {getRoleIcon(u.role)}
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">{u.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{u.department || 'General'}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => confirm(`Permanently delete ${u.name}?`) && onDeleteUser(u.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
              <h3 className="text-xl font-bold">Register New Account</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform"><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label>
                  <input type="text" required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Campus ID</label>
                  <input type="text" required value={newUser.id} onChange={e => setNewUser({ ...newUser, id: e.target.value })} placeholder="e.g. 24eg..., FA..., sf..." className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email Address</label>
                <input type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value={UserRole.STUDENT}>Student</option>
                    <option value={UserRole.FACULTY}>Faculty</option>
                    <option value={UserRole.STAFF}>Staff</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Department</label>
                  <input type="text" value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} placeholder="e.g. Computer Science" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Login Password</label>
                <input type="text" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 mt-2">Create Account</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
