import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';
import { motion } from 'framer-motion';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-primary-500/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-600/5 blur-[120px] rounded-full" />
      </div>

      <Sidebar />
      
      <div className="flex flex-col min-h-screen relative">
        <Navbar />
        <main className="lg:ml-72 flex-1 p-4 md:p-8 lg:p-10 pt-24 lg:pt-24 overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      <Chatbot />
    </div>
  );
};

export default MainLayout;
