
import React, { useState } from 'react';
import { User, LibraryStatus, UserRole } from '../types';
import { Users, Info, RefreshCw, Minus, Plus } from 'lucide-react';

interface LibraryProps {
  user: User;
  libraries: LibraryStatus[];
  onUpdateLibrary: (id: string, seats: number) => void;
}

const Library: React.FC<LibraryProps> = ({ user, libraries, onUpdateLibrary }) => {
  const canUpdate = user.role === UserRole.STAFF || user.role === UserRole.ADMIN;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Library Seat Availability</h1>
        <p className="text-slate-500">Real-time occupancy for AU libraries.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {libraries.map(lib => {
          const occupancyRate = (lib.occupiedSeats / lib.totalSeats) * 100;
          const statusColor = occupancyRate > 90 ? 'text-red-600' : occupancyRate > 70 ? 'text-orange-600' : 'text-green-600';
          const bgColor = occupancyRate > 90 ? 'bg-red-500' : occupancyRate > 70 ? 'bg-orange-500' : 'bg-indigo-600';

          return (
            <div key={lib.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">{lib.name}</h3>
                    <p className="text-slate-400 text-sm">Last updated: {new Date(lib.lastUpdated).toLocaleTimeString()}</p>
                  </div>
                  <div className={`text-4xl font-black ${statusColor}`}>
                    {Math.round(occupancyRate)}%
                  </div>
                </div>

                <div className="space-y-2 mb-8">
                  <div className="flex justify-between text-sm font-medium text-slate-500 mb-1">
                    <span>Occupancy</span>
                    <span>{lib.occupiedSeats} / {lib.totalSeats} seats</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${bgColor}`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-400 font-medium uppercase mb-1">Available</p>
                    <p className="text-xl font-bold text-slate-800">{lib.totalSeats - lib.occupiedSeats}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-400 font-medium uppercase mb-1">Total</p>
                    <p className="text-xl font-bold text-slate-800">{lib.totalSeats}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-400 font-medium uppercase mb-1">Status</p>
                    <p className={`text-sm font-bold mt-1 ${statusColor}`}>
                      {occupancyRate > 90 ? 'Full' : occupancyRate > 70 ? 'Busy' : 'Available'}
                    </p>
                  </div>
                </div>
              </div>

              {canUpdate && (
                <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">Update Count</span>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => onUpdateLibrary(lib.id, Math.max(0, lib.occupiedSeats - 5))}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="text-lg font-bold w-8 text-center">{lib.occupiedSeats}</span>
                    <button 
                      onClick={() => onUpdateLibrary(lib.id, Math.min(lib.totalSeats, lib.occupiedSeats + 5))}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 p-6 rounded-2xl flex items-start space-x-4 border border-blue-100">
        <Info className="text-blue-500 shrink-0" size={24} />
        <div>
          <h4 className="font-bold text-blue-900">About Live Updates</h4>
          <p className="text-sm text-blue-800/80 leading-relaxed">
            Library seat availability is manually updated by librarians every 15-30 minutes. 
            For the most accurate experience, please swipe your ID card at the entry and exit terminals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Library;
