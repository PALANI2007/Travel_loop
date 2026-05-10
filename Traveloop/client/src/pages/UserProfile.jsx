import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Globe, Shield, Camera, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../utils/firebase';
import { doc, setDoc } from 'firebase/firestore';

const UserProfile = () => {
  const { user, userData } = useAuth();
  const [formData, setFormData] = useState({
    name: userData?.name || user?.displayName || '',
    email: user?.email || '',
    language: 'English',
    theme: 'Dark'
  });

  useEffect(() => {
    if (userData) {
      setFormData(prev => ({ ...prev, name: userData.name }));
    }
  }, [userData]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        name: formData.name,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Profile Settings</h1>
        <p className="text-slate-500 mt-2">Manage your account and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="card p-8 flex flex-col items-center text-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 overflow-hidden border-4 border-white shadow-xl">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={60} />
              )}
            </div>
            <button className="absolute bottom-1 right-1 p-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-lg">
               <Camera size={16} />
            </button>
          </div>
          <h3 className="text-2xl font-bold mt-6">{formData.name || 'Explorer'}</h3>
          <p className="text-slate-500">{formData.email}</p>
          <div className="mt-6 w-full pt-6 border-t border-slate-100 flex justify-around">
             <div>
                <p className="text-xl font-bold">24</p>
                <p className="text-xs text-slate-400 font-bold uppercase">Trips</p>
             </div>
             <div>
                <p className="text-xl font-bold">12</p>
                <p className="text-xs text-slate-400 font-bold uppercase">Cities</p>
             </div>
             <div>
                <p className="text-xl font-bold">4.8k</p>
                <p className="text-xs text-slate-400 font-bold uppercase">Miles</p>
             </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2">
           <form onSubmit={handleSave} className="card p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                       <User size={14} /> Full Name
                    </label>
                    <input 
                       type="text" 
                       value={formData.name}
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                       className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                       <Mail size={14} /> Email Address
                    </label>
                    <input 
                       type="email" 
                       value={formData.email}
                       disabled
                       className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-slate-400 cursor-not-allowed"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                       <Globe size={14} /> Language
                    </label>
                    <select 
                       value={formData.language}
                       onChange={(e) => setFormData({...formData, language: e.target.value})}
                       className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                    >
                       <option>English</option>
                       <option>Spanish</option>
                       <option>French</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                       <Shield size={14} /> Privacy
                    </label>
                    <select className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 transition-all outline-none">
                       <option>Public Profile</option>
                       <option>Private</option>
                    </select>
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                 <button className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    Save Changes
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
