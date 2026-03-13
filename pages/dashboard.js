import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Users, Calendar, CreditCard, BarChart3, Pill, Layers, ArrowRight } from 'lucide-react';

import ActivityChart from '../components/ActivityChart';
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">ApexCare V2</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/profile" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900">
                Profile
              </Link>
              <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900">
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-[100rem] sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {/* New Chart Widget */}
              <div className="mb-8">
                <ActivityChart />
              </div>

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
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}