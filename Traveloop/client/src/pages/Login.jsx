import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Plane, ArrowRight, Globe, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please fill in all fields');
    }
    
    setIsLoading(true);
    const loadingToast = toast.loading('Authenticating...');
    
    try {
      await login(email, password);
      toast.success('Welcome back, Voyager!', { id: loadingToast });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      let message = 'Failed to sign in. Please check your credentials.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Account temporarily disabled due to many failed attempts. Try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your connection.';
      } else if (error.message.includes('API_KEY_INVALID')) {
        message = 'Firebase API Key is missing or invalid. Check your setup.';
      }
      
      toast.error(message, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#020617] overflow-hidden">
      {/* Left Side - Cinematic Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" 
            alt="Beach background" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/95 via-[#020617]/50 to-transparent" />
        
        {/* Content on Image */}
        <div className="relative z-10 p-16 flex flex-col justify-between w-full h-full">
          <div>
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3 mb-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Plane className="text-white transform -rotate-45" size={28} />
              </div>
              <span className="text-3xl font-extrabold tracking-tight text-white">Traveloop</span>
            </motion.div>
          </div>

          <div className="max-w-md">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                Unlock the <br />
                <span className="text-gradient">Unknown</span>
              </h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed font-medium">
                "The world is a book and those who do not travel read only one page."
              </p>
              
              <div className="flex gap-10">
                {[
                  { icon: Globe, label: '195+ Countries' },
                  { icon: MapPin, label: 'Unique Guides' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-slate-300">
                    <item.icon size={20} className="text-primary-400" />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          
          <div className="text-slate-500 text-sm font-medium tracking-wide uppercase">
            © 2026 TRAVELOOP GLOBAL
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20 bg-[#020617] relative">
        {/* Glow Effects */}
        <div className="absolute top-1/4 right-0 w-[50%] h-[50%] bg-primary-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[50%] h-[50%] bg-accent-600/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-10 lg:hidden text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-500 mb-4">
              <Plane size={28} className="transform -rotate-45" />
            </div>
            <h1 className="text-3xl font-bold text-white">Traveloop</h1>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400 font-medium">Sign in to manage your next adventure</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors pointer-events-none">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-glass pl-16"
                  placeholder="explorer@traveloop.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-slate-300">Password</label>
                <Link to="/forgot-password" core="true" className="text-xs text-primary-400 hover:text-primary-300 transition-colors font-bold">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors pointer-events-none">
                  <Lock size={20} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-glass pl-16 pr-14"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl font-extrabold hover:shadow-[0_10px_25px_rgba(14,165,233,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:scale-100 group mt-8"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Begin Journey</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-slate-400 font-medium">
              Don't have an explorer account? {' '}
              <Link to="/signup" className="text-white hover:text-primary-400 font-bold transition-colors underline decoration-primary-500/40 underline-offset-4 decoration-2">
                Join the Loop
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
