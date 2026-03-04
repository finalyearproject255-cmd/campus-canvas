import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { CheckCircle, Package, RefreshCcw, ArrowLeft, Utensils} from 'lucide-react';

function CanteenAdmin({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    // 1. Sync Live Tokens (Student Orders)
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 2. Sync Shelf Inventory
    const unsubInv = onSnapshot(collection(db, "canteen_items"), (snap) => {
      setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubOrders(); unsubInv(); };
  }, []);

  const completeOrder = async (id) => {
    if (window.confirm("Verify Token: Has the student collected this item?")) {
      await deleteDoc(doc(db, "orders", id));
    }
  };

  const updateStock = async (id, newStock) => {
    await updateDoc(doc(db, "canteen_items", id), { stock: parseInt(newStock) || 0 });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10 font-sans">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            <Utensils className="text-orange-500 w-10 h-10" /> CANTEEN ADMIN
          </h1>
          <p className="text-gray-500 font-medium italic">Hand over food and update product shelves.</p>
        </div>
        <button onClick={onBack} className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Active Tokens / Orders */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-orange-400">
            <Package className="w-5 h-5" /> Active Tokens
          </h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {orders.length > 0 ? orders.map(order => (
              <div key={order.id} className="bg-black/40 p-5 rounded-2xl border border-white/5 flex justify-between items-center group">
                <div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Token ID: {order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-lg font-bold text-white">{order.itemName}</p>
                  <p className="text-xs text-indigo-400 font-bold">Buyer: {order.customerName}</p>
                </div>
                <button onClick={() => completeOrder(order.id)} className="bg-green-500/20 text-green-400 p-3 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-lg">
                  <CheckCircle className="w-6 h-6" />
                </button>
              </div>
            )) : (
              <p className="text-center text-gray-600 py-10 italic">Waiting for new orders...</p>
            )}
          </div>
        </div>

        {/* Stock Management */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-400">
            <RefreshCcw className="w-5 h-5" /> Update Shelf Stock
          </h2>
          <div className="space-y-4">
            {inventory.map(item => (
              <div key={item.id} className="bg-black/40 p-5 rounded-2xl border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-xs text-gray-500">Stock: {item.stock} left</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    defaultValue={item.stock}
                    onBlur={(e) => updateStock(item.id, e.target.value)}
                    className="w-20 bg-white/5 border border-white/10 rounded-xl p-2 text-center font-bold text-indigo-400 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default CanteenAdmin;