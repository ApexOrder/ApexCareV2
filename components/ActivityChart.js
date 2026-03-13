import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 text-white p-3 rounded-lg shadow-lg border border-slate-700">
        <p className="font-bold text-sm mb-2">{`${label}'s Activity`}</p>
        <p className="text-xs text-blue-300">{`Visits: ${payload[0].value}`}</p>
        <p className="text-xs text-emerald-300">{`Notes: ${payload[1].value}`}</p>
        <p className="text-xs text-amber-300">{`Tasks: ${payload[2].value}`}</p>
      </div>
    );
  }

  return null;
};

const ActivityChart = () => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/activity-data');
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error("Failed to fetch activity data:", error);
        // Optionally set some error state to show in the UI
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8" style={{ borderTop: '6px solid #8b5cf6' }}>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Recent Activity</h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Last 7 Days</p>
            </div>
        </div>
        <div style={{ width: '100%', height: 300 }}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500 font-semibold">Loading Activity Data...</p>
              </div>
            ) : (
              <ResponsiveContainer>
                  <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                      <defs>
                          <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                          <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                          <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                      <Area type="monotone" dataKey="visits" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={2} />
                      <Area type="monotone" dataKey="notes" stroke="#10b981" fillOpacity={1} fill="url(#colorNotes)" strokeWidth={2} />
                      <Area type="monotone" dataKey="tasks" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTasks)" strokeWidth={2} />
                  </AreaChart>
              </ResponsiveContainer>
            )}
        </div>
    </div>
  );
};

export default ActivityChart;