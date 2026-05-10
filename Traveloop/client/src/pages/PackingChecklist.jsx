import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Trash2, Tag, ShoppingBag, Briefcase, HeartPulse } from 'lucide-react';

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
    setItems(items.map(item => item.id === id ? { ...item, packed: !item.packed } : item));
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const packedCount = items.filter(i => i.packed).length;
  const progress = (packedCount / items.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Packing List</h1>
          <p className="text-slate-500 mt-2">Don't leave anything behind on your Bali trip.</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-bold text-primary-600">{Math.round(progress)}%</p>
           <p className="text-sm text-slate-500 font-medium">Ready to go</p>
        </div>
      </div>

      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-primary-500 to-emerald-500"
        />
      </div>

      <form onSubmit={addItem} className="card p-2 flex gap-2">
        <input 
          type="text" 
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add something to pack..."
          className="flex-1 px-6 py-3 bg-transparent border-none focus:ring-0 outline-none text-lg"
        />
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 bg-slate-50 rounded-xl border-none text-sm font-bold text-slate-600 outline-none cursor-pointer"
        >
          {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <button className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30">
          <Plus size={24} />
        </button>
      </form>

      <div className="space-y-4">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`card p-4 flex items-center justify-between group transition-all ${item.packed ? 'bg-slate-50 opacity-60' : 'bg-white'}`}
            >
              <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => togglePacked(item.id)}>
                <div className={item.packed ? 'text-emerald-500' : 'text-slate-300'}>
                  {item.packed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </div>
                <div>
                  <p className={`font-semibold ${item.packed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {item.text}
                  </p>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-md text-slate-500 font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => deleteItem(item.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PackingChecklist;
