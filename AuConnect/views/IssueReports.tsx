
import React, { useState } from 'react';
import { User, IssueReport, UserRole } from '../types';
import { Plus, AlertCircle, CheckCircle, Clock, Send, Sparkles, Hammer } from 'lucide-react';
import { analyzeIssueReport } from '../geminiService';

interface IssueReportsProps {
  user: User;
  issues: IssueReport[];
  staffUsers: User[];
  onAddIssue: (issue: Partial<IssueReport>) => void;
  onUpdateStatus: (id: string, status: IssueReport['status']) => void;
}

const IssueReports: React.FC<IssueReportsProps> = ({ user, issues, staffUsers, onAddIssue, onUpdateStatus }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'College' as const });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setIsAnalyzing(true);
    const suggestion = await analyzeIssueReport(formData.title, formData.description);
    
    // Automatically assign to a random staff member for demo purposes
    const randomStaff = staffUsers[Math.floor(Math.random() * staffUsers.length)];

    onAddIssue({
      ...formData,
      status: 'Pending',
      reportedBy: user.id,
      assignedTo: randomStaff?.id,
      priority: suggestion.priority,
      department: suggestion.department,
      createdAt: new Date().toISOString(),
    });

    setFormData({ title: '', description: '', category: 'College' });
    setIsAnalyzing(false);
    setShowForm(false);
  };

  const filteredIssues = user.role === UserRole.STUDENT 
    ? issues.filter(i => i.reportedBy === user.id)
    : user.role === UserRole.STAFF
    ? issues.filter(i => i.assignedTo === user.id || i.status === 'Pending') // Staff can see pending or assigned to them
    : issues;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campus Issues</h1>
          <p className="text-slate-500">Report problems or manage infrastructure maintenance.</p>
        </div>
        {user.role === UserRole.STUDENT && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
          >
            <Plus size={20} />
            <span>Report Issue</span>
          </button>
        )}
      </header>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
              <h3 className="text-xl font-bold">Report a Problem</h3>
              <button onClick={() => setShowForm(false)} className="hover:rotate-90 transition-transform">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Issue Summary</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Damaged whiteboard in Lab 3"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Location Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none"
                  >
                    <option value="College">College</option>
                    <option value="Hostel">Hostel</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Detailed Description</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain the issue clearly..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isAnalyzing}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles size={20} className="animate-spin" />
                    <span>AI Classifying Issue...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Report</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">No active reports found.</p>
          </div>
        ) : (
          filteredIssues.map(issue => (
            <div key={issue.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-200 transition-colors">
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    issue.category === 'Hostel' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {issue.category}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' : 
                    issue.status === 'In Progress' ? 'bg-indigo-100 text-indigo-600 font-black' : 
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {issue.status}
                  </span>
                  {issue.priority && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-100 text-slate-600">
                      {issue.priority} Priority
                    </span>
                  )}
                  <span className="text-xs text-slate-400 ml-auto md:ml-0 flex items-center">
                    <Clock size={12} className="mr-1" />
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-800">{issue.title}</h4>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{issue.description}</p>
                <div className="flex items-center mt-3 space-x-4">
                  <div className="flex items-center text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-md">
                    <Hammer size={12} className="mr-1.5" />
                    {issue.department || 'Maintenance'}
                  </div>
                  {issue.assignedTo && (
                    <p className="text-xs text-slate-400">
                      Assigned: {staffUsers.find(s => s.id === issue.assignedTo)?.name || 'Staff Member'}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 shrink-0">
                {user.role === UserRole.STAFF && issue.status !== 'Resolved' && (
                  <>
                    {issue.status === 'Pending' && (
                      <button 
                        onClick={() => onUpdateStatus(issue.id, 'In Progress')}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                      >
                        Accept Task
                      </button>
                    )}
                    {issue.status === 'In Progress' && (
                      <button 
                        onClick={() => onUpdateStatus(issue.id, 'Resolved')}
                        className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center space-x-2"
                      >
                        <CheckCircle size={18} />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                  </>
                )}
                {issue.status === 'Resolved' && (
                  <div className="flex items-center text-emerald-600 font-bold space-x-1 px-4 py-2 bg-emerald-50 rounded-xl">
                    <CheckCircle size={18} />
                    <span className="text-sm">Completed</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IssueReports;
