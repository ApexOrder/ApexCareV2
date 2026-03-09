import React, { useState, useEffect, useRef, useMemo } from 'react';
import ClientFinanceView from './ClientFinanceView';

const ClientProfileView = ({ client, areas, onUpdateClient, onBack, onDirtyStateChange, userRole, staff = [], availableGroups = [] }) => {
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [noteFilter, setNoteFilter] = useState('All');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ content: '', category: 'General', isCqc: false });
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [showQrModal, setShowQrModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);

  // State for status change reasoning
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: null, title: '', message: '', reason: '' });

  const [dischargeReason, setDischargeReason] = useState('Care Needs Reduced');
  const [isTemporary, setIsTemporary] = useState(false);
  const [dischargeDate, setDischargeDate] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');

  // Local state for editing information in "Client Information"
  const [editInfo, setEditInfo] = useState({
    pmh: client.pmh ? client.pmh.join(', ') : '',
    lifeStory: client.social?.lifeStory || '',
    hobbies: client.social?.hobbies ? client.social.hobbies.join(', ') : ''
  });

  // Local state for editing identity information
  const [editIdentity, setEditIdentity] = useState({
    firstName: client.firstName || '',
    lastName: client.lastName || '',
    preferredName: client.preferredName || '',
    nhsNumber: client.nhsNumber || '',
    pidNumber: client.pidNumber || '',
    dob: client.dob || '',
    phone: client.phone || '',
    email: client.email || '',
    area: client.area || '',
    auditStatus: client.auditStatus || 'Compliant',
    careLevel: client.careLevel || 'Low',
    pronouns: client.pronouns || '',
    serviceStartDate: client.serviceStartDate || '',
    ageBand: client.ageBand || '',
    regulatedCare: client.regulatedCare || '',
    group: client.group || ''
  });

  // Local state for editing address
  const [editAddress, setEditAddress] = useState({
    houseNumber: '',
    street: client.address || '',
    town: '',
    county: '',
    postcode: '',
    keySafeCode: client.keySafeCode || client.environment?.accessCode || ''
  });
  const [addressSearch, setAddressSearch] = useState('');

  const mapAddress = isEditingAddress 
    ? [editAddress.houseNumber, editAddress.street, editAddress.town, editAddress.county, editAddress.postcode].filter(Boolean).join(', ') 
    : client.address;

  const handleSelectAddress = (suggestion) => {
    ignoreSearch.current = true;
    const addr = suggestion.address;
    setEditAddress({
        houseNumber: addr.house_number || addr.building || '',
        street: addr.road || addr.pedestrian || addr.street || '',
        town: addr.city || addr.town || addr.village || '',
        county: addr.county || addr.state_district || '',
        postcode: addr.postcode || '',
        keySafeCode: editAddress.keySafeCode
    });
    setAddressSearch('');
    setShowAddressSuggestions(false);
  };

  // Address autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const ignoreSearch = useRef(false);

  useEffect(() => {
    if (ignoreSearch.current) {
        ignoreSearch.current = false;
        return;
    }

    if (!isEditingAddress || !addressSearch || addressSearch.length < 4) {
        setShowAddressSuggestions(false);
        return;
    }

    const timer = setTimeout(async () => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearch)}&addressdetails=1&countrycodes=gb&limit=5`);
            const data = await response.json();
            setAddressSuggestions(data);
            setShowAddressSuggestions(true);
        } catch (error) {
            console.error("Address fetch error:", error);
        }
    }, 500);

    return () => clearTimeout(timer);
  }, [addressSearch, isEditingAddress]);

  // Local state for editing care details
  const [isEditingCare, setIsEditingCare] = useState(false);
  const [editCare, setEditCare] = useState({
    allergies: client.allergies ? client.allergies.join(', ') : '',
    mobilityLevel: client.mobility?.level || 'Independent',
    dietaryType: client.nutrition?.dietaryType || 'Regular',
    fluidConsistency: client.nutrition?.preferences?.match(/Fluids: (.*?)\./)?.[1] || 'Level 0 - Thin',
    nutritionPreferences: client.nutrition?.preferences || '',
    dnacpr: client.legal?.dnacpr || false,
    needsFluidMonitoring: client.needsFluidMonitoring || false,
    accessCode: client.environment?.accessCode || '',
    keySafeLocation: client.environment?.keySafeLocation || '',
    arrivalNote: client.arrivalNote || '',
    bigThing: client.bigThing || '',
    gpName: client.gp?.name || '',
    gpSurgery: client.gp?.surgery || '',
    gpPhone: client.gp?.phone || '',
    gpAddress: client.gp?.address || '',
    pharmacyName: client.pharmacy?.name || '',
    pharmacyPhone: client.pharmacy?.phone || '',
    pharmacyAddress: client.pharmacy?.address || '',
    carerGender: client.preferences?.carerGender || 'Any',
    carerVibe: client.preferences?.carerVibe || 'Professional/Quiet'
  });

  // Local state for editing risk assessment
  const [isEditingRisk, setIsEditingRisk] = useState(false);
  const [editRisk, setEditRisk] = useState({
    riskOfFalls: client.mobility?.riskOfFalls || 'Low',
    chokingRisk: client.nutrition?.chokingRisk || false,
    hazards: client.environment?.hazards ? client.environment.hazards.join(', ') : ''
  });

  // Calculate CQC Status based on profile completeness
  const cqcStatus = useMemo(() => {
     const missing = [];
     const add = (label, fn) => missing.push({ label, onFix: fn });

     if (!client.nhsNumber) add('NHS Number', () => { setActiveSubTab('Client Information'); setIsEditingIdentity(true); });
     if (!client.pidNumber) add('Local Auth ID', () => { setActiveSubTab('Client Information'); setIsEditingIdentity(true); });
     if (!client.dob) add('Date of Birth', () => { setActiveSubTab('Client Information'); setIsEditingIdentity(true); });
     if (!client.address) add('Address', () => { setActiveSubTab('Client Information'); setIsEditingIdentity(true); });
     if (!client.careLevel) add('Care Level', () => { setActiveSubTab('Client Information'); setIsEditingIdentity(true); });
     if (!client.mobility?.level) add('Mobility Profile', () => { setActiveSubTab('Client Information'); setIsEditingCare(true); });
     if (!client.nutrition?.dietaryType) add('Dietary Profile', () => { setActiveSubTab('Client Information'); setIsEditingCare(true); });
     if (!client.gp?.name) add('GP Details', () => { setActiveSubTab('Client Information'); setIsEditingCare(true); });
     
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

  const [isFinanceDirty, setIsFinanceDirty] = useState(false);

  useEffect(() => {
    const isDirty = isEditingInfo || isEditingIdentity || isEditingAddress || isEditingCare || isEditingRisk || isAddingNote || isFinanceDirty;
    onDirtyStateChange?.(isDirty);
  }, [isEditingInfo, isEditingIdentity, isEditingAddress, isEditingCare, isEditingRisk, isAddingNote, isFinanceDirty, onDirtyStateChange]);

  // Tasks state
  const [tasks, setTasks] = useState(client.tasks || []);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('Anytime');

  const handleAddTask = () => {
    if (!newTaskDesc.trim()) return;
    const newTask = {
      id: `t-${Date.now()}`,
      description: newTaskDesc,
      isCompleted: false,
      timeOfDay: newTaskTime
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    onUpdateClient({
      ...client,
      tasks: updatedTasks
    });
    setNewTaskDesc('');
  };

  const handleToggleTask = (taskId) => {
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    setTasks(updatedTasks);
    onUpdateClient({
      ...client,
      tasks: updatedTasks
    });
  };

  const handleDeleteTask = (taskId) => {
     if(window.confirm('Delete this task?')) {
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        setTasks(updatedTasks);
        onUpdateClient({
          ...client,
          tasks: updatedTasks
        });
     }
  };

  // Visits state
  const [visits, setVisits] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getVisitPeriod = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'Morning';
    if (hour < 14) return 'Lunch';
    if (hour < 17) return 'Tea';
    return 'Evening';
  };

  const [visitModal, setVisitModal] = useState({ isOpen: false, mode: 'add', visit: null });
  const [isCancelling, setIsCancelling] = useState(false);

  const [visitForm, setVisitForm] = useState({
    type: 'One-off',
    date: '',
    time: '',
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
    payCarer: 'Yes'
  });

  const handleOpenAddVisit = (date, time) => {
    setVisitForm({
        type: 'One-off',
        date: date || '',
        time: time || '',
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
        payCarer: 'Yes'
    });
    setIsCancelling(false);
    setVisitModal({ isOpen: true, mode: 'add', visit: null });
  };

  const handleOpenEditVisit = (visit) => {
    setVisitForm({ ...visit });
    setIsCancelling(false);
    setVisitModal({ isOpen: true, mode: 'edit', visit });
  };

  const handleSaveVisit = () => {
    if (!visitForm.carer || visitForm.carer === 'Unassigned') {
        alert('Please select a carer.');
        return;
    }
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
    const durationMinutes = visitForm.duration === 'Night Shift' ? 480 : 
                           visitForm.duration?.includes('h') ? 
                           (parseInt(visitForm.duration.split('h')[0]) * 60 + (visitForm.duration.includes('m') ? parseInt(visitForm.duration.split('h')[1]) : 0)) : 
                           parseInt(visitForm.duration || '0');
    const newEnd = newStart + durationMinutes;

    const checkConflict = (targetDate) => {
        return visits.find(v => {
            if (visitModal.mode === 'edit' && v.id === visitModal.visit?.id) return false;
            if (v.carer !== visitForm.carer) return false;
            if (v.status === 'Cancelled') return false;
            if (v.date !== targetDate) return false;

            const vStart = getMinutes(v.time);
            const vDur = v.duration === 'Night Shift' ? 480 : 
                         v.duration.includes('h') ? 
                         (parseInt(v.duration.split('h')[0]) * 60 + (v.duration.includes('m') ? parseInt(v.duration.split('h')[1]) : 0)) : 
                         parseInt(v.duration);
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
            duration: visitForm.duration || 'TBD',
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
            payCarer: visitForm.payCarer
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
                if (checkConflict(dateStr)) {
                    alert(`Conflict detected on ${dateStr}. Series creation aborted.`);
                    return;
                }
                visitsToAdd.push({
                    id: `v-${Date.now()}-${i}`,
                    date: dateStr,
                    time: visitForm.time || 'TBD',
                    duration: visitForm.duration || 'TBD',
                    carer: visitForm.carer || 'Unassigned',
                    status: isCancelling ? 'Cancelled' : 'Scheduled',
                    type: 'Recurring',
                    frequency: visitForm.frequency,
                    selectedDays: visitForm.selectedDays,
                    note: visitForm.note,
                    tasks: visitForm.tasks
                });
            }
        }
    }

    if (visitModal.mode === 'edit' && visitModal.visit) {
        setVisits(visits.map(v => v.id === visitModal.visit.id ? visitsToAdd[0] : v));
    } else {
        setVisits([...visits, ...visitsToAdd]);
    }
    setVisitModal({ ...visitModal, isOpen: false });
  };

  const handleDeleteVisit = (id) => {
      if (window.confirm('Are you sure you want to delete this visit?')) {
          setVisits(visits.filter(v => v.id !== id));
      }
  };

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

  const handleAddNote = () => {
    if (!newNote.content) return;
    const note = {
      id: `n-${Date.now()}`,
      date: new Date().toISOString(),
      author: 'Leon Lowden (Admin)',
      category: newNote.category,
      content: newNote.content,
      isCqcEvidence: newNote.isCqc,
      status: newNote.category === 'Concern' ? 'Open' : undefined
    };
    onUpdateClient({
      ...client,
      careNotes: [note, ...(client.careNotes || [])]
    });
    setNewNote({ content: '', category: 'General', isCqc: false });
    setIsAddingNote(false);
  };

  const handleUpdateClinicalInfo = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Save Clinical History?',
      message: 'Are you sure you want to save changes to the Clinical & Social History?',
      onConfirm: () => {
        const changes = [];
        const currentPmh = client.pmh ? client.pmh.join(', ') : '';
        if (editInfo.pmh !== currentPmh) changes.push(`Changed Medical History from '${currentPmh || 'None'}' to '${editInfo.pmh || 'None'}'`);
        if (editInfo.lifeStory !== client.social?.lifeStory) changes.push(`Changed Life Story from '${client.social?.lifeStory || 'None'}' to '${editInfo.lifeStory || 'None'}'`);
        const currentHobbies = client.social?.hobbies ? client.social.hobbies.join(', ') : '';
        if (editInfo.hobbies !== currentHobbies) changes.push(`Changed Hobbies from '${currentHobbies || 'None'}' to '${editInfo.hobbies || 'None'}'`);

        let updatedHistory = client.editHistory || [];
        if (changes.length > 0) {
          updatedHistory = [{
            id: `h-${Date.now()}`,
            date: new Date().toISOString(),
            author: 'Leon Lowden (Admin)',
            changes
          }, ...updatedHistory];
        }

        onUpdateClient({
          ...client,
          pmh: editInfo.pmh.split(',').map(s => s.trim()).filter(s => s !== ''),
          social: {
            ...client.social,
            lifeStory: editInfo.lifeStory,
            hobbies: editInfo.hobbies.split(',').map(s => s.trim()).filter(s => s !== '')
          },
          editHistory: updatedHistory
        });
        setIsEditingInfo(false);
      }
    });
  };

  const handleUpdateIdentity = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Save Identity Records?',
      message: 'Are you sure you want to save changes to the Identity & Contact Records?',
      onConfirm: () => {
        const changes = [];
        const fields = [
          { key: 'firstName', label: 'First Name' }, { key: 'lastName', label: 'Last Name' },
          { key: 'preferredName', label: 'Preferred Name' }, { key: 'nhsNumber', label: 'NHS Number' },
          { key: 'pidNumber', label: 'Local Authority ID' }, { key: 'dob', label: 'Date of Birth' },
          { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'area', label: 'Area' },
          { key: 'auditStatus', label: 'Audit Status' }, { key: 'careLevel', label: 'Service Level' },
          { key: 'pronouns', label: 'Pronouns' },
          { key: 'serviceStartDate', label: 'Service Start Date' },
          { key: 'ageBand', label: 'Age Band' },
          { key: 'regulatedCare', label: 'Regulated Care' },
          { key: 'group', label: 'Group' }
        ];

        fields.forEach(f => {
          if (editIdentity[f.key] !== client[f.key]) {
            changes.push(`Changed ${f.label} from '${client[f.key] || 'None'}' to '${editIdentity[f.key] || 'None'}'`);
          }
        });

        let updatedHistory = client.editHistory || [];
        if (changes.length > 0) {
          updatedHistory = [{
            id: `h-${Date.now()}`,
            date: new Date().toISOString(),
            author: 'Leon Lowden (Admin)',
            changes
          }, ...updatedHistory];
        }

        onUpdateClient({
          ...client,
          ...editIdentity,
          editHistory: updatedHistory
        });
        setIsEditingIdentity(false);
      }
    });
  };

  const handleUpdateAddress = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Save Address?',
      message: 'Are you sure you want to update the client address?',
      onConfirm: () => {
        const changes = [];
        const newFullAddress = [editAddress.houseNumber, editAddress.street, editAddress.town, editAddress.county, editAddress.postcode].filter(Boolean).join(', ');
        if (newFullAddress !== client.address) {
            changes.push(`Changed Address from '${client.address || 'None'}' to '${newFullAddress || 'None'}'`);
        }
        
        const oldKeySafe = client.keySafeCode || client.environment?.accessCode || '';
        if (editAddress.keySafeCode !== oldKeySafe) {
            changes.push(`Changed Key Safe Code from '${oldKeySafe || 'None'}' to '${editAddress.keySafeCode || 'None'}'`);
        }
        
        let updatedHistory = client.editHistory || [];
        if (changes.length > 0) {
            updatedHistory = [{
                id: `h-${Date.now()}`,
                date: new Date().toISOString(),
                author: 'Leon Lowden (Admin)',
                changes
            }, ...updatedHistory];
        }

        onUpdateClient({ 
            ...client, 
            address: newFullAddress, 
            keySafeCode: editAddress.keySafeCode,
            environment: {
                ...client.environment,
                accessCode: editAddress.keySafeCode
            },
            editHistory: updatedHistory 
        });
        setIsEditingAddress(false);
      }
    });
  };

  const handleFluidChange = (newFluid) => {
    let newPrefs = editCare.nutritionPreferences;
    if (newPrefs.includes('Fluids:')) {
        newPrefs = newPrefs.replace(/Fluids: .*?\./, `Fluids: ${newFluid}.`);
    } else {
        newPrefs = `Fluids: ${newFluid}. ${newPrefs}`;
    }
    setEditCare({ ...editCare, fluidConsistency: newFluid, nutritionPreferences: newPrefs });
  };

  const handleUpdateCare = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Save Care Profile?',
      message: 'Are you sure you want to save changes to the Care & Safety Configuration?',
      onConfirm: () => {
        onUpdateClient({
          ...client,
          arrivalNote: editCare.arrivalNote,
          bigThing: editCare.bigThing,
          needsFluidMonitoring: editCare.needsFluidMonitoring,
          allergies: editCare.allergies.split(',').map(s => s.trim()).filter(s => s !== ''),
          mobility: { ...client.mobility, level: editCare.mobilityLevel },
          nutrition: { ...client.nutrition, dietaryType: editCare.dietaryType, preferences: editCare.nutritionPreferences },
          legal: { ...client.legal, dnacpr: editCare.dnacpr },
          environment: { ...client.environment, accessCode: editCare.accessCode, keySafeLocation: editCare.keySafeLocation },
          preferences: { ...client.preferences, carerGender: editCare.carerGender, carerVibe: editCare.carerVibe },
          gp: { ...client.gp, name: editCare.gpName, surgery: editCare.gpSurgery, phone: editCare.gpPhone, address: editCare.gpAddress },
          pharmacy: { ...client.pharmacy, name: editCare.pharmacyName, phone: editCare.pharmacyPhone, address: editCare.pharmacyAddress },
          // Add change to history
          editHistory: [{
             id: `h-${Date.now()}`, date: new Date().toISOString(), author: 'Leon Lowden (Admin)', changes: ['Updated Care & Safety Configuration']
          }, ...(client.editHistory || [])]
        });
        setIsEditingCare(false);
      }
    });
  };

  const handleUpdateRisk = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Save Risk Assessment?',
      message: 'Are you sure you want to update the risk assessment profile?',
      onConfirm: () => {
        onUpdateClient({
          ...client,
          mobility: { ...client.mobility, riskOfFalls: editRisk.riskOfFalls },
          nutrition: { ...client.nutrition, chokingRisk: editRisk.chokingRisk },
          environment: { 
            ...client.environment, 
            hazards: editRisk.hazards.split(',').map(s => s.trim()).filter(s => s !== '') 
          },
          editHistory: [{
             id: `h-${Date.now()}`, date: new Date().toISOString(), author: 'Leon Lowden (Admin)', changes: ['Updated Risk Assessment']
          }, ...(client.editHistory || [])]
        });
        setIsEditingRisk(false);
      }
    });
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

  const getNoteColor = (cat) => {
    switch(cat) {
      case 'Concern': return 'bg-rose-50 border-rose-200 text-rose-600';
      case 'Action': return 'bg-blue-50 border-blue-200 text-blue-600';
      case 'Task': return 'bg-emerald-50 border-emerald-200 text-emerald-600';
      default: return 'bg-slate-100 border-slate-200 text-slate-500';
    }
  };

  const filteredNotes = (client.careNotes || []).filter(n => noteFilter === 'All' || n.category === noteFilter);

  const managementMenu = [
    { id: 'Overview', icon: '🏠' },
    { id: 'Client Information', icon: '👤' },
    { id: 'Risk Assessment', icon: '⚠️' },
    ...(userRole === 'admin' ? [{ id: 'Finance', icon: '💷' }] : []),
    { id: 'Tasks', icon: '✅' },
    { id: 'Visits', icon: '📅' },
    { id: 'Logs', icon: '📝' },
    { id: 'Documents', icon: '📂' },
    { id: 'Timeline', icon: '⏳' },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-screen bg-slate-50 overflow-y-auto lg:overflow-hidden">
      {/* MANAGEMENT SUB-NAVBAR */}
      <div className="w-full lg:w-72 bg-white border-r border-l border-slate-200 flex flex-col h-auto lg:h-full shadow-2xl z-[110] shrink-0">
        <div className="p-6 md:p-8 border-b border-slate-200 flex flex-col items-center">
          <div className="relative mb-4">
             <img src={`https://picsum.photos/seed/${client.id}/120/120`} className="w-20 h-20 rounded-[2rem] object-cover shadow-2xl border-4 border-white" alt="" />
             <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
          </div>
          <h2 className="text-xl font-black text-slate-900 text-center leading-none mb-1">{client.firstName} {client.lastName}</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{client.id}</p>
          <button onClick={onBack} className="mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 text-[10px] font-black uppercase text-slate-500 rounded-xl transition-all">← Exit to Dashboard</button>
        </div>

        <nav className="flex-1 overflow-x-auto lg:overflow-y-auto p-4 flex flex-row lg:flex-col gap-2 lg:gap-0 lg:space-y-1 scrollbar-hide">
          {managementMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`w-auto lg:w-full flex items-center gap-2 lg:gap-4 px-4 lg:px-5 py-2 lg:py-3 text-sm font-bold rounded-2xl transition-all whitespace-nowrap ${
                activeSubTab === item.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              <span className="truncate">{item.id}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-visible lg:overflow-y-auto flex flex-col relative bg-slate-50 z-0 pb-24 md:pb-0">
        
        {/* ENHANCED GOVERNANCE HEADER */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-12 py-6 md:py-8 z-[100] flex flex-col xl:flex-row items-center justify-end shadow-sm gap-6">
           <div className="flex gap-4 w-full md:w-auto">
              <button 
                  onClick={() => setShowQrModal(true)}
                  className="w-full md:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                  <span className="text-lg">📱</span> QR Access
              </button>
              {userRole === 'admin' && (client.status === 'Active' ? (
                 <button 
                   onClick={handleDischargeClient}
                   className="w-full md:w-auto px-6 py-3 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-100 transition-colors"
                 >
                   Discharge Client
                 </button>
              ) : (
                 <div className="flex gap-4 w-full md:w-auto">
                    {client.status === 'Hospitalized' && (
                        <button 
                           onClick={handleDischargeClient}
                           className="w-full md:w-auto px-6 py-3 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-100 transition-colors"
                        >
                           Discharge
                        </button>
                    )}
                    <button 
                        onClick={handleReadmitClient}
                        className="w-full md:w-auto px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                        {client.status === 'Hospitalized' ? 'Re-activate Client' : 'Re-admit Client'}
                    </button>
                 </div>
              ))}
              <button className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-95">Export Evidence Pack</button>
           </div>
        </div>

        <div className="max-w-[100rem] mx-auto w-full p-4 md:p-10 space-y-8 md:space-y-12">
           
           {activeSubTab === 'Overview' && (
             <>
               {/* SNAPSHOT WIDGETS */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Next Visit with Scheduled Carer */}
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="text-4xl">🚐</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Next Scheduled Visit</p>
                    <p className="text-2xl font-black text-slate-900">09:00 - 10:00</p>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-600 border border-blue-200 uppercase">SJ</div>
                       <div>
                         <p className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Assigned Carer</p>
                         <p className="text-xs font-bold text-slate-900">Sarah Jenkins</p>
                       </div>
                    </div>
                  </div>

                  {/* Wellbeing Insight */}
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Wellbeing Score</p>
                    <div className="flex items-end gap-3">
                      <p className={`text-5xl font-black ${client.wellbeingScore > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{client.wellbeingScore}%</p>
                      <span className="text-xs font-bold text-slate-500 pb-2 uppercase tracking-tighter">vs last week</span>
                    </div>
                    <div className="mt-6 flex items-center gap-2">
                       <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${client.wellbeingScore}%` }}></div>
                       </div>
                    </div>
                  </div>

                  {/* Quick MAR Status */}
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Medication Status</p>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                      <p className="text-2xl font-black text-slate-900 uppercase">Fully Compliant</p>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mt-2">Last dose: 08:30 Today</p>
                  </div>
               </div>

               {/* ARRIVAL INSTRUCTIONS & ALERT (Moved Above Identity) */}
               <section className="bg-white border border-slate-200 text-slate-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32"></div>
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Arrival Instructions</p>
                       <p className="text-lg font-bold text-slate-900 leading-snug">{client.arrivalNote || 'No specific arrival instructions recorded.'}</p>
                    </div>
                    <div className="space-y-6">
                       <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Important Consideration</p>
                       <p className="text-lg font-bold text-amber-600 italic">"{client.bigThing || 'No critical considerations listed.'}"</p>
                    </div>
                  </div>
               </section>

               {/* IDENTITY & PROFILE SUMMARY */}
               <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identity & Profile Summary</h3>
                     <button onClick={() => setActiveSubTab('Client Information')} className="text-[10px] font-black text-blue-600 uppercase hover:underline">Full Details →</button>
                  </div>
                  <div className="p-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
                     {[
                       { label: 'NHS Number', value: client.nhsNumber || 'Not Recorded' },
                       { label: 'Age / DOB', value: calculateAge(client.dob).full },
                       { label: 'Group', value: client.group || 'Not Assigned' },
                       { label: 'Primary Contact', value: client.phone || 'N/A', isPhone: true },
                       { label: 'Address', value: client.address || 'Not Recorded', isAddress: true, fullWidth: true },
                     ].map(item => (
                       <div key={item.label} className={`space-y-1 ${item.fullWidth ? 'col-span-2 lg:col-span-4' : ''}`}>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                          {item.isPhone && item.value !== 'N/A' ? (
                             <a href={`tel:${item.value.replace(/[^0-9+]/g, '')}`} className="text-sm font-bold text-blue-600 hover:underline truncate block">{item.value}</a>
                          ) : item.isAddress && item.value !== 'Not Recorded' ? (
                             <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.value)}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline truncate block" title={item.value}>
                               {item.value}
                             </a>
                          ) : (
                             <p className="text-sm font-bold text-slate-900 truncate" title={item.value}>{item.value}</p>
                          )}
                       </div>
                     ))}
                  </div>
               </section>

               {/* QUICK PERSONAL PROFILE (PMH & Hobbies for Carers) */}
               <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 flex justify-between items-center bg-emerald-50">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Personal Snapshot <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase">For Carers</span>
                     </h3>
                  </div>
                  <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">Previous Medical History</p>
                        <div className="flex flex-wrap gap-2">
                           {client.pmh && client.pmh.length > 0 ? client.pmh.map((p, idx) => (
                              <span key={idx} className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-black uppercase rounded-lg">
                                 {p}
                              </span>
                           )) : (
                              <p className="text-xs font-bold text-slate-500 italic">No medical history recorded.</p>
                           )}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">Hobbies & Interests</p>
                        <div className="flex flex-wrap gap-2">
                           {client.social?.hobbies && client.social.hobbies.length > 0 ? client.social.hobbies.map((h, idx) => (
                              <span key={idx} className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-black uppercase rounded-lg">
                                 {h}
                              </span>
                           )) : (
                              <p className="text-xs font-bold text-slate-500 italic">No hobbies recorded.</p>
                           )}
                        </div>
                     </div>
                  </div>
               </section>

               {/* CLINICAL INTRODUCTION HIGHLIGHT */}
               <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 bg-blue-50">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Introduction</h3>
                  </div>
                  <div className="p-6 md:p-10">
                    <p className="text-xl font-bold text-slate-600 leading-relaxed italic border-l-4 border-blue-200 pl-8">
                       "{client.social?.lifeStory}"
                    </p>
                  </div>
               </section>
             </>
           )}

           {activeSubTab === 'Client Information' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                {/* Identity & Contact Records */}
                <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identity & Contact Records</h3>
                    {userRole === 'admin' && (!isEditingIdentity ? (
                      <button onClick={() => setIsEditingIdentity(true)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-xl hover:bg-slate-50 transition-colors">Edit Details</button>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => setIsEditingIdentity(false)} className="px-6 py-3 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
                        <button onClick={handleUpdateIdentity} className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-emerald-200">Save Changes</button>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { label: 'First Name', value: client.firstName, key: 'firstName' },
                      { label: 'Last Name', value: client.lastName, key: 'lastName' },
                      { label: 'Preferred Name', value: client.preferredName, key: 'preferredName' },
                      { label: 'Date of Birth', value: client.dob, key: 'dob', type: 'date' },
                      { label: 'Pronouns', value: client.pronouns, key: 'pronouns' },
                      { label: 'NHS Number', value: client.nhsNumber, key: 'nhsNumber' },
                      { label: 'Local Authority ID', value: client.pidNumber, key: 'pidNumber' },
                      { label: 'Phone Number', value: client.phone, key: 'phone' },
                      { label: 'Email Address', value: client.email, key: 'email' },
                      { label: 'Group', value: client.group, key: 'group', type: 'select', options: availableGroups },
                    ].map(item => (
                      <div key={item.key} className={item.fullWidth ? 'md:col-span-3' : ''}>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</label>
                        {isEditingIdentity ? (
                          <input 
                            type={item.type || 'text'}
                            value={editIdentity[item.key]}
                            onChange={(e) => setEditIdentity({...editIdentity, [item.key]: e.target.value})}
                            className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900"
                          />
                        ) : (
                          <p className="text-sm font-bold text-slate-900 mt-1">{item.value || 'Not Recorded'}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Address & Location */}
                <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Address & Location</h3>
                    {userRole === 'admin' && (!isEditingAddress ? (
                      <button onClick={() => setIsEditingAddress(true)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-xl hover:bg-slate-50 transition-colors">Edit Address</button>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => { 
                            setIsEditingAddress(false); 
                            setEditAddress({ houseNumber: '', street: client.address || '', town: '', county: '', postcode: '', keySafeCode: client.keySafeCode || client.environment?.accessCode || '' }); 
                            setAddressSearch('');
                        }} className="px-6 py-3 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
                        <button onClick={handleUpdateAddress} className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-emerald-200">Save Changes</button>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 md:p-10">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-1 space-y-4 relative">
                            {isEditingAddress ? (
                                <>
                                    <div className="mb-6 relative">
                                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block">Search Address</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-blue-50 border-blue-200 rounded-xl p-3 font-bold text-blue-900 outline-none border focus:ring-2 focus:ring-blue-500/20 placeholder-blue-300" 
                                            placeholder="Start typing to auto-fill..."
                                            value={addressSearch}
                                        onChange={(e) => {
                                            ignoreSearch.current = false;
                                            setAddressSearch(e.target.value);
                                        }}
                                        onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                                    />
                                    {showAddressSuggestions && addressSuggestions.length > 0 && (
                                        <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-2xl mt-1 shadow-lg max-h-60 overflow-y-auto">
                                            <ul>
                                                {addressSuggestions.map((address) => (
                                                    <li 
                                                        key={address.place_id}
                                                        onMouseDown={() => handleSelectAddress(address)}
                                                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700"
                                                    >
                                                        {address.display_name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">House Name / Number</label>
                                            <input 
                                                type="text" 
                                                className="w-full mt-1 bg-white border-slate-300 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20"
                                                value={editAddress.houseNumber}
                                                onChange={(e) => setEditAddress({...editAddress, houseNumber: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Street</label>
                                            <input 
                                                type="text" 
                                                className="w-full mt-1 bg-white border-slate-300 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20"
                                                value={editAddress.street}
                                                onChange={(e) => setEditAddress({...editAddress, street: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Town / City</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full mt-1 bg-white border-slate-300 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20"
                                                    value={editAddress.town}
                                                    onChange={(e) => setEditAddress({...editAddress, town: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">County</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full mt-1 bg-white border-slate-300 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20"
                                                    value={editAddress.county}
                                                    onChange={(e) => setEditAddress({...editAddress, county: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Postcode</label>
                                            <input 
                                                type="text" 
                                                className="w-full mt-1 bg-white border-slate-300 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20"
                                                value={editAddress.postcode}
                                                onChange={(e) => setEditAddress({...editAddress, postcode: e.target.value})}
                                            />
                                        </div>
                                        <div className="pt-4 border-t border-slate-100">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Safe Code</label>
                                            <input 
                                                type="text" 
                                                className="w-full mt-1 bg-white border-slate-300 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20"
                                                value={editAddress.keySafeCode}
                                                onChange={(e) => setEditAddress({...editAddress, keySafeCode: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Address</label>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-900 font-bold text-lg leading-relaxed">
                                    {client.address || 'No address recorded.'}
                                </div>
                                <div className="mt-6">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Safe Code</label>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-bold text-lg mt-1">
                                        {client.keySafeCode || client.environment?.accessCode || 'Not Recorded'}
                                    </div>
                                </div>
                                </>
                            )}
                        </div>
                        <div className="lg:col-span-2 h-64 lg:h-auto min-h-[16rem] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative">
                            <iframe width="100%" height="100%" src={`https://maps.google.com/maps?q=${encodeURIComponent(mapAddress || '')}&t=&z=15&ie=UTF8&iwloc=&output=embed`} frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" className="absolute inset-0"></iframe>
                            {!mapAddress && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
                                    <p className="text-slate-400 font-bold text-sm">No address to display map</p>
                                </div>
                            )}
                        </div>
                     </div>
                  </div>
                </section>

                {/* Clinical & Social History */}
                <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Clinical & Social History</h3>
                    {userRole === 'admin' && (!isEditingInfo ? (
                      <button onClick={() => setIsEditingInfo(true)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-xl hover:bg-slate-50 transition-colors">Edit Details</button>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => setIsEditingInfo(false)} className="px-6 py-3 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
                        <button onClick={handleUpdateClinicalInfo} className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-emerald-200">Save Changes</button>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 md:p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Previous Medical History (PMH)</label>
                          {isEditingInfo ? (
                            <textarea className="w-full bg-white border-slate-300 rounded-2xl p-4 font-medium text-slate-700 h-32 focus:ring-2 focus:ring-blue-500/20 outline-none border" value={editInfo.pmh} onChange={(e) => setEditInfo({...editInfo, pmh: e.target.value})} />
                          ) : (
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 font-medium leading-relaxed">{client.pmh && client.pmh.length ? client.pmh.join(', ') : 'No history recorded.'}</div>
                          )}
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hobbies & Social Interests</label>
                          {isEditingInfo ? (
                            <textarea className="w-full bg-white border-slate-300 rounded-2xl p-4 font-medium text-slate-700 h-32 focus:ring-2 focus:ring-blue-500/20 outline-none border" value={editInfo.hobbies} onChange={(e) => setEditInfo({...editInfo, hobbies: e.target.value})} />
                          ) : (
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 font-medium leading-relaxed">{client.social?.hobbies && client.social.hobbies.length ? client.social.hobbies.join(', ') : 'No hobbies recorded.'}</div>
                          )}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">"My Life Story" (Background Narrative)</label>
                       {isEditingInfo ? (
                         <textarea className="w-full bg-white border-slate-300 rounded-2xl p-4 font-medium text-slate-700 h-48 focus:ring-2 focus:ring-blue-500/20 outline-none leading-relaxed border" value={editInfo.lifeStory} onChange={(e) => setEditInfo({...editInfo, lifeStory: e.target.value})} />
                       ) : (
                         <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 font-medium leading-relaxed italic">"{client.social?.lifeStory || 'No life story recorded.'}"</div>
                       )}
                    </div>
                  </div>
                </section>
              </div>
           )}

           {activeSubTab === 'Finance' && (
             <ClientFinanceView 
               client={client} 
               onUpdateClient={onUpdateClient} 
               onDirtyStateChange={setIsFinanceDirty} 
             />
           )}

           {activeSubTab === 'Risk Assessment' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                     <h3 className="text-xl font-black text-slate-900 tracking-tight">Risk Assessment Profile</h3>
                     {userRole === 'admin' && (!isEditingRisk ? (
                        <button onClick={() => setIsEditingRisk(true)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-xl hover:bg-slate-50 transition-colors">Edit Risks</button>
                     ) : (
                        <div className="flex gap-3">
                          <button onClick={() => setIsEditingRisk(false)} className="px-6 py-3 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
                          <button onClick={handleUpdateRisk} className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-blue-200">Save Changes</button>
                        </div>)
                     )}
                  </div>
                  <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Falls Risk */}
                     <div className={`p-6 rounded-2xl border ${editRisk.riskOfFalls === 'High' ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-3 mb-4">
                           <span className="text-2xl">🚶</span>
                           <h4 className="font-black text-slate-900 uppercase text-sm tracking-widest">Falls Risk</h4>
                        </div>
                        {isEditingRisk ? (
                           <select className="w-full bg-white border-slate-300 rounded-xl p-3 font-bold text-slate-900 border" value={editRisk.riskOfFalls} onChange={(e) => setEditRisk({...editRisk, riskOfFalls: e.target.value})}>
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                           </select>
                        ) : (
                           <p className={`text-lg font-black ${client.mobility?.riskOfFalls === 'High' ? 'text-rose-600' : 'text-slate-900'}`}>{client.mobility?.riskOfFalls || 'Not Assessed'}</p>
                        )}
                     </div>
                     {/* ... Other Risks ... */}
                  </div>
                </section>
              </div>
           )}

           {activeSubTab === 'Tasks' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                       <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-3">Daily Care Tasks</h2>
                       <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Routine & Medication Adherence</p>
                    </div>
                 </div>

                 {/* Add Task Form */}
                 {userRole === 'admin' && (
                 <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                       <input 
                         type="text" 
                         placeholder="Add a new task..." 
                         className="flex-1 bg-slate-50 border-slate-200 rounded-xl p-4 font-bold text-slate-700 outline-none border focus:ring-2 focus:ring-blue-500/20"
                         value={newTaskDesc}
                         onChange={(e) => setNewTaskDesc(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                       />
                       <select
                         className="bg-slate-50 border-slate-200 rounded-xl p-4 font-bold text-slate-700 outline-none border focus:ring-2 focus:ring-blue-500/20"
                         value={newTaskTime}
                         onChange={(e) => setNewTaskTime(e.target.value)}
                       >
                         <option value="Morning">Morning</option>
                         <option value="Afternoon">Afternoon</option>
                         <option value="Evening">Evening</option>
                         <option value="Anytime">Anytime</option>
                       </select>
                       <button 
                         onClick={handleAddTask}
                         className="bg-blue-600 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 hover:bg-blue-700"
                       >
                         Add Task
                       </button>
                    </div>
                 </div>
                 )}

                 {/* Task Lists */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {['Morning', 'Afternoon', 'Evening', 'Anytime'].map(time => {
                       const timeTasks = tasks.filter(t => t.timeOfDay === time);
                       if (timeTasks.length === 0) return null;
                       return (
                         <div key={time} className="space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">{time}</h3>
                            <div className="space-y-3">
                               {timeTasks.map(task => (
                                  <div key={task.id} className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${task.isCompleted ? 'bg-emerald-50 border-emerald-200 opacity-75' : 'bg-white border-slate-200 shadow-sm'}`}>
                                     <button 
                                       onClick={() => handleToggleTask(task.id)}
                                       className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-blue-500'}`}
                                     >
                                       {task.isCompleted && '✓'}
                                     </button>
                                     <span className={`flex-1 font-bold ${task.isCompleted ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>{task.description}</span>
                                     {userRole === 'admin' && (
                                     <button 
                                       onClick={() => handleDeleteTask(task.id)}
                                       className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all"
                                     >
                                       🗑️
                                     </button>
                                     )}
                                  </div>
                               ))}
                            </div>
                         </div>
                       );
                    })}
                    {tasks.length === 0 && (
                       <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                          <span className="text-4xl mb-4 opacity-30">✅</span>
                          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No tasks scheduled</p>
                       </div>
                    )}
                 </div>
              </div>
           )}

           {activeSubTab === 'Visits' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                       <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-3">Visit Schedule</h2>
                       <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Recurring & One-off Visits</p>
                    </div>
                    {userRole === 'admin' && (
                    <button 
                      onClick={() => handleOpenAddVisit()}
                      className="bg-blue-600 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 hover:bg-blue-700"
                    >
                      Schedule Visit
                    </button>
                    )}
                 </div>

                 <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    {/* Calendar Header */}
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <button onClick={handlePrevMonth} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">←</button>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                            </h3>
                            <button onClick={handleNextMonth} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">→</button>
                        </div>
                        <div className="flex gap-2">
                            {['Morning', 'Lunch', 'Tea', 'Evening'].map(p => (
                                <div key={p} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-100">
                                    <div className={`w-2 h-2 rounded-full ${
                                        p === 'Morning' ? 'bg-amber-400' : 
                                        p === 'Lunch' ? 'bg-emerald-400' : 
                                        p === 'Tea' ? 'bg-blue-400' : 'bg-indigo-400'
                                    }`}></div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{p}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 border-b border-slate-100">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="p-4 text-center border-r border-slate-100 last:border-0 bg-slate-50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 auto-rows-fr bg-slate-100 gap-px border-b border-slate-100">
                        {(() => {
                            const year = currentMonth.getFullYear();
                            const month = currentMonth.getMonth();
                            const daysInMonth = new Date(year, month + 1, 0).getDate();
                            const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
                            const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Mon start
                            
                            const days = [];
                            // Empty cells for offset
                            for (let i = 0; i < startOffset; i++) {
                                days.push(<div key={`empty-${i}`} className="bg-white min-h-[160px] opacity-50"></div>);
                            }

                            // Day cells
                            for (let d = 1; d <= daysInMonth; d++) {
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                const dayVisits = visits.filter(v => v.date === dateStr);
                                const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

                                days.push(
                                    <div key={d} className={`bg-white min-h-[160px] p-2 flex flex-col group relative transition-colors hover:bg-blue-50/30 ${isToday ? 'ring-2 ring-inset ring-blue-500/20' : ''}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-black ${isToday ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>{d}</span>
                                            {dayVisits.length > 0 && <span className="text-[9px] font-bold text-slate-400">{dayVisits.length} Visits</span>}
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col gap-1">
                                            {[
                                                { label: 'Morning', time: '09:00', color: 'bg-amber-50 text-amber-700 border-amber-100' },
                                                { label: 'Lunch', time: '12:30', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                                                { label: 'Tea', time: '16:00', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                                                { label: 'Evening', time: '19:00', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' }
                                            ].map(period => {
                                                const periodVisits = dayVisits.filter(v => getVisitPeriod(v.time) === period.label);
                                                
                                                return (
                                                    <div 
                                                        key={period.label} 
                                                        className={`flex-1 rounded-lg border border-dashed border-slate-100 flex items-center px-2 relative group/slot transition-all hover:border-solid ${periodVisits.length > 0 ? period.color + ' border-solid' : 'hover:border-blue-200 hover:bg-white'}`}
                                                        onClick={() => {
                                                            if (periodVisits.length === 0 && userRole === 'admin') {
                                                                handleOpenAddVisit(dateStr, period.time);
                                                            }
                                                        }}
                                                    >
                                                        {periodVisits.length > 0 ? (
                                                            <div className="w-full" onClick={(e) => { e.stopPropagation(); handleOpenEditVisit(periodVisits[0]); }}>
                                                                <div className="flex justify-between items-center w-full">
                                                                    <span className="text-[9px] font-black uppercase">{period.label}</span>
                                                                    <span className="text-[9px] font-bold opacity-70">{periodVisits[0].time}</span>
                                                                </div>
                                                                <div className="text-[9px] font-bold truncate">{periodVisits[0].carer}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[8px] font-black uppercase text-slate-300 w-full text-center opacity-0 group-hover/slot:opacity-100 transition-opacity cursor-pointer">
                                                                + {period.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }
                            return days;
                        })()}
                    </div>
                 </div>
              </div>
           )}

           {activeSubTab === 'Logs' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                   <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-3">Evidence Engine</h2>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Structured Oversight for CQC Audits</p>
                   </div>
                   {userRole === 'admin' && (
                   <button onClick={() => setIsAddingNote(true)} className="bg-white text-slate-900 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 border border-slate-200 hover:bg-slate-50">+ New Structured Note</button>
                   )}
                </div>
                {/* ... Filter Bar & Note List ... */}
                <div className="space-y-6">
                   {filteredNotes.length > 0 ? filteredNotes.map((note) => (
                     <div key={note.id} className={`bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow ${note.isCqcEvidence ? 'ring-2 ring-blue-500/20' : ''}`}>
                        <div className="px-6 md:px-10 py-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 gap-4">
                           <div className="flex items-center gap-4">
                              <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase border ${getNoteColor(note.category)}`}>{note.category}</span>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(note.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                           <div className="flex gap-3">
                              {note.isCqcEvidence && <span className="px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase rounded-full">CQC Evidence</span>}
                           </div>
                        </div>
                        <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12">
                           <div className="flex-1">
                              <p className="text-slate-600 font-medium leading-relaxed mb-6">{note.content}</p>
                           </div>
                           <div className="w-full md:w-48 pt-1 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-1 md:pl-8">
                              <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Author</p>
                              <p className="text-xs font-black text-slate-900 leading-tight">{note.author}</p>
                           </div>
                        </div>
                     </div>
                   )) : (
                    <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-200 opacity-40">
                       <span className="text-4xl mb-4">📋</span>
                       <p className="text-sm font-black uppercase tracking-widest text-slate-500">No notes found for this category</p>
                    </div>
                   )}
                </div>
             </div>
           )}

           {activeSubTab === 'Documents' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                 {/* ... Document List ... */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.length > 0 ? documents.map(doc => (
                       <div key={doc.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative cursor-pointer">
                          <div className="flex justify-between items-start mb-4">
                             <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl">{doc.type === 'PDF' ? '📄' : '📁'}</div>
                          </div>
                          <h4 className="font-bold text-slate-900 truncate mb-1" title={doc.name}>{doc.name}</h4>
                       </div>
                    )) : (
                       <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                          <span className="text-4xl mb-4 opacity-30">📂</span>
                          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No documents uploaded</p>
                       </div>
                    )}
                 </div>
              </div>
           )}

           {activeSubTab === 'Timeline' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 bg-slate-50">
                     <h3 className="text-xl font-black text-slate-900 tracking-tight">Modification Timeline</h3>
                  </div>
                  <div className="p-6 md:p-10">
                    {(client.editHistory && client.editHistory.length > 0) ? (
                      <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {client.editHistory.map((entry) => (
                          <div key={entry.id} className="relative pl-10">
                            <div className="absolute left-0 top-1.5 w-10 h-10 flex items-center justify-center">
                               <div className="w-3 h-3 bg-blue-600 rounded-full ring-4 ring-white"></div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                               <div className="flex justify-between items-start mb-2">
                                  <p className="text-xs font-black text-slate-900">{entry.author}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(entry.date).toLocaleString()}</p>
                               </div>
                               <ul className="space-y-1">
                                 {entry.changes.map((change, idx) => (
                                   <li key={idx} className="text-sm text-slate-600 font-medium">• {change}</li>
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

           {activeSubTab !== 'Overview' && activeSubTab !== 'Logs' && activeSubTab !== 'Client Information' && activeSubTab !== 'Timeline' && activeSubTab !== 'Risk Assessment' && activeSubTab !== 'Documents' && activeSubTab !== 'Tasks' && activeSubTab !== 'Visits' && activeSubTab !== 'Finance' && (
             <div className="py-40 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-200 opacity-30">
                <span className="text-6xl mb-6">{managementMenu.find(m => m.id === activeSubTab)?.icon || '⚙️'}</span>
                <p className="text-xl font-black uppercase tracking-widest text-slate-500">{activeSubTab} Deployment Pending</p>
             </div>
           )}
        </div>
      </div>

      {/* COMPLIANCE SIDEBAR */}
      <div className="w-full lg:w-96 bg-white border-l border-slate-200 p-6 md:p-10 space-y-12 overflow-y-auto scrollbar-hide shrink-0">
         <div className="bg-white rounded-[2.5rem] p-8 md:p-10 text-slate-900 relative overflow-hidden shadow-2xl border border-slate-100">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full"></div>
            <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-6">Compliance Status</p>
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
                  <p className={`text-xl font-black uppercase ${client.careLevel === 'High' || client.careLevel === 'Critical' ? 'text-rose-600' : 'text-slate-900'}`}>{client.careLevel}</p>
               </div>
               <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Review Deadline</p>
                  <p className="text-xl font-black text-slate-900 uppercase">{client.nextReviewDate}</p>
               </div>
            </div>
         </div>
         {/* MEDICATION TRACKER WIDGET */}
         {client.medicationModuleActive && (
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 text-slate-900 relative overflow-hidden shadow-2xl border border-slate-100">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full"></div>
               <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-6">Medication Tracker</p>
               <div className="space-y-8 relative z-10">
                  <div>
                     <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Last Ordered</p>
                     <p className="text-lg font-black text-slate-900">{client.medicationStats?.lastOrdered || 'N/A'}</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Next Order Due</p>
                     <div className="flex items-center gap-2">
                        <p className={`text-lg font-black ${client.medicationStats?.isDue ? 'text-rose-600' : 'text-slate-900'}`}>
                           {client.medicationStats?.nextOrderDue || 'N/A'}
                        </p>
                        {client.medicationStats?.isDue && (
                           <span className="px-2 py-1 bg-rose-100 text-rose-600 rounded text-[8px] font-black uppercase tracking-wide">Due</span>
                        )}
                     </div>
                  </div>
                  <button 
                    onClick={() => setShowReorderModal(true)}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95">
                     Reorder Now
                  </button>
               </div>
            </div>
         )}
         {/* ... Governance KPIs ... */}
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95">
                <h3 className="text-xl font-black text-slate-900 mb-2">{confirmModal.title}</h3>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">{confirmModal.message}</p>
                <div className="flex gap-3">
                    <button onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(prev => ({ ...prev, isOpen: false })); }} className="flex-1 py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">Confirm Save</button>
                </div>
            </div>
        </div>
      )}

      {/* STATUS CHANGE MODAL */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95">
                <h3 className="text-xl font-black text-slate-900 mb-2">{statusModal.title}</h3>
                <p className="text-slate-500 font-medium mb-6 leading-relaxed">{statusModal.message}</p>
                {/* ... Status Modal Content ... */}
                <div className="flex gap-3">
                    <button onClick={() => setStatusModal(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={handleConfirmStatusChange} className="flex-1 py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">Confirm</button>
                </div>
            </div>
        </div>
      )}

      {/* REORDER MODAL */}
      {showReorderModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-32 bg-emerald-600"></div>
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl text-4xl">
                        💊
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 text-center mb-2">Reorder Medication</h3>
                    <p className="text-xs font-bold text-slate-500 text-center uppercase tracking-widest mb-8">Prescription Request Details</p>
                    
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">GP Contact</p>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-900">{client.gp?.name || 'Not Recorded'}</p>
                                <p className="text-xs font-medium text-slate-600">{client.gp?.surgery}</p>
                                <p className="text-xs font-medium text-blue-600">{client.gp?.phone}</p>
                                <p className="text-xs font-medium text-slate-500">{client.gp?.address}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Patient Details</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">DOB</p>
                                    <p className="text-sm font-bold text-slate-900">{client.dob}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">NHS Number</p>
                                    <p className="text-sm font-bold text-slate-900">{client.nhsNumber}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">Address</p>
                                    <p className="text-sm font-medium text-slate-900">{client.address}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Current Medication</p>
                            {Array.isArray(client.medications) ? (
                                <ul className="space-y-2">
                                    {client.medications.map((med, idx) => (
                                        <li key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                            <span className="text-xs font-bold text-slate-700">{med.name}</span>
                                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-wide">{med.dosage}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                    {client.medications || 'No active medications recorded.'}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button 
                            onClick={() => setShowReorderModal(false)}
                            className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                        >
                            Close
                        </button>
                        <button 
                            onClick={() => setShowReorderModal(false)}
                            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
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
            <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-32 bg-blue-600"></div>
                <div className="relative z-10">
                    <div className="w-40 h-40 bg-white rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl p-4">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://portal.apexcare.com/client/${client.id}`)}&color=0f172a&bgcolor=ffffff`} alt="QR Code" className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-1">{client.firstName} {client.lastName}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Scan for Direct Profile Access</p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowQrModal(false)} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">Close</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfileView;