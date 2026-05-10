import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calendar, MapPin, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { db } from '../utils/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "trips"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const tripsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrips(tripsData);
      } catch (error) {
        console.error("Error fetching trips:", error);
        toast.error('Failed to load trips');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await deleteDoc(doc(db, "trips", id));
      setTrips(trips.filter(t => t.id !== id));
      toast.success('Trip deleted');
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium">Scanning the globe for your trips...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">My Adventures</h1>
          <p className="text-slate-400 mt-2 font-medium">Manage all your planned and past trips.</p>
        </div>
        <Link to="/trips/new" className="btn-primary flex items-center justify-center gap-2 px-8">
          <Plus size={20} />
          Plan New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-20 text-center flex flex-col items-center justify-center border-white/5"
        >
          <div className="w-24 h-24 bg-primary-500/10 rounded-full flex items-center justify-center text-primary-500 mb-6 border border-primary-500/20">
             <MapPin size={40} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No trips yet</h3>
          <p className="text-slate-400 mb-8 max-w-sm font-medium">
            It looks like you haven't started planning any adventures. Time to see the world!
          </p>
          <Link to="/trips/new" className="btn-primary px-10">
            Start Planning
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip, idx) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group glass overflow-hidden flex flex-col border-white/5 hover:border-primary-500/30 transition-all duration-300"
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={trip.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'} 
                  alt={trip.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="glass-light p-2 rounded-xl border-white/10 text-white cursor-pointer hover:bg-white/20 transition-colors">
                     <MoreVertical size={20} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                   <h3 className="text-2xl font-bold text-white mb-1">{trip.name}</h3>
                   <div className="flex items-center gap-2 text-primary-400 text-sm font-bold uppercase tracking-wider">
                     <MapPin size={14} />
                     <span>{trip.destination}</span>
                   </div>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Calendar size={18} className="text-primary-500" />
                    <span className="text-sm font-medium">
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                    {trip.description || 'Embarking on a journey to discover new horizons and create lasting memories.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <Link 
                    to={`/trips/${trip.id}`}
                    className="text-primary-400 font-bold hover:text-primary-300 flex items-center gap-1 group/btn"
                  >
                    View Details
                    <Plus size={16} className="group-hover/btn:rotate-90 transition-transform" />
                  </Link>
                  <div className="flex items-center gap-2">
                    <button className="p-2.5 text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-xl transition-all border border-transparent hover:border-primary-500/20">
                       <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(trip.id)}
                      className="p-2.5 text-slate-400 hover:text-accent-400 hover:bg-accent-500/10 rounded-xl transition-all border border-transparent hover:border-accent-500/20"
                    >
                       <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrips;
