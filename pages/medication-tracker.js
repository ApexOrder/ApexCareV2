import { useState } from 'react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/dashboard" className="text-xl font-black text-slate-900">ApexCare V2</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900">Medication Tracker</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-xl bg-blue-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              {showForm ? 'Cancel' : 'Add Medication'}
            </button>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-[100rem] sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              
              {showForm && (
                <div className="mb-8 bg-white border border-slate-200 shadow-sm rounded-[2.5rem] p-8">
                  <h3 className="text-xl font-black leading-6 text-slate-900 mb-6">Add New Medication</h3>
                  <form onSubmit={handleAddMedication} className="space-y-4">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="name" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Medication Name</label>
                        <div className="mt-1">
                          <input type="text" name="name" id="name" required
                            value={newMed.name}
                            onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                            className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900" 
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="dosage" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Dosage</label>
                        <div className="mt-1">
                          <input type="text" name="dosage" id="dosage" required
                            value={newMed.dosage}
                            onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                            className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900" 
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="frequency" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Frequency</label>
                        <div className="mt-1">
                          <input type="text" name="frequency" id="frequency" required
                            value={newMed.frequency}
                            onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                            className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900" 
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="nextDose" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Next Dose Time</label>
                        <div className="mt-1">
                          <input type="text" name="nextDose" id="nextDose"
                            value={newMed.nextDose}
                            onChange={(e) => setNewMed({...newMed, nextDose: e.target.value})}
                            className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="ml-3 inline-flex justify-center rounded-xl border border-transparent bg-blue-600 py-3 px-6 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all active:scale-95">
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white border border-slate-200 shadow-sm overflow-hidden rounded-[2.5rem]">
                <ul role="list" className="divide-y divide-slate-100">
                  {medications.map((med) => (
                    <li key={med.id}>
                      <div className="px-8 py-6 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-black text-slate-900">{med.name}</p>
                          <div className="ml-2 flex flex-shrink-0">
                            <p className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-black leading-5 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
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
  );
}