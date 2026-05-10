import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Calendar, Image as ImageIcon, ArrowLeft, Save, MapPin, Globe, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { collection, addDoc } from 'firebase/firestore';

const CreateTrip = () => {
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    description: '',
    startDate: '',
    endDate: '',
    coverImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('You must be logged in');
    
    setLoading(true);
    const loadingToast = toast.loading('Mapping your adventure...');
    
    try {
      await addDoc(collection(db, "trips"), {
        ...formData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        status: 'upcoming'
      });
      toast.success('Trip planned successfully!', { id: loadingToast });
      navigate('/trips');
    } catch (error) {
      console.error("Error saving trip:", error);
      toast.error('Error creating trip', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-fade-in">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-primary-400 transition-all font-bold group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Adventures
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-white mb-3">Plan New <span className="text-gradient">Adventure</span></h1>
          <p className="text-slate-400 text-lg font-medium">Every great journey starts with a single step (and a clear plan).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass p-10 space-y-8 border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-wider">Trip Title</label>
                <div className="relative group">
                  <Map className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-glass pl-14"
                    placeholder="e.g. Summer in Italy"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-wider">Destination</label>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    className="input-glass pl-14"
                    placeholder="e.g. Rome, Amalfi Coast"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-wider">Start Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="input-glass pl-14 [color-scheme:dark]"
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-wider">End Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="date" 
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="input-glass pl-14 [color-scheme:dark]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-wider">Adventure Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="input-glass h-40 resize-none py-5"
                placeholder="What are you most excited about exploring on this trip?"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl font-extrabold hover:shadow-[0_10px_30px_rgba(14,165,233,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 group"
            >
              <Save size={24} />
              <span className="text-lg">{loading ? 'Creating Adventure...' : 'Save Adventure'}</span>
            </button>
          </form>
        </div>

        <div className="space-y-10">
          <div className="glass p-6 border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon size={20} className="text-primary-400" />
              <h3 className="font-bold text-white uppercase tracking-widest text-xs">Cover Imagery</h3>
            </div>
            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-white/5 group border border-white/10">
              <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-3 cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Sparkles size={24} />
                </div>
                <span className="font-bold text-sm">Change Image</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-4 text-center font-bold uppercase tracking-widest">Recommended: Cinematic Landscape (16:9)</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 bg-gradient-to-br from-primary-600/20 to-transparent border-primary-500/10 relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
              <Globe size={120} />
            </div>
            <div className="relative z-10">
               <h3 className="font-extrabold text-2xl text-white mb-4 flex items-center gap-2">
                 Pro Tip 💡
               </h3>
               <p className="text-slate-300 font-medium leading-relaxed">
                 "Adding a clear destination and dates helps our Traveloop engine find the most exclusive hidden gems for your specific timeframe!"
               </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
