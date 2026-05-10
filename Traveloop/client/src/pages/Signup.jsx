import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, Plane, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../utils/firebase';
import { doc, setDoc } from 'firebase/firestore';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculateStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for missing config
    if (import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY') {
      console.warn('Firebase API Key is still set to placeholder!');
      return toast.error('Firebase not configured. Please add your API keys to the .env file.');
    }

    if (!formData.name || !formData.email || !formData.password) {
      return toast.error('Please fill in all required fields');
    }
    if (formData.password.length < 6) {
      return toast.error('Password should be at least 6 characters');
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setIsLoading(true);
    const loadingToast = toast.loading('Creating your explorer profile...');
    
    try {
      console.log('Attempting signup for:', formData.email);
      const userCredential = await signup(formData.email, formData.password);
      const user = userCredential.user;
      
      // Save user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        createdAt: new Date().toISOString(),
        role: 'user'
      });

      console.log('Signup and Firestore profile creation successful:', user.uid);
      toast.success('Account created successfully!', { id: loadingToast });
      navigate('/dashboard');
    } catch (error) {
      console.error('FULL SIGNUP ERROR:', error);
      let message;
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered.';
      } else if (error.code === 'auth/weak-password') {
        message = 'The password is too weak.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address format.';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Email/Password auth is not enabled in Firebase Console.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Check your internet connection.';
      } else {
        message = `Error: ${error.message}`;
      }
      
      toast.error(message, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#020617] overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20 bg-[#020617] relative">
        <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-primary-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-accent-600/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-8 text-center lg:text-left">
            <div className="inline-flex items-center justify-center lg:hidden w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-500 mb-4">
              <Plane size={28} className="transform -rotate-45" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Create Account</h2>
            <p className="text-slate-400 font-medium">Join 50k+ explorers planning their next trip</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors pointer-events-none">
                  <User size={20} />
                </div>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-glass pl-16"
                  placeholder="Marco Polo"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors pointer-events-none">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-glass pl-16"
                  placeholder="marco@explorer.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors pointer-events-none">
                    <Lock size={20} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({...formData, password: e.target.value});
                      calculateStrength(e.target.value);
                    }}
                    className="input-glass pl-16 pr-10 py-3"
                    placeholder="••••••••"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Confirm</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors pointer-events-none">
                    <ShieldCheck size={20} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="input-glass pl-16 py-3"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Strength Meter */}
            {formData.password && (
              <div className="px-1 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-500">Security Strength</span>
                  <span className={passwordStrength <= 1 ? 'text-red-400' : passwordStrength <= 3 ? 'text-yellow-400' : 'text-green-400'}>
                    {passwordStrength <= 1 ? 'Weak' : passwordStrength <= 3 ? 'Medium' : 'Strong'}
                  </span>
                </div>
                <div className="flex gap-1 h-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div 
                      key={step} 
                      className={`flex-1 rounded-full transition-all duration-500 ${
                        step <= passwordStrength 
                          ? (passwordStrength <= 1 ? 'bg-red-500' : passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500')
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl font-extrabold hover:shadow-[0_10px_25px_rgba(14,165,233,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:scale-100 group mt-4"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Explorer Profile</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 font-medium">
              Already in the loop? {' '}
              <Link to="/login" className="text-white hover:text-primary-400 font-bold transition-colors underline decoration-primary-500/40 underline-offset-4 decoration-2">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Cinematic Content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute inset-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80" 
            alt="Mountain background" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-l from-[#020617]/95 via-[#020617]/50 to-transparent" />
        
        <div className="relative z-10 p-16 flex flex-col justify-center items-end w-full h-full text-right">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Adventure <br />
              <span className="text-gradient">Awaits</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-sm mb-8 leading-relaxed font-medium">
              Join Traveloop today and start organizing your global journeys with our AI-powered tools.
            </p>
            <div className="flex gap-4 justify-end">
              <div className="glass-light p-5 rounded-2xl border-white/5">
                <ShieldCheck className="text-primary-400 mb-2 ml-auto" size={28} />
                <p className="text-xs font-bold text-white uppercase tracking-wider">Safe & Secure</p>
              </div>
              <div className="glass-light p-5 rounded-2xl border-white/5">
                <Plane className="text-primary-400 mb-2 ml-auto" size={28} />
                <p className="text-xs font-bold text-white uppercase tracking-wider">Fast Planning</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
