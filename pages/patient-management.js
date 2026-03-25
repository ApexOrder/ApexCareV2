import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Filter, Plus, Users, ChevronRight, User, X, LayoutDashboard, LogOut } from 'lucide-react';
import ClientProfileView from '../components/ClientProfileView';
import ThemeToggle from '../components/ThemeToggle';

export default function ServiceUserManagement() {
  const [serviceUsers, setServiceUsers] = useState([
    { 
      id: 1, 
      clientCode: '84920153',
      title: 'Mr',
      firstName: 'James',
      lastName: 'Miller',
      name: 'James H. Miller', // Kept for backward compatibility with list view
      preferredName: 'Jim',
      dob: '1954-03-12',
      gender: 'Male',
      pronouns: 'He/Him',
      address: '742 Evergreen Terrace, Springfield, IL 62704',
      phone: '(555) 019-2834',
      email: 'j.miller54@email.com',
      nhsNumber: '123 456 7890',
      pidNumber: 'LA-998877',
      area: 'North Springfield',
      auditStatus: 'Compliant',
      careLevel: 'High',
      pocType: 'Long Term',
      serviceStartDate: '2022-01-15',
      ageBand: '70-79',
      regulatedCare: 'Yes',
      languages: 'English',
      religion: 'Methodist',
      emergencyContact: { name: 'Sarah Miller', relation: 'Daughter', phone: '(555) 999-8888' },
      gp: {
        name: 'Dr. A. Smith',
        surgery: 'Springfield Medical Center',
        phone: '(555) 111-2222',
        address: '123 Medical Dr'
      },
      pharmacy: {
        name: 'Springfield Pharmacy',
        phone: '(555) 333-4444',
        address: '456 Main St'
      },
      powerOfAttorney: 'Sarah Miller (Health & Welfare)',
      condition: 'Chronic Obstructive Pulmonary Disease (COPD)',
      pmh: ['COPD', 'Hypertension', 'Hyperlipidemia', 'Appendectomy (1980)'],
      medications: [
        { name: 'Tiotropium (Spiriva)', dosage: '18mcg' },
        { name: 'Albuterol', dosage: '90mcg' },
        { name: 'Lisinopril', dosage: '10mg' }
      ],
      allergies: ['Sulfa Drugs', 'Latex'],
      mobility: {
        level: 'Uses walker',
        riskOfFalls: 'High'
      },
      nutrition: {
        dietaryType: 'Level 7 - Regular',
        preferences: 'Low salt diet. Soft food preferred. Fluids: Level 0 - Thin.',
        chokingRisk: false
      },
      legal: {
        dnacpr: true,
        respecStatus: 'In place',
        dnacprLocation: 'On file in office',
        respecLocation: 'On file in office'
      },
      environment: {
        accessCode: '4590',
        keySafeLocation: 'Side door',
        hazards: ['Stairs', 'Loose rugs'],
        lifeline: 'Yes, pendant worn at all times',
        pets: '1 Golden Retriever (Buddy)'
      },
      social: {
        lifeStory: `Hello my name is Jim, I live alone in a bungalow.

I have a private carer (family friend) called Sarah, she attends each morning and sometimes on the evening.

I have COPD and may need somethings explaining to me but otherwise I can make my own choices around my current care needs.

I have Osteoporosis and this has caused T7, T11 and L2 osteoporotic fractures. This causes me to be in a lot of pain and I struggle to get comfortable. I struggle to mobilise more in the morning then I do for the rest of the day.

I like to have a jug of juice and a glass next to my rise and recline chair in the lounge for through out the day.
I love a cup of tea or coffee on each visit (maybe even two..).

I would like my carers to provide meal support on each visit. I would like these at lunch time, served onto a plate and on the tray - I will eat this in the lounge in my chair.`,
        hobbies: ['Reading', 'Gardening', 'Classical Music']
      },
      preferences: {
        carerGender: 'Any',
        carerVibe: 'Professional/Quiet'
      },
      insuranceProvider: 'Medicare Part A & B',
      policyNumber: 'MC-987654321-A',
      status: 'Active',
      group: 'Floor 1',
      groups: ['Floor 1'],
      visits: [],
      nextOfKin: 'Sarah Miller (Daughter) - (555) 999-8888',
      careNotes: [],
      tasks: [],
      documents: [],
      editHistory: [],
      wellbeingScore: 85,
      nextReviewDate: '2024-06-01',
      arrivalNote: 'Key safe code: 4590. Side door.',
      bigThing: 'Risk of falls in morning.',
      medicationModuleActive: true,
      medicationStats: {
        lastOrdered: '15 Oct 2023',
        nextOrderDue: '12 Nov 2023',
        isDue: true
      }
    },
    {
      id: 2,
      clientCode: '92837461',
      title: 'Mrs',
      firstName: 'Eleanor',
      lastName: 'Rigby',
      name: 'Eleanor Rigby',
      preferredName: 'Ellie',
      dob: '1942-06-20',
      gender: 'Female',
      pronouns: 'She/Her',
      address: '123 Penny Lane, Liverpool, L18 1BW',
      phone: '(555) 867-5309',
      email: 'eleanor.rigby@email.com',
      nhsNumber: '987 654 3210',
      pidNumber: 'LA-112233',
      area: 'South Springfield',
      auditStatus: 'Pending Review',
      careLevel: 'Medium',
      pocType: 'Reablement',
      serviceStartDate: '2023-11-01',
      ageBand: '80-89',
      regulatedCare: 'Yes',
      languages: 'English',
      religion: 'None',
      emergencyContact: { name: 'Father McKenzie', relation: 'Friend', phone: '(555) 111-0000' },
      gp: {
        name: 'Dr. Robert',
        surgery: 'Liverpool Health Centre',
        phone: '(555) 222-3333',
        address: '456 Health St'
      },
      pharmacy: {
        name: 'Penny Lane Pharmacy',
        phone: '(555) 444-5555',
        address: '124 Penny Lane'
      },
      powerOfAttorney: 'Father McKenzie (Finance)',
      condition: 'Early-stage Dementia',
      pmh: ['Dementia', 'Arthritis', 'Glaucoma'],
      medications: [
        { name: 'Donepezil', dosage: '10mg' },
        { name: 'Paracetamol', dosage: '500mg' }
      ],
      allergies: ['Peanuts'],
      mobility: {
        level: 'Independent with stick',
        riskOfFalls: 'Medium'
      },
      nutrition: {
        dietaryType: 'Level 7 - Regular',
        preferences: 'Vegetarian. Likes sweet treats.',
        chokingRisk: false
      },
      legal: {
        dnacpr: false,
        respecStatus: 'Not in place',
        dnacprLocation: '',
        respecLocation: ''
      },
      environment: {
        accessCode: '1966',
        keySafeLocation: 'Front porch',
        hazards: ['Clutter'],
        lifeline: 'No',
        pets: 'None'
      },
      social: {
        lifeStory: 'Eleanor lived a quiet life working at the local church. She enjoys knitting and watching the world go by.',
        hobbies: ['Knitting', 'Church activities']
      },
      preferences: {
        carerGender: 'Female',
        carerVibe: 'Chatty/Friendly'
      },
      insuranceProvider: 'Private',
      policyNumber: 'PR-12345678',
      status: 'Active',
      group: 'Floor 2',
      groups: ['Floor 2'],
      visits: [],
      nextOfKin: 'Father McKenzie (Friend)',
      careNotes: [],
      tasks: [],
      documents: [],
      editHistory: [],
      wellbeingScore: 72,
      nextReviewDate: '2024-05-15',
      arrivalNote: 'Ring doorbell loudly.',
      bigThing: 'Can become anxious in evenings.',
      medicationModuleActive: true,
      medicationStats: {
        lastOrdered: '01 Nov 2023',
        nextOrderDue: '29 Nov 2023',
        isDue: false
      }
    },
    {
      id: 3,
      clientCode: '73629104',
      title: 'Mr',
      firstName: 'Arthur',
      lastName: 'Dent',
      name: 'Arthur Dent',
      preferredName: 'Art',
      dob: '1978-03-11',
      gender: 'Male',
      pronouns: 'He/Him',
      address: '155 Country Lane, Cottington, CT1 2XX',
      phone: '(555) 424-2424',
      email: 'arthur.dent@email.com',
      nhsNumber: '424 242 4242',
      pidNumber: 'LA-424242',
      area: 'West Springfield',
      auditStatus: 'Compliant',
      careLevel: 'Low',
      pocType: 'Intermediate Care',
      serviceStartDate: '2024-01-01',
      ageBand: '40-49',
      regulatedCare: 'No',
      languages: 'English',
      religion: 'Agnostic',
      emergencyContact: { name: 'Ford Prefect', relation: 'Friend', phone: '(555) 420-0000' },
      gp: {
        name: 'Dr. Adams',
        surgery: 'Galaxy Medical',
        phone: '(555) 999-9999',
        address: '42 Milky Way'
      },
      pharmacy: {
        name: 'Vogon Pharma',
        phone: '(555) 666-6666',
        address: 'Sector ZZ9'
      },
      powerOfAttorney: 'None',
      condition: 'General Anxiety & Mild Depression',
      pmh: ['Anxiety', 'Insomnia'],
      medications: [
        { name: 'Sertraline', dosage: '50mg' }
      ],
      allergies: ['None'],
      mobility: {
        level: 'Independent',
        riskOfFalls: 'Low'
      },
      nutrition: {
        dietaryType: 'Regular',
        preferences: 'Likes tea (a lot). Sandwiches.',
        chokingRisk: false
      },
      legal: {
        dnacpr: false,
        respecStatus: 'Not in place',
        dnacprLocation: '',
        respecLocation: ''
      },
      environment: {
        accessCode: '0042',
        keySafeLocation: 'Rear Garden',
        hazards: ['Bulldozers outside'],
        lifeline: 'No',
        pets: 'None'
      },
      social: {
        lifeStory: 'Arthur is a simple man who enjoys a quiet life. Recently had some property disputes.',
        hobbies: ['Reading', 'Travel', 'Tea drinking']
      },
      preferences: {
        carerGender: 'Any',
        carerVibe: 'Professional/Quiet'
      },
      insuranceProvider: 'None',
      policyNumber: '',
      status: 'Active',
      group: 'High Priority',
      groups: ['High Priority'],
      visits: [],
      nextOfKin: 'Ford Prefect (Friend)',
      careNotes: [],
      tasks: [],
      documents: [],
      editHistory: [],
      wellbeingScore: 60,
      nextReviewDate: '2024-07-01',
      arrivalNote: 'Don\'t mention the house demolition.',
      bigThing: 'Needs reassurance.',
      medicationModuleActive: true,
      medicationStats: {
        lastOrdered: '10 Jan 2024',
        nextOrderDue: '07 Feb 2024',
        isDue: false
      }
    }
  ]);
  const [availableGroups, setAvailableGroups] = useState(['Floor 1', 'Floor 2', 'High Priority']);
  const [areas] = useState([
    { id: 'north', name: 'North Springfield' },
    { id: 'south', name: 'South Springfield' }
  ]);
  const [staff] = useState([
    { id: '1', name: 'Sarah Jenkins' },
    { id: '2', name: 'Mike Ross' }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newServiceUser, setNewServiceUser] = useState({ 
    name: '', 
    preferredName: '',
    profileImage: null,
    dob: '', 
    pocType: '',
    gender: '', 
    pronouns: '',
    address: '', 
    phone: '', 
    email: '', 
    languages: '',
    religion: '',
    emergencyContact: { name: '', relation: '', phone: '' }, 
    gpName: '',
    gpContact: '',
    pharmacyName: '',
    pharmacyContact: '',
    accessInstructions: '',
    keySafeCode: '',
    dnacpr: '',
    powerOfAttorney: '',
    condition: '', 
    medicalHistory: '', 
    medications: '', 
    allergies: '', 
    mobilityNeeds: '',
    nutritionNeeds: '',
    personalCareNeeds: '',
    riskAssessment: '',
    lifeHistory: '',
    likes: '',
    dislikes: '',
    insuranceProvider: '', 
    policyNumber: '', 
    status: 'Active',
    group: '',
    groups: []
  });
  const [selectedServiceUser, setSelectedServiceUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const [addressParts, setAddressParts] = useState({
    houseNumber: '',
    street: '',
    town: '',
    county: '',
    postcode: ''
  });
  const [addressSearch, setAddressSearch] = useState('');
  // Address autocomplete state for new user form
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const ignoreSearch = useRef(false);
  const [pocTypeFilter, setPocTypeFilter] = useState('All');

  useEffect(() => {
    if (ignoreSearch.current) {
        ignoreSearch.current = false;
        return;
    }

    if (!addressSearch || addressSearch.length < 4) {
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
  }, [addressSearch]);

  const generateClientCode = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const getPocColor = (type) => {
    switch (type) {
      case 'Reablement': return '#10b981'; // Emerald
      case 'Long Term': return '#3b82f6'; // Blue
      case 'FastTrack/EOL': return '#f43f5e'; // Rose
      case 'Intermediate Care': return '#f59e0b'; // Amber
      default: return '#94a3b8'; // Slate
    }
  };

  const handleSelectAddress = (suggestion) => {
    ignoreSearch.current = true;
    const addr = suggestion.address;
    const newParts = {
        houseNumber: addr.house_number || addr.building || '',
        street: addr.road || addr.pedestrian || addr.street || '',
        town: addr.city || addr.town || addr.village || '',
        county: addr.county || addr.state_district || '',
        postcode: addr.postcode || ''
    };
    setAddressParts(newParts);
    
    const fullAddress = [newParts.houseNumber, newParts.street, newParts.town, newParts.county, newParts.postcode].filter(Boolean).join(', ');
    setNewServiceUser({ ...newServiceUser, address: fullAddress });
    setAddressSearch('');
    setShowAddressSuggestions(false);
  };

  const handleAddressPartChange = (field, value) => {
    const newParts = { ...addressParts, [field]: value };
    setAddressParts(newParts);
    const fullAddress = [newParts.houseNumber, newParts.street, newParts.town, newParts.county, newParts.postcode].filter(Boolean).join(', ');
    setNewServiceUser({ ...newServiceUser, address: fullAddress });
  };

  const handleFileChange = (e) => {
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
        setNewServiceUser({ ...newServiceUser, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddServiceUser = (e) => {
    e.preventDefault();
    setServiceUsers([...serviceUsers, { ...newServiceUser, id: Date.now(), clientCode: generateClientCode() }]);
    setNewServiceUser({ 
      name: '', 
      preferredName: '',
      profileImage: null,
      pocType: '',
      dob: '', 
      gender: '', 
      pronouns: '',
      address: '', 
      phone: '', 
      email: '', 
      languages: '',
      religion: '',
      emergencyContact: { name: '', relation: '', phone: '' }, 
      gpName: '',
      gpContact: '',
      pharmacyName: '',
      pharmacyContact: '',
      accessInstructions: '',
      keySafeCode: '',
      dnacpr: '',
      powerOfAttorney: '',
      condition: '', 
      medicalHistory: '', 
      medications: '', 
      allergies: '', 
      mobilityNeeds: '',
      nutritionNeeds: '',
      personalCareNeeds: '',
      riskAssessment: '',
      lifeHistory: '',
      likes: '',
      dislikes: '',
      insuranceProvider: '', 
      policyNumber: '', 
      status: 'Active',
      group: '',
      groups: []
    });
    setAddressParts({
        houseNumber: '',
        street: '',
        town: '',
        county: '',
        postcode: ''
    });
    setAddressSearch('');
    setShowForm(false);
  };

  const handleEditClick = () => {
    setEditForm({ ...selectedServiceUser, groups: selectedServiceUser.groups || [] });
    setIsEditing(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updatedServiceUsers = serviceUsers.map(p => p.id === editForm.id ? editForm : p);
    setServiceUsers(updatedServiceUsers);
    setSelectedServiceUser(editForm);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const handleGroupToggle = (group) => {
    const currentGroups = editForm.groups || [];
    if (currentGroups.includes(group)) {
      setEditForm({ ...editForm, groups: currentGroups.filter(g => g !== group) });
    } else {
      setEditForm({ ...editForm, groups: [...currentGroups, group] });
    }
  };

  if (selectedServiceUser) {
    return (
      <ClientProfileView 
        client={selectedServiceUser}
        areas={areas}
        availableGroups={availableGroups}
        onUpdateClient={(updatedClient) => {
          setServiceUsers(serviceUsers.map(p => p.id === updatedClient.id ? updatedClient : p));
          setSelectedServiceUser(updatedClient);
        }}
        onBack={() => setSelectedServiceUser(null)}
        userRole="admin"
        staff={staff}
      />
    );
  }

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

          {/* Profile Link */}
          <Link href="/profile" className="group/btn w-auto lg:w-full flex items-center lg:justify-start gap-2 lg:gap-4 px-4 lg:px-5 py-2 lg:py-3 text-sm font-bold rounded-2xl transition-all whitespace-nowrap overflow-hidden text-slate-500 dark:text-slate-400 border-b-4 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 active:scale-95">
            <span className="shrink-0 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-6 text-violet-500"><User size={20} /></span>
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
        <header className="mb-8">
          <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Service User Management</h1>
              <p className="text-sm font-bold text-slate-500 mt-1">Manage profiles, care plans, and service details.</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${showForm ? 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 border-b-4 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700' : 'bg-blue-600 text-white border-b-4 border-blue-800 dark:border-blue-900 hover:bg-blue-700'}`}
            >
              {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Service User</>}
            </button>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-[100rem] sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              
              <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative w-full sm:w-96">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Search size={16} />
                   </div>
                   <input 
                      type="text" 
                      placeholder="Search service users..." 
                      className="pl-10 w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-3 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400" 
                   />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500">
                    <Filter size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Filter:</span>
                  </div>
                  <select
                    id="pocFilter"
                    value={pocTypeFilter}
                    onChange={(e) => setPocTypeFilter(e.target.value)}
                    className="block w-full sm:w-auto rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs font-bold py-3 pl-3 pr-10 bg-white dark:bg-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="All">All Types</option>
                    <option value="Reablement">Reablement</option>
                    <option value="Long Term">Long Term</option>
                    <option value="FastTrack/EOL">FastTrack/EOL</option>
                    <option value="Intermediate Care">Intermediate Care</option>
                  </select>
                </div>
              </div>
              
              {showForm && (
                <div className="mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-[2.5rem] p-8 animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-xl font-black leading-6 text-slate-900 dark:text-white mb-6">Add New Service User</h3>
                  <form onSubmit={handleAddServiceUser} className="space-y-4">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      {/* Section: Personal Details */}
                      <div className="sm:col-span-6 border-b border-slate-100 pb-2 mb-2">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Personal Details</h4>
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="profileImage" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Profile Image</label>
                        <div className="mt-1 flex items-center gap-4">
                          {newServiceUser.profileImage && (
                            <img src={newServiceUser.profileImage} alt="Preview" className="h-12 w-12 rounded-full object-cover" />
                          )}
                          <input type="file" name="profileImage" id="profileImage" accept="image/jpeg, image/png"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-slate-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">JPG or PNG only. Max 2MB.</p>
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="name" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                        <input type="text" name="name" id="name" required
                          value={newServiceUser.name}
                          onChange={(e) => setNewServiceUser({...newServiceUser, name: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none" 
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="preferredName" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Preferred Name</label>
                        <input type="text" name="preferredName" id="preferredName"
                          value={newServiceUser.preferredName}
                          onChange={(e) => setNewServiceUser({...newServiceUser, preferredName: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none" 
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="dob" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Date of Birth</label>
                        <input type="date" name="dob" id="dob" required
                          value={newServiceUser.dob}
                          onChange={(e) => setNewServiceUser({...newServiceUser, dob: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="gender" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Gender</label>
                        <select id="gender" name="gender"
                          value={newServiceUser.gender}
                          onChange={(e) => setNewServiceUser({...newServiceUser, gender: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none bg-white dark:bg-slate-800"
                        >
                          <option value="">Select...</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="pronouns" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Pronouns</label>
                        <input type="text" name="pronouns" id="pronouns"
                          value={newServiceUser.pronouns}
                          onChange={(e) => setNewServiceUser({...newServiceUser, pronouns: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="languages" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Languages Spoken</label>
                        <input type="text" name="languages" id="languages"
                          value={newServiceUser.languages}
                          onChange={(e) => setNewServiceUser({...newServiceUser, languages: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="religion" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Religion/Spirituality</label>
                        <input type="text" name="religion" id="religion"
                          value={newServiceUser.religion}
                          onChange={(e) => setNewServiceUser({...newServiceUser, religion: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="status" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
                        <select id="status" name="status"
                          value={newServiceUser.status}
                          onChange={(e) => setNewServiceUser({...newServiceUser, status: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none bg-white dark:bg-slate-800"
                        >
                          <option>Active</option>
                          <option>Inactive</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="pocType" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">POC Type</label>
                        <select id="pocType" name="pocType"
                          value={newServiceUser.pocType}
                          onChange={(e) => setNewServiceUser({...newServiceUser, pocType: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none bg-white dark:bg-slate-800"
                        >
                          <option value="">Select...</option>
                          <option>Reablement</option>
                          <option>Long Term</option>
                          <option>FastTrack/EOL</option>
                          <option>Intermediate Care</option>
                        </select>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="group" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Group</label>
                        <select id="group" name="group"
                          value={newServiceUser.group}
                          onChange={(e) => setNewServiceUser({...newServiceUser, group: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none bg-white dark:bg-slate-800"
                        >
                          <option value="">Select a group...</option>
                          {availableGroups.map(group => (
                            <option key={group} value={group}>{group}</option>
                          ))}
                        </select>
                      </div>

                      {/* Section: Contact & Access */}
                      <div className="sm:col-span-6 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2 mt-4">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Contact & Access</h4>
                      </div>
                      <div className="sm:col-span-4 relative">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Search Address</label>
                        <input type="text"
                          value={addressSearch}
                          onChange={(e) => {
                            ignoreSearch.current = false;
                            setAddressSearch(e.target.value);
                          }}
                          onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none bg-slate-50 dark:bg-slate-800/50"
                        />
                        {showAddressSuggestions && addressSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto">
                                <ul>
                                    {addressSuggestions.map((address) => (
                                        <li 
                                            key={address.place_id}
                                            onMouseDown={() => handleSelectAddress(address)}
                                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-300"
                                        >
                                            {address.display_name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">House Name / Number</label>
                        <input type="text"
                          value={addressParts.houseNumber}
                          onChange={(e) => handleAddressPartChange('houseNumber', e.target.value)}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Street</label>
                        <input type="text"
                          value={addressParts.street}
                          onChange={(e) => handleAddressPartChange('street', e.target.value)}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Town / City</label>
                        <input type="text"
                          value={addressParts.town}
                          onChange={(e) => handleAddressPartChange('town', e.target.value)}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">County</label>
                        <input type="text"
                          value={addressParts.county}
                          onChange={(e) => handleAddressPartChange('county', e.target.value)}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Postcode</label>
                        <input type="text"
                          value={addressParts.postcode}
                          onChange={(e) => handleAddressPartChange('postcode', e.target.value)}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="phone" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone</label>
                        <input type="text" name="phone" id="phone"
                          value={newServiceUser.phone}
                          onChange={(e) => setNewServiceUser({...newServiceUser, phone: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="email" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</label>
                        <input type="email" name="email" id="email"
                          value={newServiceUser.email}
                          onChange={(e) => setNewServiceUser({...newServiceUser, email: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="keySafeCode" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Safe Code</label>
                        <input type="text" name="keySafeCode" id="keySafeCode"
                          value={newServiceUser.keySafeCode}
                          onChange={(e) => setNewServiceUser({...newServiceUser, keySafeCode: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="accessInstructions" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Instructions</label>
                        <input type="text" name="accessInstructions" id="accessInstructions"
                          value={newServiceUser.accessInstructions}
                          onChange={(e) => setNewServiceUser({...newServiceUser, accessInstructions: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      {/* Section: Care Circle & Legal */}
                      <div className="sm:col-span-6 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2 mt-4">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Care Circle & Legal</h4>
                      </div>
                      <div className="sm:col-span-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Primary Emergency Contact</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <input type="text" placeholder="Full Name" value={newServiceUser.emergencyContact.name} onChange={(e) => setNewServiceUser({...newServiceUser, emergencyContact: {...newServiceUser.emergencyContact, name: e.target.value}})} className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none" />
                            </div>
                            <div>
                                <input type="text" placeholder="Relationship" value={newServiceUser.emergencyContact.relation} onChange={(e) => setNewServiceUser({...newServiceUser, emergencyContact: {...newServiceUser.emergencyContact, relation: e.target.value}})} className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none" />
                            </div>
                            <div>
                                <input type="text" placeholder="Phone Number" value={newServiceUser.emergencyContact.phone} onChange={(e) => setNewServiceUser({...newServiceUser, emergencyContact: {...newServiceUser.emergencyContact, phone: e.target.value}})} className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none" />
                            </div>
                        </div>
                      </div>
                      <div className="sm:col-span-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Power of Attorney</label>
                        <input type="text" placeholder="Name & Type (e.g. Health/Welfare)" value={newServiceUser.powerOfAttorney} onChange={(e) => setNewServiceUser({...newServiceUser, powerOfAttorney: e.target.value})} className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="gpName" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">GP Name</label>
                        <input type="text" name="gpName" id="gpName"
                          value={newServiceUser.gpName}
                          onChange={(e) => setNewServiceUser({...newServiceUser, gpName: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="gpContact" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">GP Contact</label>
                        <input type="text" name="gpContact" id="gpContact"
                          value={newServiceUser.gpContact}
                          onChange={(e) => setNewServiceUser({...newServiceUser, gpContact: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="dnacpr" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">DNACPR Status</label>
                        <select id="dnacpr" name="dnacpr"
                          value={newServiceUser.dnacpr}
                          onChange={(e) => setNewServiceUser({...newServiceUser, dnacpr: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none bg-white dark:bg-slate-800"
                        >
                          <option value="">Unknown</option>
                          <option value="Yes - On file">Yes - On file</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div className="sm:col-span-3"> 
                        <label htmlFor="pharmacyName" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Pharmacy Name</label>
                        <input type="text" name="pharmacyName" id="pharmacyName"
                          value={newServiceUser.pharmacyName}
                          onChange={(e) => setNewServiceUser({...newServiceUser, pharmacyName: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="pharmacyContact" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Pharmacy Contact</label>
                        <input type="text" name="pharmacyContact" id="pharmacyContact"
                          value={newServiceUser.pharmacyContact}
                          onChange={(e) => setNewServiceUser({...newServiceUser, pharmacyContact: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      {/* Section: Medical & Care Needs */}
                      <div className="sm:col-span-6 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2 mt-4">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Medical & Care Needs</h4>
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="condition" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Condition</label>
                        <input type="text" name="condition" id="condition" required
                          value={newServiceUser.condition}
                          onChange={(e) => setNewServiceUser({...newServiceUser, condition: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none" 
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="medicalHistory" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Medical History</label>
                        <textarea rows={2} name="medicalHistory" id="medicalHistory"
                          value={newServiceUser.medicalHistory}
                          onChange={(e) => setNewServiceUser({...newServiceUser, medicalHistory: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 outline-none"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="riskAssessment" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Assessment Notes</label>
                        <textarea rows={2} name="riskAssessment" id="riskAssessment"
                          value={newServiceUser.riskAssessment}
                          onChange={(e) => setNewServiceUser({...newServiceUser, riskAssessment: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 outline-none"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="mobilityNeeds" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Mobility Needs</label>
                        <input type="text" name="mobilityNeeds" id="mobilityNeeds"
                          value={newServiceUser.mobilityNeeds}
                          onChange={(e) => setNewServiceUser({...newServiceUser, mobilityNeeds: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="nutritionNeeds" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Nutrition & Hydration Needs</label>
                        <input type="text" name="nutritionNeeds" id="nutritionNeeds"
                          value={newServiceUser.nutritionNeeds}
                          onChange={(e) => setNewServiceUser({...newServiceUser, nutritionNeeds: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="personalCareNeeds" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Personal Care Needs</label>
                        <input type="text" name="personalCareNeeds" id="personalCareNeeds"
                          value={newServiceUser.personalCareNeeds}
                          onChange={(e) => setNewServiceUser({...newServiceUser, personalCareNeeds: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      {/* Section: Person-Centered Care */}
                      <div className="sm:col-span-6 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2 mt-4">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Person-Centered Care</h4>
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="lifeHistory" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Life History / Bio</label>
                        <textarea rows={3} name="lifeHistory" id="lifeHistory"
                          value={newServiceUser.lifeHistory}
                          onChange={(e) => setNewServiceUser({...newServiceUser, lifeHistory: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-medium text-slate-700 outline-none" placeholder="Previous occupation, family details..."
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="likes" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Likes & Preferences</label>
                        <textarea rows={2} name="likes" id="likes"
                          value={newServiceUser.likes}
                          onChange={(e) => setNewServiceUser({...newServiceUser, likes: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-medium text-slate-700 outline-none"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="dislikes" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Dislikes & Fears</label>
                        <textarea rows={2} name="dislikes" id="dislikes"
                          value={newServiceUser.dislikes}
                          onChange={(e) => setNewServiceUser({...newServiceUser, dislikes: e.target.value})}
                          className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 font-medium text-slate-700 outline-none"
                        />
                      </div>

                      {/* Section: Groups */}
                      <div className="sm:col-span-6 border-b border-slate-100 pb-2 mb-2 mt-4">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Groups & Rota Allocation</h4>
                      </div>
                      <div className="sm:col-span-6">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Select groups for this user:</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {availableGroups.map(group => (
                            <button
                              key={group}
                              type="button"
                              onClick={() => {
                                  const currentGroups = newServiceUser.groups || [];
                                  if (currentGroups.includes(group)) {
                                      setNewServiceUser({ ...newServiceUser, groups: currentGroups.filter(g => g !== group) });
                                  } else {
                                      setNewServiceUser({ ...newServiceUser, groups: [...currentGroups, group] });
                                  }
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                newServiceUser.groups?.includes(group)
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {group} {newServiceUser.groups?.includes(group) && 'Ã¢ÂÂ'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="ml-3 inline-flex justify-center rounded-xl border-b-4 border-blue-800 dark:border-blue-900 bg-blue-600 py-3 px-6 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all active:scale-95">
                        Save Service User
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {serviceUsers.filter(user => pocTypeFilter === 'All' || user.pocType === pocTypeFilter).map((serviceUser) => (
                  <div 
                      key={serviceUser.id} 
                      onClick={() => { setSelectedServiceUser(serviceUser); setIsEditing(false); }}
                      className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md cursor-pointer overflow-hidden"
                      style={{ borderTop: `6px solid ${getPocColor(serviceUser.pocType)}` }}
                  >
                      {/* Card Content */}
                      <div className="p-6 flex-1">
                          <div className="flex items-start justify-between mb-4">
                              <div className="relative">
                                  {serviceUser.profileImage ? (
                                      <img src={serviceUser.profileImage} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                                  ) : (
                                      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                          <User size={32} />
                                      </div>
                                  )}
                                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${serviceUser.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${serviceUser.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                  {serviceUser.status}
                              </span>
                          </div>
                          
                          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 leading-tight group-hover:text-blue-600 transition-colors">
                              {serviceUser.firstName} {serviceUser.lastName}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">#{serviceUser.clientCode || serviceUser.id}</p>
                          <p className="text-sm font-medium text-slate-500 mb-4">{serviceUser.area || 'Area Not Assigned'}</p>
                          
                          <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                  <span className="text-slate-400 uppercase text-[9px] tracking-wider w-16">DOB</span>
                                  <span>{serviceUser.dob}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                  <span className="text-slate-400 uppercase text-[9px] tracking-wider w-16">Cond.</span>
                                  <span className="truncate">{serviceUser.condition || 'N/A'}</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{serviceUser.pocType || 'Standard'}</span>
                          <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all">
                              <ChevronRight size={16} />
                          </div>
                      </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}