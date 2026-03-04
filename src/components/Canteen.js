import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { CheckCircle, Trash2, Package, RefreshCcw } from 'lucide-react';

function CanteenAdmin() {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    // 1. Sync Orders
    const qOrders = query(collection(db, "orders"));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 2. Sync Inventory
    const qInv = query(collection(db, "canteen_items"));
    const unsubInv = onSnapshot(qInv, (snap) => {
      setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubOrders(); unsubInv(); };
  }, []);

  const completeOrder = async (id) => {
    await deleteDoc(doc(db, "orders", id)); // Remove order once food is served
  };

  const updateStock = async (id, newStock) => {
    await updateDoc(doc(db, "canteen_items", id), { stock: newStock });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <h1 className="text-3xl font-black mb-8 border-l-4 border-indigo-600 pl-4 uppercase">Canteen Control Center</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Active Orders List */}
        <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-400">
            <Package className="w-5 h-5" /> Incoming Tokens
          </h2>
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-black/40 p-5 rounded-2xl border border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Token: {order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-lg font-bold">{order.itemName}</p>
                  <p className="text-sm text-indigo-400">By: {order.customerName}</p>
                </div>
                <button onClick={() => completeOrder(order.id)} className="bg-green-500/20 text-green-400 p-3 rounded-xl hover:bg-green-500 hover:text-white transition-all">
                  <CheckCircle className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Management */}
        <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-400">
            <RefreshCcw className="w-5 h-5" /> Manage Shelves
          </h2>
          <div className="space-y-4">
            {inventory.map(item => (
              <div key={item.id} className="bg-black/40 p-5 rounded-2xl border border-white/5 flex justify-between items-center">
                <span>{item.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 text-xs">Stock: {item.stock}</span>
                  <input 
                    type="number" 
                    className="w-16 bg-white/10 border border-white/10 rounded-lg p-1 text-center"
                    onBlur={(e) => updateStock(item.id, parseInt(e.target.value))}
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