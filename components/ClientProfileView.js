import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  LayoutDashboard, 
  User, 
  ClipboardList, 
  CalendarDays, 
  FileText, 
  Clock, 
  Scan, 
  Download, 
  ArrowLeft, 
  Car, 
  Pill, 
  File,
  X
} from 'lucide-react';
import TaskManagement from './TaskManagement';
import ClientVisitsView from './ClientVisitsView';
// import ClientLogsView from './ClientLogsView';
import ClientInformationView from './ClientInformationView';
import ThemeToggle from './ThemeToggle';
// import ClientRiskView from './ClientRiskView';

const ClientProfileView = ({ client, areas, onUpdateClient, onBack, onDirtyStateChange, userRole, staff = [], availableGroups = [] }) => {
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [showQrModal, setShowQrModal] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const fileInputRef = useRef(null);

  const emergencyQrData = useMemo(() => {
    const formatContact = (contact) => {
        if (!contact) return 'None';
        if (typeof contact === 'string') return contact;
        return `${contact.name || ''} ${contact.phone ? `(${contact.phone})` : ''}`.trim() || 'None';
    };

    const data = [
        `EMERGENCY SNAPSHOT - ${client.firstName} ${client.lastName}`,
        `DOB: ${client.dob || 'Unknown'} | NHS: ${client.nhsNumber || 'Unknown'}`,
        `Allergies: ${client.allergies && client.allergies.length > 0 ? client.allergies.join(', ') : 'NKDA'}`,
        `DNACPR: ${client.legal?.dnacpr ? 'IN PLACE' : 'Attempt Resuscitation'}`,
        `RESPEC: ${client.legal?.respecStatus || 'Not Recorded'}`,
        `Contact: ${formatContact(client.emergencyContact)}`
    ].join('\n');
    return encodeURIComponent(data);
  }, [client]);

  const handleProfileImageUpdate = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Only JPG and PNG files are allowed.');
        e.target.value = '';
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('File size must be less than 2MB.');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateClient({ ...client, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // State for status change reasoning
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: null, title: '', message: '', reason: '' });

  const [dischargeReason, setDischargeReason] = useState('Care Needs Reduced');
  const [isTemporary, setIsTemporary] = useState(false);
  const [dischargeDate, setDischargeDate] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');

  // Calculate CQC Status based on profile completeness
  const cqcStatus = useMemo(() => {
     const missing = [];
     const add = (label) => missing.push({ label, onFix: () => setActiveSubTab('Client Information') });

     if (!client.nhsNumber) add('NHS Number');
     if (!client.pidNumber) add('Local Auth ID');
     if (!client.dob) add('Date of Birth');
     if (!client.address) add('Address');
     if (!client.careLevel) add('Care Level');
     if (!client.mobility?.level) add('Mobility Profile');
     if (!client.nutrition?.dietaryType) add('Dietary Profile');
     if (!client.gp?.name) add('GP Details');
     
     if (missing.length > 0) {
        return {
           label: 'Incomplete',
           color: 'text-amber-600',
           dot: 'bg-amber-500',
           missingList: missing
        };
     }
     return {
        label: 'Audit Ready',
        color: 'text-emerald-600',
        dot: 'bg-emerald-500',
        missingList: []
     };
  }, [client]);

  const [isClientInfoDirty, setIsClientInfoDirty] = useState(false);

  useEffect(() => {
    const isDirty = isClientInfoDirty;
    onDirtyStateChange?.(isDirty);
  }, [isClientInfoDirty, onDirtyStateChange]);

  // Documents state
  const [documents, setDocuments] = useState(client.documents || []);

  // Document viewer state
  const [viewingDoc, setViewingDoc] = useState(null);
  const [docContent, setDocContent] = useState('');
  const [csvData, setCsvData] = useState([]);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
      const reader = new FileReader();
      
      reader.onload = (event) => {
          const newDoc = {
            id: `doc-${Date.now()}`,
            name: file.name,
            type: extension.toUpperCase(),
            date: new Date().toISOString(),
            size: `${(file.size / 1024).toFixed(1)} KB`,
            uploadedBy: 'Leon Lowden (Admin)',
            content: event.target?.result || '',
            isImage: isImage
          };
          const updatedDocs = [newDoc, ...documents];
          setDocuments(updatedDocs);
          onUpdateClient({
            ...client,
            documents: updatedDocs
          });
      };
      
      if (isImage) {
          reader.readAsDataURL(file);
      } else {
          reader.readAsText(file);
      }
    }
  };

  const handleSaveDocument = () => {
      if (!viewingDoc) return;
      
      let contentToSave = docContent;
      if (viewingDoc.type === 'CSV') {
          contentToSave = csvData.map(row => row.join(',')).join('\n');
      }

      const updatedDocs = documents.map(d => 
          d.id === viewingDoc.id ? { ...d, content: contentToSave } : d
      );
      
      setDocuments(updatedDocs);
      
      // Add to logs
      const changeLog = {
          id: `h-${Date.now()}`,
          date: new Date().toISOString(),
          author: 'Leon Lowden (Admin)',
          changes: [`Edited document: ${viewingDoc.name}`]
      };

      onUpdateClient({
          ...client,
          documents: updatedDocs,
          editHistory: [changeLog, ...(client.editHistory || [])]
      });
      
      setViewingDoc(null);
      setDocContent('');
  };

  const handleDeleteDocument = (id) => {
      if (window.confirm('Are you sure you want to delete this document?')) {
          const updatedDocs = documents.filter(d => d.id !== id);
          setDocuments(updatedDocs);
          onUpdateClient({
            ...client,
            documents: updatedDocs
          });
      }
  };

  const calculateAge = (dob) => {
    if (!dob || dob === "" || dob === "0000-00-00") return { full: 'Not Recorded', age: 'N/A' };
    try {
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) return { full: 'Invalid Date', age: 'N/A' };
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return { full: `${birthDate.toLocaleDateString('en-GB')} (${age} years)`, age };
    } catch (e) { return { full: 'Not Recorded', age: 'N/A' }; }
  };

  const handleDischargeClient = () => {
    setDischargeReason('Care Needs Reduced');
    setIsTemporary(false);
    setDischargeDate(new Date().toISOString().split('T')[0]);
    setExpectedReturnDate('');
    setStatusModal({
      isOpen: true,
      type: 'Discharge',
      title: 'Discharge Client',
      message: `Please select the primary reason for discharging ${client.firstName} ${client.lastName}.`,
      reason: ''
    });
  };

  const handleReadmitClient = () => {
    const isHospitalized = client.status === 'Hospitalized';
    setStatusModal({
      isOpen: true,
      type: 'Re-admit',
      title: isHospitalized ? 'Re-activate Client?' : 'Re-admit Client?',
      message: isHospitalized 
        ? `Are you sure you want to re-activate ${client.firstName} ${client.lastName} from hospital leave? This will set their status to "Active".`
        : `Are you sure you want to re-admit ${client.firstName} ${client.lastName}? This will set their status to "Active".`,
      reason: ''
    });
  };

  const handleConfirmStatusChange = () => {
    if (!statusModal.type) return;

    let newStatus = 'Active';
    let logCategory = 'Action';
    let noteContent = '';
    
    if (statusModal.type === 'Discharge') {
        if (dischargeReason === 'Deceased') {
            newStatus = 'Deceased';
            logCategory = 'Clinical';
        } else if (dischargeReason === 'Hospitalised') {
            newStatus = 'Hospitalized';
            logCategory = 'Clinical';
        } else {
            newStatus = 'Left Service';
            logCategory = 'Action';
        }
        noteContent = `Discharged - ${dischargeReason}. ${statusModal.reason}`;
        
        if (dischargeDate) {
            noteContent += ` | Date: ${dischargeDate}`;
        }
        
        if (isTemporary) {
            noteContent += ` | Temporary Suspension`;
            if (expectedReturnDate) {
                noteContent += ` | Expected Return: ${expectedReturnDate}`;
            }
        }
    } else if (statusModal.type === 'Re-admit') {
        newStatus = 'Active';
        logCategory = 'Action';
        const action = client.status === 'Hospitalized' ? 'Re-activated from hospital' : 'Re-admitted to service';
        noteContent = `${action}. ${statusModal.reason}`;
    }

    const note = {
      id: `n-${Date.now()}`,
      date: new Date().toISOString(),
      author: 'Leon Lowden (Admin)',
      category: logCategory,
      content: noteContent,
      isCqcEvidence: true,
      status: 'Resolved'
    };

    const updatedClient = {
      ...client,
      status: newStatus,
      careNotes: [note, ...(client.careNotes || [])]
    };

    if (newStatus === 'Hospitalized' && dischargeDate) {
        updatedClient.hospitalAdmissionDate = dischargeDate;
    }

    onUpdateClient(updatedClient);

    setStatusModal({ isOpen: false, type: null, title: '', message: '', reason: '' });
  };

  const managementMenu = [
    { id: 'Overview', icon: LayoutDashboard, color: 'text-blue-500' },
    { id: 'Client Information', icon: User, color: 'text-violet-500' },
    { id: 'Tasks', icon: ClipboardList, color: 'text-emerald-500' },
    { id: 'Visits', icon: CalendarDays, color: 'text-amber-500' },
    { id: 'Documents', icon: FileText, color: 'text-rose-500' },
    { id: 'Timeline', icon: Clock, color: 'text-indigo-500' },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-screen bg-slate-50 dark:bg-slate-950 overflow-y-auto lg:overflow-hidden">
      {/* MANAGEMENT SUB-NAVBAR */}
      <div className="w-full lg:w-24 group hover:lg:w-72 bg-white dark:bg-slate-900 border-r border-l border-slate-200 dark:border-slate-800 flex flex-col h-auto lg:h-full shadow-2xl z-[110] shrink-0 transition-all duration-300 ease-in-out">
        <div className="p-4 lg:group-hover:p-6 md:lg:group-hover:p-8 border-b border-slate-200 dark:border-slate-800 flex flex-col items-center transition-all">
          <div className="relative mb-4 cursor-pointer" onClick={() => userRole === 'admin' && fileInputRef.current?.click()}>
             <img src={client.profileImage || `https://picsum.photos/seed/${client.id}/120/120`} className="w-16 h-16 lg:group-hover:w-20 lg:group-hover:h-20 rounded-[1.5rem] lg:group-hover:rounded-[2rem] object-cover shadow-2xl border-4 border-white transition-all" alt="" />
             {userRole === 'admin' && (
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-black text-slate-700 bg-white/90 px-2 py-1 rounded-lg backdrop-blur-sm uppercase tracking-widest shadow-sm">Edit</span>
               </div>
             )}
             <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png" onChange={handleProfileImageUpdate} />
          </div>
          <div className="flex flex-col items-center overflow-hidden transition-all duration-300 ease-in-out lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-24 lg:group-hover:opacity-100">
             <h2 className="text-xl font-black text-slate-900 dark:text-white text-center leading-none mb-1 whitespace-nowrap">{client.firstName} {client.lastName}</h2>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">#{client.clientCode || client.id}</p>
          </div>
          <button onClick={onBack} className="mt-6 w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl transition-all relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-100 lg:group-hover:opacity-0 lg:group-hover:scale-75">
                <ArrowLeft size={20} />
            </div>
            <div className="w-full flex items-center justify-center transition-all duration-300 opacity-0 lg:group-hover:opacity-100">
                 <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Exit to Dashboard</span>
            </div>
          </button>
        </div>

        <nav className="flex-1 overflow-x-auto lg:overflow-y-auto p-4 flex flex-row lg:flex-col gap-2 lg:gap-0 lg:space-y-1 scrollbar-hide">
          {managementMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`group/btn w-auto lg:w-full flex items-center lg:justify-center lg:group-hover:justify-start gap-2 lg:gap-0 lg:group-hover:gap-4 px-4 lg:group-hover:px-5 py-2 lg:py-3 text-sm font-bold rounded-2xl transition-all whitespace-nowrap ${
                activeSubTab === item.id 
                  ? 'bg-blue-600 text-white border-b-4 border-blue-800 dark:border-blue-900 active:scale-95' 
                  : 'text-slate-500 dark:text-slate-400 border-b-4 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 active:scale-95'
              }`}
            >
              <span className={`shrink-0 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-6 ${activeSubTab === item.id ? 'text-white' : item.color}`}><item.icon size={20} /></span>
              <span className="truncate lg:hidden lg:group-hover:inline">{item.id}</span>
            </button>
          ))}
          
          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800 w-full">
             <ThemeToggle className="w-full" />
          </div>
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-visible lg:overflow-y-auto flex flex-col relative bg-slate-50 dark:bg-slate-950 z-0 pb-24 md:pb-0">
        
        {/* ENHANCED GOVERNANCE HEADER */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4 z-[100] flex flex-col xl:flex-row items-center justify-end shadow-sm gap-4">
           <div className="flex gap-3 w-full md:w-auto">
              <button 
                  onClick={() => setShowQrModal(true)}
                  className="w-full md:w-auto px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                  <Scan size={16} /> QR Access
              </button>
              {userRole === 'admin' && (client.status === 'Active' ? (
                 <button 
                   onClick={handleDischargeClient}
                   className="w-full md:w-auto px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                 >
                   Discharge Client
                 </button>
              ) : (
                 <div className="flex gap-3 w-full md:w-auto">
                    {client.status === 'Hospitalized' && (
                        <button 
                           onClick={handleDischargeClient}
                           className="w-full md:w-auto px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                        >
                           Discharge
                        </button>
                    )}
                    <button 
                        onClick={handleReadmitClient}
                        className="w-full md:w-auto px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                    >
                        {client.status === 'Hospitalized' ? 'Re-activate Client' : 'Re-admit Client'}
                    </button>
                 </div>
              ))}
              <button className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg border-b-4 border-blue-800 dark:border-blue-900 transition-transform active:scale-95 flex items-center"><Download size={16} className="mr-2" />Export Evidence Pack</button>
           </div>
        </div>

        <div className="max-w-[100rem] mx-auto w-full p-4 md:p-10 space-y-8 md:space-y-12">
           
           {activeSubTab === 'Overview' && (
             <>
               {/* SNAPSHOT WIDGETS */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Next Visit with Scheduled Carer */}
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group" style={{ borderTop: '6px solid #3b82f6' }}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12 group-hover:-translate-x-2">
                      <Car size={48} className="text-blue-600" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Next Scheduled Visit</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">09:00 - 10:00</p>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-black text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 uppercase">SJ</div>
                       <div>
                         <p className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Assigned Carer</p>
                         <p className="text-xs font-bold text-slate-900 dark:text-white">Sarah Jenkins</p>
                       </div>
                    </div>
                  </div>

                  {/* Wellbeing Insight */}
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl" style={{ borderTop: '6px solid #10b981' }}>
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Wellbeing Score</p>
                    <div className="flex items-end gap-3">
                      <p className={`text-5xl font-black ${client.wellbeingScore > 80 ? 'text-emerald-600 dark:text-emerald-500' : 'text-amber-600 dark:text-amber-500'}`}>{client.wellbeingScore}%</p>
                      <span className="text-xs font-bold text-slate-500 pb-2 uppercase tracking-tighter">vs last week</span>
                    </div>
                    <div className="mt-6 flex items-center gap-2">
                       <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${client.wellbeingScore}%` }}></div>
                       </div>
                    </div>
                  </div>

                  {/* Quick MAR Status */}
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl" style={{ borderTop: '6px solid #14b8a6' }}>
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Medication Status</p>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white uppercase">Fully Compliant</p>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mt-2">Last dose: 08:30 Today</p>
                  </div>
               </div>

               {/* IDENTITY & PROFILE SUMMARY */}
               <section className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden" style={{ borderTop: '6px solid #3b82f6' }}>
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Identity & Profile Summary</h3>
                     <button onClick={() => setActiveSubTab('Client Information')} className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase hover:underline">Full Details Ã¢ÂÂ</button>
                  </div>
                  <div className="p-6 md:p-10 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                     <div className="w-full lg:w-auto flex justify-center shrink-0">
                        <div className="relative group cursor-pointer" onClick={() => setShowFullImage(true)}>
                           <img src={client.profileImage || `https://picsum.photos/seed/${client.id}/400/400`} alt={client.firstName} className="w-48 h-48 md:w-56 md:h-56 rounded-[2.5rem] object-cover shadow-xl border-8 border-white dark:border-slate-800 transition-transform duration-300 group-hover:scale-105" />
                           <div className="absolute inset-0 rounded-[2.5rem] bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center pointer-events-none ring-1 ring-inset ring-slate-900/10 dark:ring-white/10">
                               <Scan size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                           </div>
                        </div>
                     </div>
                     <div className="flex-1 w-full grid grid-cols-2 lg:grid-cols-3 gap-8">
                     {[
                       { label: 'NHS Number', value: client.nhsNumber || 'Not Recorded' },
                       { label: 'Age / DOB', value: calculateAge(client.dob).full },
                       { label: 'Group', value: client.group || 'Not Assigned' },
                       { label: 'POC Type', value: client.pocType || 'Not Recorded' },
                       { label: 'Primary Contact', value: client.phone || 'N/A', isPhone: true },
                       { label: 'Address', value: client.address || 'Not Recorded', isAddress: true, fullWidth: true },
                     ].map(item => (
                       <div key={item.label} className={`space-y-1 ${item.fullWidth ? 'col-span-2 lg:col-span-3' : ''}`}>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                          {item.isPhone && item.value !== 'N/A' ? (
                             <a href={`tel:${item.value.replace(/[^0-9+]/g, '')}`} className="text-sm font-bold text-blue-600 hover:underline truncate block">{item.value}</a>
                          ) : item.isAddress && item.value !== 'Not Recorded' ? (
                             <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.value)}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline truncate block" title={item.value}>
                               {item.value}
                             </a>
                          ) : (
                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={item.value}>{item.value}</p>
                          )}
                       </div>
                     ))}
                     </div>
                  </div>
               </section>

               {/* ARRIVAL INSTRUCTIONS & ALERT (Moved Above Identity) */}
               <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl relative overflow-hidden" style={{ borderTop: '6px solid #f59e0b' }}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32"></div>
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Arrival Instructions</p>
                       <p className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{client.arrivalNote || 'No specific arrival instructions recorded.'}</p>
                    </div>
                    <div className="space-y-6">
                       <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Important Consideration</p>
                       <p className="text-lg font-bold text-amber-600 dark:text-amber-500 italic">"{client.bigThing || 'No critical considerations listed.'}"</p>
                    </div>
                  </div>
               </section>

               {/* QUICK PERSONAL PROFILE (PMH & Hobbies for Carers) */}
               <section className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden" style={{ borderTop: '6px solid #6366f1' }}>
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20">
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        Personal Snapshot <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 rounded-full uppercase">For Carers</span>
                     </h3>
                  </div>
                  <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">Previous Medical History</p>
                        <div className="flex flex-wrap gap-2">
                           {client.pmh && client.pmh.length > 0 ? client.pmh.map((p, idx) => (
                              <span key={idx} className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase rounded-lg">
                                 {p}
                              </span>
                           )) : (
                              <p className="text-xs font-bold text-slate-500 italic">No medical history recorded.</p>
                           )}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">Hobbies & Interests</p>
                        <div className="flex flex-wrap gap-2">
                           {client.social?.hobbies && client.social.hobbies.length > 0 ? client.social.hobbies.map((h, idx) => (
                              <span key={idx} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase rounded-lg">
                                 {h}
                              </span>
                           )) : (
                              <p className="text-xs font-bold text-slate-500 italic">No hobbies recorded.</p>
                           )}
                        </div>
                     </div>
                  </div>
               </section>

               {/* ABOUT ME / HIGHLIGHTS */}
               <section className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden" style={{ borderTop: '6px solid #8b5cf6' }}>
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">About {client.firstName}</h3>
                  </div>
                  <div className="p-6 md:p-10">
                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                       {client.social?.lifeStory || 'No summary available.'}
                    </p>
                  </div>
               </section>

               {/* Care Plan & Daily Routine */}
               <section className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden" style={{ borderTop: '6px solid #14b8a6' }}>
                 <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Care Plan & Daily Routine</h3>
                 </div>
                 <div className="p-6 md:p-10 grid grid-cols-1 gap-8">
                   {[
                     { label: 'Morning Routine', key: 'morning' },
                     { label: 'Lunch Routine', key: 'lunch' },
                     { label: 'Tea / Evening Routine', key: 'tea' },
                     { label: 'Night Routine', key: 'night' },
                   ].map(item => (
                     <div key={item.key}>
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</label>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium leading-relaxed mt-1 whitespace-pre-wrap">
                          {client.carePlan?.[item.key] || 'No routine recorded.'}
                        </div>
                     </div>
                   ))}
                 </div>
               </section>
             </>
           )}

           {activeSubTab === 'Client Information' && (
             <ClientInformationView 
               client={client}
               onUpdateClient={onUpdateClient}
               userRole={userRole}
               availableGroups={availableGroups}
               onDirtyStateChange={setIsClientInfoDirty}
             />
           )}

           {activeSubTab === 'Tasks' && (
              <TaskManagement 
                tasks={client.tasks || []}
                onUpdateTasks={(updatedTasks) => onUpdateClient({ ...client, tasks: updatedTasks })}
                userRole={userRole}
              />
           )}

           {activeSubTab === 'Visits' && (
             <ClientVisitsView 
               client={client}
               onUpdateClient={onUpdateClient}
               userRole={userRole}
               staff={staff}
             />
           )}

           {activeSubTab === 'Documents' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                 {/* ... Document List ... */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.length > 0 ? documents.map(doc => (
                       <div key={doc.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative cursor-pointer">
                          <div className="flex justify-between items-start mb-4">
                             <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400">{doc.type === 'PDF' ? <FileText size={24} /> : <File size={24} />}</div>
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white truncate mb-1" title={doc.name}>{doc.name}</h4>
                       </div>
                    )) : (
                       <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                          <FileText size={48} className="mb-4 text-slate-300" />
                          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No documents uploaded</p>
                       </div>
                    )}
                 </div>
              </div>
           )}

           {activeSubTab === 'Timeline' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                <section className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden" style={{ borderTop: '6px solid #64748b' }}>
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                     <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Modification Timeline</h3>
                  </div>
                  <div className="p-6 md:p-10">
                    {(client.editHistory && client.editHistory.length > 0) ? (
                      <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                        {client.editHistory.map((entry) => (
                          <div key={entry.id} className="relative pl-10">
                            <div className="absolute left-0 top-1.5 w-10 h-10 flex items-center justify-center">
                               <div className="w-3 h-3 bg-blue-600 rounded-full ring-4 ring-white"></div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                               <div className="flex justify-between items-start mb-2">
                                  <p className="text-xs font-black text-slate-900 dark:text-white">{entry.author}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(entry.date).toLocaleString()}</p>
                               </div>
                               <ul className="space-y-1">
                                 {entry.changes.map((change, idx) => (
                                   <li key={idx} className="text-sm text-slate-600 dark:text-slate-300 font-medium">Ã¢ÂÂ¢ {change}</li>
                                 ))}
                               </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-slate-400 font-medium italic">No modification history available.</div>
                    )}
                  </div>
                </section>
              </div>
           )}

           {activeSubTab !== 'Overview' && activeSubTab !== 'Client Information' && activeSubTab !== 'Timeline' && activeSubTab !== 'Documents' && activeSubTab !== 'Tasks' && activeSubTab !== 'Visits' && (
             <div className="py-40 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 opacity-30">
                {(() => {
                    const Icon = managementMenu.find(m => m.id === activeSubTab)?.icon || FileText;
                    return <Icon size={64} className="mb-6" />;
                })()}
                <p className="text-xl font-black uppercase tracking-widest text-slate-500">{activeSubTab} Deployment Pending</p>
             </div>
           )}
        </div>
      </div>

      {/* COMPLIANCE SIDEBAR */}
      {activeSubTab === 'Overview' && (
      <div className="w-full lg:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 md:p-10 space-y-12 overflow-y-auto scrollbar-hide shrink-0">
         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-slate-900 dark:text-white relative overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full"></div>
            <p className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest mb-6">Compliance Status</p>
            <div className="space-y-8 relative z-10">
               <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">CQC Status</p>
                  <div className="flex items-center gap-2">
                     <span className={`w-2 h-2 rounded-full ${cqcStatus.dot} ${cqcStatus.missingList.length > 0 ? 'animate-pulse' : ''}`}></span>
                     <p className={`text-lg font-black uppercase ${cqcStatus.color}`}>{cqcStatus.label}</p>
                  </div>
               </div>
               <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Clinical Priority</p>
                  <p className={`text-xl font-black uppercase ${client.careLevel === 'High' || client.careLevel === 'Critical' ? 'text-rose-600 dark:text-rose-500' : 'text-slate-900 dark:text-white'}`}>{client.careLevel}</p>
               </div>
               <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Review Deadline</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white uppercase">{client.nextReviewDate}</p>
               </div>
            </div>
         </div>
         {/* MEDICATION TRACKER WIDGET */}
         {client.medicationModuleActive && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-slate-900 dark:text-white relative overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full"></div>
               <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest mb-6">Medication Tracker</p>
               <div className="space-y-8 relative z-10">
                  <div>
                     <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Last Ordered</p>
                     <p className="text-lg font-black text-slate-900 dark:text-white">{client.medicationStats?.lastOrdered || 'N/A'}</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Next Order Due</p>
                     <div className="flex items-center gap-2">
                        <p className={`text-lg font-black ${client.medicationStats?.isDue ? 'text-rose-600 dark:text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                           {client.medicationStats?.nextOrderDue || 'N/A'}
                        </p>
                        {client.medicationStats?.isDue && (
                           <span className="px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded text-[8px] font-black uppercase tracking-wide">Due</span>
                        )}
                     </div>
                  </div>
                  <button 
                    onClick={() => setShowReorderModal(true)}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border-b-4 border-emerald-800 dark:border-emerald-900 hover:bg-emerald-700 transition-all active:scale-95">
                     Reorder Now
                  </button>
               </div>
            </div>
         )}
         {/* ... Governance KPIs ... */}
      </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/20 dark:bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{confirmModal.title}</h3>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">{confirmModal.message}</p>
                <div className="flex gap-3">
                    <button onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b-4 border-transparent rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(prev => ({ ...prev, isOpen: false })); }} className="flex-1 py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest border-b-4 border-blue-800 dark:border-blue-900 hover:bg-blue-700 transition-all active:scale-95">Confirm Save</button>
                </div>
            </div>
        </div>
      )}

      {/* STATUS CHANGE MODAL */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/20 dark:bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{statusModal.title}</h3>
                <p className="text-slate-500 font-medium mb-6 leading-relaxed">{statusModal.message}</p>
                {/* ... Status Modal Content ... */}
                <div className="flex gap-3">
                    <button onClick={() => setStatusModal(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b-4 border-transparent rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button onClick={handleConfirmStatusChange} className="flex-1 py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest border-b-4 border-blue-800 dark:border-blue-900 hover:bg-blue-700 transition-all active:scale-95">Confirm</button>
                </div>
            </div>
        </div>
      )}

      {/* REORDER MODAL */}
      {showReorderModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-32 bg-emerald-600"></div>
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl text-4xl">
                        <Pill size={40} className="text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-2">Reorder Medication</h3>
                    <p className="text-xs font-bold text-slate-500 text-center uppercase tracking-widest mb-8">Prescription Request Details</p>
                    
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">GP Contact</p>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{client.gp?.name || 'Not Recorded'}</p>
                                <p className="text-xs font-medium text-slate-600">{client.gp?.surgery}</p>
                                <p className="text-xs font-medium text-blue-600">{client.gp?.phone}</p>
                                <p className="text-xs font-medium text-slate-500">{client.gp?.address}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Patient Details</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">DOB</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{client.dob}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">NHS Number</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{client.nhsNumber}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">Address</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{client.address}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Current Medication</p>
                            {Array.isArray(client.medications) ? (
                                <ul className="space-y-2">
                                    {client.medications.map((med, idx) => (
                                        <li key={idx} className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{med.name}</span>
                                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg uppercase tracking-wide">{med.dosage}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {client.medications || 'No active medications recorded.'}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button 
                            onClick={() => setShowReorderModal(false)}
                            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b-4 border-transparent rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Close
                        </button>
                        <button 
                            onClick={() => setShowReorderModal(false)}
                            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest border-b-4 border-emerald-800 dark:border-emerald-900 hover:bg-emerald-700 transition-all active:scale-95"
                        >
                            Confirm Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* QR ACCESS MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-32 bg-blue-600"></div>
                <div className="relative z-10">
                    <div className="w-40 h-40 bg-white rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl p-4">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${emergencyQrData}&color=0f172a&bgcolor=ffffff`} alt="QR Code" className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{client.firstName} {client.lastName}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Scan for Emergency Snapshot</p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowQrModal(false)} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">Close</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* FULL IMAGE MODAL */}
      {showFullImage && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in" onClick={() => setShowFullImage(false)}>
            <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setShowFullImage(false)} className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors">
                    <X size={32} />
                </button>
                <img src={client.profileImage || `https://picsum.photos/seed/${client.id}/800/800`} alt={client.firstName} className="max-w-full max-h-[85vh] rounded-3xl shadow-2xl object-contain animate-in zoom-in-95" />
            </div>
        </div>
      )}

    </div>
  );
};

export default ClientProfileView; 