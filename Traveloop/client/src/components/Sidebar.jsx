import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  PlusCircle, 
  Wallet, 
  CheckSquare, 
  User, 
  Settings, 
  Shield, 
  LogOut,
  Plane
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { logout } = useAuth();

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/trips', icon: Map, label: 'My Trips' },
    { to: '/trips/new', icon: PlusCircle, label: 'Plan New Trip' },
    { to: '/budget', icon: Wallet, label: 'Budget' },
    { to: '/checklist', icon: CheckSquare, label: 'Checklist' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 glass border-r border-white/5 z-50 hidden lg:flex flex-col p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Plane className="text-white transform -rotate-45" size={24} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">Traveloop</span>
      </div>

      <nav className="flex-1 space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `nav-link group ${isActive ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : ''}`
            }
          >
            <link.icon size={20} className="group-hover:scale-110 transition-transform" />
            <span>{link.label}</span>
          </NavLink>
        ))}
        
        <div className="pt-8 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Account</div>
        <NavLink
          to="/settings"
          className={({ isActive }) => 
            `nav-link group ${isActive ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : ''}`
          }
        >
          <User size={20} className="group-hover:scale-110 transition-transform" />
          <span>Profile</span>
        </NavLink>
        <NavLink
          to="/admin"
          className={({ isActive }) => 
            `nav-link group ${isActive ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : ''}`
          }
        >
          <Shield size={20} className="group-hover:scale-110 transition-transform" />
          <span>Admin</span>
        </NavLink>
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-accent-500/10 hover:text-accent-400 transition-all font-medium group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
