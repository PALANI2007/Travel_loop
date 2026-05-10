import { motion } from 'framer-motion';
import { Users, Map, Globe, Activity, TrendingUp, ArrowUpRight, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  CartesianGrid
} from 'recharts';

const AdminDashboard = () => {
  const growthData = [
    { month: 'Jan', users: 400, trips: 240 },
    { month: 'Feb', users: 600, trips: 350 },
    { month: 'Mar', users: 900, trips: 580 },
    { month: 'Apr', users: 1500, trips: 920 },
    { month: 'May', users: 2400, trips: 1600 },
  ];

  const popularDestinations = [
    { name: 'Paris', count: 120, growth: '+15%' },
    { name: 'Bali', count: 95, growth: '+24%' },
    { name: 'Tokyo', count: 88, growth: '+10%' },
    { name: 'Rome', count: 76, growth: '+5%' },
  ];

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      <div>
        <h1 className="text-5xl font-black text-white tracking-tight mb-2">Admin <span className="text-gradient">Intelligence</span></h1>
        <p className="text-slate-400 font-medium">Monitoring Traveloop's global growth and user engagement.</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Total Users', value: '12,450', icon: <Users size={20} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
           { label: 'Trips Created', value: '45,820', icon: <Map size={20} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
           { label: 'Active Sessions', value: '1,240', icon: <Activity size={20} />, color: 'text-rose-400', bg: 'bg-rose-500/10' },
           { label: 'Global Reach', value: '142', icon: <Globe size={20} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
         ].map((stat, idx) => (
           <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-6 border-white/5 relative overflow-hidden group"
           >
              <div className="flex items-center justify-between mb-6">
                 <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                 </div>
                 <div className="flex items-center gap-1 text-emerald-400 font-black text-xs">
                   <TrendingUp size={12} />
                   +8.2%
                 </div>
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h2 className="text-3xl font-black text-white">{stat.value}</h2>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* User Growth Chart */}
         <div className="glass p-8 border-white/5">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-3">
                 <BarChart3 className="text-primary-400" size={20} />
                 <h3 className="text-xl font-black text-white tracking-tight">User Acquisition</h3>
               </div>
               <select className="bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest p-2 px-4 text-white outline-none focus:border-primary-500/50">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
               </select>
            </div>
            <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                     <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                     <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}}
                     />
                     <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}}
                     />
                     <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                        itemStyle={{ color: '#fff' }}
                     />
                     <Area type="monotone" dataKey="users" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Popular Destinations Table */}
         <div className="glass overflow-hidden border-white/5">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <PieChartIcon className="text-primary-400" size={20} />
                 <h3 className="text-xl font-black text-white tracking-tight">Popular Destinations</h3>
               </div>
               <button className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-primary-400 transition-colors border border-white/5">
                  <TrendingUp size={20} />
               </button>
            </div>
            <div className="p-4">
               <table className="w-full">
                  <thead>
                     <tr className="text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        <th className="px-6 py-4">Destination</th>
                        <th className="px-6 py-4">Planners</th>
                        <th className="px-6 py-4">Growth</th>
                        <th className="px-6 py-4"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {popularDestinations.map((dest, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                           <td className="px-6 py-5">
                             <div className="font-bold text-white group-hover:text-primary-400 transition-colors">{dest.name}</div>
                           </td>
                           <td className="px-6 py-5 text-slate-400 font-medium text-sm">{dest.count}k users</td>
                           <td className="px-6 py-5">
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-black bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                                 {dest.growth} <ArrowUpRight size={12} />
                              </span>
                           </td>
                           <td className="px-6 py-5 text-right">
                              <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Details</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
