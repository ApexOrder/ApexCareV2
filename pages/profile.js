import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';
import { LayoutDashboard, User, LogOut, Building, CreditCard, Receipt, Shield, Check, Download, AlertCircle, ArrowRight, Plus } from 'lucide-react';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('subscription');
  const [currentPlan, setCurrentPlan] = useState('Professional');
  const [addonModal, setAddonModal] = useState({ isOpen: false, addon: null });
  const [planModal, setPlanModal] = useState({ isOpen: false, plan: null });
  const [agencyInfo, setAgencyInfo] = useState({
    name: 'Apex Home Health',
    email: 'admin@apexcare.com',
    phone: '(555) 123-4567',
    address: '123 Care Lane, Medical District, Springfield'
  });

  const plans = [
    {
      name: 'Starter',
      price: '£49',
      description: 'Essential tools for small care providers. Includes 20 clients.',
      features: ['Up to 20 Service Users included', '+£2.00 per additional user', 'Unlimited Staff Accounts', 'Care plans', 'Client records', 'Staff notes'],
      color: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-700'
    },
    {
      name: 'Professional',
      price: '£99',
      description: 'Advanced features for growing agencies. Includes 50 clients.',
      features: ['Up to 50 Service Users included', '+£1.50 per additional user', 'Unlimited Staff Accounts', 'MAR charts / eMAR', 'Scheduling', 'Incident logs', 'Mobile app'],
      color: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '£199',
      description: 'Complete compliance and scaling tools. Includes 150 clients.',
      features: ['Up to 150 Service Users included', '+£1.00 per additional user', 'Unlimited Staff Accounts', 'API access', 'Compliance reports', 'Multi-branch support', 'CQC audit export'],
      color: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500'
    }
  ];

  const invoices = [
    { id: 'INV-2024-003', date: 'Apr 01, 2024', amount: '£299.00', status: 'Paid', plan: 'Professional' },
    { id: 'INV-2024-002', date: 'Mar 01, 2024', amount: '£299.00', status: 'Paid', plan: 'Professional' },
    { id: 'INV-2024-001', date: 'Feb 01, 2024', amount: '£99.00', status: 'Paid', plan: 'Starter' },
  ];

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

          {/* Profile Link (Active) */}
          <Link href="/profile" className="group/btn w-auto lg:w-full flex items-center lg:justify-start gap-2 lg:gap-4 px-4 lg:px-5 py-2 lg:py-3 text-sm font-bold rounded-2xl transition-all whitespace-nowrap overflow-hidden bg-blue-600 text-white border-b-4 border-blue-800 dark:border-blue-900 active:scale-95">
            <span className="shrink-0 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-6"><User size={20} /></span>
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
          <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Agency Settings</h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-[80rem] sm:px-6 lg:px-8 mt-8">
            <div className="flex flex-col md:flex-row gap-8 px-4 sm:px-0">
              
              {/* Sidebar Navigation */}
              <div className="w-full md:w-64 shrink-0">
                <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
                  {[
                    { id: 'general', label: 'General Info', icon: Building },
                    { id: 'subscription', label: 'Subscription', icon: CreditCard },
                    { id: 'billing', label: 'Billing History', icon: Receipt },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white border-b-4 border-blue-800 dark:border-blue-900 shadow-md'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-600 border-b-4 border-b-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-200' : 'text-slate-400'} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 space-y-8">
                
                {/* General Info Tab */}
                {activeTab === 'general' && (
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4" style={{ borderTop: '6px solid #8b5cf6' }}>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Agency Details</h3>
                    <div className="space-y-6 max-w-2xl">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agency Name</label>
                        <input type="text" value={agencyInfo.name} onChange={(e) => setAgencyInfo({...agencyInfo, name: e.target.value})} className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-blue-500/20" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Email</label>
                          <input type="email" value={agencyInfo.email} onChange={(e) => setAgencyInfo({...agencyInfo, email: e.target.value})} className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Number</label>
                          <input type="text" value={agencyInfo.phone} onChange={(e) => setAgencyInfo({...agencyInfo, phone: e.target.value})} className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registered Address</label>
                        <textarea rows={3} value={agencyInfo.address} onChange={(e) => setAgencyInfo({...agencyInfo, address: e.target.value})} className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-medium text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-blue-500/20" />
                      </div>
                      <div className="pt-4 flex justify-end">
                        <button className="rounded-xl bg-blue-600 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white border-b-4 border-blue-800 dark:border-blue-900 hover:bg-blue-700 transition-all active:scale-95">Save Changes</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subscription Tab */}
                {activeTab === 'subscription' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-10" style={{ borderTop: '6px solid #3b82f6' }}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Current Plan</h3>
                          <p className="text-sm font-medium text-slate-500">Manage your subscription and limits.</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Shield size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-0.5">Status</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Active (Renews May 1, 2024)</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => {
                          const isCurrent = currentPlan === plan.name;
                          return (
                            <div key={plan.name} className={`relative flex flex-col p-6 rounded-3xl border-2 transition-all ${isCurrent ? plan.border + ' shadow-lg shadow-blue-500/10 bg-blue-50/30 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                              {plan.popular && (
                                <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">Recommended</div>
                              )}
                              <h4 className={`text-xl font-black mb-2 ${isCurrent ? plan.color : 'text-slate-900 dark:text-white'}`}>{plan.name}</h4>
                              <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                                <span className="text-xs font-bold text-slate-500">/month</span>
                              </div>
                              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 flex-1">{plan.description}</p>
                              
                              <ul className="space-y-3 mb-8">
                                {plan.features.map(feature => (
                                  <li key={feature} className="flex items-start gap-3">
                                    <Check size={16} className={`shrink-0 ${isCurrent ? plan.color : 'text-emerald-500'}`} />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">{feature}</span>
                                  </li>
                                ))}
                              </ul>

                              <button
                                onClick={() => setPlanModal({ isOpen: true, plan })}
                                disabled={isCurrent}
                                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${
                                  isCurrent 
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent cursor-not-allowed' 
                                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-white border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95'
                                }`}
                              >
                                {isCurrent ? 'Current Plan' : `Switch to ${plan.name}`}
                              </button>
                            </div>
                          )
                        })}
                      </div>

                      {/* Add-ons Section */}
                      <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-10">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Optional Add-ons</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">Enhance your platform with powerful modular features to drive more revenue.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { name: 'eMAR System', price: '£1', unit: '/ client', desc: 'Electronic medication administration records and alerts.' },
                            { name: 'Family Portal', price: '£10', unit: '/ month', desc: 'Secure access for family members to view care logs.' },
                            { name: 'AI Risk Assessments', price: '£20', unit: '/ month', desc: 'Automated AI-driven risk evaluation and mitigation.' },
                            { name: 'SMS Notifications', price: 'Usage', unit: 'based', desc: 'Automated text alerts for staff scheduling and clients.' },
                          ].map(addon => (
                            <div key={addon.name} className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col transition-all hover:border-blue-300 dark:hover:border-slate-500">
                              <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{addon.name}</h4>
                              <div className="flex items-baseline gap-1 mt-2 mb-4">
                                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{addon.price}</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{addon.unit}</span>
                              </div>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex-1 leading-relaxed">{addon.desc}</p>
                              <button 
                                onClick={() => setAddonModal({ isOpen: true, addon })}
                                className="mt-6 w-full py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                              >
                                <Plus size={14} /> Add to Plan
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing Tab */}
                {activeTab === 'billing' && (
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4" style={{ borderTop: '6px solid #10b981' }}>
                    <div className="p-6 md:p-10 border-b border-slate-200 dark:border-slate-800">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Billing History</h3>
                      <p className="text-sm font-medium text-slate-500">View and download your past invoices.</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="px-6 md:px-10 py-4">Invoice</th>
                            <th className="px-6 md:px-10 py-4">Date</th>
                            <th className="px-6 md:px-10 py-4">Amount</th>
                            <th className="px-6 md:px-10 py-4">Status</th>
                            <th className="px-6 md:px-10 py-4">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                          {invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 md:px-10 py-5 font-bold text-slate-900 dark:text-white">
                                {inv.id}
                                <span className="block text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{inv.plan} Plan</span>
                              </td>
                              <td className="px-6 md:px-10 py-5 font-medium">{inv.date}</td>
                              <td className="px-6 md:px-10 py-5 font-bold">{inv.amount}</td>
                              <td className="px-6 md:px-10 py-5">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 uppercase tracking-wide">
                                  {inv.status}
                                </span>
                              </td>
                              <td className="px-6 md:px-10 py-5">
                                <button className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800 active:scale-95">
                                  <Download size={14} /> PDF
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* ADDON CONFIRMATION MODAL */}
          {addonModal.isOpen && addonModal.addon && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Confirm Purchase</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6 leading-relaxed">
                  You are about to add the <span className="font-bold text-slate-900 dark:text-white">{addonModal.addon.name}</span> module to your current <span className="font-bold text-slate-900 dark:text-white">{currentPlan}</span> plan.
                </p>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Base Price</span>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400">{addonModal.addon.price} {addonModal.addon.unit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Billed</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">On Next Invoice</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setAddonModal({ isOpen: false, addon: null })}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b-4 border-transparent rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => { alert(`Successfully added ${addonModal.addon.name} to your plan!`); setAddonModal({ isOpen: false, addon: null }); }}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border-b-4 border-blue-800 dark:border-blue-900 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    Confirm Purchase
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PLAN CHANGE CONFIRMATION MODAL */}
          {planModal.isOpen && planModal.plan && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Change Subscription</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6 leading-relaxed">
                  You are about to switch from the <span className="font-bold text-slate-900 dark:text-white">{currentPlan}</span> plan to the <span className="font-bold text-slate-900 dark:text-white">{planModal.plan.name}</span> plan.
                </p>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">New Base Price</span>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400">{planModal.plan.price} / month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Effective</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Immediately</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setPlanModal({ isOpen: false, plan: null })}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b-4 border-transparent rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => { 
                      setCurrentPlan(planModal.plan.name);
                      alert(`Successfully switched to the ${planModal.plan.name} plan!`); 
                      setPlanModal({ isOpen: false, plan: null }); 
                    }}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border-b-4 border-blue-800 dark:border-blue-900 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    Confirm Change
                  </button>
                </div>
              </div>
            </div>
          )}
          </main>
        </div>
      </div>
    </div>
  );
}