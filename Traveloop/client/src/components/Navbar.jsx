import { Bell, Search, User, Menu, Plane } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, userData } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-20 glass border-b border-white/5 z-40 lg:ml-72 flex items-center justify-between px-8">
      {/* Mobile Menu Button */}
      <button className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
        <Menu size={24} />
      </button>

      {/* Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md relative group">
        <Search className="absolute left-4 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Search for destinations, trips..." 
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-12 pr-4 outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm"
        />
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
          className="flex items-center gap-3 pl-3 pr-1.5 py-1.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group"
        >
          <div className="hidden sm:block text-right">
            <p className="text-sm font-black text-white leading-tight tracking-tight">
              {userData?.name || user?.displayName || 'Traveler'}
            </p>
            <p className="text-[10px] text-primary-400 font-black uppercase tracking-[0.1em] opacity-90 mt-0.5">
              Explorer
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
