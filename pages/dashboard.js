import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LayoutDashboard, User, LogOut, Users, Calendar, CreditCard, BarChart3, Pill, Layers, ArrowRight } from 'lucide-react';

import ThemeToggle from '../components/ThemeToggle';

const initialModules = [
  { id: 1, name: 'Service User Management', icon: Users, description: 'Manage service user records and history.', href: '/patient-management', color: '#3b82f6', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { id: 2, name: 'Scheduling', icon: Calendar, description: 'Schedule appointments and visits.', href: '#', color: '#10b981', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { id: 3, name: 'Billing', icon: CreditCard, description: 'Invoicing and payment processing.', href: '#', color: '#8b5cf6', bg: 'bg-violet-50', iconColor: 'text-violet-600' },
  { id: 4, name: 'Reports', icon: BarChart3, description: 'View analytics and performance reports.', href: '#', color: '#f59e0b', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { id: 5, name: 'Medication Tracker', icon: Pill, description: 'Track service user medications and schedules.', href: '/medication-tracker', color: '#14b8a6', bg: 'bg-teal-50', iconColor: 'text-teal-600' },
  { id: 6, name: 'Group Management', icon: Layers, description: 'Create and manage service user groups and staff allocation.', href: '/group-management', color: '#6366f1', bg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
];

export default function Dashboard() {
  const [modules, setModules] = useState(initialModules);

  useEffect(() => {
    const savedSettings = localStorage.getItem('module-settings');
    if (savedSettings) {
      try {
        const savedModules = JSON.parse(savedSettings);
        const initialMap = new Map(initialModules.map(m => [m.id, m]));
        const newModules = [];
        const seenIds = new Set();

        savedModules.forEach(saved => {
          const initial = initialMap.get(saved.id);
          if (initial) {
            newModules.push({ ...initial, color: saved.color });
            seenIds.add(saved.id);
          }
        });

        initialModules.forEach(initial => {
          if (!seenIds.has(initial.id)) {
            newModules.push(initial);
          }
        });
        setModules(newModules);
      } catch (e) {
        console.error("Failed to load module settings for dashboard:", e);
      }
    }
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-screen bg-slate-50 dark:bg-slate-950 overflow-y-auto lg:overflow-hidden transition-colors duration-300">
      {/* SPACER */}
      <div className="hidden lg:block w-24 shrink-0 z-[100]"></div>
      
      {/* SIDEBAR */}
      <div className="w-full lg:w-24 group hover:lg:w-72 bg-white dark:bg-slate-900 border-r border-l border-slate-200 dark:border-slate-800 flex flex-col h-auto lg:h-full lg:fixed lg:top-0 lg:left-0 lg:bottom-0 shadow-2xl z-[120] shrink-0 transition-[width] duration-300 ease-in-out overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col items-center transition-all">
           <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg mb-2 shrink-0">
              A
           </div>
           <div className="flex flex-col items-center overflow-hidden transition-all duration-300 lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-24 lg:group-hover:opacity-100">
              <h2 className="text-xl font-black text-slate-900 dark:text-white text-center leading-none mb-1 whitespace-nowrap">ApexCare V2</h2>
           </div>
        </div>
        
        <nav className="flex-1 overflow-x-auto lg:overflow-y-auto p-4 flex flex-row lg:flex-col gap-2 lg:gap-0 lg:space-y-2 scrollbar-hide">
          {/* Dashboard Link (Active) */}
          <Link href="/dashboard" className="group/btn w-auto lg:w-full flex items-center lg:justify-start gap-2 lg:gap-4 px-4 lg:px-5 py-2 lg:py-3 text-sm font-bold rounded-2xl transition-all whitespace-nowrap overflow-hidden bg-blue-600 text-white border-b-4 border-blue-800 dark:border-blue-900 active:scale-95">
            <span className="shrink-0 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-6"><LayoutDashboard size={20} /></span>
            <span className="truncate transition-all duration-300 lg:opacity-0 lg:-translate-x-2 lg:group-hover:opacity-100 lg:group-hover:translate-x-0">Dashboard</span>
          </Link>

          {/* Profile Link */}
          <Link href="/profile" className="group/btn w-auto lg:w-full flex items-center lg:justify-start gap-2 lg:gap-4 px-4 lg:px-5 py-2 lg:py-3 text-sm font-bold rounded-2xl transition-all whitespace-nowrap overflow-hidden text-slate-500 dark:text-slate-400 border-b-4 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 active:scale-95">
            <span className="shrink-0 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-6 text-violet-500"><User size={20} /></span>
            <span className="truncate transition-all duration-300 lg:opacity-0 lg:-translate-x-2 lg:group-hover:opacity-100 lg:group-hover:translate-x-0">Profile</span>
          </Link>

          {/* Sign Out Link */}
          <Link href="/login" className="group/btn w-auto lg:w-full flex items-center lg:justify-start gap-2 lg:gap-4 px-4 lg:px-5 py-2 lg:py-3 text-sm font-bold rounded-2xl transition-all whitespace-nowrap overflow-hidden text-slate-500 dark:text-slate-400 border-b-4 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-500 dark:hover:text-rose-400 active:scale-95">
            <span className="shrink-0 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-6 text-rose-500"><LogOut size={20} /></span>
            <span className="truncate transition-all duration-300 lg:opacity-0 lg:-translate-x-2 lg:group-hover:opacity-100 lg:group-hover:translate-x-0">Sign Out</span>
          </Link>
          
          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800 w-full overflow-hidden">
             <ThemeToggle className="w-full lg:justify-start lg:px-5 lg:gap-4" isSidebar={true} />
          </div>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-visible lg:overflow-y-auto flex flex-col relative z-0">
        <div className="py-8">
        <main>
          <div className="mx-auto max-w-[100rem] sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {modules.map((module) => (
                  <div 
                    key={module.id} 
                    className="overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                    style={{ borderTop: `6px solid ${module.color}` }}
                  >
                    <div className="px-8 py-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${module.bg || 'bg-slate-50 dark:bg-slate-800'} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                           {module.icon && <module.icon size={24} className={module.iconColor || 'text-slate-600'} />}
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{module.name}</h3>
                      <div className="mt-2 max-w-xl text-sm font-medium text-slate-500 leading-relaxed">
                        <p>{module.description}</p>
                      </div>
                      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center text-blue-600">
                        <a href={module.href} className="text-[10px] font-black uppercase tracking-widest hover:text-blue-700 flex items-center gap-2">
                          Open module <ArrowRight size={14} />
                        </a>
                      </div>
        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}