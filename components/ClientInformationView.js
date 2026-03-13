import React, { useState, useRef, useEffect } from 'react';

const ClientInformationView = ({ client, onUpdateClient, userRole, availableGroups, onDirtyStateChange }) => {
    // Editing States
    const [isEditingIdentity, setIsEditingIdentity] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [isEditingCare, setIsEditingCare] = useState(false);
    const [isEditingHome, setIsEditingHome] = useState(false);
    const [isEditingCarePlan, setIsEditingCarePlan] = useState(false);
    const [isEditingInfo, setIsEditingInfo] = useState(false); // Clinical Info

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

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
        smokingStatus: client.smokingStatus || 'Non-Smoker',
        group: client.group || '',
        alcoholConsumption: client.alcoholConsumption || 'None'
    });

    // Local state for editing address
    const [editAddress, setEditAddress] = useState({
        houseNumber: '',
        street: client.address || '',
        town: '',
        county: '',
        postcode: '',
        keySafeCode: client.keySafeCode || client.environment?.accessCode || '',
        propertyType: client.propertyType || 'House'
    });
    const [addressSearch, setAddressSearch] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
    const ignoreSearch = useRef(false);

    // Local state for detailed contact information
    const [editContacts, setEditContacts] = useState({
        phone: client.phone || '',
        email: client.email || '',
        contacts: client.contacts && client.contacts.length > 0 ? client.contacts : [
            { 
                name: client.nextOfKinName || client.nextOfKin || '', 
                relation: client.nextOfKinRelation || '', 
                phone: '', 
                address: '' 
            }
        ],
        gp: {
            name: client.gp?.name || '',
            surgery: client.gp?.surgery || '',
            address: client.gp?.address || '',
            phone: client.gp?.phone || ''
        },
        pharmacy: {
            name: client.pharmacy?.name || '',
            address: client.pharmacy?.address || '',
            phone: client.pharmacy?.phone || ''
        }
    });

    // Local state for editing care details
    const [editCare, setEditCare] = useState({
        emergencyContact: client.emergencyContact || '',
        secondaryContact: client.secondaryContact || '',
        nextOfKin: client.nextOfKin || '',
        powerOfAttorney: client.powerOfAttorney || '',
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
        districtNurse: client.districtNurse || '',
        socialWorker: client.socialWorker || '',
        carerGender: client.preferences?.carerGender || 'Any',
        carerVibe: client.preferences?.carerVibe || 'Professional/Quiet',
        communicationNeeds: client.communication?.needs || '',
        continenceDetails: client.continence?.details || '',
        cognitionSummary: client.cognition?.summary || '',
        vision: client.sensory?.vision || '',
        hearing: client.sensory?.hearing || '',
        oralCare: client.sensory?.oralCare || ''
    });

    // Local state for editing home environment
    const [editHome, setEditHome] = useState({
        equipment: client.environment?.equipment ? client.environment.equipment.join(', ') : '',
        pets: client.environment?.pets || '',
        lifeline: client.environment?.lifeline || '',
        binDay: client.environment?.binDay || '',
        fuseBoxLocation: client.environment?.fuseBoxLocation || '',
        stopcockLocation: client.environment?.stopcockLocation || '',
        parking: client.environment?.parking || '',
        spareKeyLocation: client.environment?.spareKeyLocation || '',
        entryInstructions: client.environment?.entryInstructions || ''
    });

    // Local state for editing care plan
    const [editCarePlan, setEditCarePlan] = useState({
        morning: client.carePlan?.morning || '',
        lunch: client.carePlan?.lunch || '',
        tea: client.carePlan?.tea || '',
        evening: client.carePlan?.evening || '',
        night: client.carePlan?.night || ''
    });

    // Local state for editing clinical info
    const [editInfo, setEditInfo] = useState({
        pmh: client.pmh ? client.pmh.join(', ') : '',
        lifeStory: client.social?.lifeStory || '',
        hobbies: client.social?.hobbies ? client.social.hobbies.join(', ') : '',
        likes: client.social?.likes || '',
        dislikes: client.social?.dislikes || '',
        importantToMe: client.social?.importantToMe || '',
        dailyRoutine: client.social?.dailyRoutine || ''
    });

    // Notify parent about dirty state
    useEffect(() => {
        const isDirty = isEditingInfo || isEditingIdentity || isEditingAddress || isEditingCare || isEditingHome || isEditingCarePlan;
        onDirtyStateChange?.(isDirty);
    }, [isEditingInfo, isEditingIdentity, isEditingAddress, isEditingCare, isEditingHome, isEditingCarePlan, onDirtyStateChange]);

    // Address Search Logic
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

    const mapAddress = isEditingAddress 
        ? [editAddress.houseNumber, editAddress.street, editAddress.town, editAddress.county, editAddress.postcode].filter(Boolean).join(', ') 
        : client.address;

    // --- UPDATE HANDLERS ---

    const handleUpdateIdentity = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Save Identity Records?',
            message: 'Are you sure you want to save changes to the Identity & Contact Records?',
            onConfirm: () => {
                const changes = [];
                // Logic to diff changes could go here
                onUpdateClient({
                    ...client,
                    ...editIdentity,
                    phone: editContacts.phone,
                    email: editContacts.email,
                    contacts: editContacts.contacts,
                    gp: { ...client.gp, ...editContacts.gp },
                    pharmacy: { ...client.pharmacy, ...editContacts.pharmacy },
                    editHistory: [{
                        id: `h-${Date.now()}`, date: new Date().toISOString(), author: 'Leon Lowden (Admin)', changes: ['Updated Identity Records']
                    }, ...(client.editHistory || [])]
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
                const newFullAddress = [editAddress.houseNumber, editAddress.street, editAddress.town, editAddress.county, editAddress.postcode].filter(Boolean).join(', ');
                onUpdateClient({ 
                    ...client, 
                    address: newFullAddress, 
                    propertyType: editAddress.propertyType,
                    keySafeCode: editAddress.keySafeCode,
                    environment: { ...client.environment, accessCode: editAddress.keySafeCode },
                    editHistory: [{
                        id: `h-${Date.now()}`, date: new Date().toISOString(), author: 'Leon Lowden (Admin)', changes: ['Updated Address & Access']
                    }, ...(client.editHistory || [])]
                });
                setIsEditingAddress(false);
            }
        });
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
                    secondaryContact: editCare.secondaryContact,
                    nextOfKin: editCare.nextOfKin,
                    powerOfAttorney: editCare.powerOfAttorney,
                    arrivalNote: editCare.arrivalNote,
                    bigThing: editCare.bigThing,
                    needsFluidMonitoring: editCare.needsFluidMonitoring,
                    allergies: editCare.allergies.split(',').map(s => s.trim()).filter(s => s !== ''),
                    mobility: { ...client.mobility, level: editCare.mobilityLevel },
                    nutrition: { ...client.nutrition, dietaryType: editCare.dietaryType, preferences: editCare.nutritionPreferences },
                    legal: { ...client.legal, dnacpr: editCare.dnacpr, respecStatus: editCare.respecStatus, dnacprLocation: editCare.dnacprLocation, respecLocation: editCare.respecLocation },
                    environment: { ...client.environment, accessCode: editCare.accessCode, keySafeLocation: editCare.keySafeLocation },
                    preferences: { ...client.preferences, carerGender: editCare.carerGender, carerVibe: editCare.carerVibe },
                    gp: { ...client.gp, ...editContacts.gp }, // Ensure GP updates are synced
                    districtNurse: editCare.districtNurse,
                    socialWorker: editCare.socialWorker,
                    communication: { ...client.communication, needs: editCare.communicationNeeds },
                    continence: { ...client.continence, details: editCare.continenceDetails },
                    cognition: { ...client.cognition, summary: editCare.cognitionSummary },
                    sensory: { 
                        vision: editCare.vision, 
                        hearing: editCare.hearing, 
                        oralCare: editCare.oralCare 
                    },
                    editHistory: [{
                        id: `h-${Date.now()}`, date: new Date().toISOString(), author: 'Leon Lowden (Admin)', changes: ['Updated Care & Safety Configuration']
                    }, ...(client.editHistory || [])]
                });
                setIsEditingCare(false);
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
                        stopcockLocation: editHome.stopcockLocation,
                        parking: editHome.parking,
                        spareKeyLocation: editHome.spareKeyLocation,
                        entryInstructions: editHome.entryInstructions
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
                    carePlan: { ...editCarePlan },
                    editHistory: [{
                        id: `h-${Date.now()}`, date: new Date().toISOString(), author: 'Leon Lowden (Admin)', changes: ['Updated Care Plan Routines']
                    }, ...(client.editHistory || [])]
                });
                setIsEditingCarePlan(false);
            }
        });
    };

    const handleUpdateClinicalInfo = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Save Clinical History?',
            message: 'Are you sure you want to save changes to the Clinical & Social History?',
            onConfirm: () => {
                onUpdateClient({
                    ...client,
                    pmh: editInfo.pmh.split(',').map(s => s.trim()).filter(s => s !== ''),
                    social: {
                        ...client.social,
                        lifeStory: editInfo.lifeStory,
                        hobbies: editInfo.hobbies.split(',').map(s => s.trim()).filter(s => s !== ''),
                        likes: editInfo.likes,
                        dislikes: editInfo.dislikes,
                        importantToMe: editInfo.importantToMe,
                        dailyRoutine: editInfo.dailyRoutine,
                    },
                    editHistory: [{
                        id: `h-${Date.now()}`, date: new Date().toISOString(), author: 'Leon Lowden (Admin)', changes: ['Updated Clinical & Social History']
                    }, ...(client.editHistory || [])]
                });
                setIsEditingInfo(false);
            }
        });
    };

    const handleAddContact = () => {
        setEditContacts(prev => ({
            ...prev,
            contacts: [...prev.contacts, { name: '', relation: '', phone: '', address: '' }]
        }));
    };

    const handleRemoveContact = (index) => {
        setEditContacts(prev => ({
            ...prev,
            contacts: prev.contacts.filter((_, i) => i !== index)
        }));
    };

    const identityGroups = [
        {
            title: 'Personal Details',
            icon: '👤',
            color: 'text-blue-600',
            bg: 'bg-blue-50/50',
            border: 'border-blue-100',
            fields: [
                { label: 'Title', key: 'title', type: 'select', options: ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Mx', 'Other'] },
                { label: 'First Name', key: 'firstName' },
                { label: 'Last Name', key: 'lastName' },
                { label: 'Preferred Name', key: 'preferredName' },
                { label: 'Date of Birth', key: 'dob', type: 'date' },
                { label: 'Gender', key: 'gender', type: 'select', options: ['Male', 'Female', 'Non-binary', 'Transgender', 'Intersex', 'Other', 'Prefer not to say'] },
                { label: 'Pronouns', key: 'pronouns', type: 'select', options: ['He/Him', 'She/Her', 'They/Them', 'Ze/Zir', 'Other'] },
                { label: 'Sexual Orientation', key: 'sexuality', type: 'select', options: ['Heterosexual', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Other', 'Prefer not to say'] },
            ]
        },
        {
            title: 'Cultural Context',
            icon: '🌍',
            color: 'text-amber-600',
            bg: 'bg-amber-50/50',
            border: 'border-amber-100',
            fields: [
                { label: 'Ethnicity', key: 'ethnicity', type: 'select', options: ['White British', 'White Irish', 'White Other', 'Black Caribbean', 'Black African', 'Black Other', 'Indian', 'Pakistani', 'Bangladeshi', 'Chinese', 'Asian Other', 'Mixed', 'Other', 'Prefer not to say'] },
                { label: 'Religion', key: 'religion', type: 'select', options: ['No Religion', 'Christian', 'Buddhist', 'Hindu', 'Jewish', 'Muslim', 'Sikh', 'Other', 'Prefer not to say'] },
                { label: 'Languages', key: 'languages', type: 'select', options: ['English', 'Spanish', 'French', 'German', 'Italian', 'Polish', 'Urdu', 'Bengali', 'Punjabi', 'Gujarati', 'Arabic', 'Other'] },
                { label: 'Smoking Status', key: 'smokingStatus', type: 'select', options: ['Non-Smoker', 'Smoker', 'E-Cigarette/Vape'] },
                { label: 'Alcohol Consumption', key: 'alcoholConsumption', type: 'select', options: ['None', 'Rarely', 'Socially', 'Regularly'] },
            ]
        },
        {
            title: 'Service & Governance',
            icon: '📋',
            color: 'text-purple-600',
            bg: 'bg-purple-50/50',
            border: 'border-purple-100',
            fields: [
                { label: 'NHS Number', key: 'nhsNumber' },
                { label: 'Local Authority ID', key: 'pidNumber' },
                { label: 'Service Start Date', key: 'serviceStartDate', type: 'date' },
                { label: 'Service Level', key: 'careLevel', type: 'select', options: ['Low', 'Medium', 'High', 'Critical', 'End of Life'] },
                { label: 'POC Type', key: 'pocType', type: 'select', options: ['Reablement', 'Long Term', 'FastTrack/EOL', 'Intermediate Care'] },
                { label: 'Area', key: 'area', type: 'select', options: ['North Springfield', 'South Springfield', 'East Springfield', 'West Springfield', 'Central'] },
                { label: 'Group', key: 'group', type: 'select', options: availableGroups },
                { label: 'Regulated Care', key: 'regulatedCare', type: 'select', options: ['Yes', 'No'] },
                { label: 'Audit Status', key: 'auditStatus', type: 'select', options: ['Compliant', 'Non-Compliant', 'Pending Review', 'Requires Improvement'] },
            ]
        }
    ];

    return (
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
                <div className="p-6 md:p-10 grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {identityGroups.slice(0, 1).map((group) => (
                        <div key={group.title} className={`rounded-3xl p-6 border ${group.border} ${group.bg} space-y-6`}>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{group.icon}</span>
                                <h4 className={`text-lg font-black uppercase tracking-tight ${group.color}`}>{group.title}</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {group.fields.map((item) => (
                                    <div key={item.key} className={item.width || ''}>
                                        <label className={`text-[9px] font-black uppercase tracking-widest ${group.color} opacity-70`}>{item.label}</label>
                                        {isEditingIdentity ? (
                                            item.type === 'select' ? (
                                                <select value={editIdentity[item.key]} onChange={(e) => setEditIdentity({...editIdentity, [item.key]: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs font-bold text-slate-900 p-2.5 bg-white">
                                                    <option value="">Not Assigned</option>
                                                    {item.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            ) : (
                                                <input 
                                                    type={item.type || 'text'}
                                                    value={editIdentity[item.key]}
                                                    onChange={(e) => setEditIdentity({...editIdentity, [item.key]: e.target.value})}
                                                    className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs font-bold text-slate-900 p-2.5"
                                                />
                                            )
                                        ) : (
                                            <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{(item.getValue ? item.getValue(client) : client[item.key]) || '—'}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Custom Contact Information Card - Moved here */}
                    <div className="rounded-3xl p-6 border border-emerald-100 bg-emerald-50/50 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">📞</span>
                            <h4 className="text-lg font-black uppercase tracking-tight text-emerald-600">Contact Information</h4>
                        </div>
                        <div className="space-y-6">
                            {/* Primary Client Contact */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-emerald-600 opacity-70">Phone Number</label>
                                    {isEditingIdentity ? (
                                        <input type="text" value={editContacts.phone} onChange={(e) => setEditContacts({...editContacts, phone: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-xs font-bold text-slate-900 p-2.5" />
                                    ) : (
                                        <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{client.phone || '—'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-emerald-600 opacity-70">Email Address</label>
                                    {isEditingIdentity ? (
                                        <input type="email" value={editContacts.email} onChange={(e) => setEditContacts({...editContacts, email: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-xs font-bold text-slate-900 p-2.5" />
                                    ) : (
                                        <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{client.email || '—'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="h-px bg-emerald-200/50"></div>

                            {/* Multiple Contacts Loop */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Next of Kin / Contacts</label>
                                    {isEditingIdentity && (
                                        <button onClick={handleAddContact} className="text-[10px] font-bold text-emerald-600 bg-white border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors">+ Add</button>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    {(isEditingIdentity ? editContacts.contacts : (client.contacts && client.contacts.length > 0 ? client.contacts : [{ name: client.nextOfKin || '—', relation: client.nextOfKinRelation || '', phone: '', address: '' }])).map((contact, idx) => (
                                        <div key={idx} className="bg-white/50 rounded-xl p-3 border border-emerald-100 relative group">
                                            {isEditingIdentity && idx > 0 && (
                                                <button onClick={() => handleRemoveContact(idx)} className="absolute top-2 right-2 text-rose-400 hover:text-rose-600">✕</button>
                                            )}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[8px] font-bold text-emerald-500 uppercase">Name</label>
                                                    {isEditingIdentity ? (
                                                        <input type="text" value={contact.name} onChange={(e) => { const newContacts = [...editContacts.contacts]; newContacts[idx].name = e.target.value; setEditContacts({...editContacts, contacts: newContacts}); }} className="w-full mt-0.5 rounded-lg border-slate-200 text-xs font-bold p-1.5" placeholder="Name" />
                                                    ) : <p className="text-xs font-bold text-slate-900">{contact.name}</p>}
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-bold text-emerald-500 uppercase">Relationship</label>
                                                    {isEditingIdentity ? (
                                                        <select value={contact.relation} onChange={(e) => { const newContacts = [...editContacts.contacts]; newContacts[idx].relation = e.target.value; setEditContacts({...editContacts, contacts: newContacts}); }} className="w-full mt-0.5 rounded-lg border-slate-200 text-xs font-bold p-1.5 bg-white">
                                                            <option value="">Select...</option>
                                                            {['Family', 'Wife', 'Husband', 'Son', 'Daughter', 'Brother', 'Sister', 'Partner', 'Friend', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    ) : <p className="text-xs font-bold text-slate-900">{contact.relation}</p>}
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-bold text-emerald-500 uppercase">Phone Number</label>
                                                    {isEditingIdentity ? (
                                                        <input type="text" value={contact.phone} onChange={(e) => { const newContacts = [...editContacts.contacts]; newContacts[idx].phone = e.target.value; setEditContacts({...editContacts, contacts: newContacts}); }} className="w-full mt-0.5 rounded-lg border-slate-200 text-xs font-bold p-1.5" placeholder="Number" />
                                                    ) : <p className="text-xs font-bold text-slate-900">{contact.phone || '—'}</p>}
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-bold text-emerald-500 uppercase">Address</label>
                                                    {isEditingIdentity ? (
                                                        <input type="text" value={contact.address} onChange={(e) => { const newContacts = [...editContacts.contacts]; newContacts[idx].address = e.target.value; setEditContacts({...editContacts, contacts: newContacts}); }} className="w-full mt-0.5 rounded-lg border-slate-200 text-xs font-bold p-1.5" placeholder="Address" />
                                                    ) : <p className="text-xs font-bold text-slate-900 truncate">{contact.address || '—'}</p>}
                                    {contact.address && !isEditingIdentity && (
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase text-blue-600 hover:underline block mt-1">
                                            Open Map ↗
                                        </a>
                                    )}
                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-emerald-200/50"></div>

                            {/* GP & Pharmacy */}
                            <div className="grid grid-cols-1 gap-4">
                                {[{ label: 'GP', key: 'gp' }, { label: 'Pharmacy', key: 'pharmacy' }].map(provider => (
                                    <div key={provider.key} className="bg-white/50 rounded-xl p-3 border border-emerald-100">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">{provider.label}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {['Name', 'Address', 'Phone'].map(field => (
                                                <div key={field} className={field === 'Address' ? 'sm:col-span-2' : ''}>
                                                    <label className="text-[8px] font-bold text-emerald-500 uppercase">{field}</label>
                                                    {isEditingIdentity ? (
                                                        <input 
                                                            type="text" 
                                                            value={editContacts[provider.key][field.toLowerCase()] || ''} 
                                                            onChange={(e) => setEditContacts({...editContacts, [provider.key]: { ...editContacts[provider.key], [field.toLowerCase()]: e.target.value }})} 
                                                            className="w-full mt-0.5 rounded-lg border-slate-200 text-xs font-bold p-1.5" 
                                                            placeholder={field} 
                                                        />
                                                    ) : (
                                                        <p className="text-xs font-bold text-slate-900">{client[provider.key]?.[field.toLowerCase()] || (field === 'Name' ? client[provider.key]?.name : '') || '—'}</p>
                                                    )}
                                                    {field === 'Address' && !isEditingIdentity && client[provider.key]?.address && (
                                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client[provider.key]?.address)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase text-blue-600 hover:underline block mt-1">
                                                            Open Map ↗
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {identityGroups.slice(1).map((group) => (
                        <div key={group.title} className={`rounded-3xl p-6 border ${group.border} ${group.bg} space-y-6`}>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{group.icon}</span>
                                <h4 className={`text-lg font-black uppercase tracking-tight ${group.color}`}>{group.title}</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {group.fields.map((item) => (
                                    <div key={item.key} className={item.width || ''}>
                                        <label className={`text-[9px] font-black uppercase tracking-widest ${group.color} opacity-70`}>{item.label}</label>
                                        {isEditingIdentity ? (
                                            item.type === 'select' ? (
                                                <select value={editIdentity[item.key]} onChange={(e) => setEditIdentity({...editIdentity, [item.key]: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs font-bold text-slate-900 p-2.5 bg-white">
                                                    <option value="">Not Assigned</option>
                                                    {item.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            ) : (
                                                <input 
                                                    type={item.type || 'text'}
                                                    value={editIdentity[item.key]}
                                                    onChange={(e) => setEditIdentity({...editIdentity, [item.key]: e.target.value})}
                                                    className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs font-bold text-slate-900 p-2.5"
                                                />
                                            )
                                        ) : (
                                            <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{(item.getValue ? item.getValue(client) : client[item.key]) || '—'}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
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
                                            <input type="text" className="w-full mt-1 bg-white border-slate-300 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20" value={editAddress.houseNumber} onChange={(e) => setEditAddress({...editAddress, houseNumber: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Street</label>
                                            <input type="text" className="w-full mt-1 bg-white border-slate-300 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20" value={editAddress.street} onChange={(e) => setEditAddress({...editAddress, street: e.target.value})} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Town / City</label>
                                                <input type="text" className="w-full mt-1 bg-white border-slate-300 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20" value={editAddress.town} onChange={(e) => setEditAddress({...editAddress, town: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">County</label>
                                                <input type="text" className="w-full mt-1 bg-white border-slate-300 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20" value={editAddress.county} onChange={(e) => setEditAddress({...editAddress, county: e.target.value})} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Postcode</label>
                                            <input type="text" className="w-full mt-1 bg-white border-slate-300 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20" value={editAddress.postcode} onChange={(e) => setEditAddress({...editAddress, postcode: e.target.value})} />
                                        </div>
                                        <div className="pt-4 border-t border-slate-100">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Safe Code</label>
                                            <input type="text" className="w-full mt-1 bg-white border-slate-300 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20" value={editAddress.keySafeCode} onChange={(e) => setEditAddress({...editAddress, keySafeCode: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Property Type</label>
                                            <select value={editAddress.propertyType} onChange={(e) => setEditAddress({...editAddress, propertyType: e.target.value})} className="w-full mt-1 bg-white border-slate-300 rounded-xl p-3 font-bold text-slate-900 outline-none border focus:ring-2 focus:ring-blue-500/20">
                                                <option value="House">House</option>
                                                <option value="Flat">Flat</option>
                                                <option value="Bungalow">Bungalow</option>
                                                <option value="Care Housing">Care Housing</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Address</label>
                                        {client.address && (
                                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase text-blue-600 hover:underline">
                                                Open Map ↗
                                            </a>
                                        )}
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-900 font-bold text-lg leading-relaxed">{client.address || 'No address recorded.'}</div>
                                    <div className="mt-6">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Safe Code</label>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-bold text-lg mt-1">{client.keySafeCode || client.environment?.accessCode || 'Not Recorded'}</div>
                                    </div>
                                    <div className="mt-6">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Property Type</label>
                                        <div className="text-sm font-bold text-slate-700 mt-1">{client.propertyType || 'Not Recorded'}</div>
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
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Emergency Contact</label>
                        {isEditingCare ? (
                            <input type="text" value={editCare.emergencyContact} onChange={(e) => setEditCare({...editCare, emergencyContact: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900" />
                        ) : (
                            <p className="text-sm font-bold text-slate-900 mt-1">{editCare.emergencyContact || 'Not Recorded'}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secondary Emergency Contact</label>
                        {isEditingCare ? (
                            <input type="text" value={editCare.secondaryContact} onChange={(e) => setEditCare({...editCare, secondaryContact: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900" placeholder="Name, Relation & Phone" />
                        ) : (
                            <p className="text-sm font-bold text-slate-900 mt-1">{editCare.secondaryContact || 'Not Recorded'}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Power of Attorney</label>
                        {isEditingCare ? (
                            <input type="text" value={editCare.powerOfAttorney} onChange={(e) => setEditCare({...editCare, powerOfAttorney: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900" placeholder="Name & Type (e.g. Health/Welfare)" />
                        ) : (
                            <p className="text-sm font-bold text-slate-900 mt-1">{editCare.powerOfAttorney || 'Not Recorded'}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">DNACPR Status</label>
                        {isEditingCare ? (
                            <div className="mt-1 flex gap-4">
                                <label className="flex items-center"><input type="radio" checked={editCare.dnacpr === true} onChange={() => setEditCare({...editCare, dnacpr: true})} className="mr-2" /> In Place</label>
                                <label className="flex items-center"><input type="radio" checked={editCare.dnacpr === false} onChange={() => setEditCare({...editCare, dnacpr: false})} className="mr-2" /> Not in place</label>
                            </div>
                        ) : (
                            <div className="mt-1 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${editCare.dnacpr ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                                <p className="text-sm font-bold text-slate-900">{editCare.dnacpr ? 'DNACPR In Place' : 'Attempt Resuscitation'}</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ReSPECT Form</label>
                        {isEditingCare ? (
                            <select value={editCare.respecStatus} onChange={(e) => setEditCare({...editCare, respecStatus: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900">
                                <option value="Not in place">Not in place</option>
                                <option value="In place">In place</option>
                                <option value="Pending">Pending</option>
                            </select>
                        ) : (
                            <p className="text-sm font-bold text-slate-900 mt-1">{editCare.respecStatus}</p>
                        )}
                    </div>

                    {/* Professional Contacts */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">District Nurse</label>
                        {isEditingCare ? (
                            <input type="text" value={editCare.districtNurse} onChange={(e) => setEditCare({...editCare, districtNurse: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900" placeholder="Name & Phone" />
                        ) : (
                            <p className="text-sm font-bold text-slate-900 mt-1">{editCare.districtNurse || 'Not Recorded'}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Social Worker</label>
                        {isEditingCare ? (
                            <input type="text" value={editCare.socialWorker} onChange={(e) => setEditCare({...editCare, socialWorker: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900" placeholder="Name & Phone" />
                        ) : (
                            <p className="text-sm font-bold text-slate-900 mt-1">{editCare.socialWorker || 'Not Recorded'}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Communication Needs</label>
                        {isEditingCare ? (
                            <textarea value={editCare.communicationNeeds} onChange={(e) => setEditCare({...editCare, communicationNeeds: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-medium text-slate-700 min-h-[80px]" placeholder="e.g. Hard of hearing, uses communication board..." />
                        ) : (
                            <p className="text-sm font-medium text-slate-700 mt-2">{editCare.communicationNeeds || 'No specific communication needs recorded.'}</p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Continence Details</label>
                        {isEditingCare ? (
                            <textarea value={editCare.continenceDetails} onChange={(e) => setEditCare({...editCare, continenceDetails: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-medium text-slate-700 min-h-[80px]" placeholder="e.g. Incontinent of urine, uses size M pads..." />
                        ) : (
                            <p className="text-sm font-medium text-slate-700 mt-2">{editCare.continenceDetails || 'No continence details recorded.'}</p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cognition / Mental State</label>
                        {isEditingCare ? (
                            <textarea value={editCare.cognitionSummary} onChange={(e) => setEditCare({...editCare, cognitionSummary: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-medium text-slate-700 min-h-[80px]" placeholder="e.g. Diagnosed with dementia, can get confused in the evenings..." />
                        ) : (
                            <p className="text-sm font-medium text-slate-700 mt-2">{editCare.cognitionSummary || 'No cognitive summary recorded.'}</p>
                        )}
                    </div>

                    <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Sensory & Physical Needs</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Vision</label>
                                {isEditingCare ? (
                                    <textarea rows={2} value={editCare.vision} onChange={(e) => setEditCare({...editCare, vision: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs font-medium border p-3" placeholder="e.g. Wears glasses for reading" />
                                ) : (
                                    <p className="text-sm font-medium text-slate-900 mt-1">{editCare.vision || 'No issues recorded'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Hearing</label>
                                {isEditingCare ? (
                                    <textarea rows={2} value={editCare.hearing} onChange={(e) => setEditCare({...editCare, hearing: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs font-medium border p-3" placeholder="e.g. Left hearing aid" />
                                ) : (
                                    <p className="text-sm font-medium text-slate-900 mt-1">{editCare.hearing || 'No issues recorded'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Oral Care</label>
                                {isEditingCare ? (
                                    <textarea rows={2} value={editCare.oralCare} onChange={(e) => setEditCare({...editCare, oralCare: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs font-medium border p-3" placeholder="e.g. Upper dentures" />
                                ) : (
                                    <p className="text-sm font-medium text-slate-900 mt-1">{editCare.oralCare || 'Natural teeth'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Home Environment */}
            <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden" style={{ borderTop: '6px solid #14b8a6' }}>
                <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Home Environment</h3>
                    {userRole === 'admin' && (!isEditingHome ? (
                        <button onClick={() => setIsEditingHome(true)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-xl hover:bg-slate-50 transition-colors">Edit Home Details</button>
                    ) : (
                        <div className="flex gap-3">
                            <button onClick={() => setIsEditingHome(false)} className="px-6 py-3 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
                            <button onClick={handleUpdateHome} className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-emerald-200">Save Changes</button>
                        </div>
                    ))}
                </div>
                <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { label: 'Care Equipment', key: 'equipment', placeholder: 'e.g. Hoist, Hospital Bed' },
                        { label: 'Pets', key: 'pets', placeholder: 'e.g. 1 cat (Tiddles)' },
                        { label: 'Lifeline / Alarm', key: 'lifeline', placeholder: 'e.g. Yes, pendant worn' },
                        { label: 'Bin Collection Day', key: 'binDay', placeholder: 'e.g. Tuesday morning' },
                        { label: 'Fuse Box Location', key: 'fuseBoxLocation', placeholder: 'e.g. Under the stairs' },
                        { label: 'Water Stopcock Location', key: 'stopcockLocation', placeholder: 'e.g. Under kitchen sink' },
                        { label: 'Parking Instructions', key: 'parking', placeholder: 'e.g. Driveway available or permit #123' },
                        { label: 'Spare Key Location', key: 'spareKeyLocation', placeholder: 'e.g. With neighbour at No. 4' },
                        { label: 'Door Entry Instructions', key: 'entryInstructions', placeholder: 'e.g. Ring bell twice' }
                    ].map(item => (
                        <div key={item.key}>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</label>
                            {isEditingHome ? (
                                <input 
                                    type="text" 
                                    value={editHome[item.key]} 
                                    onChange={(e) => setEditHome({...editHome, [item.key]: e.target.value})} 
                                    className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900" 
                                    placeholder={item.placeholder}
                                />
                            ) : (
                                <p className="text-sm font-bold text-slate-900 mt-1">{editHome[item.key] || 'Not Recorded'}</p>
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
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hobbies & Interests</label>
                            {isEditingInfo ? (
                                <input type="text" className="w-full bg-white border-slate-300 rounded-2xl p-4 font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none border" value={editInfo.hobbies} onChange={(e) => setEditInfo({...editInfo, hobbies: e.target.value})} placeholder="e.g. Reading, Knitting" />
                            ) : (
                                <div className="flex flex-wrap gap-2">{client.social?.hobbies && client.social.hobbies.length > 0 ? client.social.hobbies.map(h => <span key={h} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">{h}</span>) : <span className="text-sm font-bold text-slate-400">Not Recorded</span>}</div>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Likes</label>
                            {isEditingInfo ? (
                                <textarea className="w-full bg-white border-slate-300 rounded-2xl p-4 font-medium text-slate-700 h-24 focus:ring-2 focus:ring-blue-500/20 outline-none border" value={editInfo.likes} onChange={(e) => setEditInfo({...editInfo, likes: e.target.value})} placeholder="e.g. Cup of tea on arrival, classical music..." />
                            ) : (
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 font-medium leading-relaxed">{editInfo.likes || 'Not recorded.'}</div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dislikes</label>
                            {isEditingInfo ? (
                                <textarea className="w-full bg-white border-slate-300 rounded-2xl p-4 font-medium text-slate-700 h-24 focus:ring-2 focus:ring-blue-500/20 outline-none border" value={editInfo.dislikes} onChange={(e) => setEditInfo({...editInfo, dislikes: e.target.value})} placeholder="e.g. Loud noises, being rushed..." />
                            ) : (
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 font-medium leading-relaxed">{editInfo.dislikes || 'Not recorded.'}</div>
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
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">"What's Important to Me"</label>
                        {isEditingInfo ? (
                            <textarea className="w-full bg-white border-slate-300 rounded-2xl p-4 font-medium text-slate-700 h-32 focus:ring-2 focus:ring-blue-500/20 outline-none leading-relaxed border" value={editInfo.importantToMe} onChange={(e) => setEditInfo({...editInfo, importantToMe: e.target.value})} placeholder="e.g. Seeing my grandchildren, being able to sit in the garden..." />
                        ) : (
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 font-medium leading-relaxed italic">"{editInfo.importantToMe || 'Not recorded.'}"</div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Typical Daily Routine</label>
                        {isEditingInfo ? (
                            <textarea className="w-full bg-white border-slate-300 rounded-2xl p-4 font-medium text-slate-700 h-32 focus:ring-2 focus:ring-blue-500/20 outline-none leading-relaxed border" value={editInfo.dailyRoutine} onChange={(e) => setEditInfo({...editInfo, dailyRoutine: e.target.value})} placeholder="e.g. Wakes at 8am, breakfast at 9am..." />
                        ) : (
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 font-medium leading-relaxed">{editInfo.dailyRoutine || 'No routine recorded.'}</div>
                        )}
                    </div>
                </div>
            </section>

            {/* CONFIRMATION MODAL - Local to this component */}
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
        </div>
    );
};

export default ClientInformationView;
