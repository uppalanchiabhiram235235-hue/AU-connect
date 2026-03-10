
import React, { useState } from 'react';
import { User, LibraryStatus, IssueReport, Announcement, UserRole } from '../types';
import { Users, AlertCircle, Library, Clock, Megaphone, Plus, X, Send } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: User;
  libraries: LibraryStatus[];
  issues: IssueReport[];
  announcements: Announcement[];
  onCreateAnnouncement: (ann: Partial<Announcement>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, libraries, issues, announcements, onCreateAnnouncement }) => {
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annForm, setAnnForm] = useState({ title: '', content: '', type: 'Info' as Announcement['type'] });

  const activeIssues = issues.filter(i => i.status !== 'Resolved').length;
  const libraryData = libraries.map(lib => ({
    name: lib.name.split(' ')[0],
    occupancy: (lib.occupiedSeats / lib.totalSeats) * 100,
    seats: lib.occupiedSeats,
    total: lib.totalSeats
  }));

  const handleAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content) return;
    onCreateAnnouncement({
      ...annForm,
      authorId: user.id
    });
    setAnnForm({ title: '', content: '', type: 'Info' });
    setShowAnnModal(false);
  };

  const canPostAnnouncement = user.role === UserRole.FACULTY || user.role === UserRole.ADMIN;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user.name}</h1>
        <p className="text-slate-500">Live campus status updated via AU Connect.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Active Students</p>
          <p className="text-2xl font-bold text-slate-800">1,248</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Pending Issues</p>
          <p className="text-2xl font-bold text-slate-800">{activeIssues}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
            <Library size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Library Load</p>
          <p className="text-2xl font-bold text-slate-800">Medium</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Upcoming Classes</p>
          <p className="text-2xl font-bold text-slate-800">2</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <Library className="mr-2 text-indigo-600" size={20} />
            Library Occupancy Rate (%)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={libraryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="occupancy" radius={[4, 4, 0, 0]} barSize={40}>
                  {libraryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.occupancy > 80 ? '#ef4444' : entry.occupancy > 50 ? '#f59e0b' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <Megaphone className="mr-2 text-orange-500" size={20} />
              Announcements
            </h3>
            {canPostAnnouncement && (
              <button 
                onClick={() => setShowAnnModal(true)}
                className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {announcements.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">No announcements today.</div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="flex space-x-4 p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600">{ann.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ann.content}</p>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-2">
                      <span>{new Date(ann.timestamp).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase font-bold text-slate-500">{ann.type}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700">View all announcements →</button>
        </div>
      </div>

      {/* Post Announcement Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
              <h3 className="text-xl font-bold">Post New Announcement</h3>
              <button onClick={() => setShowAnnModal(false)} className="hover:rotate-90 transition-transform"><X size={20} /></button>
            </div>
            <form onSubmit={handleAnnSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Announcement Title</label>
                <input 
                  type="text" 
                  value={annForm.title}
                  onChange={e => setAnnForm({ ...annForm, title: e.target.value })}
                  placeholder="e.g., Mid-term Exam Schedule"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                <div className="flex gap-2">
                  {(['Academic', 'Event', 'Info'] as Announcement['type'][]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAnnForm({ ...annForm, type })}
                      className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold transition-all ${
                        annForm.type === type ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Content</label>
                <textarea 
                  rows={4}
                  value={annForm.content}
                  onChange={e => setAnnForm({ ...annForm, content: e.target.value })}
                  placeholder="Provide details about the announcement..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center space-x-2"
              >
                <Send size={18} />
                <span>Publish Announcement</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
