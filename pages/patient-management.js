import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ClientProfileView from '../components/ClientProfileView';

export default function ServiceUserManagement() {
  const [serviceUsers, setServiceUsers] = useState([
    { 
      id: 1, 
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
      serviceStartDate: '2022-01-15',
      ageBand: '70-79',
      regulatedCare: 'Yes',
      languages: 'English',
      religion: 'Methodist',
      emergencyContact: 'Sarah Miller (Daughter) - (555) 999-8888',
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
        dnacpr: true
      },
      environment: {
        accessCode: '4590',
        keySafeLocation: 'Side door',
        hazards: ['Stairs', 'Loose rugs']
      },
      social: {
        lifeStory: 'Retired school teacher. Widowed in 2018. Enjoys reading history books.',
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
    dob: '', 
    gender: '', 
    pronouns: '',
    address: '', 
    phone: '', 
    email: '', 
    languages: '',
    religion: '',
    emergencyContact: '', 
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

  const handleAddServiceUser = (e) => {
    e.preventDefault();
    setServiceUsers([...serviceUsers, { ...newServiceUser, id: Date.now() }]);
    setNewServiceUser({ 
      name: '', 
      preferredName: '',
      dob: '', 
      gender: '', 
      pronouns: '',
      address: '', 
      phone: '', 
      email: '', 
      languages: '',
      religion: '',
      emergencyContact: '', 
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
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/dashboard" className="text-xl font-bold text-gray-900">ApexCare V2</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Service User Management</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {showForm ? 'Cancel' : 'Add Service User'}
            </button>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              
              {showForm && (
                <div className="mb-8 bg-white shadow sm:rounded-lg p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add New Service User</h3>
                  <form onSubmit={handleAddServiceUser} className="space-y-4">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      {/* Section: Personal Details */}
                      <div className="sm:col-span-6 border-b border-gray-200 pb-2 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">Personal Details</h4>
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" name="name" id="name" required
                          value={newServiceUser.name}
                          onChange={(e) => setNewServiceUser({...newServiceUser, name: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" 
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="preferredName" className="block text-sm font-medium text-gray-700">Preferred Name</label>
                        <input type="text" name="preferredName" id="preferredName"
                          value={newServiceUser.preferredName}
                          onChange={(e) => setNewServiceUser({...newServiceUser, preferredName: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" 
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input type="date" name="dob" id="dob" required
                          value={newServiceUser.dob}
                          onChange={(e) => setNewServiceUser({...newServiceUser, dob: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                        <select id="gender" name="gender"
                          value={newServiceUser.gender}
                          onChange={(e) => setNewServiceUser({...newServiceUser, gender: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        >
                          <option value="">Select...</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700">Pronouns</label>
                        <input type="text" name="pronouns" id="pronouns"
                          value={newServiceUser.pronouns}
                          onChange={(e) => setNewServiceUser({...newServiceUser, pronouns: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="languages" className="block text-sm font-medium text-gray-700">Languages Spoken</label>
                        <input type="text" name="languages" id="languages"
                          value={newServiceUser.languages}
                          onChange={(e) => setNewServiceUser({...newServiceUser, languages: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="religion" className="block text-sm font-medium text-gray-700">Religion/Spirituality</label>
                        <input type="text" name="religion" id="religion"
                          value={newServiceUser.religion}
                          onChange={(e) => setNewServiceUser({...newServiceUser, religion: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select id="status" name="status"
                          value={newServiceUser.status}
                          onChange={(e) => setNewServiceUser({...newServiceUser, status: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        >
                          <option>Active</option>
                          <option>Inactive</option>
                        </select>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="group" className="block text-sm font-medium text-gray-700">Group</label>
                        <select id="group" name="group"
                          value={newServiceUser.group}
                          onChange={(e) => setNewServiceUser({...newServiceUser, group: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        >
                          <option value="">Select a group...</option>
                          {availableGroups.map(group => (
                            <option key={group} value={group}>{group}</option>
                          ))}
                        </select>
                      </div>

                      {/* Section: Contact & Access */}
                      <div className="sm:col-span-6 border-b border-gray-200 pb-2 mb-2 mt-4">
                        <h4 className="text-lg font-medium text-gray-900">Contact & Access</h4>
                      </div>
                      <div className="sm:col-span-4 relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search Address</label>
                        <input type="text"
                          value={addressSearch}
                          onChange={(e) => {
                            ignoreSearch.current = false;
                            setAddressSearch(e.target.value);
                          }}
                          onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                        {showAddressSuggestions && addressSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                                <ul>
                                    {addressSuggestions.map((address) => (
                                        <li 
                                            key={address.place_id}
                                            onMouseDown={() => handleSelectAddress(address)}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                                        >
                                            {address.display_name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">House Name / Number</label>
                        <input type="text"
                          value={addressParts.houseNumber}
                          onChange={(e) => handleAddressPartChange('houseNumber', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-sm font-medium text-gray-700">Street</label>
                        <input type="text"
                          value={addressParts.street}
                          onChange={(e) => handleAddressPartChange('street', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Town / City</label>
                        <input type="text"
                          value={addressParts.town}
                          onChange={(e) => handleAddressPartChange('town', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">County</label>
                        <input type="text"
                          value={addressParts.county}
                          onChange={(e) => handleAddressPartChange('county', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Postcode</label>
                        <input type="text"
                          value={addressParts.postcode}
                          onChange={(e) => handleAddressPartChange('postcode', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                        <input type="text" name="phone" id="phone"
                          value={newServiceUser.phone}
                          onChange={(e) => setNewServiceUser({...newServiceUser, phone: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" id="email"
                          value={newServiceUser.email}
                          onChange={(e) => setNewServiceUser({...newServiceUser, email: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="keySafeCode" className="block text-sm font-medium text-gray-700">Key Safe Code</label>
                        <input type="text" name="keySafeCode" id="keySafeCode"
                          value={newServiceUser.keySafeCode}
                          onChange={(e) => setNewServiceUser({...newServiceUser, keySafeCode: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="accessInstructions" className="block text-sm font-medium text-gray-700">Access Instructions</label>
                        <input type="text" name="accessInstructions" id="accessInstructions"
                          value={newServiceUser.accessInstructions}
                          onChange={(e) => setNewServiceUser({...newServiceUser, accessInstructions: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>

                      {/* Section: Care Circle & Legal */}
                      <div className="sm:col-span-6 border-b border-gray-200 pb-2 mb-2 mt-4">
                        <h4 className="text-lg font-medium text-gray-900">Care Circle & Legal</h4>
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                        <input type="text" name="emergencyContact" id="emergencyContact"
                          value={newServiceUser.emergencyContact}
                          onChange={(e) => setNewServiceUser({...newServiceUser, emergencyContact: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="powerOfAttorney" className="block text-sm font-medium text-gray-700">Power of Attorney</label>
                        <input type="text" name="powerOfAttorney" id="powerOfAttorney"
                          value={newServiceUser.powerOfAttorney}
                          onChange={(e) => setNewServiceUser({...newServiceUser, powerOfAttorney: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="gpName" className="block text-sm font-medium text-gray-700">GP Name</label>
                        <input type="text" name="gpName" id="gpName"
                          value={newServiceUser.gpName}
                          onChange={(e) => setNewServiceUser({...newServiceUser, gpName: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="gpContact" className="block text-sm font-medium text-gray-700">GP Contact</label>
                        <input type="text" name="gpContact" id="gpContact"
                          value={newServiceUser.gpContact}
                          onChange={(e) => setNewServiceUser({...newServiceUser, gpContact: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="dnacpr" className="block text-sm font-medium text-gray-700">DNACPR Status</label>
                        <select id="dnacpr" name="dnacpr"
                          value={newServiceUser.dnacpr}
                          onChange={(e) => setNewServiceUser({...newServiceUser, dnacpr: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        >
                          <option value="">Unknown</option>
                          <option value="Yes - On file">Yes - On file</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="pharmacyName" className="block text-sm font-medium text-gray-700">Pharmacy Name</label>
                        <input type="text" name="pharmacyName" id="pharmacyName"
                          value={newServiceUser.pharmacyName}
                          onChange={(e) => setNewServiceUser({...newServiceUser, pharmacyName: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="pharmacyContact" className="block text-sm font-medium text-gray-700">Pharmacy Contact</label>
                        <input type="text" name="pharmacyContact" id="pharmacyContact"
                          value={newServiceUser.pharmacyContact}
                          onChange={(e) => setNewServiceUser({...newServiceUser, pharmacyContact: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>

                      {/* Section: Medical & Care Needs */}
                      <div className="sm:col-span-6 border-b border-gray-200 pb-2 mb-2 mt-4">
                        <h4 className="text-lg font-medium text-gray-900">Medical & Care Needs</h4>
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="condition" className="block text-sm font-medium text-gray-700">Primary Condition</label>
                        <input type="text" name="condition" id="condition" required
                          value={newServiceUser.condition}
                          onChange={(e) => setNewServiceUser({...newServiceUser, condition: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" 
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">Medical History</label>
                        <textarea rows={2} name="medicalHistory" id="medicalHistory"
                          value={newServiceUser.medicalHistory}
                          onChange={(e) => setNewServiceUser({...newServiceUser, medicalHistory: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="riskAssessment" className="block text-sm font-medium text-gray-700">Risk Assessment Notes</label>
                        <textarea rows={2} name="riskAssessment" id="riskAssessment"
                          value={newServiceUser.riskAssessment}
                          onChange={(e) => setNewServiceUser({...newServiceUser, riskAssessment: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="mobilityNeeds" className="block text-sm font-medium text-gray-700">Mobility Needs</label>
                        <input type="text" name="mobilityNeeds" id="mobilityNeeds"
                          value={newServiceUser.mobilityNeeds}
                          onChange={(e) => setNewServiceUser({...newServiceUser, mobilityNeeds: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="nutritionNeeds" className="block text-sm font-medium text-gray-700">Nutrition & Hydration Needs</label>
                        <input type="text" name="nutritionNeeds" id="nutritionNeeds"
                          value={newServiceUser.nutritionNeeds}
                          onChange={(e) => setNewServiceUser({...newServiceUser, nutritionNeeds: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="personalCareNeeds" className="block text-sm font-medium text-gray-700">Personal Care Needs</label>
                        <input type="text" name="personalCareNeeds" id="personalCareNeeds"
                          value={newServiceUser.personalCareNeeds}
                          onChange={(e) => setNewServiceUser({...newServiceUser, personalCareNeeds: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>

                      {/* Section: Person-Centered Care */}
                      <div className="sm:col-span-6 border-b border-gray-200 pb-2 mb-2 mt-4">
                        <h4 className="text-lg font-medium text-gray-900">Person-Centered Care</h4>
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="lifeHistory" className="block text-sm font-medium text-gray-700">Life History / Bio</label>
                        <textarea rows={3} name="lifeHistory" id="lifeHistory"
                          value={newServiceUser.lifeHistory}
                          onChange={(e) => setNewServiceUser({...newServiceUser, lifeHistory: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" placeholder="Previous occupation, family details..."
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="likes" className="block text-sm font-medium text-gray-700">Likes & Preferences</label>
                        <textarea rows={2} name="likes" id="likes"
                          value={newServiceUser.likes}
                          onChange={(e) => setNewServiceUser({...newServiceUser, likes: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="dislikes" className="block text-sm font-medium text-gray-700">Dislikes & Fears</label>
                        <textarea rows={2} name="dislikes" id="dislikes"
                          value={newServiceUser.dislikes}
                          onChange={(e) => setNewServiceUser({...newServiceUser, dislikes: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                      </div>

                      {/* Section: Groups */}
                      <div className="sm:col-span-6 border-b border-gray-200 pb-2 mb-2 mt-4">
                        <h4 className="text-lg font-medium text-gray-900">Groups & Rota Allocation</h4>
                      </div>
                      <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select groups for this user:</label>
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
                              {group} {newServiceUser.groups?.includes(group) && '✓'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        Save Service User
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                  {serviceUsers.map((serviceUser) => (
                    <li key={serviceUser.id} onClick={() => { setSelectedServiceUser(serviceUser); setIsEditing(false); }} className="block hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-blue-600 truncate">
                            {serviceUser.name}
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${serviceUser.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {serviceUser.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              DOB: {serviceUser.dob}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              Condition: {serviceUser.condition}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}