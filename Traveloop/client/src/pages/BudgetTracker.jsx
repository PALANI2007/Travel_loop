import { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const BudgetTracker = () => {
  const data = [
    { name: 'Transport', value: 450, color: '#3b82f6' },
    { name: 'Hotels', value: 800, color: '#10b981' },
    { name: 'Activities', value: 300, color: '#f59e0b' },
    { name: 'Food', value: 500, color: '#ef4444' },
  ];

  const barData = [
    { name: 'Bali', spent: 1200, budget: 1500 },
    { name: 'Tokyo', spent: 2100, budget: 2000 },
    { name: 'Paris', spent: 800, budget: 1200 },
  ];

  const totalSpent = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-4xl font-bold">Budget Analytics</h1>
        <p className="text-slate-500 mt-2">Track your spending across all your adventures.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-slate-900 text-white border-none shadow-xl">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/10 rounded-lg text-white">
                 <DollarSign size={20} />
              </div>
              <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">+12% vs last trip</span>
           </div>
           <p className="text-slate-400 text-sm font-medium">Total Spent</p>
           <h2 className="text-3xl font-bold mt-1">₹{totalSpent.toLocaleString()}</h2>
        </div>

        <div className="card p-6">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                 <TrendingUp size={20} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">On Track</span>
           </div>
           <p className="text-slate-500 text-sm font-medium">Avg. Daily Spend</p>
           <h2 className="text-3xl font-bold mt-1">₹8,450.00</h2>
        </div>

        <div className="card p-6 border-red-100 bg-red-50/30">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                 <AlertTriangle size={20} />
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">Over Budget</span>
           </div>
           <p className="text-red-900/60 text-sm font-medium">Tokyo Adventure</p>
           <h2 className="text-3xl font-bold mt-1 text-red-600">+₹10,500</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="card p-8">
          <h3 className="text-xl font-bold mb-8">Category Breakdown</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trip Comparison */}
        <div className="card p-8">
          <h3 className="text-xl font-bold mb-8">Trip Comparison</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar dataKey="spent" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Spent" />
                <Bar dataKey="budget" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Budget" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
           <h3 className="text-xl font-bold">Recent Expenses</h3>
           <button className="text-sm font-bold text-primary-600 hover:underline">View History</button>
        </div>
        <div className="divide-y divide-slate-100">
           {[
             { name: 'Sushizanmai Tokyo', cat: 'Food', amount: -4500, date: 'May 08', up: false },
             { name: 'Hotel Refund', cat: 'Hotel', amount: 12000, date: 'May 07', up: true },
             { name: 'JR Rail Pass', cat: 'Transport', amount: -28000, date: 'May 06', up: false },
             { name: 'Street Food Tour', cat: 'Activities', amount: -6000, date: 'May 05', up: false },
           ].map((item, idx) => (
             <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-xl ${item.up ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                      {item.up ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                   </div>
                   <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.cat} • {item.date}</p>
                   </div>
                </div>
                <p className={`font-bold ${item.up ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {item.up ? '+' : '-'}₹{Math.abs(item.amount).toLocaleString()}
                </p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;
