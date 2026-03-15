import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Calendar, CreditCard, BarChart3, Pill, Layers, Plus } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const initialModules = [
  { 
    id: 1, 
    name: 'Service User Management', 
    description: 'Manage service user records and history.', 
    href: '/patient-management',
    exports: ['ServiceUserID', 'Demographics', 'Group'],
    imports: [],
    color: '#3b82f6',
    icon: Users,
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  { 
    id: 2, 
    name: 'Scheduling', 
    description: 'Schedule appointments and visits.', 
    href: '#',
    exports: ['AppointmentID', 'VisitLogs'],
    imports: ['ServiceUserID'],
    color: '#10b981',
    icon: Calendar,
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600'
  },
  { 
    id: 3, 
    name: 'Billing', 
    description: 'Invoicing and payment processing.', 
    href: '#',
    exports: ['InvoiceID'],
    imports: ['ServiceUserID', 'AppointmentID'],
    color: '#8b5cf6',
    icon: CreditCard,
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600'
  },
  { 
    id: 4, 
    name: 'Reports', 
    description: 'View analytics and performance reports.', 
    href: '#',
    exports: [],
    imports: ['Demographics', 'VisitLogs', 'InvoiceID'],
    color: '#f59e0b',
    icon: BarChart3,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600'
  },
  { 
    id: 5, 
    name: 'Medication Tracker', 
    description: 'Track service user medications and schedules.', 
    href: '/medication-tracker',
    exports: ['MedicationList'],
    imports: ['ServiceUserID'],
    color: '#14b8a6',
    icon: Pill,
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600'
  },
  { 
    id: 6, 
    name: 'Group Management', 
    description: 'Create and manage service user groups and staff allocation.', 
    href: '/group-management',
    exports: ['GroupList'],
    imports: ['ServiceUserID', 'StaffID'],
    color: '#6366f1',
    icon: Layers,
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-600'
  },
];

export default function AdminDashboard() {
  const [modules, setModules] = useState(initialModules);
  const [draggedModuleId, setDraggedModuleId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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
        console.error("Failed to parse module settings:", e);
        setModules(initialModules);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const modulesToSave = modules.map(({ id, color }) => ({ id, color }));
      localStorage.setItem('module-settings', JSON.stringify(modulesToSave));
    }
  }, [modules, isLoaded]);

  const handleAddModule = () => {
    const newId = modules.length + 1;
    setModules([
      ...modules,
      { id: newId, name: `New Module ${newId}`, description: 'A newly added custom module.', href: '#', exports: [], imports: [], color: '#71717a', icon: Layers, bg: 'bg-zinc-50', iconColor: 'text-zinc-600' }
    ]);
  };

  const handleColorChange = (id, color) => {
    setModules(modules.map(m => m.id === id ? { ...m, color } : m));
  };

  const handleDragStart = (e, id) => {
    setDraggedModuleId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (draggedModuleId === null || draggedModuleId === targetId) {
      setDraggedModuleId(null);
      return;
    }

    const draggedIndex = modules.findIndex(m => m.id === draggedModuleId);
    const targetIndex = modules.findIndex(m => m.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newModules = [...modules];
    const [draggedItem] = newModules.splice(draggedIndex, 1);
    newModules.splice(targetIndex, 0, draggedItem);

    setModules(newModules);
    setDraggedModuleId(null);
  };

  const handleDragEnd = () => {
    setDraggedModuleId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">ApexCare V2 <span className="text-blue-600">Master</span></h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900">
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Module Management</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                  isEditing
                    ? 'bg-emerald-600 text-white border-b-4 border-emerald-800 dark:border-emerald-900 hover:bg-emerald-700'
                    : 'bg-white dark:bg-slate-800 border-b-4 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {isEditing ? 'Done Editing' : 'Edit Layout'}
              </button>
              <button
                onClick={handleAddModule}
                className="rounded-xl bg-blue-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white border-b-4 border-blue-800 dark:border-blue-900 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 group"
              >
                <Plus size={14} className="transition-transform duration-300 group-hover:rotate-90" /> Add New Module
              </button>
            </div>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-[100rem] sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {modules.map((module) => (
                  <div 
                    key={module.id}
                    draggable={isEditing}
                    onDragStart={isEditing ? (e) => handleDragStart(e, module.id) : undefined}
                    onDragOver={isEditing ? handleDragOver : undefined}
                    onDrop={isEditing ? (e) => handleDrop(e, module.id) : undefined}
                    onDragEnd={isEditing ? handleDragEnd : undefined}
                    className={`relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all ${isEditing ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${draggedModuleId === module.id ? 'opacity-50 ring-2 ring-blue-500' : ''} group`}
                    style={{ borderTop: `6px solid ${module.color}` }}
                  >
                    <div className="px-8 py-8 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${module.bg || 'bg-slate-50 dark:bg-slate-800'} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                                {module.icon && <module.icon size={20} className={module.iconColor || 'text-slate-600'} />}
                             </div>
                             <h3 className="text-xl font-black text-slate-900 dark:text-white">{module.name}</h3>
                          </div>
                          {isEditing && (
                            <input type="color" value={module.color} 
                              onChange={(e) => handleColorChange(module.id, e.target.value)} 
                              className="w-8 h-8 p-0 border-none rounded-full cursor-pointer bg-transparent" title="Change module color" />
                          )}
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">{module.description}</p>
                      </div>
                      
                      <div>
                        <div className="mt-6 flex flex-col space-y-3">
                          <div className="flex items-start">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 mt-1">Exports:</span>
                            <div className="flex flex-wrap gap-2">
                              {module.exports && module.exports.length > 0 ? (
                                module.exports.map((exp, i) => (
                                  <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">
                                    {exp}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] font-bold text-slate-300 italic">None</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-start">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 mt-1">Imports:</span>
                            <div className="flex flex-wrap gap-2">
                              {module.imports && module.imports.length > 0 ? (
                                module.imports.map((imp, i) => (
                                  <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                                    {imp}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] font-bold text-slate-300 italic">None</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            {isEditing ? 'Configure module' : 'Open module \u2192'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!isEditing && (
                        <Link href={module.href} className="absolute inset-0" aria-label={`Open ${module.name}`}></Link>
                    )}
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