import { motion } from 'framer-motion';
import { Users, Map, Globe, Activity, TrendingUp, ArrowUpRight } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Admin Console</h1>
        <p className="text-slate-500 mt-2">Platform-wide analytics and management.</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Total Users', value: '12,450', icon: <Users />, color: 'bg-blue-50 text-blue-600' },
           { label: 'Trips Created', value: '45,820', icon: <Map />, color: 'bg-emerald-50 text-emerald-600' },
           { label: 'Active Sessions', value: '1,240', icon: <Activity />, color: 'bg-rose-50 text-rose-600' },
           { label: 'Global Reach', value: '142', icon: <Globe />, color: 'bg-amber-50 text-amber-600' },
         ].map((stat, idx) => (
           <div key={idx} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                 <div className={`p-3 rounded-2xl ${stat.color}`}>
                    {stat.icon}
                 </div>
                 <span className="text-xs font-bold text-emerald-600">+8.2%</span>
              </div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h2 className="text-3xl font-bold mt-1">{stat.value}</h2>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* User Growth Chart */}
         <div className="card p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold">User Acquisition</h3>
               <select className="bg-slate-50 border-none rounded-lg text-sm font-bold p-2 outline-none">
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
                     <XAxis dataKey="month" axisLine={false} tickLine={false} />
                     <YAxis axisLine={false} tickLine={false} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                     />
                     <Area type="monotone" dataKey="users" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Popular Destinations Table */}
         <div className="card overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
               <h3 className="text-xl font-bold">Popular Destinations</h3>
               <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-primary-600 transition-colors">
                  <TrendingUp size={20} />
               </button>
            </div>
            <div className="p-4">
               <table className="w-full">
                  <thead>
                     <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-4 py-3">Destination</th>
                        <th className="px-4 py-3">Planners</th>
                        <th className="px-4 py-3">Growth</th>
                        <th className="px-4 py-3"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {popularDestinations.map((dest, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="px-4 py-4 font-bold">{dest.name}</td>
                           <td className="px-4 py-4 text-slate-500 font-medium">{dest.count}k users</td>
                           <td className="px-4 py-4">
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg text-xs">
                                 {dest.growth} <ArrowUpRight size={12} />
                              </span>
                           </td>
                           <td className="px-4 py-4 text-right">
                              <button className="text-slate-300 group-hover:text-primary-600 transition-colors">Details</button>
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
