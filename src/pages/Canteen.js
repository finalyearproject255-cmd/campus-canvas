import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, increment, addDoc } from 'firebase/firestore';
import { ArrowLeft, Utensils, QrCode, CheckCircle2, Loader2, ShoppingBag } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

function Canteen({ onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user_info')) || { name: 'Guest', username: 'guest' };

  // --- 1. SYNC MENU FROM FIRESTORE ---
  useEffect(() => {
    const q = query(collection(db, "canteen_items"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const menuData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(menuData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. ORDER & STOCK REDUCTION LOGIC ---
  const placeOrder = async (item) => {
    if (item.stock <= 0) return alert("Sorry, this item just sold out!");
    setIsProcessing(true);

    try {
      // Create the Token/Order in Database
      const orderRef = await addDoc(collection(db, "orders"), {
        customerName: currentUser.name,
        customerUser: currentUser.username,
        itemName: item.name,
        price: item.price,
        status: "Paid",
        timestamp: new Date().toISOString()
      });

      // 🔥 ATOMIC UPDATE: Reduce "Shelf" count in Firestore
      const itemRef = doc(db, "canteen_items", item.id);
      await updateDoc(itemRef, {
        stock: increment(-1)
      });

      // Show the Digital Receipt
      setActiveOrder({ id: orderRef.id, ...item });
    } catch (err) {
      console.error("Transaction Error:", err);
      alert("Order failed. Please check your connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-12 h-12 mb-4" />
        <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Loading Smart Menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-20">
      
      {/* Navbar */}
      <nav className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white border border-white/10 text-xs font-bold">
            <ArrowLeft className="w-4 h-4" /> Back to Campus
          </button>
          <div className="flex items-center gap-2 text-indigo-400">
            <Utensils className="w-5 h-5" />
            <span className="font-black text-sm tracking-tighter italic uppercase">NIMIT Smart Canteen</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-2">DIGITAL MENU</h1>
            <p className="text-gray-500 font-medium max-w-md">Tokens are generated instantly. Show the QR at the counter to collect your meal.</p>
          </div>
          <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Balance Status</p>
                <p className="text-sm font-bold text-green-400">Verified Account</p>
             </div>
             <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="text-green-500 w-6 h-6" />
             </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.id} className="group bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.08] transition-all relative overflow-hidden flex flex-col">
              {/* Availability Badge */}
              <div className="flex justify-between items-start mb-6">
                <div className="bg-indigo-500/10 p-4 rounded-2xl text-4xl group-hover:scale-110 transition-transform">{item.icon || '🍲'}</div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black border ${item.stock > 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {item.stock > 0 ? `${item.stock} LEFT` : 'SOLD OUT'}
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-1 text-white">{item.name}</h3>
              <p className="text-gray-500 text-xs mb-4 uppercase tracking-widest font-bold">{item.category}</p>
              
              <div className="mt-auto">
                <p className="text-indigo-400 font-black text-3xl mb-6">₹{item.price}</p>
                <button 
                  onClick={() => placeOrder(item)}
                  disabled={item.stock <= 0 || isProcessing}
                  className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-20 disabled:grayscale"
                >
                  {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <><QrCode className="w-5 h-5" /> Buy Token</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- SUCCESS TOKEN MODAL (The Receipt) --- */}
      {activeOrder && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white text-black w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl transform animate-in zoom-in duration-500">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-indigo-600 w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-black mb-1 uppercase tracking-tighter">Order Confirmed</h2>
            <p className="text-gray-500 text-xs mb-8 font-bold">Show this token at the NIMIT Canteen</p>
            
            <div className="bg-gray-50 p-6 rounded-[2rem] border-4 border-double border-gray-200 mb-8 inline-block shadow-inner">
              <QRCodeSVG value={`NIMIT-TOKEN-${activeOrder.id}`} size={160} />
            </div>

            <div className="bg-black text-white p-5 rounded-2xl mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-bl-full"></div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Your Unique Token</p>
              <p className="text-3xl font-mono font-black tracking-widest">#{activeOrder.id.slice(-6).toUpperCase()}</p>
            </div>

            <button 
              onClick={() => setActiveOrder(null)} 
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Canteen;