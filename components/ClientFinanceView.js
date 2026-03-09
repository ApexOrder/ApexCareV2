import React from 'react';

const ClientFinanceView = ({ client }) => {
  return (
    <div className="p-10 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
      <h2 className="text-2xl font-black text-slate-900 mb-4">Finance Dashboard</h2>
      <p className="text-slate-500">Financial details for {client.firstName} {client.lastName}</p>
      <div className="mt-8 p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 font-bold uppercase tracking-widest">Finance Module Placeholder</div>
    </div>
  );
};

export default ClientFinanceView;