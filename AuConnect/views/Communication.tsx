
import React, { useState } from 'react';
import { User, Message, UserRole } from '../types';
import { Avatar } from '../components/Avatar';
import { Send, User as UserIcon, Search, Sparkles } from 'lucide-react';
import { suggestFacultyReply } from '../geminiService';

interface CommunicationProps {
  user: User;
  allUsers: User[];
  messages: Message[];
  onSendMessage: (toId: string, content: string) => void;
}

const Communication: React.FC<CommunicationProps> = ({ user, allUsers, messages, onSendMessage }) => {
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);

  const contacts = user.role === UserRole.STUDENT 
    ? allUsers.filter(u => u.role === UserRole.FACULTY)
    : allUsers.filter(u => u.role === UserRole.STUDENT);

  const filteredMessages = messages.filter(m => 
    (m.fromId === user.id && m.toId === selectedContact?.id) || 
    (m.toId === user.id && m.fromId === selectedContact?.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleSend = () => {
    if (!messageText.trim() || !selectedContact) return;
    onSendMessage(selectedContact.id, messageText);
    setMessageText('');
  };

  const handleAiSuggest = async () => {
    if (filteredMessages.length === 0) return;
    const lastStudentMessage = [...filteredMessages].reverse().find(m => m.fromId !== user.id);
    if (!lastStudentMessage) return;

    setIsAiSuggesting(true);
    const suggestion = await suggestFacultyReply(lastStudentMessage.content);
    setMessageText(suggestion || '');
    setIsAiSuggesting(false);
  };

  return (
    <div className="h-[calc(100vh-160px)] flex bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Sidebar Contacts */}
      <div className="w-80 border-r border-slate-100 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">Messages</h3>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full p-4 flex items-center space-x-3 hover:bg-slate-50 transition-colors border-l-4 ${
                selectedContact?.id === contact.id ? 'bg-indigo-50/50 border-indigo-600' : 'border-transparent'
              }`}
            >
              <Avatar name={contact.name} size="md" />
              <div className="flex-1 text-left overflow-hidden">
                <p className="font-bold text-slate-800 truncate">{contact.name}</p>
                <p className="text-xs text-slate-500 truncate">{contact.department || 'Campus Community'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/30">
        {selectedContact ? (
          <>
            <div className="p-4 md:p-6 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar name={selectedContact.name} size="md" />
                <div>
                  <h4 className="font-bold text-slate-800">{selectedContact.name}</h4>
                  <p className="text-xs text-green-500 font-medium">Online</p>
                </div>
              </div>
              {user.role === UserRole.FACULTY && (
                <button 
                  onClick={handleAiSuggest}
                  disabled={isAiSuggesting}
                  className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 flex items-center space-x-2 transition-all"
                >
                  <Sparkles size={14} className={isAiSuggesting ? 'animate-spin' : ''} />
                  <span>AI Draft Reply</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Send size={24} className="rotate-45" />
                  </div>
                  <p className="text-sm font-medium">Start the conversation</p>
                </div>
              ) : (
                filteredMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.fromId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm ${
                      msg.fromId === user.id 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.fromId === user.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-center space-x-3">
                <input 
                  type="text" 
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..." 
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!messageText.trim()}
                  className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <UserIcon size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Select a contact</h3>
            <p className="max-w-xs mt-2 text-sm">Choose someone from the list to start messaging. Connect with faculty or students easily.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Communication;
