import React, { useState, useEffect } from 'react';

const ClientFinanceView = ({ client, onUpdateClient, onDirtyStateChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [financeData, setFinanceData] = useState({
    fundingSource: client.finance?.fundingSource || 'Private',
    monthlyCost: client.finance?.monthlyCost || '',
    paymentMethod: client.finance?.paymentMethod || 'Direct Debit',
    billingReference: client.finance?.billingReference || '',
    notes: client.finance?.notes || ''
  });

  useEffect(() => {
    onDirtyStateChange?.(isEditing);
  }, [isEditing, onDirtyStateChange]);

  const handleSave = () => {
    onUpdateClient({
      ...client,
      finance: { ...financeData }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFinanceData({
        fundingSource: client.finance?.fundingSource || 'Private',
        monthlyCost: client.finance?.monthlyCost || '',
        paymentMethod: client.finance?.paymentMethod || 'Direct Debit',
        billingReference: client.finance?.billingReference || '',
        notes: client.finance?.notes || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-3">Financial Overview</h2>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Funding & Billing Details</p>
            </div>
            {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="bg-white text-slate-900 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 border border-slate-200 hover:bg-slate-50">Edit Finance Details</button>
            ) : (
                <div className="flex gap-3">
                    <button onClick={handleCancel} className="bg-slate-100 text-slate-500 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-colors">Save Changes</button>
                </div>
            )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden" style={{ borderTop: '6px solid #8b5cf6' }}>
            <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                
                {/* Funding Source */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Funding Source</label>
                    {isEditing ? (
                        <select 
                            value={financeData.fundingSource} 
                            onChange={(e) => setFinanceData({...financeData, fundingSource: e.target.value})}
                            className="w-full bg-slate-50 border-slate-200 rounded-xl p-4 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="Private">Private / Self-Funded</option>
                            <option value="Local Authority">Local Authority</option>
                            <option value="NHS CHC">NHS Continuing Healthcare</option>
                            <option value="Direct Payments">Direct Payments</option>
                            <option value="Insurance">Insurance</option>
                        </select>
                    ) : (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-lg font-black text-slate-900">
                            {financeData.fundingSource}
                        </div>
                    )}
                </div>

                {/* Monthly Cost */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Monthly Cost</label>
                    {isEditing ? (
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                            <input 
                                type="number" 
                                value={financeData.monthlyCost} 
                                onChange={(e) => setFinanceData({...financeData, monthlyCost: e.target.value})}
                                className="w-full bg-slate-50 border-slate-200 rounded-xl p-4 pl-8 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20"
                                placeholder="0.00"
                            />
                        </div>
                    ) : (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-lg font-black text-slate-900">
                            {financeData.monthlyCost ? `£${parseFloat(financeData.monthlyCost).toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : 'Not Set'}
                        </div>
                    )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Method</label>
                    {isEditing ? (
                        <select 
                            value={financeData.paymentMethod} 
                            onChange={(e) => setFinanceData({...financeData, paymentMethod: e.target.value})}
                            className="w-full bg-slate-50 border-slate-200 rounded-xl p-4 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="Direct Debit">Direct Debit</option>
                            <option value="Bank Transfer">Bank Transfer (BACS)</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Cash">Cash</option>
                            <option value="Third Party">Third Party Invoice</option>
                        </select>
                    ) : (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-lg font-black text-slate-900">
                            {financeData.paymentMethod}
                        </div>
                    )}
                </div>

                {/* Billing Reference */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Billing Reference / Account No.</label>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={financeData.billingReference} 
                            onChange={(e) => setFinanceData({...financeData, billingReference: e.target.value})}
                            className="w-full bg-slate-50 border-slate-200 rounded-xl p-4 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20"
                            placeholder="e.g. INV-2024-001"
                        />
                    ) : (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-lg font-black text-slate-900">
                            {financeData.billingReference || 'Not Set'}
                        </div>
                    )}
                </div>

                 {/* Notes */}
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Financial Notes</label>
                    {isEditing ? (
                        <textarea 
                            value={financeData.notes} 
                            onChange={(e) => setFinanceData({...financeData, notes: e.target.value})}
                            className="w-full bg-slate-50 border-slate-200 rounded-xl p-4 font-medium text-slate-700 outline-none border focus:ring-2 focus:ring-blue-500/20 min-h-[100px]"
                            placeholder="Any additional financial arrangements or notes..."
                        />
                    ) : (
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium leading-relaxed">
                            {financeData.notes || 'No notes recorded.'}
                        </div>
                    )}
                </div>

            </div>
        </div>
    </div>
  );
};

export default ClientFinanceView;