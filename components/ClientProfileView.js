import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ClientFinanceView from './ClientFinanceView';
import TaskManagement from './TaskManagement';

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
  const [visitPeriodFilter, setVisitPeriodFilter] = useState('All');
  const [hoveredVisit, setHoveredVisit] = useState(null);
  const [hoveredVisitPosition, setHoveredVisitPosition] = useState(null);
  const fileInputRef = useRef(null);

  const emergencyQrData = useMemo(() => {
    const data = [
        `EMERGENCY SNAPSHOT - ${client.firstName} ${client.lastName}`,
        `DOB: ${client.dob || 'Unknown'} | NHS: ${client.nhsNumber || 'Unknown'}`,
        `Allergies: ${client.allergies && client.allergies.length > 0 ? client.allergies.join(', ') : 'NKDA'}`,
        `DNACPR: ${client.legal?.dnacpr ? 'IN PLACE' : 'Attempt Resuscitation'}`,
        `RESPEC: ${client.legal?.respecStatus || 'Not Recorded'}`,
        `Contact: ${client.emergencyContact || 'None'}`
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

  // Local state for editing information in "Client Information"
  const [editInfo, setEditInfo] = useState({
    pmh: client.pmh ? client.pmh.join(', ') : '',
    lifeStory: client.social?.lifeStory || '',
    hobbies: client.social?.hobbies ? client.social.hobbies.join(', ') : ''
  });

  // Local state for editing identity information
  const [editIdentity, setEditIdentity] = useState({
    title: client.title || '',
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
    pocType: client.pocType || '',
    pronouns: client.pronouns || '',
    gender: client.gender || '',
    sexuality: client.sexuality || '',
    ethnicity: client.ethnicity || '',
    religion: client.religion || '',
    languages: client.languages || '',
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
    emergencyContact: client.emergencyContact || '',
    nextOfKin: client.nextOfKin || '',
    allergies: client.allergies ? client.allergies.join(', ') : '',
    mobilityLevel: client.mobility?.level || 'Independent',
    dietaryType: client.nutrition?.dietaryType || 'Regular',
    fluidConsistency: client.nutrition?.preferences?.match(/Fluids: (.*?)\./)?.[1] || 'Level 0 - Thin',
    nutritionPreferences: client.nutrition?.preferences || '',
    dnacpr: client.legal?.dnacpr || false,
    dnacprLocation: client.legal?.dnacprLocation || '',
    respecStatus: client.legal?.respecStatus || 'Not in place',
    respecLocation: client.legal?.respecLocation || '',
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

  // Local state for editing home environment
  const [isEditingHome, setIsEditingHome] = useState(false);
  const [editHome, setEditHome] = useState({
    equipment: client.environment?.equipment ? client.environment.equipment.join(', ') : '',
    pets: client.environment?.pets || '',
    lifeline: client.environment?.lifeline || '',
    binDay: client.environment?.binDay || '',
    fuseBoxLocation: client.environment?.fuseBoxLocation || '',
    stopcockLocation: client.environment?.stopcockLocation || ''
  });

  // Local state for editing care plan
  const [isEditingCarePlan, setIsEditingCarePlan] = useState(false);
  const [editCarePlan, setEditCarePlan] = useState({
    morning: client.carePlan?.morning || '',
    lunch: client.carePlan?.lunch || '',
    tea: client.carePlan?.tea || '',
    evening: client.carePlan?.evening || '',
    night: client.carePlan?.night || ''
  });

  // Assessment History State
  const [assessmentHistory, setAssessmentHistory] = useState([
    { id: 1, name: 'Waterlow Score', date: '2023-10-15', score: '15 (High Risk)', nextDue: '2023-11-15', status: 'Completed' },
    { id: 2, name: 'MUST', date: '2023-10-10', score: '0 (Low Risk)', nextDue: '2024-01-10', status: 'Completed' }
  ]);

  const [activeAssessment, setActiveAssessment] = useState(null);
  const [viewingAssessment, setViewingAssessment] = useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [showAssessmentSelector, setShowAssessmentSelector] = useState(false);

  const assessmentDefinitions = {
    'Waterlow Score': {
      questions: [
        { id: 'bmi', label: 'BMI / Weight for Height', options: [{ label: 'Average (BMI 20-24.9)', score: 0 }, { label: 'Above Average (BMI >25)', score: 1 }, { label: 'Obese (BMI >30)', score: 2 }, { label: 'Below Average (BMI <20)', score: 3 }] },
        { id: 'skin', label: 'Skin Type', options: [{ label: 'Healthy', score: 0 }, { label: 'Tissue Paper', score: 1 }, { label: 'Dry', score: 1 }, { label: 'Oedematous', score: 1 }, { label: 'Clammy (Fever)', score: 1 }, { label: 'Discoloured', score: 2 }, { label: 'Broken/Spot', score: 3 }] },
        { id: 'sexAge', label: 'Sex & Age', options: [{ label: 'Male', score: 1 }, { label: 'Female', score: 2 }, { label: '14-49', score: 1 }, { label: '50-64', score: 2 }, { label: '65-74', score: 3 }, { label: '75-80', score: 4 }, { label: '81+', score: 5 }] },
        { id: 'continence', label: 'Continence', options: [{ label: 'Complete / Catheterised', score: 0 }, { label: 'Occasional Incontinence', score: 1 }, { label: 'Catheter / Incontinent of Faeces', score: 2 }, { label: 'Doubly Incontinent', score: 3 }] },
        { id: 'mobility', label: 'Mobility', options: [{ label: 'Fully Mobile', score: 0 }, { label: 'Restless / Fidgety', score: 1 }, { label: 'Apathetic', score: 2 }, { label: 'Restricted', score: 3 }, { label: 'Bedbound / Traction', score: 4 }, { label: 'Chairbound', score: 5 }] }
      ],
      calculateScore: (answers) => Object.values(answers).reduce((a, b) => a + parseInt(b || 0), 0)
    },
    'MUST': {
      questions: [
        { id: 'bmi', label: 'BMI Score', options: [{ label: '>20 (>30 Obese)', score: 0 }, { label: '18.5 - 20', score: 1 }, { label: '<18.5', score: 2 }] },
        { id: 'weightLoss', label: 'Weight Loss Score (unplanned)', options: [{ label: '<5%', score: 0 }, { label: '5-10%', score: 1 }, { label: '>10%', score: 2 }] },
        { id: 'acute', label: 'Acute Disease Effect', options: [{ label: 'No', score: 0 }, { label: 'Yes', score: 2 }] }
      ],
      calculateScore: (answers) => Object.values(answers).reduce((a, b) => a + parseInt(b || 0), 0)
    },
    'Falls Risk Assessment Tool (FRAT)': {
        questions: [
            { id: 'history', label: 'History of Falls', options: [{ label: 'No', score: 0 }, { label: 'Yes', score: 1 }] },
            { id: 'medication', label: 'Medications (Sedatives, etc.)', options: [{ label: 'No', score: 0 }, { label: 'Yes', score: 1 }] },
            { id: 'mobility', label: 'Mobility Impairment', options: [{ label: 'No', score: 0 }, { label: 'Yes', score: 1 }] },
            { id: 'cognition', label: 'Cognitive Impairment', options: [{ label: 'No', score: 0 }, { label: 'Yes', score: 1 }] }
        ],
        calculateScore: (answers) => Object.values(answers).reduce((a, b) => a + parseInt(b || 0), 0)
    },
    'Bed Rails Assessment': {
        questions: [
            { id: 'consent', label: 'Consent Obtained', options: [{ label: 'Yes', score: 0 }, { label: 'No', score: 1 }] },
            { id: 'alternatives', label: 'Alternatives Tried', options: [{ label: 'Yes', score: 0 }, { label: 'No', score: 1 }] },
            { id: 'risk', label: 'Risk of Entrapment', options: [{ label: 'Low', score: 0 }, { label: 'High', score: 1 }] }
        ],
        calculateScore: (answers) => Object.values(answers).reduce((a, b) => a + parseInt(b || 0), 0)
    }
  };

  const handleStartAssessment = (name) => {
    if (assessmentDefinitions[name]) {
        setActiveAssessment(name);
        setAssessmentAnswers({});
        setShowAssessmentSelector(false);
    } else {
        alert('Assessment template not available.');
    }
  };

  const handleSaveAssessmentResult = () => {
      const def = assessmentDefinitions[activeAssessment];
      
      // Calculate score and gather details based on selected indices
      let score = 0;
      const details = def.questions.map(q => {
          const selectedIdx = parseInt(assessmentAnswers[q.id]);
          if (isNaN(selectedIdx)) return null;
          const opt = q.options[selectedIdx];
          score += opt.score;
          return { question: q.label, answer: opt.label, score: opt.score };
      }).filter(Boolean);

      let outcome = 'Low Risk';
      if (activeAssessment === 'Waterlow Score') {
          if (score >= 10) outcome = 'At Risk';
          if (score >= 15) outcome = 'High Risk';
          if (score >= 20) outcome = 'Very High Risk';
      } else if (activeAssessment === 'MUST') {
          if (score >= 1) outcome = 'Medium Risk';
          if (score >= 2) outcome = 'High Risk';
      } else if (activeAssessment.includes('FRAT')) {
          if (score >= 1) outcome = 'High Risk';
      } else if (activeAssessment.includes('Bed Rails')) {
          if (score > 0) outcome = 'Review Required';
          else outcome = 'Safe to Proceed';
      }

      const newRecord = {
          id: Date.now(),
          name: activeAssessment,
          date: new Date().toISOString(),
          score: `${score} (${outcome})`,
          nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
          status: 'Completed',
          author: 'Leon Lowden (Admin)',
          details: details
      };

      setAssessmentHistory([newRecord, ...assessmentHistory]);
      setActiveAssessment(null);
      setAssessmentAnswers({});
  };

  const recommendedAssessments = useMemo(() => {
    const recs = [];
    if (client.mobility?.riskOfFalls === 'High') {
        recs.push({ name: 'Falls Risk Assessment Tool (FRAT)', reason: 'High Falls Risk identified in profile.' });
        recs.push({ name: 'Bed Rails Assessment', reason: 'High Falls Risk may require bed rails.' });
    }
    if (client.nutrition?.chokingRisk) {
        recs.push({ name: 'SALT Referral', reason: 'Choking risk identified.' });
    }
    if (!assessmentHistory.find(a => a.name === 'Moving & Handling')) {
        recs.push({ name: 'Moving & Handling Plan', reason: 'Routine requirement.' });
    }
    return recs;
  }, [client, assessmentHistory]);

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

  const timeOptions = useMemo(() => {
      const options = [];
      for (let i = 0; i < 24; i++) {
          for (let j = 0; j < 60; j += 15) {
              options.push(`${String(i).padStart(2, '0')}:${String(j).padStart(2, '0')}`);
          }
      }
      return options;
  }, []);

  const [isFinanceDirty, setIsFinanceDirty] = useState(false);

  useEffect(() => {
    const isDirty = isEditingInfo || isEditingIdentity || isEditingAddress || isEditingCare || isEditingRisk || isAddingNote || isFinanceDirty || isEditingHome || isEditingCarePlan;
    onDirtyStateChange?.(isDirty);
  }, [isEditingInfo, isEditingIdentity, isEditingAddress, isEditingCare, isEditingRisk, isAddingNote, isFinanceDirty, isEditingHome, isEditingCarePlan, onDirtyStateChange]);

  // Visits state
  const [visits, setVisits] = useState(client.visits || []);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getPeriodColor = (time) => {
    const period = getVisitPeriod(time);
    switch(period) {
        case 'Morning': return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100';
        case 'Lunch': return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100';
        case 'Tea': return 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100';
        case 'Evening': return 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100';
        default: return 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100';
    }
  };

  const getVisitPeriod = useCallback((time) => {
    if (!time) return 'Unknown';
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'Morning';
    if (hour < 14) return 'Lunch';
    if (hour < 17) return 'Tea';
    return 'Evening';
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

  const [visitModal, setVisitModal] = useState({ isOpen: false, mode: 'add', visit: null });
  const [isCancelling, setIsCancelling] = useState(false);

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
                    id: `v-${Date.now()}-${i}`,
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
    setVisits(updatedVisits);
    onUpdateClient({
        ...client,
        visits: updatedVisits
    });
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
                message: `A "${newVisitPeriod}" visit is already scheduled for this day. Are you sure you want to add another?`,
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
          setVisits(updatedVisits);
          onUpdateClient({
              ...client,
              visits: updatedVisits
          });
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
          { key: 'title', label: 'Title' },
          { key: 'firstName', label: 'First Name' }, { key: 'lastName', label: 'Last Name' },
          { key: 'preferredName', label: 'Preferred Name' }, { key: 'nhsNumber', label: 'NHS Number' },
          { key: 'pidNumber', label: 'Local Authority ID' }, { key: 'dob', label: 'Date of Birth' },
          { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'area', label: 'Area' },
          { key: 'auditStatus', label: 'Audit Status' }, { key: 'careLevel', label: 'Service Level' },
          { key: 'pronouns', label: 'Pronouns' },
          { key: 'pocType', label: 'POC Type' },
          { key: 'gender', label: 'Gender' },
          { key: 'sexuality', label: 'Sexual Orientation' },
          { key: 'ethnicity', label: 'Ethnicity' },
          { key: 'religion', label: 'Religion' },
          { key: 'languages', label: 'Languages' },
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
          emergencyContact: editCare.emergencyContact,
          nextOfKin: editCare.nextOfKin,
          arrivalNote: editCare.arrivalNote,
          bigThing: editCare.bigThing,
          needsFluidMonitoring: editCare.needsFluidMonitoring,
          allergies: editCare.allergies.split(',').map(s => s.trim()).filter(s => s !== ''),
          mobility: { ...client.mobility, level: editCare.mobilityLevel },
          nutrition: { ...client.nutrition, dietaryType: editCare.dietaryType, preferences: editCare.nutritionPreferences },
          legal: { ...client.legal, dnacpr: editCare.dnacpr, respecStatus: editCare.respecStatus, dnacprLocation: editCare.dnacprLocation, respecLocation: editCare.respecLocation },
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

  const handleUpdateHome = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Save Home Environment?',
      message: 'Are you sure you want to update the home environment details?',
      onConfirm: () => {
        onUpdateClient({
          ...client,
          environment: {
            ...client.environment,
            equipment: editHome.equipment.split(',').map(s => s.trim()).filter(s => s !== ''),
            lifeline: editHome.lifeline,
            pets: editHome.pets,
            binDay: editHome.binDay,
            fuseBoxLocation: editHome.fuseBoxLocation,
            stopcockLocation: editHome.stopcockLocation
          },
          editHistory: [{
             id: `h-${Date.now()}`, date: new Date().toISOString(), author: 'Leon Lowden (Admin)', changes: ['Updated Home Environment']
          }, ...(client.editHistory || [])]
        });
        setIsEditingHome(false);
      }
    });
  };

  const handleUpdateCarePlan = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Save Care Plan?',
      message: 'Are you sure you want to update the daily care plan routines?',
      onConfirm: () => {
        onUpdateClient({
          ...client,
          carePlan: {
            morning: editCarePlan.morning,
            lunch: editCarePlan.lunch,
            tea: editCarePlan.tea,
            evening: editCarePlan.evening,
            night: editCarePlan.night
          },
          editHistory: [{
             id: `h-${Date.now()}`, date: new Date().toISOString(), author: 'Leon Lowden (Admin)', changes: ['Updated Care Plan Routines']
          }, ...(client.editHistory || [])]
        });
        setIsEditingCarePlan(false);
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
      case 'Alert': return 'bg-rose-50 border-rose-200 text-rose-600';
      case 'Incident': return 'bg-orange-50 border-orange-200 text-orange-600';
      case 'Visit Log': return 'bg-purple-50 border-purple-200 text-purple-600';
      case 'Action': return 'bg-blue-50 border-blue-200 text-blue-600';
      case 'Task': return 'bg-emerald-50 border-emerald-200 text-emerald-600';
      default: return 'bg-slate-100 border-slate-200 text-slate-500';
    }
  };

  const handleTogglePin = (noteId) => {
    const updatedNotes = (client.careNotes || []).map(n => 
      n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
    );
    onUpdateClient({ ...client, careNotes: updatedNotes });
  };

  const handleUpdateStatus = (noteId, newStatus) => {
    const updatedNotes = (client.careNotes || []).map(n => 
      n.id === noteId ? { ...n, status: newStatus } : n
    );
    onUpdateClient({ ...client, careNotes: updatedNotes });
  };

  const filteredNotes = (client.careNotes || [])
    .filter(n => noteFilter === 'All' || n.category === noteFilter)
    .sort((a, b) => {
        if (a.isPinned === b.isPinned) return new Date(b.date) - new Date(a.date);
        return a.isPinned ? -1 : 1;
    });

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
      <div className="w-full lg:w-24 group hover:lg:w-72 bg-white border-r border-l border-slate-200 flex flex-col h-auto lg:h-full shadow-2xl z-[110] shrink-0 transition-all duration-300 ease-in-out">
        <div className="p-4 lg:group-hover:p-6 md:lg:group-hover:p-8 border-b border-slate-200 flex flex-col items-center transition-all">
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
             <h2 className="text-xl font-black text-slate-900 text-center leading-none mb-1 whitespace-nowrap">{client.firstName} {client.lastName}</h2>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{client.id}</p>
          </div>
          <button onClick={onBack} className="mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-all relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-100 lg:group-hover:opacity-0 lg:group-hover:scale-75">
                <span className="text-xl">←</span>
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
              className={`w-auto lg:w-full flex items-center lg:justify-center lg:group-hover:justify-start gap-2 lg:gap-0 lg:group-hover:gap-4 px-4 lg:group-hover:px-5 py-2 lg:py-3 text-sm font-bold rounded-2xl transition-all whitespace-nowrap ${
                activeSubTab === item.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              <span className="truncate lg:hidden lg:group-hover:inline">{item.id}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-visible lg:overflow-y-auto flex flex-col relative bg-slate-50 z-0 pb-24 md:pb-0">
        
        {/* ENHANCED GOVERNANCE HEADER */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4 z-[100] flex flex-col xl:flex-row items-center justify-end shadow-sm gap-4">
           <div className="flex gap-3 w-full md:w-auto">
              <button 
                  onClick={() => setShowQrModal(true)}
                  className="w-full md:w-auto px-4 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                  <span className="text-base">📱</span> QR Access
              </button>
              {userRole === 'admin' && (client.status === 'Active' ? (
                 <button 
                   onClick={handleDischargeClient}
                   className="w-full md:w-auto px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-100 transition-colors"
                 >
                   Discharge Client
                 </button>
              ) : (
                 <div className="flex gap-3 w-full md:w-auto">
                    {client.status === 'Hospitalized' && (
                        <button 
                           onClick={handleDischargeClient}
                           className="w-full md:w-auto px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-100 transition-colors"
                        >
                           Discharge
                        </button>
                    )}
                    <button 
                        onClick={handleReadmitClient}
                        className="w-full md:w-auto px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                        {client.status === 'Hospitalized' ? 'Re-activate Client' : 'Re-admit Client'}
                    </button>
                 </div>
              ))}
              <button className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-200 transition-transform active:scale-95"><span className="mr-2">📂</span>Export Evidence Pack</button>
           </div>
        </div>

        <div className="max-w-[100rem] mx-auto w-full p-4 md:p-10 space-y-8 md:space-y-12">
           
           {activeSubTab === 'Overview' && (
             <>
               {/* SNAPSHOT WIDGETS */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Next Visit with Scheduled Carer */}
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden group" style={{ borderTop: '6px solid #3b82f6' }}>
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
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl" style={{ borderTop: '6px solid #10b981' }}>
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
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl" style={{ borderTop: '6px solid #14b8a6' }}>
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Medication Status</p>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                      <p className="text-2xl font-black text-slate-900 uppercase">Fully Compliant</p>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mt-2">Last dose: 08:30 Today</p>
                  </div>
               </div>

               {/* ARRIVAL INSTRUCTIONS & ALERT (Moved Above Identity) */}
               <section className="bg-white border border-slate-200 text-slate-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl relative overflow-hidden" style={{ borderTop: '6px solid #f59e0b' }}>
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
               <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden" style={{ borderTop: '6px solid #3b82f6' }}>
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identity & Profile Summary</h3>
                     <button onClick={() => setActiveSubTab('Client Information')} className="text-[10px] font-black text-blue-600 uppercase hover:underline">Full Details →</button>
                  </div>
                  <div className="p-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
                     {[
                       { label: 'NHS Number', value: client.nhsNumber || 'Not Recorded' },
                       { label: 'Age / DOB', value: calculateAge(client.dob).full },
                       { label: 'Group', value: client.group || 'Not Assigned' },
                       { label: 'POC Type', value: client.pocType || 'Not Recorded' },
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
               <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden" style={{ borderTop: '6px solid #6366f1' }}>
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

               {/* ABOUT ME / HIGHLIGHTS */}
               <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden" style={{ borderTop: '6px solid #8b5cf6' }}>
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight">About {client.firstName}</h3>
                  </div>
                  <div className="p-6 md:p-10">
                    <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                       {client.social?.lifeStory || 'No summary available.'}
                    </p>
                  </div>
               </section>

               {/* Care Plan & Daily Routine */}
               <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden" style={{ borderTop: '6px solid #14b8a6' }}>
                 <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">Care Plan & Daily Routine</h3>
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
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium leading-relaxed mt-1 whitespace-pre-wrap">
                          {client.carePlan?.[item.key] || 'No routine recorded.'}
                        </div>
                     </div>
                   ))}
                 </div>
               </section>
             </>
           )}

           {activeSubTab === 'Client Information' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                {/* Identity & Contact Records */}
                <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden" style={{ borderTop: '6px solid #3b82f6' }}>
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
                  <div className="p-6 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6 xl:gap-x-8">
                    {[
                       { label: 'Title', value: client.title, key: 'title' },
                      { label: 'First Name', value: client.firstName, key: 'firstName' },
                      { label: 'Last Name', value: client.lastName, key: 'lastName' },
                      { label: 'Preferred Name', value: client.preferredName, key: 'preferredName' },
                      { label: 'Date of Birth', value: client.dob, key: 'dob', type: 'date' },
                       
                       { type: 'divider' },

                      { label: 'Gender', value: client.gender, key: 'gender' },
                      { label: 'Pronouns', value: client.pronouns, key: 'pronouns' },
                      { label: 'Sexual Orientation', value: client.sexuality, key: 'sexuality' },
                      { label: 'Ethnicity', value: client.ethnicity, key: 'ethnicity' },
                      { label: 'Religion', value: client.religion, key: 'religion' },
                      { label: 'Languages', value: client.languages, key: 'languages' },

                       { type: 'divider' },

                      { label: 'NHS Number', value: client.nhsNumber, key: 'nhsNumber' },
                      { label: 'Local Authority ID', value: client.pidNumber, key: 'pidNumber' },

                       { type: 'divider' },

                      { label: 'Phone Number', value: client.phone, key: 'phone' },
                      { label: 'Email Address', value: client.email, key: 'email' },

                       { type: 'divider' },

                       { label: 'Service Start Date', value: client.serviceStartDate, key: 'serviceStartDate', type: 'date' },
                       { label: 'Service Level', value: client.careLevel, key: 'careLevel' },
                       { label: 'POC Type', value: client.pocType, key: 'pocType', type: 'select', options: ['Reablement', 'Long Term', 'FastTrack/EOL', 'Intermediate Care'] },
                       { label: 'Area', value: client.area, key: 'area' },
                      { label: 'Group', value: client.group, key: 'group', type: 'select', options: availableGroups },
                       { label: 'Regulated Care', value: client.regulatedCare, key: 'regulatedCare' },
                       { label: 'Audit Status', value: client.auditStatus, key: 'auditStatus' },
                     ].map((item, index) => {
                       if (item.type === 'divider') {
                         return <div key={`divider-${index}`} className="col-span-full h-px bg-slate-100"></div>;
                       }
                       return (
                         <div key={item.key} className={item.fullWidth ? 'col-span-full' : ''}>
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</label>
                           {isEditingIdentity ? (
                             item.type === 'select' ? (
                               <select value={editIdentity[item.key]} onChange={(e) => setEditIdentity({...editIdentity, [item.key]: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900">
                                 <option value="">Not Assigned</option>
                                 {item.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                               </select>
                             ) : (
                               <input 
                            type={item.type || 'text'}
                            value={editIdentity[item.key]}
                            onChange={(e) => setEditIdentity({...editIdentity, [item.key]: e.target.value})}
                            className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900"
                          />
                             )
                           ) : (
                             <p className="text-sm font-bold text-slate-900 mt-1">{item.value || 'Not Recorded'}</p>
                           )}
                         </div>
                       );
                     })}
                  </div>
                </section>

                {/* Address & Location */}
                <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden" style={{ borderTop: '6px solid #3b82f6' }}>
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

                {/* Professional & Emergency Contacts */}
                <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden" style={{ borderTop: '6px solid #6366f1' }}>
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Professional & Emergency Contacts</h3>
                    {userRole === 'admin' && (!isEditingCare ? (
                      <button onClick={() => setIsEditingCare(true)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-xl hover:bg-slate-50 transition-colors">Edit Contacts</button>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => setIsEditingCare(false)} className="px-6 py-3 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
                        <button onClick={handleUpdateCare} className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-emerald-200">Save Changes</button>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
                    {[
                      { label: 'Emergency Contact', value: editCare.emergencyContact, key: 'emergencyContact', placeholder: 'Name & Number' },
                      { label: 'Next of Kin', value: editCare.nextOfKin, key: 'nextOfKin', placeholder: 'Name, Relationship & Number' },
                      { label: 'GP Name', value: editCare.gpName, key: 'gpName', placeholder: 'Dr. Name' },
                      { label: 'GP Surgery', value: editCare.gpSurgery, key: 'gpSurgery', placeholder: 'Surgery Name' },
                      { label: 'GP Phone', value: editCare.gpPhone, key: 'gpPhone', placeholder: 'Number' },
                      { label: 'Pharmacy Name', value: editCare.pharmacyName, key: 'pharmacyName', placeholder: 'Pharmacy Name' },
                      { label: 'Pharmacy Phone', value: editCare.pharmacyPhone, key: 'pharmacyPhone', placeholder: 'Number' },
                    ].map(item => (
                      <div key={item.key}>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</label>
                        {isEditingCare ? (
                          <input 
                            type="text"
                            value={editCare[item.key]}
                            onChange={(e) => setEditCare({...editCare, [item.key]: e.target.value})}
                            placeholder={item.placeholder}
                            className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900"
                          />
                        ) : (
                          <p className="text-sm font-bold text-slate-900 mt-1">{client[item.key === 'emergencyContact' ? 'emergencyContact' : 'gp']?.[item.key === 'emergencyContact' ? 'toString' : item.key.replace('gp', '').toLowerCase()] || (item.key.includes('pharmacy') ? client.pharmacy?.[item.key.replace('pharmacy', '').toLowerCase()] : client[item.key]) || 'Not Recorded'}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Care & Safety Profile */}
                <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden" style={{ borderTop: '6px solid #f43f5e' }}>
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Care & Safety Profile</h3>
                    {userRole === 'admin' && (!isEditingCare ? (
                      <button onClick={() => setIsEditingCare(true)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-xl hover:bg-slate-50 transition-colors">Edit Profile</button>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => setIsEditingCare(false)} className="px-6 py-3 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
                        <button onClick={handleUpdateCare} className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-emerald-200">Save Changes</button>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Allergies</label>
                        {isEditingCare ? (
                          <input type="text" value={editCare.allergies} onChange={(e) => setEditCare({...editCare, allergies: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900" placeholder="e.g. Penicillin, Latex" />
                        ) : (
                          <div className="flex flex-wrap gap-2 mt-2">{client.allergies && client.allergies.length > 0 ? client.allergies.map(a => <span key={a} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-100">{a}</span>) : <span className="text-sm font-bold text-slate-400">NKDA</span>}</div>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">DNACPR Status</label>
                        {isEditingCare ? (
                          <select value={editCare.dnacpr} onChange={(e) => setEditCare({...editCare, dnacpr: e.target.value === 'true'})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900"><option value="false">No - Attempt Resuscitation</option><option value="true">Yes - Do Not Attempt</option></select>
                        ) : (
                          <p className={`text-sm font-black mt-1 ${client.legal?.dnacpr ? 'text-rose-600' : 'text-emerald-600'}`}>{client.legal?.dnacpr ? 'DNACPR In Place' : 'Attempt Resuscitation'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">DNACPR Form Location</label>
                        {isEditingCare ? (
                          <input type="text" value={editCare.dnacprLocation} onChange={(e) => setEditCare({...editCare, dnacprLocation: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900" placeholder="e.g. On file in office" />
                        ) : (
                          <p className="text-sm font-bold text-slate-900 mt-1">{client.legal?.dnacprLocation || 'Not Recorded'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">RESPEC Status</label>
                        {isEditingCare ? (
                          <select value={editCare.respecStatus} onChange={(e) => setEditCare({...editCare, respecStatus: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900">
                            <option>Not in place</option>
                            <option>In place</option>
                            <option>For discussion</option>
                          </select>
                        ) : (
                          <p className={`text-sm font-black mt-1 ${client.legal?.respecStatus === 'In place' ? 'text-rose-600' : 'text-slate-900'}`}>{client.legal?.respecStatus || 'Not in place'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">RESPEC Form Location</label>
                        {isEditingCare ? (
                          <input type="text" value={editCare.respecLocation} onChange={(e) => setEditCare({...editCare, respecLocation: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900" placeholder="e.g. With client" />
                        ) : (
                          <p className="text-sm font-bold text-slate-900 mt-1">{client.legal?.respecLocation || 'Not Recorded'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mobility Level</label>
                        {isEditingCare ? (
                          <input type="text" value={editCare.mobilityLevel} onChange={(e) => setEditCare({...editCare, mobilityLevel: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900" />
                        ) : (
                          <p className="text-sm font-bold text-slate-900 mt-1">{client.mobility?.level || 'Not Recorded'}</p>
                        )}
                    </div>
                  </div>
                </section>

                {/* Care Plan & Daily Routine */}
                <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden" style={{ borderTop: '6px solid #14b8a6' }}>
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Care Plan & Daily Routine</h3>
                    {userRole === 'admin' && (!isEditingCarePlan ? (
                      <button onClick={() => setIsEditingCarePlan(true)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-xl hover:bg-slate-50 transition-colors">Edit Plan</button>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => setIsEditingCarePlan(false)} className="px-6 py-3 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
                        <button onClick={handleUpdateCarePlan} className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-emerald-200">Save Changes</button>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 md:p-10 grid grid-cols-1 gap-8">
                    {[
                      { label: 'Morning Routine', key: 'morning', placeholder: 'e.g. Wake up, wash, dress, breakfast...' },
                      { label: 'Lunch Routine', key: 'lunch', placeholder: 'e.g. Prepare lunch, medication prompt...' },
                      { label: 'Tea / Evening Routine', key: 'tea', placeholder: 'e.g. Afternoon tea, check fluids...' },
                      { label: 'Night Routine', key: 'night', placeholder: 'e.g. Prepare for bed, secure home...' },
                    ].map(item => (
                      <div key={item.key}>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</label>
                        {isEditingCarePlan ? (
                          <textarea 
                            rows={3}
                            value={editCarePlan[item.key]}
                            onChange={(e) => setEditCarePlan({...editCarePlan, [item.key]: e.target.value})}
                            placeholder={item.placeholder}
                            className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-medium text-slate-900"
                          />
                        ) : (
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium leading-relaxed mt-1 whitespace-pre-wrap">
                            {client.carePlan?.[item.key] || 'No routine recorded.'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Home Environment & Equipment */}
                <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden" style={{ borderTop: '6px solid #64748b' }}>
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Home Environment & Equipment</h3>
                    {userRole === 'admin' && (!isEditingHome ? (
                      <button onClick={() => setIsEditingHome(true)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-xl hover:bg-slate-50 transition-colors">Edit Details</button>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => setIsEditingHome(false)} className="px-6 py-3 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
                        <button onClick={handleUpdateHome} className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-emerald-200">Save Changes</button>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { label: 'Equipment in Place', value: editHome.equipment, key: 'equipment', placeholder: 'e.g. Hoist, Commode, Hospital Bed' },
                      { label: 'Lifeline/Pendant Alarm', value: editHome.lifeline, key: 'lifeline', placeholder: 'e.g. Yes, pendant worn' },
                      { label: 'Pets', value: editHome.pets, key: 'pets', placeholder: 'e.g. 1 Dog (Rex), 2 Cats' },
                      { label: 'Bin Day', value: editHome.binDay, key: 'binDay', placeholder: 'e.g. Tuesday' },
                      { label: 'Fuse Box Location', value: editHome.fuseBoxLocation, key: 'fuseBoxLocation', placeholder: 'e.g. Under stairs' },
                      { label: 'Stopcock Location', value: editHome.stopcockLocation, key: 'stopcockLocation', placeholder: 'e.g. Kitchen sink cupboard' },
                    ].map(item => (
                      <div key={item.key} className={item.key === 'equipment' ? 'md:col-span-2' : ''}>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</label>
                        {isEditingHome ? (
                          <input 
                            type="text"
                            value={editHome[item.key]}
                            onChange={(e) => setEditHome({...editHome, [item.key]: e.target.value})}
                            placeholder={item.placeholder}
                            className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900"
                          />
                        ) : (
                          <p className="text-sm font-bold text-slate-900 mt-1">{
                            item.key === 'equipment' 
                              ? (client.environment?.equipment && client.environment.equipment.length > 0 ? client.environment.equipment.join(', ') : 'None Recorded')
                              : (client.environment?.[item.key] || 'Not Recorded')
                          }</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Clinical & Social History */}
                <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden" style={{ borderTop: '6px solid #8b5cf6' }}>
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
                <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden" style={{ borderTop: '6px solid #f43f5e' }}>
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

                {/* Recommended Assessments */}
                {recommendedAssessments.length > 0 && (
                    <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 md:px-10 py-6 border-b border-slate-200 bg-amber-50">
                            <h3 className="text-xl font-black text-amber-800 tracking-tight flex items-center gap-2">
                                ⚠️ Recommended Assessments
                            </h3>
                        </div>
                        <div className="p-6 md:p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recommendedAssessments.map((rec, idx) => (
                                    <div key={idx} className="p-4 border border-amber-200 bg-amber-50/50 rounded-2xl flex justify-between items-center">
                                        <div>
                                            <p className="font-black text-slate-900">{rec.name}</p>
                                            <p className="text-xs font-bold text-amber-700 mt-1">{rec.reason}</p>
                                        </div>
                                        <button onClick={() => handleStartAssessment(rec.name)} className="px-4 py-2 bg-white border border-amber-200 text-amber-700 text-[10px] font-black uppercase rounded-xl hover:bg-amber-100 transition-colors shadow-sm">
                                            Start
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Assessment History */}
                <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 md:px-10 py-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Assessment History</h3>
                        <button onClick={() => setShowAssessmentSelector(true)} className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
                            + New Assessment
                        </button>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score / Outcome</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Due</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {assessmentHistory.map((assessment) => (
                                    <tr key={assessment.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-6 font-bold text-slate-900">{assessment.name}</td>
                                        <td className="p-6 text-sm font-medium text-slate-600">{new Date(assessment.date).toLocaleDateString('en-GB')}</td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${assessment.score.includes('High') ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                                {assessment.score}
                                            </span>
                                        </td>
                                        <td className="p-6 text-sm font-medium text-slate-600">{new Date(assessment.nextDue).toLocaleDateString('en-GB')}</td>
                                        <td className="p-6 text-right">
                                            <button onClick={() => setViewingAssessment(assessment)} className="text-blue-600 font-bold text-xs hover:underline">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
              </div>
           )}

           {activeSubTab === 'Tasks' && (
              <TaskManagement 
                tasks={client.tasks || []}
                onUpdateTasks={(updatedTasks) => onUpdateClient({ ...client, tasks: updatedTasks })}
                userRole={userRole}
              />
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

                 <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ borderTop: '6px solid #3b82f6' }}>
                    {/* Calendar Header */}
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <button onClick={handlePrevMonth} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">←</button>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                            </h3>
                            <button onClick={handleNextMonth} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">→</button>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-center">
                            <button onClick={() => setVisitPeriodFilter('All')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${visitPeriodFilter === 'All' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>All</button>
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
                                            visitPeriodFilter === p ? activeColor : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
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
                                    <div key={d} className={`bg-white min-h-[180px] p-2 flex flex-col group relative transition-colors ${isToday ? 'ring-2 ring-inset ring-blue-500/20' : ''}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-black ${isToday ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>{d}</span>
                                            {dayVisits.length > 0 && <span className="text-[9px] font-bold text-slate-400">{dayVisits.length} Visits</span>}
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1 scrollbar-hide">
                                            {periodsToRender.map(period => {
                                                const periodVisits = dayVisits.filter(v => getVisitPeriod(v.time) === period.label);
                                                
                                                let emptyClasses = 'border-slate-100 hover:border-blue-200 hover:bg-slate-50';
                                                let textClasses = 'text-slate-300 group-hover/slot:text-blue-400';

                                                if (period.label === 'Morning') {
                                                    emptyClasses = 'border-amber-100/50 bg-amber-50/30 hover:bg-amber-50 hover:border-amber-200';
                                                    textClasses = 'text-amber-300 group-hover/slot:text-amber-600';
                                                } else if (period.label === 'Lunch') {
                                                    emptyClasses = 'border-emerald-100/50 bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-200';
                                                    textClasses = 'text-emerald-300 group-hover/slot:text-emerald-600';
                                                } else if (period.label === 'Tea') {
                                                    emptyClasses = 'border-blue-100/50 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-200';
                                                    textClasses = 'text-blue-300 group-hover/slot:text-blue-600';
                                                } else if (period.label === 'Evening') {
                                                    emptyClasses = 'border-indigo-100/50 bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-200';
                                                    textClasses = 'text-indigo-300 group-hover/slot:text-indigo-600';
                                                }

                                                return (
                                                    <div key={period.label} className="flex-1 min-h-[30px] flex flex-col gap-1">
                                                        {periodVisits.length > 0 ? (
                                                            periodVisits.map(visit => (
                                                                <div key={visit.id}>
                                                                    <div 
                                                                        className={`p-1.5 rounded-lg border cursor-pointer transition-all ${getPeriodColor(visit.time)}`}
                                                                        onClick={(e) => { e.stopPropagation(); handleOpenEditVisit(visit); }}
                                                                        onMouseEnter={(e) => handleVisitMouseEnter(e, visit)}
                                                                        onMouseLeave={handleVisitMouseLeave}
                                                                    >
                                                                        <div className="flex justify-between items-center w-full">
                                                                            <span className="text-[9px] font-black uppercase">{period.label}</span>
                                                                            <span className="text-[9px] font-bold opacity-70">{visit.time}</span>
                                                                        </div>
                                                                        <div className="text-[9px] font-bold truncate">{visit.carer}</div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div 
                                                                className={`flex-1 rounded-lg border border-dashed flex items-center justify-center group/slot transition-all cursor-pointer ${emptyClasses}`}
                                                                onClick={() => {
                                                                    if (userRole === 'admin') {
                                                                        handleOpenAddVisit(dateStr, period.time);
                                                                    }
                                                                }}
                                                            >
                                                                <span className={`text-[8px] font-black uppercase transition-colors ${textClasses}`}>
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
                                                +
                                            </button>
                                        )}
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
                   <button onClick={() => setIsAddingNote(true)} className="bg-white text-slate-900 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 border border-slate-200 hover:bg-slate-50">+ Add Log</button>
                   )}
                </div>
                
                {/* Filter Bar */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['All', 'General', 'Alert', 'Incident', 'Visit Log', 'Action', 'Concern'].map(type => (
                        <button 
                            key={type}
                            onClick={() => setNoteFilter(type)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${noteFilter === type ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                   {filteredNotes.length > 0 ? filteredNotes.map((note) => (
                     <div key={note.id} className={`bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow ${note.isCqcEvidence ? 'ring-2 ring-blue-500/20' : ''} ${note.isPinned ? 'border-blue-200 ring-1 ring-blue-100' : ''}`}>
                        <div className="px-6 md:px-10 py-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 gap-4">
                           <div className="flex items-center gap-4">
                              <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase border ${getNoteColor(note.category)}`}>{note.category}</span>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(note.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                           <div className="flex gap-3 items-center">
                              {(['Concern', 'Incident', 'Action', 'Alert'].includes(note.category)) && (
                                  <select
                                      value={note.status || 'Open'}
                                      onChange={(e) => handleUpdateStatus(note.id, e.target.value)}
                                      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border outline-none cursor-pointer transition-colors ${
                                          note.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                          note.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                          note.status === 'Investigating' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                          'bg-white text-slate-500 border-slate-200'
                                      }`}
                                  >
                                      <option value="Open">Open</option>
                                      <option value="Investigating">Investigating</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Resolved">Resolved</option>
                                  </select>
                              )}
                              {note.isCqcEvidence && <span className="px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase rounded-full">CQC Evidence</span>}
                              {userRole === 'admin' && (
                                <button 
                                    onClick={() => handleTogglePin(note.id)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${note.isPinned ? 'bg-blue-100 text-blue-600' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'}`}
                                    title={note.isPinned ? "Unpin Log" : "Pin Log"}
                                >
                                    📌
                                </button>
                              )}
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
                <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden" style={{ borderTop: '6px solid #64748b' }}>
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
      {activeSubTab === 'Overview' && (
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
      )}

      {/* VISIT MODAL */}
      {visitModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-8 overflow-y-auto">
                <h3 className="text-2xl font-black text-slate-900 mb-6">{visitModal.mode === 'add' ? 'Schedule Visit' : 'Edit Visit'}</h3>
                
                <div className="space-y-6">
                    {/* Type Selection */}
                    <div className="bg-slate-50 p-1 rounded-xl flex">
                        <button 
                            onClick={() => setVisitForm({...visitForm, type: 'Recurring'})}
                            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${visitForm.type === 'Recurring' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Rota (Recurring)
                        </button>
                        <button 
                            onClick={() => setVisitForm({...visitForm, type: 'One-off'})}
                            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${visitForm.type === 'One-off' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            One-off
                        </button>
                    </div>

                    {/* Date & Carer */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Start Date</label>
                            <input type="date" value={visitForm.date} onChange={(e) => setVisitForm({...visitForm, date: e.target.value})} className="w-full mt-1 bg-slate-50 border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Carer</label>
                            <select value={visitForm.carer} onChange={(e) => setVisitForm({...visitForm, carer: e.target.value})} className="w-full mt-1 bg-slate-50 border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20">
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
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            {num} Carer{num > 1 ? 's' : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Additional Support</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-700">Add Extra Carer</span>
                                        <button 
                                            onClick={() => setVisitForm({ ...visitForm, hasAdditionalCarer: !visitForm.hasAdditionalCarer })}
                                            className={`w-10 h-6 rounded-full transition-colors relative ${visitForm.hasAdditionalCarer ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${visitForm.hasAdditionalCarer ? 'translate-x-4' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {visitForm.hasAdditionalCarer && (
                                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 pt-2 border-t border-slate-200">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                                            <select 
                                                value={visitForm.additionalCarerType} 
                                                onChange={(e) => setVisitForm({...visitForm, additionalCarerType: e.target.value})}
                                                className="w-full mt-1 bg-white border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-emerald-500/20"
                                            >
                                                <option value="Shadowing">Shadowing</option>
                                                <option value="Induction">Induction</option>
                                                <option value="Training">Training</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pay Rate (£/hr)</label>
                                            <input 
                                                type="number" 
                                                value={visitForm.additionalPayRate} 
                                                onChange={(e) => setVisitForm({...visitForm, additionalPayRate: e.target.value})}
                                                className="w-full mt-1 bg-white border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-emerald-500/20"
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
                                    className="w-full mt-1 bg-slate-50 border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20"
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
                                    className="w-full mt-1 bg-slate-50 border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20"
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
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 text-[10px] font-black uppercase rounded-lg transition-colors border border-slate-200 hover:border-blue-200"
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
                            className="w-full mt-1 bg-slate-50 border-slate-200 rounded-xl p-3 font-medium text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20 min-h-[80px]"
                            placeholder="Enter any specific instructions or notes for this visit..."
                        />
                    </div>

                    {/* Visit Tasks */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tasks for this visit</label>
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto bg-slate-50 p-3 rounded-lg border border-slate-200">
                            {client.tasks && client.tasks.length > 0 ? client.tasks.map(task => (
                                <div key={task.id} className="flex items-center">
                                    <input
                                        id={`visit-task-${task.id}`}
                                        type="checkbox"
                                        checked={visitForm.tasks.includes(task.description)}
                                        onChange={(e) => {
                                            const taskDesc = task.description;
                                            if (e.target.checked) {
                                                setVisitForm(vf => ({ ...vf, tasks: [...vf.tasks, taskDesc] }));
                                            } else {
                                                setVisitForm(vf => ({ ...vf, tasks: vf.tasks.filter(t => t !== taskDesc) }));
                                            }
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor={`visit-task-${task.id}`} className="ml-3 text-sm font-medium text-gray-700">{task.description}</label>
                                </div>
                            )) : (
                                <p className="text-xs text-slate-400 italic p-2">No tasks defined for this client. Add tasks in the 'Tasks' tab.</p>
                            )}
                        </div>
                    </div>

                    {/* Recurring Options */}
                    {visitForm.type === 'Recurring' && (
                        <div className="space-y-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                            <div>
                                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Frequency</label>
                                <select value={visitForm.frequency} onChange={(e) => setVisitForm({...visitForm, frequency: e.target.value})} className="w-full mt-1 bg-white border-blue-200 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20">
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
                                                className={`w-10 h-10 rounded-xl text-[10px] font-black uppercase transition-all ${visitForm.selectedDays.includes(day) ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-400 border border-blue-100 hover:border-blue-300'}`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={() => setVisitModal({ ...visitModal, isOpen: false })} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={handleSaveVisit} className="flex-1 py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">Save Schedule</button>
                </div>
                </div>
            </div>
        </div>
      )}

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
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${emergencyQrData}&color=0f172a&bgcolor=ffffff`} alt="QR Code" className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-1">{client.firstName} {client.lastName}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Scan for Emergency Snapshot</p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowQrModal(false)} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">Close</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* ASSESSMENT SELECTOR MODAL */}
      {showAssessmentSelector && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95">
                <h3 className="text-xl font-black text-slate-900 mb-6">Select Assessment</h3>
                <div className="space-y-3">
                    {Object.keys(assessmentDefinitions).map(name => (
                        <button key={name} onClick={() => handleStartAssessment(name)} className="w-full p-4 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-colors">
                            <span className="font-bold text-slate-900">{name}</span>
                        </button>
                    ))}
                </div>
                <button onClick={() => setShowAssessmentSelector(false)} className="mt-6 w-full py-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Cancel</button>
            </div>
        </div>
      )}

      {/* ACTIVE ASSESSMENT MODAL */}
      {activeAssessment && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-black text-slate-900 mb-2">{activeAssessment}</h3>
                <p className="text-slate-500 font-medium mb-8">Complete the assessment below.</p>
                
                <div className="space-y-6">
                    {assessmentDefinitions[activeAssessment].questions.map(q => (
                        <div key={q.id} className="space-y-2">
                            <label className="text-sm font-bold text-slate-900">{q.label}</label>
                            <select 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={assessmentAnswers[q.id] || ''}
                                onChange={(e) => setAssessmentAnswers({...assessmentAnswers, [q.id]: e.target.value})}
                            >
                                <option value="">Select...</option>
                                {q.options.map((opt, idx) => (
                                    <option key={idx} value={idx}>{opt.label} (Score: {opt.score})</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={() => setActiveAssessment(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={handleSaveAssessmentResult} className="flex-1 py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">Complete Assessment</button>
                </div>
            </div>
        </div>
      )}

      {/* VIEW ASSESSMENT MODAL */}
      {viewingAssessment && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900">{viewingAssessment.name}</h3>
                        <p className="text-sm font-bold text-slate-500">Completed by {viewingAssessment.author} on {new Date(viewingAssessment.date).toLocaleDateString('en-GB')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Score</p>
                        <p className="text-xl font-black text-blue-600">{viewingAssessment.score}</p>
                    </div>
                </div>
                
                <div className="space-y-4 bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    {viewingAssessment.details ? viewingAssessment.details.map((detail, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-slate-200 last:border-0 pb-3 last:pb-0">
                            <p className="text-sm font-bold text-slate-700">{detail.question}</p>
                            <p className="text-sm font-medium text-slate-900 text-right">{detail.answer} <span className="text-slate-400 text-xs">({detail.score})</span></p>
                        </div>
                    )) : <p className="text-sm text-slate-500 italic">No detailed breakdown available for this record.</p>}
                </div>

                <button onClick={() => setViewingAssessment(null)} className="mt-8 w-full py-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Close</button>
            </div>
        </div>
      )}

      {/* HOVER VISIT MODAL - RENDERED AT ROOT LEVEL */}
      {hoveredVisit && hoveredVisitPosition && (
        <div 
            className="fixed w-72 bg-slate-800 text-white p-4 rounded-xl shadow-2xl transition-opacity pointer-events-none z-[210] animate-in fade-in-5"
            style={{
                top: `${hoveredVisitPosition.top}px`,
                left: `${hoveredVisitPosition.left}px`,
                transform: 'translate(-50%, -100%) translateY(-0.5rem)',
            }}
        >
            <h4 className="font-black text-sm mb-2 border-b border-slate-700 pb-2">{hoveredVisit.time} - {hoveredVisit.carer}</h4>
            <div className="space-y-3 text-xs max-h-48 overflow-y-auto">
                <div>
                    <p className="font-bold text-slate-400 uppercase text-[9px] tracking-widest">Notes</p>
                    <p className="font-medium text-slate-200 whitespace-pre-wrap">{hoveredVisit.note || 'No notes.'}</p>
                </div>
                <div>
                    <p className="font-bold text-slate-400 uppercase text-[9px] tracking-widest">Tasks</p>
                    {hoveredVisit.tasks && hoveredVisit.tasks.length > 0 ? (
                        <ul className="list-disc list-inside pl-1 space-y-1 mt-1">
                            {hoveredVisit.tasks.map((task, i) => <li key={i} className="font-medium text-slate-200">{task}</li>)}
                        </ul>
                    ) : (
                        <p className="font-medium text-slate-300 italic">No specific tasks.</p>
                    )}
                </div>
            </div>
            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-slate-800"></div>
        </div>
      )}

      {/* ADD NOTE MODAL */}
      {isAddingNote && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-in zoom-in-95">
                <h3 className="text-2xl font-black text-slate-900 mb-6">Add New Log</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Log Type</label>
                        <select 
                            value={newNote.category} 
                            onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                            className="w-full mt-1 bg-slate-50 border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="General">General Note</option>
                            <option value="Alert">Alert</option>
                            <option value="Incident">Incident</option>
                            <option value="Visit Log">Visit Log</option>
                            <option value="Action">Action Required</option>
                            <option value="Concern">Concern</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Content</label>
                        <textarea 
                            value={newNote.content} 
                            onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                            className="w-full mt-1 bg-slate-50 border-slate-200 rounded-xl p-3 font-medium text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20 min-h-[120px]"
                            placeholder="Enter log details..."
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input 
                            type="checkbox" 
                            id="cqcEvidence" 
                            checked={newNote.isCqc} 
                            onChange={(e) => setNewNote({...newNote, isCqc: e.target.checked})}
                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="cqcEvidence" className="text-sm font-bold text-slate-700">Mark as CQC Evidence</label>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={() => setIsAddingNote(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={handleAddNote} className="flex-1 py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">Save Log</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfileView; 