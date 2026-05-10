import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  DollarSign, 
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Luggage,
  BookOpen,
  Share2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { safeCurrency, safeNumber, safeArray, safeString, safeDate } from '../utils/safeHelpers';

const TripDetail = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrip = async () => {
      if (!user || !id) return;
      try {
        const docRef = doc(db, "trips", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setTrip({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error('Trip not found');
          navigate('/trips');
        }
      } catch (error) {
        console.error("Error fetching trip:", error);
        toast.error('Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id, user, navigate]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium tracking-wide">Gathering your adventure details...</p>
    </div>
  );

  if (!trip) return null;

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      {/* Hero Header */}
      <div className="relative h-[450px] rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 group">
        <img 
          src={trip?.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'} 
          alt={safeString(trip?.name)} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent flex flex-col justify-end p-12">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <span className="px-4 py-1.5 rounded-full bg-primary-500/20 backdrop-blur-md border border-primary-500/30 text-primary-400 text-xs font-black uppercase tracking-widest">
                   {safeString(trip?.status) || 'Active'}
                 </span>
                 <span className="flex items-center gap-1.5 text-slate-300 text-sm font-bold">
                   <MapPin size={16} className="text-primary-400" />
                   {safeString(trip?.destination)}
                 </span>
              </div>
              <h1 className="text-6xl font-black text-white tracking-tight">{safeString(trip?.name)}</h1>
              <div className="flex items-center gap-8 text-slate-300">
                <span className="flex items-center gap-2 font-bold">
                  <Calendar size={20} className="text-primary-500" />
                  {safeDate(trip?.startDate)} - {safeDate(trip?.endDate)}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
               <button 
                onClick={() => navigate('/trips/new')}
                className="glass-light px-8 py-4 rounded-2xl hover:bg-white/20 transition-all font-black text-white border-white/10 flex items-center gap-2 uppercase tracking-tighter"
               >
                Edit Journey
               </button>
            </div>
          </motion.div>
        </div>
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/trips')}
          className="absolute top-8 left-8 glass-light p-4 rounded-2xl text-white hover:bg-white/20 transition-all border-white/10"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Itinerary Timeline */}
        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black text-white tracking-tight">
              {trip?.aiGenerated ? 'AI Crafted Itinerary' : 'The Itinerary'}
            </h2>
            <button 
              onClick={() => toast.success('Select a date to add activity')}
              className="btn-primary flex items-center gap-2 px-6"
            >
              <Plus size={20} />
              Add Activity
            </button>
          </div>

          <div className="space-y-12 relative">
             {safeArray(trip?.itinerary).length > 0 ? (
               <div className="space-y-12 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-white/5">
                 {safeArray(trip?.itinerary).map((day, idx) => (
                   <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative pl-16"
                   >
                     <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 font-black z-10 shadow-lg shadow-primary-500/5">
                       {safeNumber(day?.day)}
                     </div>
                     <div className="space-y-6">
                       <h3 className="text-2xl font-black text-white tracking-tight">Day {safeNumber(day?.day)}</h3>
                       <div className="grid gap-4">
                         {safeArray(day?.activities).map((activity, actIdx) => (
                           <div key={actIdx} className="glass p-6 border-white/5 hover:border-white/10 transition-all group flex items-start gap-6">
                             <div className="w-16 text-center">
                               <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{safeString(activity?.time) || '10:00 AM'}</p>
                             </div>
                             <div className="flex-1 space-y-2">
                               <h4 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">{safeString(activity?.location) || safeString(activity?.description)}</h4>
                               <p className="text-slate-400 text-sm leading-relaxed">{safeString(activity?.description)}</p>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   </motion.div>
                 ))}
               </div>
             ) : (
               <div className="space-y-8 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-white/5">
                 <div className="glass p-12 text-center border-dashed border-white/10">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-slate-500 mx-auto mb-6">
                       <Plus size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Build your timeline</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                      Start adding activities, flights, or hotels to create your perfect travel story.
                    </p>
                    <button 
                      onClick={() => toast.success('Opening planning toolkit...')}
                      className="mt-8 text-primary-400 font-bold hover:text-primary-300 flex items-center gap-2 mx-auto transition-all"
                    >
                      Get Started <ChevronRight size={18} />
                    </button>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Budget Overview */}
          <div className="glass p-8 relative overflow-hidden group border-white/5">
             <div className="absolute -top-10 -right-10 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <DollarSign size={160} />
             </div>
             <div className="flex items-center gap-2 mb-8">
                <DollarSign size={20} className="text-primary-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Financial Insights</h3>
             </div>
             <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <div className="space-y-1">
                       <span className="block text-slate-400 font-bold text-sm">Estimated Spend</span>
                       <span className="block text-[10px] font-black text-primary-500/60 uppercase tracking-widest">
                         {safeNumber(trip?.tripDays, 0)} Days • {safeNumber(trip?.memberCount, 1)} Member{safeNumber(trip?.memberCount, 1) > 1 ? 's' : ''}
                       </span>
                    </div>
                    <span className="text-3xl font-black text-white">
                      {safeCurrency(trip?.totalBudget)}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 w-full rounded-full"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                     <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-wider">Lodging</p>
                     <p className="text-lg font-black text-white">{safeCurrency(trip?.hotelCost)}</p>
                   </div>
                   <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                     <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-wider">Transport</p>
                     <p className="text-lg font-black text-white">{safeCurrency(trip?.transportCost)}</p>
                   </div>
                   <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                     <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-wider">Food</p>
                     <p className="text-lg font-black text-white">{safeCurrency(trip?.foodCost)}</p>
                   </div>
                   <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                     <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-wider">Activities</p>
                     <p className="text-lg font-black text-white">{safeCurrency(trip?.activityCost)}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Tools */}
          <div className="glass p-8 space-y-6 border-white/5">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Traveler Toolkit</h3>
            <div className="grid grid-cols-1 gap-4">
               {[
                 { 
                   icon: Luggage, 
                   label: 'Packing Assistant', 
                   color: 'text-blue-400', 
                   action: () => {
                     if (trip?.packing_list) {
                       toast(() => (
                         <div className="space-y-4 text-white">
                           <p className="font-black uppercase tracking-widest text-[10px] text-primary-400">AI Packing List</p>
                           <ul className="space-y-2">
                             {safeArray(trip?.packing_list).map((item, i) => <li key={i} className="text-sm flex items-center gap-2">✅ {item}</li>)}
                           </ul>
                         </div>
                       ), { duration: 5000, style: { background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)' } });
                     } else {
                       navigate('/checklist');
                     }
                   } 
                 },
                 { icon: BookOpen, label: 'Travel Journal', color: 'text-purple-400', path: '/checklist' },
                 { icon: Share2, label: 'Invite Friends', color: 'text-emerald-400', action: () => {
                   navigator.clipboard.writeText(window.location.href);
                   toast.success('Invitation link copied to clipboard!');
                 }}
               ].map((tool, idx) => (
                 <button 
                  key={idx} 
                  onClick={() => tool.path ? navigate(tool.path) : tool.action()}
                  className="flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group border border-white/5 hover:border-white/10 text-left w-full"
                 >
                   <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${tool.color} group-hover:scale-110 transition-transform`}>
                       <tool.icon size={20} />
                     </div>
                     <span className="font-bold text-white tracking-tight">{tool.label}</span>
                   </div>
                   <ChevronRight size={18} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                 </button>
               ))}
            </div>
          </div>

          {/* AI Intelligence */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass p-8 bg-gradient-to-br from-primary-600/20 to-transparent border-primary-500/20 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 animate-pulse">
               <Sparkles className="text-primary-400" size={24} />
            </div>
            <h4 className="font-black text-white mb-3 uppercase tracking-tighter text-xl">
              {trip.aiGenerated ? 'AI Travel Intelligence' : 'Intelligence Suggestion'}
            </h4>
            <p className="text-slate-300 text-sm font-medium leading-relaxed">
              {trip.travel_tips ? trip.travel_tips[0] : `Based on your destination of ${trip.destination}, we recommend booking local experiences at least 2 weeks in advance.`}
            </p>
            <button 
              onClick={() => {
                if (trip.travel_tips) {
                  toast.success(trip.travel_tips.join('\n\n'));
                } else {
                  toast.success('Analyzing travel market data...');
                }
              }}
              className="mt-6 w-full py-3 bg-primary-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-400 transition-colors"
            >
              {trip.aiGenerated ? 'View All Tips' : 'Analyze Market'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
