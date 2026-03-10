
import React, { useState } from 'react';
import { User, FoodItem, FoodOrder as OrderType } from '../types';
import { FOOD_MENU, PICKUP_INTERVALS } from '../constants';
import { ShoppingCart, Clock, Check, Plus, Minus, Package, History, Info } from 'lucide-react';

interface FoodOrderProps {
  user: User;
  onPlaceOrder: (order: Partial<OrderType>) => void;
  orders: OrderType[];
}

const FoodOrder: React.FC<FoodOrderProps> = ({ user, onPlaceOrder, orders }) => {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [pickupTime, setPickupTime] = useState(PICKUP_INTERVALS[0]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const myOrders = orders.filter(o => o.userId === user.id).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const updateCart = (itemId: string, delta: number) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const newValue = Math.max(0, current + delta);
      if (newValue === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newValue };
    });
  };

  const totalItems = (Object.values(cart) as number[]).reduce((a: number, b: number) => a + b, 0);
  const totalPrice = (Object.entries(cart) as [string, number][]).reduce((sum: number, [id, qty]) => {
    const item = FOOD_MENU.find(f => f.id === id);
    return sum + (item?.price || 0) * qty;
  }, 0);

  const handleCheckout = () => {
    if (totalItems === 0) return;
    
    onPlaceOrder({
      userId: user.id,
      userName: user.name, // Ensure username is passed for staff
      items: Object.entries(cart).map(([itemId, quantity]) => ({ itemId, quantity })),
      totalPrice,
      pickupTime,
      status: 'Ordered',
      createdAt: new Date().toISOString()
    });

    setOrderPlaced(true);
    setCart({});
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mess & Food Order</h1>
          <p className="text-slate-500">Skip the queue, preorder your meals.</p>
        </div>
        {totalItems > 0 && (
          <div className="bg-indigo-600 text-white px-6 py-2 rounded-2xl flex items-center space-x-3 shadow-lg">
            <ShoppingCart size={20} />
            <span className="font-bold">₹{totalPrice.toFixed(2)}</span>
          </div>
        )}
      </header>

      {orderPlaced && (
        <div className="bg-green-500 text-white p-4 rounded-2xl flex items-center justify-center space-x-2 animate-in slide-in-from-top duration-300">
          <Check size={20} />
          <span className="font-bold">Order placed successfully! Canteen staff notified.</span>
        </div>
      )}

      {/* Main Order View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FOOD_MENU.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{item.name}</h4>
                  <p className="text-sm text-slate-500">{item.category}</p>
                  <p className="text-indigo-600 font-black mt-1">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {cart[item.id] ? (
                    <>
                      <button onClick={() => updateCart(item.id, -1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600"><Minus size={18} /></button>
                      <span className="font-bold text-sm w-4 text-center">{cart[item.id]}</span>
                      <button onClick={() => updateCart(item.id, 1)} className="p-1 hover:bg-slate-100 rounded-lg text-indigo-600"><Plus size={18} /></button>
                    </>
                  ) : (
                    <button 
                      onClick={() => updateCart(item.id, 1)}
                      className="bg-slate-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors"
                    >
                      ADD
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit space-y-6 sticky top-8">
          <h3 className="text-xl font-bold text-slate-800">New Order</h3>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {totalItems === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ShoppingCart size={40} className="mx-auto mb-2 opacity-20" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              (Object.entries(cart) as [string, number][]).map(([id, qty]) => {
                const item = FOOD_MENU.find(f => f.id === id)!;
                return (
                  <div key={id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold">{qty}x</span>
                      <span className="font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-slate-500">₹{(item.price * qty).toFixed(2)}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider flex items-center">
                <Clock size={14} className="mr-1" /> Pickup Time
              </label>
              <select 
                value={pickupTime}
                onChange={e => setPickupTime(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {PICKUP_INTERVALS.map(time => <option key={time} value={time}>{time}</option>)}
              </select>
            </div>

            <div className="flex justify-between items-center text-lg font-black text-slate-800 pt-2">
              <span>Total</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={totalItems === 0}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-indigo-100"
            >
              Confirm Order
            </button>
          </div>
        </div>
      </div>

      {/* My Orders History */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
          <History className="text-slate-400" size={20} />
          <h2 className="text-xl font-bold text-slate-800">My Recent Orders</h2>
        </div>

        {myOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-400">
            <Package size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-medium">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myOrders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">#{order.id.split('-')[1]}</p>
                    <p className="text-sm font-bold text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    order.status === 'Confirmed' ? 'bg-blue-100 text-blue-600' :
                    order.status === 'Ready' ? 'bg-green-100 text-green-600' :
                    order.status === 'Picked Up' ? 'bg-slate-100 text-slate-500' :
                    'bg-indigo-100 text-indigo-600'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map(cartItem => {
                    const item = FOOD_MENU.find(f => f.id === cartItem.itemId);
                    return (
                      <div key={cartItem.itemId} className="flex justify-between text-xs text-slate-600">
                        <span>{cartItem.quantity}x {item?.name}</span>
                      </div>
                    );
                  })}
                </div>

                {order.status === 'Confirmed' && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start space-x-2 animate-pulse">
                    <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] font-bold text-blue-700">Your order has been confirmed by staff and is being prepared!</p>
                  </div>
                )}

                {order.status === 'Ready' && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-xl flex items-start space-x-2">
                    <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] font-bold text-green-700">Order is ready for pickup! Head to the counter.</p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex items-center text-xs text-slate-400">
                    <Clock size={12} className="mr-1" />
                    {order.pickupTime}
                  </div>
                  <div className="text-sm font-black text-indigo-600">₹{order.totalPrice.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodOrder;
