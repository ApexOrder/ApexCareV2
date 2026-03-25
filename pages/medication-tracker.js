import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, User, LogOut } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function MedicationTracker() {
  const [medications, setMedications] = useState([
    { id: 1, name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily', nextDose: '14:00' },
    { id: 2, name: 'Ibuprofen', dosage: '200mg', frequency: 'As needed', nextDose: 'N/A' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '', nextDose: '' });

  const handleAddMedication = (e) => {
    e.preventDefault();
    setMedications([...medications, { ...newMed, id: Date.now() }]);
    setNewMed({ name: '', dosage: '', frequency: '', nextDose: '' });
    setShowForm(false);
  };

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
          {/* Dashboard Link */}
          <Link href="/dashboard" className="group/btn w-auto lg:w-full flex items-center lg:justify-start gap-2 lg:gap-4 px-4 lg:px-5 py-2 lg:py-3 text-sm font-bold rounded-2xl transition-all whitespace-nowrap overflow-hidden text-slate-500 dark:text-slate-400 border-b-4 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 active:scale-95">
            <span className="shrink-0 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-6 text-blue-500"><LayoutDashboard size={20} /></span>
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
        <div className="py-10">
        <header>
          <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Medication Tracker</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-xl bg-blue-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white border-b-4 border-blue-800 dark:border-blue-900 hover:bg-blue-700 transition-all active:scale-95"
            >
              {showForm ? 'Cancel' : 'Add Medication'}
            </button>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-[100rem] sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              
              {showForm && (
                <div className="mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-[2.5rem] p-8">
                  <h3 className="text-xl font-black leading-6 text-slate-900 dark:text-white mb-6">Add New Medication</h3>
                  <form onSubmit={handleAddMedication} className="space-y-4">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="name" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Medication Name</label>
                        <div className="mt-1">
                          <input type="text" name="name" id="name" required
                            value={newMed.name}
                            onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                            className="block w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white dark:bg-slate-800" 
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="dosage" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Dosage</label>
                        <div className="mt-1">
                          <input type="text" name="dosage" id="dosage" required
                            value={newMed.dosage}
                            onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                            className="block w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white dark:bg-slate-800" 
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="frequency" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Frequency</label>
                        <div className="mt-1">
                          <input type="text" name="frequency" id="frequency" required
                            value={newMed.frequency}
                            onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                            className="block w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white dark:bg-slate-800" 
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="nextDose" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Next Dose Time</label>
                        <div className="mt-1">
                          <input type="text" name="nextDose" id="nextDose"
                            value={newMed.nextDose}
                            onChange={(e) => setNewMed({...newMed, nextDose: e.target.value})}
                            className="block w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white dark:bg-slate-800" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="ml-3 inline-flex justify-center rounded-xl border-b-4 border-blue-800 dark:border-blue-900 bg-blue-600 py-3 px-6 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all active:scale-95">
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden rounded-[2.5rem]">
                <ul role="list" className="divide-y divide-slate-100 dark:divide-slate-800">
                  {medications.map((med) => (
                    <li key={med.id}>
                      <div className="px-8 py-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-black text-slate-900 dark:text-white">{med.name}</p>
                          <div className="ml-2 flex flex-shrink-0">
                            <p className="inline-flex rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 text-[10px] font-black leading-5 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 uppercase tracking-wide">
                              Active
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-xs font-bold text-slate-500">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Dosage:</span> {med.dosage}
                            </p>
                            <p className="mt-2 flex items-center text-xs font-bold text-slate-500 sm:mt-0 sm:ml-6">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Frequency:</span> {med.frequency}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-xs font-bold text-slate-500 sm:mt-0">
                            <p className="flex items-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Next Dose:</span> <time dateTime={med.nextDose} className="text-blue-600">{med.nextDose}</time>
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}