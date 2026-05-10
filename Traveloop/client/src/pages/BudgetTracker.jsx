import { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, AlertTriangle, ArrowUpRight, Plus, Receipt, Wallet, X } from 'lucide-react';
import { db } from '../utils/firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { safeCurrency, safeNumber, safeArray, safeString, safeDate, safeParseJSON } from '../utils/safeHelpers';

const BudgetTracker = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState(() => {
    try {
      return safeParseJSON(localStorage.getItem('traveloop_expenses'), []);
    } catch {
      return [];
    }
  });
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'Food',
    tripId: ''
  });

  // Fetch real data from Firebase + LocalStorage sync
  useEffect(() => {
    if (!user) return;

    // Listen for expenses from Firebase
    const qExpenses = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeExpenses = onSnapshot(qExpenses, (snapshot) => {
      const expenseData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Update state and sync localStorage
      setExpenses(expenseData);
      try {
        localStorage.setItem('traveloop_expenses', JSON.stringify(expenseData));
      } catch {
        console.error("Storage write failed");
      }
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    // Listen for trips to get budgets
    const qTrips = query(
      collection(db, 'trips'),
      where('userId', '==', user.uid)
    );

    const unsubscribeTrips = onSnapshot(qTrips, (snapshot) => {
      const tripData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrips(tripData);
    });

    return () => {
      unsubscribeExpenses();
      unsubscribeTrips();
    };
  }, [user]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount || !newExpense.tripId) {
      return toast.error('Please fill all fields');
    }

    const expenseObj = {
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      userId: user?.uid || 'guest',
      date: newExpense.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    try {
      if (user) {
        await addDoc(collection(db, 'expenses'), {
          ...expenseObj,
          createdAt: serverTimestamp()
        });
      }
      
      // Update local state and storage for instant feedback
      const updatedExpenses = [
        { ...expenseObj, id: Date.now().toString() },
        ...expenses
      ];
      setExpenses(updatedExpenses);
      try {
        localStorage.setItem('traveloop_expenses', JSON.stringify(updatedExpenses));
      } catch (e) {
        console.error("Storage write failed", e);
      }

      toast.success('Expense added successfully');
      setShowAddModal(false);
      setNewExpense({ title: '', amount: '', category: 'Food', tripId: '', date: '', notes: '' });
    } catch (error) {
      console.error("Add expense error:", error);
      toast.error('Failed to add expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      // Remove from local state immediately
      const updatedExpenses = safeArray(expenses).filter(e => e?.id !== id);
      setExpenses(updatedExpenses);
      try {
        localStorage.setItem('traveloop_expenses', JSON.stringify(updatedExpenses));
      } catch (e) {
        console.error("Storage write failed", e);
      }

      if (user) {
        const { deleteDoc, doc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'expenses', id));
      }
      
      toast.success('Expense deleted');
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  // Calculations
  const totalSpent = safeArray(expenses).reduce((acc, curr) => acc + safeNumber(curr?.amount), 0);
  
  const categoryData = [
    { name: 'Food', value: safeArray(expenses).filter(e => e?.category === 'Food').reduce((a, b) => a + safeNumber(b?.amount), 0), color: '#ef4444' },
    { name: 'Hotel', value: safeArray(expenses).filter(e => e?.category === 'Hotel').reduce((a, b) => a + safeNumber(b?.amount), 0), color: '#10b981' },
    { name: 'Transport', value: safeArray(expenses).filter(e => e?.category === 'Transport').reduce((a, b) => a + safeNumber(b?.amount), 0), color: '#3b82f6' },
    { name: 'Activities', value: safeArray(expenses).filter(e => e?.category === 'Activities').reduce((a, b) => a + safeNumber(b?.amount), 0), color: '#f59e0b' },
    { name: 'Shopping', value: safeArray(expenses).filter(e => e?.category === 'Shopping').reduce((a, b) => a + safeNumber(b?.amount), 0), color: '#8b5cf6' },
  ].filter(cat => cat.value > 0);

  const tripComparisonData = safeArray(trips).map(trip => {
    const tripSpent = safeArray(expenses).filter(e => e?.tripId === trip?.id).reduce((a, b) => a + safeNumber(b?.amount), 0);
    return {
      name: trip?.name || 'Untitled',
      spent: tripSpent,
      budget: safeNumber(trip?.budget_limit)
    };
  });

  const avgExpense = safeArray(expenses).length > 0 ? (totalSpent / safeArray(expenses).length) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Analyzing financial records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tight">Budget <span className="text-gradient">Mastery</span></h1>
          <p className="text-slate-400 font-medium mt-2">Track real-time spending across your global adventures.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center justify-center gap-2 px-8 py-4 text-lg shadow-lg shadow-primary-500/20"
        >
          <Plus size={24} />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -5 }} className="glass p-6 border-white/5 bg-slate-900/40 relative overflow-hidden group">
           <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-primary-500/10 rounded-2xl text-primary-400 group-hover:scale-110 transition-transform">
                 <DollarSign size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full text-slate-400">Total Analytics</span>
           </div>
           <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Total Spent</p>
           <h2 className="text-4xl font-black text-white tracking-tight">{safeCurrency(totalSpent)}</h2>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass p-6 border-white/5 bg-emerald-500/5 relative overflow-hidden group">
           <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                 <TrendingUp size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">Efficiency</span>
           </div>
           <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Avg. Expense</p>
           <h2 className="text-4xl font-black text-white tracking-tight">{safeCurrency(avgExpense)}</h2>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass p-6 border-white/5 bg-rose-500/5 relative overflow-hidden group">
           <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400 group-hover:scale-110 transition-transform">
                 <AlertTriangle size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full">Alerts</span>
           </div>
           <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Budget Status</p>
           <h2 className="text-3xl font-black text-white tracking-tight">
             {safeArray(trips).length === 0 ? "No Trips Set" : "All Trips On Track"}
           </h2>
        </motion.div>
      </div>

      {expenses.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-20 text-center flex flex-col items-center justify-center border-white/5"
        >
          <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-600 mb-8 border border-white/10 group">
             <Receipt size={48} className="group-hover:scale-110 transition-transform text-slate-500" />
          </div>
          <h3 className="text-3xl font-black text-white mb-3 tracking-tight">No expenses added yet</h3>
          <p className="text-slate-400 mb-10 max-w-sm font-medium leading-relaxed">
            Start adding transport, hotel, food, and activity costs to track your travel budget in real-time.
          </p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary px-12 py-4 text-lg">
            + Add First Expense
          </button>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Category Breakdown */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass p-8 border-white/5">
              <h3 className="text-xl font-black text-white mb-10 uppercase tracking-tighter flex items-center gap-3">
                <Wallet className="text-primary-500" />
                Category Breakdown
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1500}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => safeCurrency(value)}
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">{value}</span>}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Trip Comparison */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-8 border-white/5">
              <h3 className="text-xl font-black text-white mb-10 uppercase tracking-tighter flex items-center gap-3">
                <TrendingUp className="text-primary-500" />
                Trip Spending
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tripComparisonData}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}}
                    />
                    <YAxis 
                      hide
                    />
                    <RechartsTooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)', radius: 10}}
                      formatter={(value) => safeCurrency(value)}
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                    />
                    <Bar dataKey="spent" fill="#0ea5e9" radius={[10, 10, 0, 0]} name="Spent" />
                    <Bar dataKey="budget" fill="rgba(255,255,255,0.05)" radius={[10, 10, 0, 0]} name="Budget" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Recent Transactions */}
          <div className="glass overflow-hidden border-white/5 mt-10">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
               <h3 className="text-xl font-black text-white uppercase tracking-tighter">Real-time Expenses</h3>
               <div className="flex gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Sync</span>
               </div>
            </div>
            <div className="divide-y divide-white/5">
                {safeArray(expenses).map((item, idx) => {
                  const tripName = safeArray(trips).find(t => t.id === item?.tripId)?.name || 'Unknown Trip';
                  return (
                    <motion.div 
                     key={item?.id} 
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: idx * 0.05 }}
                     className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group"
                    >
                       <div className="flex items-center gap-5">
                          <div className="p-4 rounded-2xl bg-white/5 text-slate-400 group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-all border border-white/5">
                             <ArrowUpRight size={24} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </div>
                          <div>
                             <p className="font-black text-white text-lg group-hover:text-primary-400 transition-colors">{item?.title || 'Untitled Expense'}</p>
                             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                               {safeString(item?.category) || 'General'} • {tripName} • {safeDate(item?.createdAt)}
                             </p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                         <div className="text-right">
                           <p className="text-2xl font-black text-white tracking-tighter">
                             {safeCurrency(item?.amount)}
                           </p>
                         </div>
                         <button 
                          onClick={() => handleDeleteExpense(item?.id)}
                          className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                         >
                           <X size={18} />
                         </button>
                       </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </>
      )}

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass p-10 border-white/10 shadow-2xl"
            >
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Add <span className="text-gradient">Expense</span></h2>
              <p className="text-slate-400 mb-8 font-medium">Record a new transaction for your trip.</p>

              <form onSubmit={handleAddExpense} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    type="text" 
                    value={newExpense.title}
                    onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                    placeholder="e.g. Sushi Dinner"
                    className="input-glass"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount (₹)</label>
                    <input 
                      type="number" 
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      placeholder="0.00"
                      className="input-glass"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      className="input-glass appearance-none cursor-pointer"
                    >
                      {['Hotel', 'Food', 'Transport', 'Activities', 'Shopping', 'Other'].map(cat => (
                        <option key={cat} value={cat} className="bg-[#020617] text-white">{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date</label>
                    <input 
                      type="date" 
                      value={newExpense.date || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                      className="input-glass"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Trip</label>
                    <select 
                      value={newExpense.tripId}
                      onChange={(e) => setNewExpense({...newExpense, tripId: e.target.value})}
                      className="input-glass appearance-none cursor-pointer"
                      required
                    >
                      <option value="" className="bg-[#020617] text-white">Select a trip...</option>
                      {safeArray(trips).map(trip => (
                        <option key={trip.id} value={trip.id} className="bg-[#020617] text-white">{trip.name || 'Untitled Trip'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notes</label>
                  <textarea 
                    value={newExpense.notes || ''}
                    onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                    placeholder="Add details (optional)..."
                    className="input-glass min-h-[100px] py-3"
                  />
                </div>

                <button type="submit" className="btn-primary w-full py-4 text-lg mt-4">
                  Confirm Transaction
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BudgetTracker;
