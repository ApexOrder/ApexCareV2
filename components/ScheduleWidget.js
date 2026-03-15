import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, X } from 'lucide-react';

const ScheduleWidget = () => {
  const [carers, setCarers] = useState([
    {
      id: 'c1', name: 'Sarah Jenkins', initials: 'SJ',
      visits: [
        { id: 1, time: '09:00', duration: '1h', client: 'James Miller', type: 'Personal Care', status: 'Completed' },
        { id: 2, time: '11:30', duration: '45m', client: 'Eleanor Rigby', type: 'Medication', status: 'In Progress' },
        { id: 3, time: '14:00', duration: '1h', client: 'Arthur Dent', type: 'Companionship', status: 'Upcoming' },
      ]
    },
    {
      id: 'c2', name: 'Mike Ross', initials: 'MR',
      visits: [
        { id: 4, time: '08:00', duration: '1h', client: 'Alice Johnson', type: 'Personal Care', status: 'Completed' },
        { id: 5, time: '10:00', duration: '30m', client: 'John Doe', type: 'Check-in', status: 'Completed' },
        { id: 6, time: '12:00', duration: '1h', client: 'Robert Brown', type: 'Meal Prep', status: 'Upcoming' },
      ]
    },
    {
      id: 'c3', name: 'Emma Watson', initials: 'EW',
      visits: [
        { id: 7, time: '09:30', duration: '45m', client: 'Margaret Smith', type: 'Medication', status: 'Completed' },
        { id: 8, time: '14:30', duration: '1h', client: 'James Miller', type: 'Companionship', status: 'Upcoming' },
        { id: 9, time: '16:00', duration: '30m', client: 'Eleanor Rigby', type: 'Check-in', status: 'Upcoming' },
      ]
    },
    {
      id: 'c4', name: 'David Tennant', initials: 'DT',
      visits: [
        { id: 10, time: '07:30', duration: '1h', client: 'Arthur Dent', type: 'Personal Care', status: 'Completed' },
        { id: 11, time: '13:00', duration: '45m', client: 'Margaret Smith', type: 'Meal Prep', status: 'Upcoming' },
      ]
    }
  ]);

  const [selectedVisit, setSelectedVisit] = useState(null);
  const [editCarerId, setEditCarerId] = useState('');

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [invoiceClient, setInvoiceClient] = useState('No');
  const [payCarer, setPayCarer] = useState('No');

  // Drag state for Modal
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Visit Drag state for Timeline
  const [draggedVisit, setDraggedVisit] = useState(null);

  const START_HOUR = 0;
  const PIXELS_PER_HOUR = 200; 

  // Reset position when closed
  useEffect(() => {
    if (!selectedVisit) {
      setModalPos({ x: 0, y: 0 });
      setIsDragging(false);
      setIsCancelling(false);
      setCancelReason('');
      setInvoiceClient('No');
      setPayCarer('No');
    }
  }, [selectedVisit]);

  // Handle mouse moves for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setModalPos({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - modalPos.x, y: e.clientY - modalPos.y };
  };
  
  const formatTimeFromLeft = (left) => {
    const totalMinutes = (left / PIXELS_PER_HOUR) * 60;
    const snappedMinutes = Math.round(totalMinutes / 15) * 15;
    let newH = Math.floor(snappedMinutes / 60);
    let newM = snappedMinutes % 60;
    if (newH < 0) { newH = 0; newM = 0; }
    if (newH > 23) { newH = 23; newM = 45; }
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  };

  const handleVisitMouseDown = (e, visit, carerId) => {
    e.stopPropagation();
    const style = getVisitStyle(visit.time, visit.duration);
    const startLeft = parseFloat(style.left);
    setDraggedVisit({
      ...visit,
      carerId,
      startClientX: e.clientX,
      startLeft: startLeft,
      currentLeft: startLeft,
      isDragging: false
    });
  };

  // Drag logic for visits on timeline
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggedVisit) return;
      const deltaX = e.clientX - draggedVisit.startClientX;
      
      if (!draggedVisit.isDragging && Math.abs(deltaX) > 3) {
         setDraggedVisit(prev => ({ ...prev, isDragging: true }));
      }

      if (draggedVisit.isDragging || Math.abs(deltaX) > 3) {
          let newLeft = draggedVisit.startLeft + deltaX;
          if (newLeft < 0) newLeft = 0;
          setDraggedVisit(prev => ({ ...prev, currentLeft: newLeft }));
      }
    };

    const handleMouseUp = (e) => {
      if (!draggedVisit) return;
      if (draggedVisit.isDragging) {
          const newTime = formatTimeFromLeft(draggedVisit.currentLeft);
          setCarers(prev => prev.map(c => {
            if (c.id === draggedVisit.carerId) return { ...c, visits: c.visits.map(v => v.id === draggedVisit.id ? { ...v, time: newTime } : v) };
            return c;
          }));
      } else {
          handleVisitClick(draggedVisit, draggedVisit.carerId);
      }
      setDraggedVisit(null);
    };

    if (draggedVisit) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [draggedVisit, setCarers]);

  const handleVisitClick = (visit, carerId) => {
    setSelectedVisit({ ...visit, currentCarerId: carerId });
    setEditCarerId(carerId);
  };

  const handleConfirmCancellation = () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }
    setCarers(carers.map(carer => {
      if (carer.id === selectedVisit.currentCarerId) {
        return { 
          ...carer, 
          visits: carer.visits.map(v => v.id === selectedVisit.id ? { 
            ...v, status: 'Cancelled', cancelReason, invoiceClient, payCarer 
          } : v) 
        };
      }
      return carer;
    }));
    setSelectedVisit(null);
  };

  const handleSaveVisit = () => {
    if (editCarerId !== selectedVisit.currentCarerId) {
      setCarers(carers.map(carer => {
        if (carer.id === selectedVisit.currentCarerId) return { ...carer, visits: carer.visits.filter(v => v.id !== selectedVisit.id) };
        if (carer.id === editCarerId) {
          const { currentCarerId, ...visitToSave } = selectedVisit;
          return { ...carer, visits: [...carer.visits, visitToSave] };
        }
        return carer;
      }));
    }
    setSelectedVisit(null);
  };

  const getVisitStyle = (time, duration) => {
    const [hours, minutes] = time.split(':').map(Number);
    
    let durMins = 0;
    const hMatch = duration.match(/(\d+)h/);
    const mMatch = duration.match(/(\d+)m/);
    if (hMatch) durMins += parseInt(hMatch[1], 10) * 60;
    if (mMatch) durMins += parseInt(mMatch[1], 10);
    if (!hMatch && !mMatch) durMins = 60; 

    const startOffsetMins = (hours * 60 + minutes) - (START_HOUR * 60);
    const left = (startOffsetMins / 60) * PIXELS_PER_HOUR;
    const width = (durMins / 60) * PIXELS_PER_HOUR;

    return {
      left: `${left}px`,
      width: `${Math.max(width, 130)}px`
    };
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6" style={{ borderTop: '6px solid #10b981' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Today's Schedule</h3>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-colors">
          <CalendarIcon size={20} />
        </button>
      </div>

      <div className="relative overflow-x-auto pb-2 max-h-[350px] overflow-y-auto">
        <div className="min-w-max pb-4">
          
          {/* Timeline Header */}
          <div className="flex ml-[216px] mb-4 relative h-4">
            {Array.from({ length: 25 }, (_, i) => i + START_HOUR).map((hour, i) => (
              <div key={hour} className="absolute text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ left: `${i * PIXELS_PER_HOUR}px`, transform: 'translateX(-50%)' }}>
                {`${(hour % 24).toString().padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {carers.map((carer) => (
              <div key={carer.id} className="flex relative group/row border-b border-slate-50 dark:border-slate-800/50 pb-4 last:border-0 last:pb-0">
                {/* Sticky Carer Column */}
                <div className="w-48 shrink-0 sticky left-0 z-20 bg-white dark:bg-slate-900 flex items-center gap-3 py-2 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm border border-blue-100 dark:border-blue-800 shrink-0">
                    {carer.initials}
                  </div>
                  <div className="min-w-0">
                     <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                       {carer.name}
                     </div>
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       {carer.visits.length} Visits
                     </div>
                  </div>
                  {/* Gradient shadow for sticky overlap */}
                  <div className="absolute right-0 top-0 bottom-0 w-4 translate-x-full bg-gradient-to-r from-white dark:from-slate-900 to-transparent pointer-events-none"></div>
                </div>

                {/* Timeline Area */}
                <div className="flex-1 relative ml-6" style={{ width: `${24 * PIXELS_PER_HOUR}px`, minHeight: '60px' }}>
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className="absolute top-0 bottom-[-24px] border-l border-slate-100 dark:border-slate-800/50 transition-colors group-hover/row:border-slate-200 dark:group-hover/row:border-slate-700" style={{ left: `${i * PIXELS_PER_HOUR}px` }}></div>
                    ))}
                  </div>

                  {/* Visit Cards */}
                  {carer.visits.map(visit => {
                    const isBeingDragged = draggedVisit && draggedVisit.id === visit.id;
                    const style = getVisitStyle(visit.time, visit.duration);
                    
                    if (isBeingDragged) {
                        style.left = `${draggedVisit.currentLeft}px`;
                        style.zIndex = 40;
                        style.transition = 'none';
                    }

                    return (
                      <div key={visit.id} 
                           onMouseDown={(e) => handleVisitMouseDown(e, visit, carer.id)}
                           className={`absolute top-0 bottom-0 p-2 rounded-2xl border transition-all cursor-grab active:cursor-grabbing hover:z-30 hover:shadow-lg group flex flex-col justify-center overflow-hidden select-none ${
                             visit.status === 'In Progress' ? 'bg-emerald-50/90 dark:bg-emerald-900/80 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-800' :
                             visit.status === 'Completed' ? 'bg-slate-50/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700' :
                             visit.status === 'Cancelled' ? 'bg-rose-50/90 dark:bg-rose-900/80 border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-800 opacity-75' :
                             'bg-white/90 dark:bg-slate-800/90 border-blue-200 dark:border-blue-700 hover:bg-blue-50/90 dark:hover:bg-slate-700 backdrop-blur-sm shadow-sm'
                           } ${isBeingDragged ? 'shadow-xl scale-[1.02] ring-2 ring-blue-500/50' : ''}`}
                           style={style}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest truncate ${
                              visit.status === 'Completed' ? 'text-slate-400 dark:text-slate-500' :
                              visit.status === 'In Progress' ? 'text-emerald-600 dark:text-emerald-400' :
                              visit.status === 'Cancelled' ? 'text-rose-600 dark:text-rose-400' :
                              'text-blue-600 dark:text-blue-400'
                          }`}>
                              {isBeingDragged ? formatTimeFromLeft(draggedVisit.currentLeft) : visit.time} <span className="opacity-60">({visit.duration})</span>
                          </span>
                          {visit.status === 'Completed' && <CheckCircle2 size={12} className="text-slate-400 dark:text-slate-500 shrink-0 ml-1" />}
                          {visit.status === 'Cancelled' && <X size={12} className="text-rose-500 dark:text-rose-400 shrink-0 ml-1" />}
                          {visit.status === 'In Progress' && <span className="relative flex h-2 w-2 shrink-0 ml-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>}
                        </div>
                        <h4 className={`text-xs font-black truncate transition-colors ${
                            visit.status === 'Completed' ? 'text-slate-500 dark:text-slate-400' : 
                            visit.status === 'Cancelled' ? 'text-rose-700 dark:text-rose-300 line-through' :
                            'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                        }`}>{visit.client}</h4>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate mt-0.5">{visit.type}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
        <button className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest hover:underline">
          View Full Schedule
        </button>
      </div>

      {/* Quick Edit Visit Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-sm animate-in zoom-in-95"
            style={{ 
              transform: `translate(${modalPos.x}px, ${modalPos.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 w-full shadow-2xl border border-slate-100 dark:border-slate-800 relative">
              
              {/* Drag Handle Zone */}
              <div 
                className="absolute inset-x-0 top-0 h-20 cursor-grab active:cursor-grabbing rounded-t-[2rem]"
                onMouseDown={handleMouseDown}
              />

              <button 
                onClick={() => setSelectedVisit(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
              >
                <X size={20} />
              </button>
              
              <div className="relative z-10 pointer-events-none">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Edit Visit</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">{selectedVisit.client} • {selectedVisit.time}</p>
              </div>
              
              <div className="space-y-4 relative z-10">
                {isCancelling ? (
                  <>
                    <div>
                      <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Reason for Cancellation</label>
                      <textarea 
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-full mt-1 bg-rose-50/50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/30 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-rose-500/20"
                        placeholder="e.g., Client admitted to hospital..."
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoice Client?</label>
                        <select 
                          value={invoiceClient}
                          onChange={(e) => setInvoiceClient(e.target.value)}
                          className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pay Carer?</label>
                        <select 
                          value={payCarer}
                          onChange={(e) => setPayCarer(e.target.value)}
                          className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assigned Carer</label>
                    <select 
                      value={editCarerId}
                      onChange={(e) => setEditCarerId(e.target.value)}
                      className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white outline-none border focus:ring-2 focus:ring-blue-500/20"
                    >
                      {carers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8 relative z-10">
                {isCancelling ? (
                  <>
                    <button 
                      onClick={() => setIsCancelling(false)}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b-4 border-transparent rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleConfirmCancellation}
                      className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest border-b-4 border-rose-800 dark:border-rose-900 hover:bg-rose-700 transition-all active:scale-95"
                    >
                      Confirm Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsCancelling(true)}
                      className="flex-1 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-b-4 border-rose-200 dark:border-rose-800/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                    >
                      Cancel Visit
                    </button>
                    <button 
                      onClick={handleSaveVisit}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest border-b-4 border-blue-800 dark:border-blue-900 hover:bg-blue-700 transition-all active:scale-95"
                    >
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleWidget;