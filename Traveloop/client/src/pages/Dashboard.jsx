import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Plane, 
  ChevronRight, 
  Clock, 
  Star,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '../utils/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { safeCurrency, safeNumber, safeArray, safeString, safeParseJSON } from '../utils/safeHelpers';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [, setExpenses] = useState(() => {
    try {
      return safeParseJSON(localStorage.getItem('traveloop_expenses'), []);
    } catch {
      return [];
    }
  });
  const [stats, setStats] = useState([
    { label: 'Active Trips', value: '0', icon: Calendar, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Destinations', value: '0', icon: MapPin, color: 'text-accent-400', bg: 'bg-accent-500/10' },
    { label: 'Total Spent', value: '₹0', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Travel Distance', value: '0K', icon: Plane, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ]);

  useEffect(() => {
    if (!user) return;

    const qTrips = query(
      collection(db, 'trips'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeTrips = onSnapshot(qTrips, (snapshot) => {
      const tripData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrips(tripData);
      
      const activeCount = safeArray(tripData).filter(t => t?.status === 'upcoming' || t?.status === 'ongoing').length;
      const destCount = [...new Set(safeArray(tripData).map(t => t?.destination).filter(Boolean))].length;
      const km = destCount * 1240;
      const kmFormatted = km >= 1000 ? (km / 1000).toFixed(1) + 'K' : km.toString();
      
      setStats(prev => [
        { ...prev[0], value: safeNumber(activeCount).toString() },
        { ...prev[1], value: safeNumber(destCount).toString() },
        { ...prev[2], value: prev[2].value }, 
        { ...prev[3], value: `${kmFormatted} KM` }
      ]);
    });

    const qExpenses = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid)
    );

    const unsubscribeExpenses = onSnapshot(qExpenses, (snapshot) => {
      const expenseData = safeArray(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      setExpenses(expenseData);
      try {
        localStorage.setItem('traveloop_expenses', JSON.stringify(expenseData));
      } catch (err) {
        console.error("Failed to save expenses to storage:", err);
      }
      
      const totalSpentAmount = expenseData.reduce((acc, curr) => acc + safeNumber(curr?.amount), 0);
      setStats(prev => {
        const newStats = [...prev];
        newStats[2] = { ...newStats[2], value: safeCurrency(totalSpentAmount) };
        return newStats;
      });
    });

    return () => {
      unsubscribeTrips();
      unsubscribeExpenses();
    };
  }, [user]);

  // Aggregate monthly spending for chart
  const getChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      last6Months.push(months[idx]);
    }

    return safeArray(last6Months).map(month => {
      const monthlyTotal = safeArray(trips).reduce((acc, trip) => {
        const startStr = safeString(trip?.startDate);
        if (!startStr) return acc;
        
        try {
          const tripDate = new Date(startStr);
          if (isNaN(tripDate.getTime())) return acc;
          const tripMonth = tripDate.toLocaleString('en-US', { month: 'short' });
          return tripMonth === month ? acc + safeNumber(trip?.totalBudget) : acc;
        } catch {
          return acc;
        }
      }, 0);
      return { name: month, spent: monthlyTotal };
    });
  };

  const chartData = getChartData();

  const popularDestinations = [
    { name: 'Santorini, Greece', rating: 4.9, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=400&q=80' },
    { name: 'Kyoto, Japan', rating: 4.8, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Swiss Alps', rating: 4.9, image: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=400&q=80' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-80 rounded-[2.5rem] overflow-hidden shadow-2xl group"
      >
        <img 
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80" 
          alt="Travel Hero" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/90 via-[#020617]/40 to-transparent flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-5xl font-extrabold mb-4 tracking-tight leading-tight">
              Ready for your next <br />
              <span className="text-gradient">Masterpiece?</span>
            </h2>
            <p className="text-slate-300 mb-8 max-w-lg text-lg font-medium leading-relaxed">
              Explore 100+ new destinations added this month. Your next adventure is just a click away.
            </p>
            <div className="flex gap-4">
              <Link to="/trips/new" className="btn-primary flex items-center gap-2 group px-8 py-4 text-lg">
                <Plus size={24} />
                <span>Plan New Journey</span>
              </Link>
              <button className="glass-light hover:bg-white/10 text-white font-bold py-4 px-8 rounded-xl transition-all flex items-center gap-2">
                <Star size={20} className="text-amber-400" />
                <span>Saved Ideas</span>
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl -mr-12 -mt-12 transition-transform group-hover:scale-150`}></div>
            <div className="relative flex flex-col gap-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                  <span className="text-emerald-500 text-xs font-bold mb-1 flex items-center">
                    <TrendingUp size={12} className="mr-1" /> +12%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Recent Trips */}
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Clock className="text-primary-500" />
                Recent Adventures
              </h3>
              <Link to="/trips" className="text-primary-400 font-bold hover:text-primary-300 transition-colors flex items-center gap-1 group">
                View Gallery
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {safeArray(trips).length > 0 ? (
                safeArray(trips).slice(0, 2).map((trip) => (
                  <motion.div 
                    key={trip?.id} 
                    whileHover={{ y: -8 }}
                    className="group relative h-80 rounded-[2rem] overflow-hidden shadow-xl"
                  >
                    <img 
                      src={trip?.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'} 
                      alt={trip?.name || 'Trip'} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                    
                    <div className="absolute top-4 right-4">
                      <span className="px-4 py-1.5 glass-light backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                        {trip?.status || 'Upcoming'}
                      </span>
                    </div>
 
                    <div className="absolute bottom-6 left-6 right-6">
                      <h4 className="text-2xl font-black text-white mb-2 tracking-tight">{trip?.name || 'Untitled Trip'}</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar size={12} className="text-primary-500" />
                            {trip?.startDate ? new Date(trip.startDate).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'}) : 'Planning...'}
                          </p>
                          <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <DollarSign size={12} className="text-emerald-500" />
                            {safeString(trip?.budget, 'Moderate')}
                          </p>
                        </div>
                        <Link to={`/trips/${trip?.id}`} className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-primary-500 transition-colors">
                          <ArrowUpRight size={20} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="md:col-span-2 glass p-12 text-center border-white/5">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Recent Adventures</p>
                  <Link to="/trips/new" className="text-primary-400 font-black mt-4 inline-block hover:underline">Start your first journey →</Link>
                </div>
              )}
            </div>
          </section>

          {/* Budget Analytics */}
          <section className="glass p-8 rounded-[2rem] border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Budget Overview</h3>
                <p className="text-slate-400 text-sm">Monthly spending analysis</p>
              </div>
              <select className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 outline-none focus:border-primary-500/50">
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}} 
                    dy={10}
                  />
                  <YAxis 
                    hide 
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass p-4 border-white/10 shadow-2xl">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{safeString(label)}</p>
                            <p className="text-lg font-black text-white">{safeCurrency(payload[0]?.value)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="spent" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSpent)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-10">
          <section className="glass p-8 rounded-[2rem] border-white/5 h-full">
            <h3 className="text-xl font-bold text-white mb-8">Popular Destinations</h3>
            <div className="space-y-6">
              {popularDestinations.map((dest, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden relative">
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute top-1 right-1 w-6 h-6 glass-light rounded-lg flex items-center justify-center">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-primary-400 transition-colors">{dest.name}</h4>
                    <p className="text-sm text-slate-400 mb-2">Trending Choice</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded-md">{dest.rating} Rating</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/trips/new', { state: { destination: dest.name } });
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-primary-400 hover:text-primary-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Generate <Sparkles size={10} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-12 p-6 glass-light rounded-3xl border-primary-500/20 bg-primary-500/5 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-lg font-bold text-white mb-2">Traveloop Pro</h4>
                <p className="text-sm text-slate-400 mb-6">Unlock exclusive deals and AI-powered trip planning.</p>
                <button className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95">
                  Upgrade Now
                </button>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-primary-500/20 blur-3xl rounded-full"></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
