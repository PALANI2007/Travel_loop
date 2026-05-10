import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, 
  Calendar, 
  Image as ImageIcon, 
  ArrowLeft, 
  Save, 
  MapPin, 
  Globe, 
  Sparkles,
  Zap,
  Users,
  Heart,
  Camera,
  Coffee,
  TreePine,
  ShoppingBag,
  Dumbbell
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { db } from '../utils/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import { calculateTripBudget } from '../utils/budgetLogic';
import { safeCurrency, safeNumber } from '../utils/safeHelpers';
import { generateTripAI } from '../utils/ai';

const CreateTrip = () => {
  const location = useLocation();
  const [mode, setMode] = useState('ai'); // 'manual' or 'ai'
  const [formData, setFormData] = useState({
    source: '',
    destination: location.state?.destination || '',
    description: '',
    startDate: '',
    endDate: '',
    travelType: 'Solo',
    memberCount: 1,
    budget: 'Moderate',
    interests: [],
    coverImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const travelTypes = [
    { id: 'Solo', icon: MapPin },
    { id: 'Friends', icon: Users },
    { id: 'Family', icon: Globe },
    { id: 'Couple', icon: Heart }
  ];

  const interestOptions = [
    { id: 'Adventure', icon: Dumbbell },
    { id: 'Food', icon: Coffee },
    { id: 'Nature', icon: TreePine },
    { id: 'Shopping', icon: ShoppingBag },
    { id: 'Relaxation', icon: Heart },
    { id: 'Photography', icon: Camera }
  ];

  const budgetOptions = ['Budget', 'Moderate', 'Luxury'];

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const budgetInfo = calculateTripBudget(
    formData.startDate, 
    formData.endDate, 
    formData.memberCount, 
    formData.budget
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('You must be logged in');
    
    // Strict Validation
    if (!formData.source.trim()) return toast.error('Please enter a source city');
    if (!formData.destination.trim()) return toast.error('Please enter a destination');
    if (!formData.startDate) return toast.error('Please select a start date');
    if (!formData.endDate) return toast.error('Please select an end date');
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) return toast.error('End date cannot be before start date');

    setLoading(true);
    const loadingToast = toast.loading(mode === 'ai' ? 'Consulting Gemini AI for your perfect trip...' : 'Mapping your adventure...');
    
    try {
      let finalData = { ...formData };
      
      if (mode === 'ai') {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        const aiResponse = await generateTripAI({
          source: formData.source,
          destination: formData.destination,
          days,
          travelType: formData.travelType,
          interests: formData.interests,
          budget: formData.budget,
          memberCount: formData.memberCount
        });
        
        if (aiResponse.isLocalFallback) {
          toast.dismiss(loadingToast);
          toast('AI server busy. Using smart local planner instead.', {
            icon: '🤖',
            style: {
              borderRadius: '16px',
              background: '#0ea5e9',
              color: '#fff',
              fontWeight: 'bold'
            }
          });
        }
        
        finalData = {
          ...finalData,
          aiGenerated: true,
          ...aiResponse
        };
      }

      await addDoc(collection(db, "trips"), {
        ...finalData,
        ...budgetInfo,
        budget: {
          perPerson: budgetInfo.perMemberPerDay,
          hotels: budgetInfo.hotelCost,
          food: budgetInfo.foodCost,
          travel: budgetInfo.transportCost,
          activities: budgetInfo.activityCost,
          total: budgetInfo.totalBudget
        },
        userId: user.uid,
        createdAt: new Date().toISOString(),
        status: 'upcoming'
      });
      
      toast.success('Adventure created successfully!', { id: !finalData.isLocalFallback ? loadingToast : undefined });
      navigate('/trips');
    } catch (error) {
      console.error("Error creating trip:", error);
      toast.error(error.message || 'Error creating trip', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  // Render functions for better organization and to fix React component rendering issues
  const renderMemberSelector = () => (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 glass border-white/5 bg-white/2 rounded-3xl space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-bold">Number of Members</p>
          <p className="text-xs text-slate-400">
            {formData.travelType === 'Couple' ? 'Members locked for Couple Trip' : 'Specify total travelers in your group'}
          </p>
        </div>
        
        {formData.travelType === 'Couple' ? (
          <div className="px-5 py-2.5 bg-primary-500/20 border border-primary-500/30 rounded-2xl">
            <span className="text-sm font-black text-primary-400 uppercase tracking-widest">2 Members (Couple)</span>
          </div>
        ) : (
          <div className="flex items-center gap-6 bg-white/5 p-2 rounded-2xl border border-white/10">
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, memberCount: Math.max(1, prev.memberCount - 1) }))}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-all active:scale-90"
            >
              -
            </button>
            <span className="text-xl font-black text-white w-4 text-center">{formData.memberCount}</span>
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, memberCount: prev.memberCount + 1 }))}
              className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center hover:bg-primary-400 text-white transition-all shadow-lg shadow-primary-500/20 active:scale-90"
            >
              +
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderBudgetEstimator = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-wider">Budget Strategy</label>
        <div className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full">
          <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Live Estimation</span>
        </div>
      </div>
      
      <div className="flex bg-white/5 p-1.5 rounded-[2rem] border border-white/10">
        {budgetOptions.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setFormData({...formData, budget: level})}
            className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${formData.budget === level ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="glass p-6 border-white/5 space-y-4">
            <div className="flex justify-between items-center">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Per Person</p>
               <p className="text-lg font-black text-white">{safeCurrency(budgetInfo?.perMemberPerDay)}/day</p>
            </div>
            <div className="flex justify-between items-center">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration & Group</p>
               <p className="text-sm font-black text-white">{safeNumber(budgetInfo?.tripDays, 1)} Days • {safeNumber(formData?.memberCount, 1)} Members</p>
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
               <p className="text-xs font-black text-primary-400 uppercase tracking-widest">Estimated Total</p>
               <p className="text-2xl font-black text-white">{safeCurrency(budgetInfo?.totalBudget)}</p>
            </div>
         </div>
         
         <div className="glass p-6 border-white/5 flex flex-col justify-center gap-3">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Travel</span>
               </div>
               <span className="text-xs font-black text-white">{safeCurrency(budgetInfo?.transportCost)}</span>
            </div>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Hotels</span>
               </div>
               <span className="text-xs font-black text-white">{safeCurrency(budgetInfo?.hotelCost)}</span>
            </div>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Food</span>
               </div>
               <span className="text-xs font-black text-white">{safeCurrency(budgetInfo?.foodCost)}</span>
            </div>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Activities</span>
               </div>
               <span className="text-xs font-black text-white">{safeCurrency(budgetInfo?.activityCost)}</span>
            </div>
         </div>
      </div>
    </div>
  );

  const renderInterestSelector = () => (
    <div className="space-y-4">
      <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-wider">Select Interests</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {interestOptions.map((interest) => (
          <button
            key={interest.id}
            type="button"
            onClick={() => toggleInterest(interest.id)}
            className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${formData.interests.includes(interest.id) ? 'bg-primary-500/10 border-primary-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.1)]' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'}`}
          >
            <interest.icon size={18} />
            <span className="text-xs font-bold">{interest.id}</span>
          </button>
        ))}
      </div>
    </div>
  );

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
          <p className="text-slate-400 text-lg font-medium">Choose between manual planning or let our AI engine build it for you.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setMode('ai')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${mode === 'ai' ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Zap size={14} /> AI Mode
          </button>
          <button 
            onClick={() => setMode('manual')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${mode === 'manual' ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Map size={14} /> Manual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass p-10 space-y-10 border-white/5">
            {/* Common Fields */}
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-wider">Trip Title</label>
                <div className="relative group">
                  <Map className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={formData?.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-glass pl-14"
                    placeholder="e.g. Summer in Italy"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-wider">Source City</label>
                  <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input 
                      type="text" 
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="input-glass pl-14"
                      placeholder="e.g. Mumbai, Delhi"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-wider">Destination</label>
                  <div className="relative group">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
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
            </div>

            <AnimatePresence mode="wait">
              {mode === 'ai' ? (
                <motion.div 
                  key="ai-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-10"
                >
                  <div className="space-y-6">
                    <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-wider">Who's traveling?</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {travelTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({
                            ...formData, 
                            travelType: type.id,
                            memberCount: type.id === 'Solo' ? 1 : type.id === 'Couple' ? 2 : formData.memberCount
                          })}
                          className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${formData.travelType === type.id ? 'bg-primary-500/10 border-primary-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'}`}
                        >
                          <type.icon size={20} />
                          <span className="text-xs font-bold">{type.id}</span>
                        </button>
                      ))}
                    </div>

                    {formData.travelType !== 'Solo' && renderMemberSelector()}
                  </div>

                  {renderInterestSelector()}

                  {renderBudgetEstimator()}
                </motion.div>
              ) : (
                <motion.div 
                  key="manual-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-wider">Adventure Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="input-glass h-40 resize-none py-5"
                    placeholder="What are you most excited about exploring on this trip?"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl font-extrabold hover:shadow-[0_10px_30px_rgba(14,165,233,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {mode === 'ai' ? <Zap size={24} className="animate-pulse" /> : <Save size={24} />}
              <span className="text-lg">{loading ? 'Processing Adventure...' : mode === 'ai' ? 'Generate AI Itinerary' : 'Save Adventure'}</span>
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
                 {mode === 'ai' ? 'AI Magic ✨' : 'Pro Tip 💡'}
               </h3>
               <p className="text-slate-300 font-medium leading-relaxed">
                 {mode === 'ai' 
                   ? "Our Gemini engine will analyze your interests and destination to craft a day-by-day masterpiece, including costs and food spots."
                   : "Adding a clear destination and dates helps our Traveloop engine find the most exclusive hidden gems for your specific timeframe!"}
               </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
