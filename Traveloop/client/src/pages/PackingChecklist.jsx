import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Trash2, Tag, ShoppingBag, Briefcase, HeartPulse } from 'lucide-react';
import { safeArray } from '../utils/safeHelpers';

const PackingChecklist = () => {
  const [items, setItems] = useState([
    { id: 1, text: 'Passport & Visas', category: 'Essentials', packed: true },
    { id: 2, text: 'Travel Insurance Docs', category: 'Essentials', packed: false },
    { id: 3, text: 'Camera & Lenses', category: 'Gear', packed: false },
    { id: 4, text: 'Comfortable Walking Shoes', category: 'Clothing', packed: true },
    { id: 5, text: 'First Aid Kit', category: 'Health', packed: false },
  ]);
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Essentials');

  const categories = [
    { name: 'Essentials', icon: <Briefcase size={16} /> },
    { name: 'Clothing', icon: <ShoppingBag size={16} /> },
    { name: 'Gear', icon: <Tag size={16} /> },
    { name: 'Health', icon: <HeartPulse size={16} /> },
  ];

  const addItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setItems([{ id: Date.now(), text: newItem, category: selectedCategory, packed: false }, ...items]);
    setNewItem('');
  };

  const togglePacked = (id) => {
    setItems(safeArray(items).map(item => item?.id === id ? { ...item, packed: !item?.packed } : item));
  };

  const deleteItem = (id) => {
    setItems(safeArray(items).filter(item => item?.id !== id));
  };

  const packedCount = safeArray(items).filter(i => i?.packed).length;
  const progress = safeArray(items).length > 0 ? (packedCount / items.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tight">Packing <span className="text-gradient">List</span></h1>
          <p className="text-slate-400 font-medium mt-2">Essential items for your upcoming adventure.</p>
        </div>
        <div className="text-right glass p-6 border-white/5 min-w-[160px]">
           <p className="text-4xl font-black text-primary-400">{Math.round(progress)}%</p>
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Ready to explore</p>
        </div>
      </div>

      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-primary-600 to-primary-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
        />
      </div>

      <form onSubmit={addItem} className="glass p-2 flex gap-3 border-white/5">
        <input 
          type="text" 
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add something to pack..."
          className="flex-1 px-6 py-4 bg-transparent border-none focus:ring-0 outline-none text-white placeholder:text-slate-500 font-medium"
        />
        <div className="flex items-center gap-2">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest text-slate-300 outline-none cursor-pointer hover:bg-white/10 transition-all"
          >
            {categories.map(c => <option key={c.name} value={c.name} className="bg-[#020617]">{c.name}</option>)}
          </select>
          <button className="p-4 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/25 active:scale-95">
            <Plus size={24} />
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {safeArray(items).map((item) => (
            <motion.div
              key={item?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`glass p-6 flex items-center justify-between group transition-all border-white/5 ${item?.packed ? 'opacity-40 grayscale-[0.5]' : ''}`}
            >
              <div className="flex items-center gap-5 flex-1 cursor-pointer" onClick={() => togglePacked(item?.id)}>
                <div className={`${item?.packed ? 'text-primary-400' : 'text-slate-600'} transition-colors`}>
                  {item?.packed ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                </div>
                <div>
                  <p className={`text-lg font-bold transition-all ${item?.packed ? 'line-through text-slate-500' : 'text-white'}`}>
                    {item?.text || 'Untitled Item'}
                  </p>
                  <span className="text-[10px] px-3 py-1 bg-white/5 border border-white/5 rounded-full text-slate-500 font-black uppercase tracking-widest mt-2 inline-block">
                    {item?.category || 'General'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => deleteItem(item?.id)}
                className="p-3 text-slate-600 hover:text-accent-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={20} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PackingChecklist;
