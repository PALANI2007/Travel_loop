import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, MapPin, Trash2, Edit2, X, Save, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { db } from '../utils/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { calculateTripBudget } from '../utils/budgetLogic';
import { safeCurrency, safeNumber, safeArray, safeString, safeDate } from '../utils/safeHelpers';
import React from 'react';

const sanitizeTrip = (trip = {}) => {
  if (!trip) return null;
  return {
    ...trip,
    id: trip.id || crypto.randomUUID(),
    name: trip.name || trip.title || "Untitled Trip",
    destination: trip.destination || "Global",
    startDate: trip.startDate || "",
    endDate: trip.endDate || "",
    status: trip.status || "upcoming",
    memberCount: Number(trip.memberCount || trip.members || 1),
    budget: typeof trip.budget === 'string' ? trip.budget : "Moderate",
    totalBudget: Number(trip.totalBudget || trip.budget?.total || 0),
    hotelCost: Number(trip.hotelCost || trip.budget?.hotels || 0),
    foodCost: Number(trip.foodCost || trip.budget?.food || 0),
    transportCost: Number(trip.transportCost || trip.budget?.travel || 0),
    activityCost: Number(trip.activityCost || trip.budget?.activities || 0),
    coverImage: trip.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    description: trip.description || 'Embarking on a journey to discover new horizons and create lasting memories.',
    itinerary: Array.isArray(trip.itinerary) ? trip.itinerary : [],
  };
};

class MyTripsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("MyTrips rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-fade-in">
          <AlertCircle size={48} className="text-rose-500 mb-2" />
          <h2 className="text-3xl font-black text-white">Oops! Something went sideways</h2>
          <p className="text-slate-400 font-medium max-w-md text-center">
            We encountered an issue while rendering your trips. Some data might be corrupted.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary px-8 py-3 mt-4"
          >
            Reload Trips
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const MyTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTrip, setEditingTrip] = useState(null);
  const [filter, setFilter] = useState('All');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, "trips"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => {
        try {
          return sanitizeTrip({ id: doc.id, ...doc.data() });
        } catch {
          console.warn("Corrupted trip skipped safely:", doc.id);
          return null;
        }
      }).filter(Boolean);
      setTrips(tripsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching trips:", error);
      toast.error('Failed to load trips');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await deleteDoc(doc(db, "trips", id));
      toast.success('Trip deleted');
    } catch {
      toast.error('Failed to delete trip');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const budgetInfo = calculateTripBudget(
        editingTrip?.startDate,
        editingTrip?.endDate,
        editingTrip?.memberCount,
        editingTrip?.budget
      );

      const tripRef = doc(db, 'trips', editingTrip?.id);
      const updatedData = {
        ...editingTrip,
        ...budgetInfo,
        budget: {
          perPerson: budgetInfo.perMemberPerDay,
          hotels: budgetInfo.hotelCost,
          food: budgetInfo.foodCost,
          travel: budgetInfo.transportCost,
          activities: budgetInfo.activityCost,
          total: budgetInfo.totalBudget
        }
      };
      
      await updateDoc(tripRef, updatedData);
      toast.success('Trip updated successfully!');
      setEditingTrip(null);
    } catch (error) {
      console.error("Update error:", error);
      toast.error('Failed to update trip');
    }
  };

  const handleComplete = async (id) => {
    try {
      await updateDoc(doc(db, "trips", id), { status: 'completed' });
      toast.success('Trip marked as completed!');
    } catch {
      toast.error('Failed to complete trip');
    }
  };

  const getStatus = (trip) => {
    if (safeString(trip?.status) === 'completed') return { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle2 };
    
    try {
      const now = new Date();
      const start = new Date(trip?.startDate);
      const end = new Date(trip?.endDate);

      if (isNaN(start.getTime())) return { label: 'Upcoming', color: 'bg-primary-500/20 text-primary-400', icon: Clock };
      if (now < start) return { label: 'Upcoming', color: 'bg-primary-500/20 text-primary-400', icon: Clock };
      if (now >= start && now <= end) return { label: 'Ongoing', color: 'bg-amber-500/20 text-amber-400', icon: AlertCircle };
    } catch {
      // Fallback
    }
    return { label: 'Upcoming', color: 'bg-primary-500/20 text-primary-400', icon: Clock };
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium animate-pulse">Scanning the globe for your trips...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tight">My <span className="text-gradient">Adventures</span></h1>
          <p className="text-slate-400 mt-2 font-medium">Manage and relive your journeys across the world.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 h-fit">
            {['All', 'Upcoming', 'Completed'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === f ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <Link to="/trips/new" className="btn-primary flex items-center justify-center gap-2 px-8 py-3 text-sm shadow-lg shadow-primary-500/20 h-fit">
            <Plus size={20} />
            Plan New Trip
          </Link>
        </div>
      </div>

      {safeArray(trips).length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-20 text-center flex flex-col items-center justify-center border-white/5"
        >
          <div className="w-24 h-24 bg-primary-500/10 rounded-[2rem] flex items-center justify-center text-primary-500 mb-8 border border-primary-500/20">
             <MapPin size={48} />
          </div>
          <h3 className="text-3xl font-black text-white mb-3 tracking-tight">No trips yet</h3>
          <p className="text-slate-400 mb-10 max-w-sm font-medium leading-relaxed">
            It looks like you haven't started planning any adventures. The world is waiting for you!
          </p>
          <Link to="/trips/new" className="btn-primary px-12 py-4 text-lg">
            Start Planning
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {safeArray(trips)
            .filter(t => filter === 'All' || t.status?.toLowerCase() === filter.toLowerCase())
            .map((trip, idx) => {
            const status = getStatus(trip);
            return (
              <motion.div
                key={trip?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`group glass overflow-hidden flex flex-col border-white/5 hover:border-primary-500/30 transition-all duration-500 shadow-xl ${status?.label === 'Completed' ? 'bg-emerald-500/[0.02]' : ''}`}
              >
                <div className="relative h-60 overflow-hidden">
                  <img 
                    src={trip.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'} 
                    alt={trip.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-90" />
                  
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md border border-white/10 ${status.color}`}>
                      <status.icon size={12} />
                      {status.label}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                     <h3 className="text-2xl font-black text-white mb-1 tracking-tight">{trip?.name || 'Untitled Trip'}</h3>
                     <div className="flex items-center gap-2 text-primary-400 text-[10px] font-black uppercase tracking-[0.2em]">
                       <MapPin size={12} />
                       <span>{trip?.destination || 'Global'}</span>
                     </div>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between bg-white/2">
                  <div className="space-y-6 mb-8">
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="p-2 bg-primary-500/10 rounded-lg">
                        <Calendar size={18} className="text-primary-500" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">
                        {safeDate(trip?.startDate)} - {safeDate(trip?.endDate)}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed font-medium">
                      {trip.description || 'Embarking on a journey to discover new horizons and create lasting memories.'}
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Group & Level</p>
                        <p className="text-sm font-bold text-white">{safeNumber(trip?.memberCount, 1)} {safeNumber(trip?.memberCount, 1) > 1 ? 'People' : 'Person'} • {trip?.budget || 'Moderate'}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Budget</p>
                        <p className="text-sm font-black text-primary-400">{safeCurrency(trip?.totalBudget)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Hotel</span>
                          <span className="text-[10px] font-bold text-slate-300">{safeCurrency(trip?.hotelCost)}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Food</span>
                          <span className="text-[10px] font-bold text-slate-300">{safeCurrency(trip?.foodCost)}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Travel</span>
                          <span className="text-[10px] font-bold text-slate-300">{safeCurrency(trip?.transportCost)}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Events</span>
                          <span className="text-[10px] font-bold text-slate-300">{safeCurrency(trip?.activityCost)}</span>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/trips/${trip.id}`}
                        className="text-primary-400 text-[10px] font-black uppercase tracking-widest hover:text-primary-300 flex items-center gap-2 group/btn"
                      >
                        Details
                        <Plus size={12} className="group-hover/btn:rotate-90 transition-transform" />
                      </Link>
                      {status.label !== 'Completed' && (
                        <button 
                          onClick={() => handleComplete(trip.id)}
                          className="text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:text-emerald-300 flex items-center gap-2"
                        >
                          Complete
                          <CheckCircle2 size={12} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setEditingTrip(trip)}
                        className="p-3 text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-2xl transition-all border border-white/5 hover:border-primary-500/20 shadow-lg"
                      >
                         <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(trip.id)}
                        className="p-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all border border-white/5 hover:border-rose-500/20 shadow-lg"
                      >
                         <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Trip Modal */}
      <AnimatePresence>
        {editingTrip && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTrip(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass p-10 border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setEditingTrip(null)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Edit <span className="text-gradient">Adventure</span></h2>
              <p className="text-slate-400 mb-8 font-medium">Update your trip details and itinerary.</p>

              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Trip Title</label>
                    <input 
                      type="text" 
                      value={editingTrip?.name || ''}
                      onChange={(e) => setEditingTrip({...editingTrip, name: e.target.value})}
                      className="input-glass"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Destination</label>
                    <input 
                      type="text" 
                      value={editingTrip?.destination || ''}
                      onChange={(e) => setEditingTrip({...editingTrip, destination: e.target.value})}
                      className="input-glass"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Start Date</label>
                    <input 
                      type="date" 
                      value={editingTrip?.startDate || ''}
                      onChange={(e) => setEditingTrip({...editingTrip, startDate: e.target.value})}
                      className="input-glass"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">End Date</label>
                    <input 
                      type="date" 
                      value={editingTrip?.endDate || ''}
                      onChange={(e) => setEditingTrip({...editingTrip, endDate: e.target.value})}
                      className="input-glass"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Budget</label>
                    <select 
                      value={editingTrip?.budget || 'Moderate'}
                      onChange={(e) => setEditingTrip({...editingTrip, budget: e.target.value})}
                      className="input-glass"
                    >
                      <option className="bg-[#020617]">Budget</option>
                      <option className="bg-[#020617]">Moderate</option>
                      <option className="bg-[#020617]">Luxury</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Travel Type</label>
                    <select 
                      value={editingTrip?.travelType || 'Solo'}
                      onChange={(e) => setEditingTrip({...editingTrip, travelType: e.target.value})}
                      className="input-glass"
                    >
                      <option className="bg-[#020617]">Solo</option>
                      <option className="bg-[#020617]">Couple</option>
                      <option className="bg-[#020617]">Family</option>
                      <option className="bg-[#020617]">Friends</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cover Image URL</label>
                  <input 
                    type="text" 
                    value={editingTrip?.coverImage || ''}
                    onChange={(e) => setEditingTrip({...editingTrip, coverImage: e.target.value})}
                    placeholder="https://images.unsplash.com/..."
                    className="input-glass"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="submit" className="btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-2">
                    <Save size={20} />
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingTrip(null)}
                    className="glass px-8 py-4 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MyTrips = () => {
  return (
    <MyTripsErrorBoundary>
      <MyTripsPage />
    </MyTripsErrorBoundary>
  );
};

export default MyTrips;
