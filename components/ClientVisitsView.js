import React, { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Plus, AlertOctagon } from 'lucide-react';

// Custom Hook for Visit Logic
const useVisits = (initialVisits, onUpdateClient, client) => {
    const [visits, setVisits] = useState(initialVisits || []);
    const [visitModal, setVisitModal] = useState({ isOpen: false, mode: 'add', visit: null });
    const [visitForm, setVisitForm] = useState({
        type: 'One-off',
        date: '',
        time: '',
        endTime: '',
        duration: '',
        carer: '',
        status: 'Scheduled',
        frequency: 'Daily',
        selectedDays: [],
        note: '',
        tasks: [],
        cancellationReason: '',
        cancelledBy: '',
        invoiceClient: 'Yes',
        payCarer: 'Yes',
        carerCount: '1',
        hasAdditionalCarer: false,
        additionalCarerType: 'Shadowing',
        additionalPayRate: ''
    });
    const [isCancelling, setIsCancelling] = useState(false);

    const getVisitPeriod = useCallback((time) => {
        if (!time) return 'Unknown';
        const hour = parseInt(time.split(':')[0]);
        if (hour < 12) return 'Morning';
        if (hour < 14) return 'Lunch';
        if (hour < 17) return 'Tea';
        return 'Evening';
    }, []);

    const updateVisits = (newVisits) => {
        setVisits(newVisits);
        onUpdateClient({
            ...client,
            visits: newVisits
        });
    };

    return {
        visits,
        visitModal,
        setVisitModal,
        visitForm,
        setVisitForm,
        isCancelling,
        setIsCancelling,
        getVisitPeriod,
        updateVisits
    };
};

const ClientVisitsView = ({ client, onUpdateClient, userRole, staff = [] }) => {
    const {
        visits,
        visitModal,
        setVisitModal,
        visitForm,
        setVisitForm,
        isCancelling,
        setIsCancelling,
        getVisitPeriod,
        updateVisits
    } = useVisits(client.visits, onUpdateClient, client);

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [visitPeriodFilter, setVisitPeriodFilter] = useState('All');
    const [hoveredVisit, setHoveredVisit] = useState(null);
    const [hoveredVisitPosition, setHoveredVisitPosition] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const getPeriodColor = (time) => {
        const period = getVisitPeriod(time);
        switch(period) {
            case 'Morning': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-900/40';
            case 'Lunch': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40';
            case 'Tea': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-900/40';
            case 'Evening': return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40';
            default: return 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800';
        }
    };

    const checkIsOverdue = useCallback((dateStr, timeStr, status) => {
        if (status === 'Completed' || status === 'Cancelled' || status === 'In Progress') return false;
        if (!dateStr || !timeStr || timeStr === 'TBD') return false;
        const visitDateTime = new Date(`${dateStr}T${timeStr}`);
        return visitDateTime < new Date();
    }, []);

    const filteredVisits = useMemo(() => {
        if (visitPeriodFilter === 'All') {
            return visits;
        }
        return visits.filter(v => getVisitPeriod(v.time) === visitPeriodFilter);
    }, [visits, visitPeriodFilter, getVisitPeriod]);

    const handleVisitMouseEnter = (e, visit) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoveredVisitPosition({
            top: rect.top,
            left: rect.left + rect.width / 2,
        });
        setHoveredVisit(visit);
    };

    const handleVisitMouseLeave = () => {
        setHoveredVisit(null);
    };

    const handleOpenAddVisit = (date, time) => {
        setVisitForm({
            type: 'Recurring',
            date: date || '',
            time: time || '',
            endTime: '',
            duration: '',
            carer: '',
            status: 'Scheduled',
            frequency: 'Daily',
            selectedDays: [],
            note: '',
            tasks: [],
            cancellationReason: '',
            cancelledBy: '',
            invoiceClient: 'Yes',
            payCarer: 'Yes',
            carerCount: '1',
            hasAdditionalCarer: false,
            additionalCarerType: 'Shadowing',
            additionalPayRate: ''
        });
        setIsCancelling(false);
        setVisitModal({ isOpen: true, mode: 'add', visit: null });
    };

    const handleOpenEditVisit = (visit) => {
        const getMinutes = (t) => parseInt(t.split(':')[0] || '0') * 60 + parseInt(t.split(':')[1] || '0');
        const startMins = getMinutes(visit.time);
        let durationMins = 0;
        if (visit.duration === 'Night Shift') durationMins = 480;
        else if (visit.duration?.toString().includes('h')) {
             const parts = visit.duration.toString().split('h');
             durationMins = parseInt(parts[0]) * 60;
             if (parts[1] && parts[1].includes('m')) {
                 durationMins += parseInt(parts[1]);
             }
        } else {
            durationMins = parseInt(visit.duration || '0');
        }
        const endMins = startMins + durationMins;
        const endH = Math.floor(endMins / 60) % 24;
        const endM = endMins % 60;
        const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
        setVisitForm({ ...visit, endTime, carerCount: visit.carerCount || '1', hasAdditionalCarer: visit.hasAdditionalCarer || false, additionalCarerType: visit.additionalCarerType || 'Shadowing', additionalPayRate: visit.additionalPayRate || '' });
        setIsCancelling(false);
        setVisitModal({ isOpen: true, mode: 'edit', visit });
    };

    const _confirmAndSaveVisit = () => {
        if (!visitForm.date) {
            alert('Please select a date.');
            return;
        }
    
        if (isCancelling && (!visitForm.cancelledBy || !visitForm.cancellationReason)) {
            alert('Please provide cancellation details.');
            return;
        }
    
        // Conflict Check
        const getMinutes = (t) => parseInt(t.split(':')[0] || '0') * 60 + parseInt(t.split(':')[1] || '0');
        const newStart = getMinutes(visitForm.time || '00:00');
        const newEnd = getMinutes(visitForm.endTime || '00:00');
        let durationMinutes = newEnd - newStart;
        if (durationMinutes < 0) durationMinutes += 24 * 60;
    
        const checkConflict = (targetDate) => {
            return visits.find(v => {
                if (visitModal.mode === 'edit' && v.id === visitModal.visit?.id) return false;
                if (v.carer !== visitForm.carer) return false;
                if (v.status === 'Cancelled') return false;
                if (v.date !== targetDate) return false;
    
                const vStart = getMinutes(v.time);
                let vDur = 0;
                if (v.duration === 'Night Shift') vDur = 480;
                else if (v.duration?.toString().includes('h')) {
                     const parts = v.duration.toString().split('h');
                     vDur = parseInt(parts[0]) * 60;
                     if (parts[1] && parts[1].includes('m')) {
                         vDur += parseInt(parts[1]);
                     }
                } else {
                    vDur = parseInt(v.duration || '0');
                }
                const vEnd = vStart + vDur;
    
                return (newStart < vEnd && vStart < newEnd);
            });
        };
    
        const visitsToAdd = [];
    
        if (visitForm.type === 'One-off' || visitModal.mode === 'edit') {
            if (checkConflict(visitForm.date || '')) {
                 alert(`Conflict detected for ${visitForm.date}.`);
                 return;
            }
            visitsToAdd.push({
                id: visitModal.visit?.id || `v-${Date.now()}`,
                date: visitForm.date || '',
                time: visitForm.time || 'TBD',
                duration: durationMinutes.toString(),
                carer: visitForm.carer || 'Unassigned',
                status: isCancelling ? 'Cancelled' : (visitForm.status || 'Scheduled'),
                type: visitForm.type || 'One-off',
                frequency: visitForm.frequency,
                selectedDays: visitForm.selectedDays,
                note: visitForm.note,
                tasks: visitForm.tasks,
                cancellationReason: visitForm.cancellationReason,
                cancelledBy: visitForm.cancelledBy,
                invoiceClient: visitForm.invoiceClient,
                payCarer: visitForm.payCarer,
                carerCount: visitForm.carerCount,
                hasAdditionalCarer: visitForm.hasAdditionalCarer,
                additionalCarerType: visitForm.hasAdditionalCarer ? visitForm.additionalCarerType : null,
                additionalPayRate: visitForm.hasAdditionalCarer ? visitForm.additionalPayRate : null
            });
        } else {
            // Recurring Generation
            const startDate = new Date(visitForm.date || '');
            // Generate for 8 weeks
            for (let i = 0; i < 56; i++) {
                const curr = new Date(startDate);
                curr.setDate(startDate.getDate() + i);
                const dateStr = curr.toISOString().split('T')[0];
                const dayName = curr.toLocaleDateString('en-GB', { weekday: 'short' });
    
                let shouldAdd = false;
                if (visitForm.frequency === 'Daily') shouldAdd = true;
                if (visitForm.frequency === 'Weekly' && visitForm.selectedDays?.includes(dayName)) shouldAdd = true;
    
                if (shouldAdd) {
                    visitsToAdd.push({
                        id: `v-${Date.now()}-`,
                        date: dateStr,
                        time: visitForm.time || 'TBD',
                        duration: durationMinutes.toString(),
                        carer: visitForm.carer || 'Unassigned',
                        status: isCancelling ? 'Cancelled' : 'Scheduled',
                        type: 'Recurring',
                        frequency: visitForm.frequency,
                        selectedDays: visitForm.selectedDays,
                        note: visitForm.note,
                        tasks: visitForm.tasks,
                        carerCount: visitForm.carerCount,
                        hasAdditionalCarer: visitForm.hasAdditionalCarer,
                        additionalCarerType: visitForm.hasAdditionalCarer ? visitForm.additionalCarerType : null,
                        additionalPayRate: visitForm.hasAdditionalCarer ? visitForm.additionalPayRate : null
                    });
                }
            }
        }
    
        let updatedVisits;
        if (visitModal.mode === 'edit' && visitModal.visit) {
            updatedVisits = visits.map(v => v.id === visitModal.visit.id ? visitsToAdd[0] : v);
        } else {
            updatedVisits = [...visits, ...visitsToAdd];
        }
        updateVisits(updatedVisits);
        setVisitModal({ ...visitModal, isOpen: false });
    };

    const handleSaveVisit = () => {
        // New check for duplicate visit period
        if (visitModal.mode === 'add') {
            const newVisitPeriod = getVisitPeriod(visitForm.time);
            const existingVisitInPeriod = visits.find(v => 
                v.date === visitForm.date && 
                getVisitPeriod(v.time) === newVisitPeriod &&
                v.status !== 'Cancelled'
            );
    
            if (existingVisitInPeriod) {
                setConfirmModal({
                    isOpen: true,
                    title: 'Duplicate Visit Period',
                    message: `A "" visit is already scheduled for this day. Are you sure you want to add another?`,
                    onConfirm: () => _confirmAndSaveVisit()
                });
                return;
            }
        }
    
        _confirmAndSaveVisit();
    };

    const handleDeleteVisit = (id) => {
        if (window.confirm('Are you sure you want to delete this visit?')) {
            const updatedVisits = visits.filter(v => v.id !== id);
            updateVisits(updatedVisits);
        }
    };

    const timeOptions = useMemo(() => {
        const options = [];
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 60; j += 15) {
                options.push(`${String(i).padStart(2, '0')}:${String(j).padStart(2, '0')}`);
            }
        }
        return options;
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-3">Visit Schedule</h2>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Recurring & One-off Visits</p>
            </div>
            {userRole === 'admin' && (
            <button 
                onClick={() => handleOpenAddVisit()}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-b-4 border-blue-800 dark:border-blue-900 transition-all active:scale-95 hover:bg-blue-700"
            >
                Schedule Visit
            </button>
            )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col" style={{ borderTop: '6px solid #3b82f6' }}>
            {/* Calendar Header */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-4">
                    <button onClick={handlePrevMonth} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><ArrowLeft size={20} /></button>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={handleNextMonth} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><ArrowRight size={20} /></button>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                    <button onClick={() => setVisitPeriodFilter('All')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${visitPeriodFilter === 'All' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>All</button>
                    {['Morning', 'Lunch', 'Tea', 'Evening'].map(p => {
                        const activeColor = 
                            p === 'Morning' ? 'bg-amber-500 text-white border-amber-500' : 
                            p === 'Lunch' ? 'bg-emerald-500 text-white border-emerald-500' : 
                            p === 'Tea' ? 'bg-blue-500 text-white border-blue-500' : 
                            'bg-indigo-500 text-white border-indigo-500';
                        
                        const dotColor = 
                            p === 'Morning' ? 'bg-amber-400' : 
                            p === 'Lunch' ? 'bg-emerald-400' : 
                            p === 'Tea' ? 'bg-blue-400' : 
                            'bg-indigo-400';

                        return (
                            <button 
                                key={p} 
                                onClick={() => setVisitPeriodFilter(p)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                    visitPeriodFilter === p ? activeColor : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                            >
                                <div className={`w-2 h-2 rounded-full ${visitPeriodFilter === p ? 'bg-white' : dotColor}`}></div>
                                <span>{p}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="p-4 text-center border-r border-slate-100 dark:border-slate-800 last:border-0 bg-slate-50 dark:bg-slate-800/50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 auto-rows-fr bg-slate-100 dark:bg-slate-800 gap-px border-b border-slate-100 dark:border-slate-800">
                {(() => {
                    const year = currentMonth.getFullYear();
                    const month = currentMonth.getMonth();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
                    const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Mon start
                    
                    const days = [];
                    // Empty cells for offset
                    for (let i = 0; i < startOffset; i++) {
                        days.push(<div key={`empty-`} className="bg-white dark:bg-slate-900 min-h-[160px] opacity-50"></div>);
                    }

                    // Day cells
                    for (let d = 1; d <= daysInMonth; d++) {
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const dayVisits = filteredVisits.filter(v => v.date === dateStr).sort((a,b) => a.time.localeCompare(b.time));
                        const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

                        const periodsToRender = visitPeriodFilter === 'All' 
                            ? [
                                { label: 'Morning', time: '09:00' },
                                { label: 'Lunch', time: '13:00' },
                                { label: 'Tea', time: '16:00' },
                                { label: 'Evening', time: '19:00' }
                                ]
                            : [
                                { label: 'Morning', time: '09:00' },
                                { label: 'Lunch', time: '13:00' },
                                { label: 'Tea', time: '16:00' },
                                { label: 'Evening', time: '19:00' }
                                ].filter(p => p.label === visitPeriodFilter);

                        days.push(
                            <div key={d} className={`bg-white dark:bg-slate-900 min-h-[180px] p-2 flex flex-col group relative transition-colors ${isToday ? 'ring-2 ring-inset ring-blue-500/20' : ''}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-black ${isToday ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>{d}</span>
                                    {dayVisits.length > 0 && <span className="text-[9px] font-bold text-slate-400">{dayVisits.length} Visits</span>}
                                </div>
                                
                                <div className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1 scrollbar-hide">
                                    {periodsToRender.map(period => {
                                        const periodVisits = dayVisits.filter(v => getVisitPeriod(v.time) === period.label);

                                        return (
                                            <div key={period.label} className="flex-1 min-h-[30px] flex flex-col gap-1 relative group/period z-0 hover:z-50">
                                                {periodVisits.length > 0 ? (
                                                    <>
                                                        {/* Base View (Shows First Visit + Badge) */}
                                                        <div className={`flex flex-col gap-1 transition-opacity duration-200 ${periodVisits.length > 1 ? 'group-hover/period:opacity-0' : ''}`}>
                                                            {(() => {
                                                                const visit = periodVisits[0];
                                                                const isCancelled = visit.status === 'Cancelled';
                                                                const isOverdue = checkIsOverdue(visit.date, visit.time, visit.status);
                                                                return (
                                                                    <div 
                                                                        key={visit.id}
                                                                        className={`p-1.5 rounded-lg border cursor-pointer transition-all ${isCancelled ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100' : isOverdue ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 shadow-sm shadow-rose-100 dark:shadow-none' : getPeriodColor(visit.time)}`}
                                                                        onClick={(e) => { e.stopPropagation(); handleOpenEditVisit(visit); }}
                                                                        onMouseEnter={(e) => handleVisitMouseEnter(e, visit)}
                                                                        onMouseLeave={handleVisitMouseLeave}
                                                                    >
                                                                        <div className="flex justify-between items-center w-full">
                                                                            <span className={`text-[9px] font-black uppercase flex items-center gap-1 ${isCancelled ? 'line-through' : ''}`}>
                                                                                {isOverdue && <AlertOctagon size={10} />}
                                                                                {period.label}
                                                                            </span>
                                                                            <span className={`text-[9px] font-bold opacity-70 ${isCancelled ? 'line-through' : ''}`}>{visit.time}</span>
                                                                        </div>
                                                                        <div className={`text-[9px] font-bold truncate ${isCancelled ? 'line-through' : ''}`}>{visit.carer}</div>
                                                                    </div>
                                                                );
                                                            })()}
                                                            {periodVisits.length > 1 && (
                                                                <div className="text-[9px] font-bold text-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md py-0.5 border border-slate-200 dark:border-slate-700 cursor-pointer pointer-events-none">
                                                                    +{periodVisits.length - 1} More
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Expanded Hover View for Multiple Visits */}
                                                        {periodVisits.length > 1 && (
                                                            <div className="absolute top-0 left-0 w-[calc(100%+16px)] -ml-2 -mt-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover/period:opacity-100 group-hover/period:visible flex flex-col gap-1 transition-all duration-200 z-50">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1 border-b border-slate-100 dark:border-slate-700 pb-1 flex justify-between">
                                                                    <span>{period.label}</span>
                                                                    <span className="text-blue-500">{periodVisits.length} visits</span>
                                                                </p>
                                                                {periodVisits.map((visit) => {
                                                                    const isCancelled = visit.status === 'Cancelled';
                                                                    const isOverdue = checkIsOverdue(visit.date, visit.time, visit.status);
                                                                    return (
                                                                        <div 
                                                                            key={visit.id}
                                                                            className={`p-1.5 rounded-lg border cursor-pointer transition-all ${isCancelled ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100' : isOverdue ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 shadow-sm shadow-rose-100 dark:shadow-none' : getPeriodColor(visit.time)}`}
                                                                            onClick={(e) => { e.stopPropagation(); handleOpenEditVisit(visit); }}
                                                                            onMouseEnter={(e) => handleVisitMouseEnter(e, visit)}
                                                                            onMouseLeave={handleVisitMouseLeave}
                                                                        >
                                                                            <div className="flex justify-between items-center w-full">
                                                                                <span className={`text-[9px] font-black uppercase flex items-center gap-1 ${isCancelled ? 'line-through' : ''}`}>
                                                                                    {isOverdue && <AlertOctagon size={10} />}
                                                                                    {visit.time}
                                                                                </span>
                                                                                <div className={`text-[9px] font-bold truncate ${isCancelled ? 'line-through' : ''}`}>{visit.carer}</div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div 
                                                        className={`flex-1 rounded-lg border border-dashed flex items-center justify-center group/slot transition-all cursor-pointer 
                                                            ${period.label === 'Morning' ? 'border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700' : ''}
                                                            ${period.label === 'Lunch' ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700' : ''}
                                                            ${period.label === 'Tea' ? 'border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700' : ''}
                                                            ${period.label === 'Evening' ? 'border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700' : ''}
                                                        `}
                                                        onClick={() => {
                                                            if (userRole === 'admin') {
                                                                handleOpenAddVisit(dateStr, period.time);
                                                            }
                                                        }}
                                                    >
                                                        <span className={`text-[8px] font-black uppercase transition-colors 
                                                            ${period.label === 'Morning' ? 'text-amber-400 dark:text-amber-600/50 group-hover/slot:text-amber-700 dark:group-hover/slot:text-amber-500' : ''}
                                                            ${period.label === 'Lunch' ? 'text-emerald-400 dark:text-emerald-600/50 group-hover/slot:text-emerald-700 dark:group-hover/slot:text-emerald-500' : ''}
                                                            ${period.label === 'Tea' ? 'text-blue-400 dark:text-blue-600/50 group-hover/slot:text-blue-700 dark:group-hover/slot:text-blue-500' : ''}
                                                            ${period.label === 'Evening' ? 'text-indigo-400 dark:text-indigo-600/50 group-hover/slot:text-indigo-700 dark:group-hover/slot:text-indigo-500' : ''}
                                                        `}>
                                                            {period.label}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {userRole === 'admin' && (
                                    <button 
                                        onClick={() => handleOpenAddVisit(dateStr)}
                                        className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-light opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                                        title="Add Visit"
                                    >
                                        <Plus size={14} />
                                    </button>
                                )}
                            </div>
                        );
                    }
                    return days;
                })()}
            </div>
            </div>

            {/* VISIT MODAL */}
            {visitModal.isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/20 dark:bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-8 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                {isCancelling ? 'Cancel Visit' : (visitModal.mode === 'add' ? 'Schedule Visit' : 'Edit Visit')}
                            </h3>
                            {!isCancelling && visitModal.mode === 'edit' && (
                                <button onClick={() => handleDeleteVisit(visitModal.visit.id)} className="text-rose-500 hover:text-rose-700 font-bold text-xs uppercase tracking-widest">Delete</button>
                            )}
                        </div>
                        
                        <div className="space-y-6">
                            {isCancelling ? (
                                <div className="space-y-4 animate-in slide-in-from-right-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cancelled By</label>
                                        <select
                                            value={visitForm.cancelledBy}
                                            onChange={(e) => setVisitForm({...visitForm, cancelledBy: e.target.value})}
                                            className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-rose-500/20"
                                        >
                                            <option value="">Select...</option>
                                            <option value="Client / Next of Kin">Client / Next of Kin</option>
                                            <option value="Agency">Agency</option>
                                            <option value="Hospital / Medical">Hospital / Medical</option>
                                            <option value="Carer">Carer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reason for Cancellation</label>
                                        <textarea
                                            value={visitForm.cancellationReason}
                                            onChange={(e) => setVisitForm({...visitForm, cancellationReason: e.target.value})}
                                            className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-medium text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-rose-500/20 min-h-[80px]"
                                            placeholder="Please provide details..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoice Client?</label>
                                            <select
                                                value={visitForm.invoiceClient}
                                                onChange={(e) => setVisitForm({...visitForm, invoiceClient: e.target.value})}
                                                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-rose-500/20"
                                            >
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pay Carer?</label>
                                            <select
                                                value={visitForm.payCarer}
                                                onChange={(e) => setVisitForm({...visitForm, payCarer: e.target.value})}
                                                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-rose-500/20"
                                            >
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                            {/* Type Selection */}
                            <div className="bg-slate-50 dark:bg-slate-800 p-1 rounded-xl flex">
                                <button 
                                    onClick={() => setVisitForm({...visitForm, type: 'Recurring'})}
                                    className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${visitForm.type === 'Recurring' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                >
                                    Rota (Recurring)
                                </button>
                                <button 
                                    onClick={() => setVisitForm({...visitForm, type: 'One-off'})}
                                    className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${visitForm.type === 'One-off' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                >
                                    One-off
                                </button>
                            </div>

                            {/* Date & Carer */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Start Date</label>
                                    <input type="date" value={visitForm.date} onChange={(e) => setVisitForm({...visitForm, date: e.target.value})} className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Carer</label>
                                    <select value={visitForm.carer} onChange={(e) => setVisitForm({...visitForm, carer: e.target.value})} className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-blue-500/20">
                                        <option value="">Select...</option>
                                        {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2 space-y-4 pt-2">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base Carers Required</label>
                                        <div className="flex gap-2 mt-1">
                                            {['1', '2'].map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => setVisitForm({ ...visitForm, carerCount: num })}
                                                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                                                        visitForm.carerCount === num 
                                                            ? 'bg-blue-600 text-white border-b-4 border-blue-800 dark:border-blue-900' 
                                                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                    }`}
                                                >
                                                    {num} Carer{num > 1 ? 's' : ''}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Additional Support</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Add Extra Carer</span>
                                                <button 
                                                    onClick={() => setVisitForm({ ...visitForm, hasAdditionalCarer: !visitForm.hasAdditionalCarer })}
                                                    className={`w-10 h-6 rounded-full transition-colors relative ${visitForm.hasAdditionalCarer ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${visitForm.hasAdditionalCarer ? 'translate-x-4' : ''}`} />
                                                </button>
                                            </div>
                                        </div>

                                        {visitForm.hasAdditionalCarer && (
                                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                                                    <select 
                                                        value={visitForm.additionalCarerType} 
                                                        onChange={(e) => setVisitForm({...visitForm, additionalCarerType: e.target.value})}
                                                        className="w-full mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-emerald-500/20"
                                                    >
                                                        <option value="Shadowing">Shadowing</option>
                                                        <option value="Induction">Induction</option>
                                                        <option value="Training">Training</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pay Rate (ÃÂ£/hr)</label>
                                                    <input 
                                                        type="number" 
                                                        value={visitForm.additionalPayRate} 
                                                        onChange={(e) => setVisitForm({...visitForm, additionalPayRate: e.target.value})}
                                                        className="w-full mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-emerald-500/20"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Start & Finish Time */}
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Start Time</label>
                                        <select 
                                            value={visitForm.time} 
                                            onChange={(e) => setVisitForm({...visitForm, time: e.target.value})} 
                                            className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-blue-500/20"
                                        >
                                            <option value="">Select Time</option>
                                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Finish Time</label>
                                        <select 
                                            value={visitForm.endTime} 
                                            onChange={(e) => setVisitForm({...visitForm, endTime: e.target.value})} 
                                            className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-blue-500/20"
                                        >
                                            <option value="">Select Time</option>
                                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Quick Duration Helpers */}
                                <div className="flex gap-2 flex-wrap">
                                    {[15, 30, 45, 60, 90, 120].map(mins => (
                                        <button
                                            key={mins}
                                            type="button"
                                            onClick={() => {
                                                if (!visitForm.time) return;
                                                const [h, m] = visitForm.time.split(':').map(Number);
                                                const date = new Date();
                                                date.setHours(h);
                                                date.setMinutes(m + mins);
                                                const newEndTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                                                setVisitForm({...visitForm, endTime: newEndTime});
                                            }}
                                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-[10px] font-black uppercase rounded-lg transition-colors border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800"
                                        >
                                            +{mins}m
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Visit Notes */}
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visit Notes (For Carer)</label>
                                <textarea
                                    value={visitForm.note}
                                    onChange={(e) => setVisitForm({...visitForm, note: e.target.value})}
                                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-medium text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-blue-500/20 min-h-[80px]"
                                    placeholder="Enter any specific instructions or notes for this visit..."
                                />
                            </div>

                            {/* Visit Tasks */}
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tasks for this visit</label>
                                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                    {client.tasks && client.tasks.length > 0 ? client.tasks.map(task => {
                                        const isAssigned = visitForm.tasks.includes(task.description);
                                        return (
                                            <div key={task.id} className={`flex items-center p-2 rounded-lg transition-colors ${task.isMandatory && !isAssigned ? 'bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30' : ''}`}>
                                                <input
                                                    id={`visit-task-${task.id}`}
                                                    type="checkbox"
                                                    checked={isAssigned}
                                                    onChange={(e) => {
                                                        const taskDesc = task.description;
                                                        if (e.target.checked) {
                                                            setVisitForm(vf => ({ ...vf, tasks: [...vf.tasks, taskDesc] }));
                                                        } else {
                                                            setVisitForm(vf => ({ ...vf, tasks: vf.tasks.filter(t => t !== taskDesc) }));
                                                        }
                                                    }}
                                                    className={`h-4 w-4 rounded border-gray-300 focus:ring-blue-500 ${task.isMandatory && !isAssigned ? 'text-rose-600 border-rose-300' : 'text-blue-600'}`}
                                                />
                                                <label htmlFor={`visit-task-${task.id}`} className="ml-3 flex-1 flex justify-between items-center text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                                    <span>{task.description}</span>
                                                    {task.isMandatory && (
                                                        <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 px-2 py-0.5 rounded ${isAssigned ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30'}`}>
                                                            <AlertOctagon size={10} /> {isAssigned ? 'Assigned' : 'Unassigned'}
                                                        </span>
                                                    )}
                                                </label>
                                            </div>
                                        );
                                    }) : (
                                        <p className="text-xs text-slate-400 italic p-2">No tasks defined for this client. Add tasks in the 'Tasks' tab.</p>
                                    )}
                                </div>
                            </div>

                            {/* Recurring Options */}
                            {visitForm.type === 'Recurring' && (
                                <div className="space-y-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                                    <div>
                                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Frequency</label>
                                        <select value={visitForm.frequency} onChange={(e) => setVisitForm({...visitForm, frequency: e.target.value})} className="w-full mt-1 bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800/50 rounded-xl p-3 font-bold text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-blue-500/20">
                                            <option value="Daily">Daily</option>
                                            <option value="Weekly">Weekly</option>
                                        </select>
                                    </div>
                                    {visitForm.frequency === 'Weekly' && (
                                        <div>
                                            <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block">Days of Week</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                                    <button
                                                        key={day}
                                                        onClick={() => {
                                                            const days = visitForm.selectedDays.includes(day)
                                                                ? visitForm.selectedDays.filter(d => d !== day)
                                                                : [...visitForm.selectedDays, day];
                                                            setVisitForm({...visitForm, selectedDays: days});
                                                        }}
                                                        className={`w-10 h-10 rounded-xl text-[10px] font-black uppercase transition-all border-b-4 ${visitForm.selectedDays.includes(day) ? 'bg-blue-600 text-white border-blue-800 dark:border-blue-900 active:scale-95' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 active:scale-95'}`}
                                                    >
                                                        {day}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                                </>
                            )}
                        </div>

                        <div className="flex gap-3 mt-8">
                            {isCancelling ? (
                                <>
                                    <button onClick={() => setIsCancelling(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b-4 border-transparent rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Back to Edit</button>
                                    <button onClick={handleSaveVisit} className="flex-1 py-4 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest border-b-4 border-rose-800 dark:border-rose-900 hover:bg-rose-700 transition-all active:scale-95">Confirm Cancel</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setVisitModal({ ...visitModal, isOpen: false })} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b-4 border-transparent rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                    {visitModal.mode === 'edit' && visitModal.visit?.status !== 'Cancelled' && (
                                        <button onClick={() => setIsCancelling(true)} className="flex-1 py-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-b-4 border-rose-200 dark:border-rose-800/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors">Cancel Visit</button>
                                    )}
                                    <button onClick={handleSaveVisit} className="flex-1 py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest border-b-4 border-blue-800 dark:border-blue-900 hover:bg-blue-700 transition-all active:scale-95">Save Schedule</button>
                                </>
                            )}
                        </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRMATION MODAL - LOCAL */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/20 dark:bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{confirmModal.title}</h3>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{confirmModal.message}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b-4 border-transparent rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                            <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(prev => ({ ...prev, isOpen: false })); }} className="flex-1 py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest border-b-4 border-blue-800 dark:border-blue-900 hover:bg-blue-700 transition-all active:scale-95">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* HOVER VISIT MODAL - RENDERED LOCALLY FOR PORTAL EFFECT */}
            {hoveredVisit && hoveredVisitPosition && (
                <div 
                    className="fixed w-72 bg-slate-800 text-white p-4 rounded-xl shadow-2xl transition-opacity pointer-events-none z-[210] animate-in fade-in-5"
                    style={{
                        top: `${hoveredVisitPosition.top}px`,
                        left: `${hoveredVisitPosition.left}px`,
                        transform: 'translate(-50%, -100%) translateY(-0.5rem)',
                    }}
                >
                    <div className="flex justify-between items-start mb-2 border-b border-slate-700 pb-2">
                        <h4 className="font-black text-sm">{hoveredVisit.time} - {hoveredVisit.carer}</h4>
                        {checkIsOverdue(hoveredVisit.date, hoveredVisit.time, hoveredVisit.status) && (
                            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                                <AlertOctagon size={10} /> Overdue
                            </span>
                        )}
                    </div>
                    <div className="space-y-3 text-xs max-h-48 overflow-y-auto">
                        {hoveredVisit.status === 'Cancelled' && (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg text-rose-300">
                                <p className="font-bold uppercase text-[9px] tracking-widest mb-1">Cancelled By: {hoveredVisit.cancelledBy}</p>
                                <p className="font-medium leading-snug">{hoveredVisit.cancellationReason}</p>
                                <div className="mt-2 flex items-center gap-2 pt-2 border-t border-rose-500/20">
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${hoveredVisit.invoiceClient === 'Yes' ? 'bg-rose-500/20 text-rose-200' : 'bg-slate-700/50 text-slate-400'}`}>Invoice: {hoveredVisit.invoiceClient || 'No'}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${hoveredVisit.payCarer === 'Yes' ? 'bg-rose-500/20 text-rose-200' : 'bg-slate-700/50 text-slate-400'}`}>Pay: {hoveredVisit.payCarer || 'No'}</span>
                                </div>
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-slate-400 uppercase text-[9px] tracking-widest">Notes</p>
                            <p className="font-medium text-slate-200 whitespace-pre-wrap">{hoveredVisit.note || 'No notes.'}</p>
                        </div>
                        <div>
                            <p className="font-bold text-slate-400 uppercase text-[9px] tracking-widest">Tasks</p>
                            {hoveredVisit.tasks && hoveredVisit.tasks.length > 0 ? (
                                <ul className="list-disc list-inside pl-1 space-y-1 mt-1">
                                    {hoveredVisit.tasks.map((taskDesc, i) => {
                                        const isMandatory = client.tasks?.find(t => t.description === taskDesc)?.isMandatory;
                                        return (
                                            <li key={i} className="font-medium text-slate-200">
                                                {taskDesc}
                                                {isMandatory && <span className="ml-1.5 text-rose-400 inline-block align-text-bottom"><AlertOctagon size={12} /></span>}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="font-medium text-slate-300 italic">No specific tasks.</p>
                            )}
                        </div>
                    </div>
                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-slate-800"></div>
                </div>
            )}
        </div>
    );
};

export default ClientVisitsView;
