
import React from 'react';
import { User, FoodOrder, UserRole } from '../types';
import { FOOD_MENU } from '../constants';
import { Avatar } from '../components/Avatar';
import { Clock, CheckCircle, Package, ShoppingBag, XCircle } from 'lucide-react';

interface CanteenManagementProps {
  user: User;
  orders: FoodOrder[];
  onUpdateStatus: (id: string, status: FoodOrder['status']) => void;
}

const CanteenManagement: React.FC<CanteenManagementProps> = ({ user, orders, onUpdateStatus }) => {
  const pendingOrders = orders.filter(o => o.status === 'Ordered');
  const activeOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Ready');
  const completedOrders = orders.filter(o => o.status === 'Picked Up');

  const getStatusBadge = (status: FoodOrder['status']) => {
    switch (status) {
      case 'Ordered': return <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-[10px] font-black uppercase">Pending</span>;
      case 'Confirmed': return <span className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded text-[10px] font-black uppercase">Confirmed</span>;
      case 'Ready': return <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-[10px] font-black uppercase">Ready</span>;
      case 'Picked Up': return <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase">Picked Up</span>;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Canteen Management</h1>
        <p className="text-slate-500">Manage incoming orders and pickup readiness.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pending Confirmation</p>
          <p className="text-2xl font-black text-blue-600">{pendingOrders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Being Prepared</p>
          <p className="text-2xl font-black text-indigo-600">{activeOrders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Picked Up Today</p>
          <p className="text-2xl font-black text-slate-400">{completedOrders.length}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
          <ShoppingBag className="text-slate-400" size={20} />
          <h2 className="text-xl font-bold text-slate-800">Incoming Orders</h2>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-400">
            <Package size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-medium">No new orders to confirm.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingOrders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-3xl border-2 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar name={order.userName || 'Student'} size="sm" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{order.userName || 'Unknown Student'}</p>
                      <p className="text-[10px] text-slate-400">#{order.id.split('-')[1]}</p>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="space-y-2 py-3 border-t border-b border-slate-50">
                  {order.items.map(item => {
                    const menuItem = FOOD_MENU.find(f => f.id === item.itemId);
                    return (
                      <div key={item.itemId} className="flex justify-between text-xs">
                        <span className="text-slate-700 font-medium">{item.quantity}x {menuItem?.name}</span>
                        <span className="text-slate-400">₹{(menuItem?.price || 0) * item.quantity}</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between pt-2 text-sm font-black text-slate-800">
                    <span>Total</span>
                    <span>₹{order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col space-y-3">
                  <div className="flex items-center text-xs text-slate-500">
                    <Clock size={14} className="mr-1" />
                    Pickup: <span className="font-bold text-indigo-600 ml-1">{order.pickupTime}</span>
                  </div>
                  <button 
                    onClick={() => onUpdateStatus(order.id, 'Confirmed')}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <CheckCircle size={16} />
                    <span>Confirm Order</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Clock className="text-slate-400" size={20} />
          <h2 className="text-xl font-bold text-slate-800">Active Prep & Pickups</h2>
        </div>

        <div className="overflow-hidden bg-white rounded-3xl border border-slate-200">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Pickup Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700 text-sm">{order.userName || 'Student'}</td>
                  <td className="px-6 py-4 text-xs font-mono">{order.pickupTime}</td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {order.status === 'Confirmed' && (
                      <button 
                        onClick={() => onUpdateStatus(order.id, 'Ready')}
                        className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'Ready' && (
                      <button 
                        onClick={() => onUpdateStatus(order.id, 'Picked Up')}
                        className="bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-900"
                      >
                        Picked Up
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {activeOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm italic">No active preparations.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CanteenManagement;
