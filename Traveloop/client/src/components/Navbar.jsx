import { Bell, Search, User, Menu, X, MapPin, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Navbar = () => {
  const { user, userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    // Wrap in timeout to avoid cascading renders warning
    const timer = setTimeout(() => {
      if (searchQuery !== '' || searchResults.length > 0) {
        setSearchQuery('');
        setSearchResults([]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname, searchQuery, searchResults.length]);

  // Search logic
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim() || !user) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = [];
        const q = searchQuery.toLowerCase();

        // 1. Search Trips
        const tripsRef = collection(db, 'trips');
        const tripsQuery = query(tripsRef, where('userId', '==', user.uid));
        const tripsSnapshot = await getDocs(tripsQuery);
        
        tripsSnapshot.forEach(doc => {
          const trip = { id: doc.id, ...doc.data() };
          const matchesTrip = 
            trip.name?.toLowerCase().includes(q) || 
            trip.destination?.toLowerCase().includes(q) ||
            trip.itinerary?.some(day => 
              day.activities?.some(act => 
                act.location?.toLowerCase().includes(q) || 
                act.description?.toLowerCase().includes(q)
              )
            );

          if (matchesTrip) {
            results.push({
              type: 'trip',
              id: trip.id,
              title: trip.name,
              subtitle: trip.destination,
              icon: MapPin,
              path: `/trips/${trip.id}`
            });
          }
        });

        // 2. Search Expenses
        const expensesRef = collection(db, 'expenses');
        const expensesQuery = query(expensesRef, where('userId', '==', user.uid));
        const expensesSnapshot = await getDocs(expensesQuery);

        expensesSnapshot.forEach(doc => {
          const expense = doc.data();
          if (expense.title?.toLowerCase().includes(q) || expense.category?.toLowerCase().includes(q)) {
            results.push({
              type: 'expense',
              id: doc.id,
              title: expense.title,
              subtitle: `₹${expense.amount} • ${expense.category}`,
              icon: Wallet,
              path: `/budget`
            });
          }
        });

        setSearchResults(results.slice(0, 8));
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, user]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-20 glass border-b border-white/5 z-40 lg:ml-72 flex items-center justify-between px-8">
      {/* Mobile Menu Button */}
      <button className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
        <Menu size={24} />
      </button>

      {/* Search Bar */}
      <div ref={searchRef} className="hidden md:flex items-center flex-1 max-w-md relative group">
        <Search className={`absolute left-4 transition-colors ${isSearching ? 'text-primary-500 animate-pulse' : 'text-slate-500 group-focus-within:text-primary-500'}`} size={18} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search destinations, trips, expenses..." 
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-12 pr-10 outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm font-medium text-white"
        />
        
        <AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-3 glass border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden py-3"
            >
              <div className="px-5 py-2 border-b border-white/5 flex justify-between items-center">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Search Results</span>
                 {isSearching && <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>}
              </div>
              
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => {
                        navigate(result.path);
                        setSearchQuery('');
                      }}
                      className="w-full px-5 py-4 flex items-center gap-4 hover:bg-white/5 transition-all group text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-all">
                        <result.icon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white group-hover:text-primary-400 transition-colors">{result.title}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{result.subtitle}</p>
                      </div>
                    </button>
                  ))
                ) : !isSearching && searchQuery.trim() ? (
                  <div className="px-5 py-10 text-center space-y-3">
                    <p className="text-slate-400 font-bold">No matches found for "{searchQuery}"</p>
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Try another destination or activity</p>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent-500 rounded-full border-2 border-[#020617] group-hover:scale-125 transition-transform"></span>
        </button>

        <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block"></div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/settings')}
          className="flex items-center gap-3 pl-3 pr-1.5 py-1.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group"
        >
          <div className="hidden sm:block text-right">
            <p className="text-sm font-black text-white leading-tight tracking-tight">
              {userData?.name || user?.displayName || 'Traveler'}
            </p>
            <p className="text-[10px] text-primary-400 font-black uppercase tracking-[0.1em] opacity-90 mt-0.5">
              {userData?.role || 'Explorer'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/30 flex items-center justify-center overflow-hidden group-hover:border-primary-500/60 transition-colors shadow-lg shadow-black/20">
            {userData?.avatar || user?.photoURL ? (
              <img src={userData?.avatar || user.photoURL} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary-500/10 flex items-center justify-center">
                <User size={20} className="text-primary-400" />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default Navbar;
