import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { User, Mail, Globe, Shield, Camera, Save, Milestone, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db, storage } from '../utils/firebase';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { safeNumber, safeString, safeArray } from '../utils/safeHelpers';

const UserProfile = () => {
  const { user, userData, loading: authLoading } = useAuth();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({ trips: 0, cities: 0, km: 0 });
  const [formData, setFormData] = useState({
    name: safeString(userData?.name || user?.displayName, 'Voyager'),
    email: safeString(user?.email, ''),
    language: safeString(userData?.language, 'English'),
    privacy: safeString(userData?.privacy, 'Public Profile')
  });

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (userData && !hasInitialized.current) {
      setFormData({
        name: userData.name || '',
        email: user?.email || '',
        language: userData.language || 'English',
        privacy: userData.privacy || 'Public Profile'
      });
      hasInitialized.current = true;
    }
  }, [userData, user]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "trips"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const trips = safeArray(querySnapshot.docs.map(doc => doc.data()));
        const uniqueCities = new Set(trips.map(t => t?.destination).filter(Boolean)).size;
        
        setStats({
          trips: safeNumber(trips.length),
          cities: safeNumber(uniqueCities),
          km: safeNumber(uniqueCities) * 1240 
        });
      } catch {
        console.error("Error fetching profile stats");
      }
    };
    fetchStats();
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Image size must be less than 2MB');
    }

    setUploading(true);
    const loadingToast = toast.loading('Uploading your new look...');

    try {
      const storageRef = ref(storage, `users/${user.uid}/profileImage`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        avatar: downloadURL
      }, { merge: true });

      toast.success('Profile image updated!', { id: loadingToast });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error('Failed to upload image', { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        name: formData.name,
        language: formData.language,
        privacy: formData.privacy,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  if (authLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium animate-pulse">Syncing your profile...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-fade-in">
      <div className="px-2">
        <h1 className="text-5xl font-black text-white tracking-tight">Profile <span className="text-gradient">Hub</span></h1>
        <p className="text-slate-400 font-medium mt-2">Personalize your global identity and track your milestones.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-10 flex flex-col items-center text-center border-white/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-accent-500"></div>
          
          <div className="relative">
            <div className="w-36 h-36 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-primary-400 overflow-hidden border-2 border-white/10 shadow-2xl group-hover:border-primary-500/50 transition-all duration-500">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={32} className="animate-spin text-primary-500" />
                  <span className="text-[10px] font-black uppercase text-primary-500">Uploading</span>
                </div>
              ) : userData?.avatar || user?.photoURL ? (
                <img src={userData?.avatar || user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={64} strokeWidth={1.5} />
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 p-3 bg-primary-500 text-white rounded-2xl hover:bg-primary-400 transition-all shadow-xl hover:scale-110 active:scale-95 disabled:opacity-50"
            >
               <Camera size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*"
            />
          </div>

          <h3 className="text-3xl font-black text-white mt-8 tracking-tight">{safeString(formData?.name, 'Voyager')}</h3>
          <p className="text-primary-400 font-bold text-sm tracking-widest uppercase mt-1 opacity-80">{safeString(userData?.role, 'Explorer')}</p>
          <p className="text-slate-400 text-sm mt-4 font-medium px-4 bg-white/5 py-1.5 rounded-full border border-white/5">{safeString(formData?.email, 'Not provided')}</p>
          
          <div className="mt-10 w-full pt-10 border-t border-white/5 grid grid-cols-3 gap-4">
             <div className="space-y-1">
                <p className="text-2xl font-black text-white leading-none">{safeNumber(stats?.trips)}</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Trips</p>
             </div>
             <div className="space-y-1 border-x border-white/5">
                <p className="text-2xl font-black text-white leading-none">{safeNumber(stats?.cities)}</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Cities</p>
             </div>
             <div className="space-y-1">
                <p className="text-2xl font-black text-white leading-none">
                  {safeNumber(stats?.km) >= 1000 ? (safeNumber(stats?.km) / 1000).toFixed(1) + 'K' : safeNumber(stats?.km)}
                </p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">KM</p>
             </div>
          </div>
        </motion.div>

        {/* Settings Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
           <form onSubmit={handleSave} className="glass p-10 space-y-10 border-white/5 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 ml-1 flex items-center gap-2 uppercase tracking-widest">
                       <User size={12} className="text-primary-500" /> Full Name
                    </label>
                    <input 
                       type="text" 
                       value={formData.name}
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                       className="input-glass"
                       placeholder="Enter your name"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 ml-1 flex items-center gap-2 uppercase tracking-widest">
                       <Mail size={12} className="text-primary-500" /> Email Address
                    </label>
                    <input 
                       type="email" 
                       value={formData.email}
                       disabled
                       className="input-glass opacity-50 cursor-not-allowed"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 ml-1 flex items-center gap-2 uppercase tracking-widest">
                       <Globe size={12} className="text-primary-500" /> Language
                    </label>
                    <select 
                       value={formData.language}
                       onChange={(e) => setFormData({...formData, language: e.target.value})}
                       className="input-glass appearance-none cursor-pointer"
                    >
                       <option className="bg-slate-900">English</option>
                       <option className="bg-slate-900">Spanish</option>
                       <option className="bg-slate-900">French</option>
                       <option className="bg-slate-900">German</option>
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 ml-1 flex items-center gap-2 uppercase tracking-widest">
                       <Shield size={12} className="text-primary-500" /> Privacy Mode
                    </label>
                    <select 
                      value={formData.privacy}
                      onChange={(e) => setFormData({...formData, privacy: e.target.value})}
                      className="input-glass appearance-none cursor-pointer"
                    >
                       <option className="bg-slate-900">Public Profile</option>
                       <option className="bg-slate-900">Private</option>
                    </select>
                 </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-4 text-slate-500">
                    <Milestone size={24} className="opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Data Secure & Encrypted</span>
                 </div>
                 <button className="btn-primary flex items-center gap-2 px-10 py-4 shadow-lg shadow-primary-500/20 active:scale-95 transition-all">
                    <Save size={20} />
                    Update Profile
                 </button>
              </div>
           </form>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
