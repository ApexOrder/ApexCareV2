import Link from 'next/link';
import { useState, useEffect } from 'react';

const initialModules = [
  { id: 1, name: 'Service User Management', description: 'Manage service user records and history.', href: '/patient-management', color: '#3b82f6' },
  { id: 2, name: 'Scheduling', description: 'Schedule appointments and visits.', href: '#', color: '#10b981' },
  { id: 3, name: 'Billing', description: 'Invoicing and payment processing.', href: '#', color: '#8b5cf6' },
  { id: 4, name: 'Reports', description: 'View analytics and performance reports.', href: '#', color: '#f59e0b' },
  { id: 5, name: 'Medication Tracker', description: 'Track service user medications and schedules.', href: '/medication-tracker', color: '#14b8a6' },
  { id: 6, name: 'Group Management', description: 'Create and manage service user groups and staff allocation.', href: '/group-management', color: '#6366f1' },
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
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-black text-slate-900">ApexCare V2</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900">Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-[100rem] sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {modules.map((module) => (
                  <div 
                    key={module.id} 
                    className="overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all"
                    style={{ borderTop: `6px solid ${module.color}` }}
                  >
                    <div className="px-8 py-8">
                      <h3 className="text-xl font-black text-slate-900">{module.name}</h3>
                      <div className="mt-2 max-w-xl text-sm font-medium text-slate-500 leading-relaxed">
                        <p>{module.description}</p>
                      </div>
                      <div className="mt-8 pt-6 border-t border-slate-100">
                        <a href={module.href} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">
                          Open module &rarr;
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