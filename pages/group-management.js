import { useState } from 'react';
import Link from 'next/link';
import { Users, Trash2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function GroupManagement() {
  const [groups, setGroups] = useState([
    { id: 1, name: 'Floor 1', description: 'Ground floor residents', staffCount: 4, patientCount: 12 },
    { id: 2, name: 'Floor 2', description: 'First floor residents', staffCount: 3, patientCount: 10 },
    { id: 3, name: 'High Priority', description: 'Residents requiring frequent observation', staffCount: 5, patientCount: 6 },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });

  const handleAddGroup = (e) => {
    e.preventDefault();
    setGroups([...groups, { ...newGroup, id: Date.now(), staffCount: 0, patientCount: 0 }]);
    setNewGroup({ name: '', description: '' });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/dashboard" className="text-xl font-black text-slate-900 dark:text-white">ApexCare V2</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Group Management</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-xl bg-blue-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white border-b-4 border-blue-800 dark:border-blue-900 hover:bg-blue-700 transition-all active:scale-95"
            >
              {showForm ? 'Cancel' : 'Create Group'}
            </button>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-[100rem] sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              
              {showForm && (
                <div className="mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-[2.5rem] p-8 animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-xl font-black leading-6 text-slate-900 dark:text-white mb-6">Create New Group</h3>
                  <form onSubmit={handleAddGroup} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Group Name</label>
                      <div className="mt-1">
                        <input type="text" name="name" id="name" required
                          value={newGroup.name}
                          onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                          className="block w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white dark:bg-slate-800" 
                          placeholder="e.g. Floor 1, Dementia Unit"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                      <div className="mt-1">
                        <textarea name="description" id="description" rows={3}
                          value={newGroup.description}
                          onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                          className="block w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-medium text-slate-700 dark:text-slate-300 dark:bg-slate-800" 
                          placeholder="Brief description of this group's purpose..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="ml-3 inline-flex justify-center rounded-xl border-b-4 border-blue-800 dark:border-blue-900 bg-blue-600 py-3 px-6 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all active:scale-95">
                        Save Group
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => (
                  <div key={group.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden rounded-[2.5rem] hover:shadow-md transition-all group relative">
                    <div className="px-8 py-8">
                      <div className="flex justify-between items-start mb-4">
                         <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400"><Users size={24} /></div>
                         <button onClick={() => {
                             if(confirm('Delete this group?')) setGroups(groups.filter(g => g.id !== group.id));
                         }} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{group.name}</h3>
                      <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6 min-h-[3rem]">{group.description || 'No description provided.'}</p>
                      
                      <div className="flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                          <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Staff</p>
                              <p className="text-lg font-black text-slate-900 dark:text-white">{group.staffCount}</p>
                          </div>
                          <div className="w-px h-8 bg-slate-100"></div>
                          <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Patients</p>
                              <p className="text-lg font-black text-slate-900 dark:text-white">{group.patientCount}</p>
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