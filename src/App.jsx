import React, { useState, useEffect } from 'react';
import { auth, db, storage } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth'; 
import { doc, getDoc, collection, addDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 

// Professional icons from react-icons
import { 
  FiUser, FiPhone, FiMail, FiMapPin, FiClock, FiInfo, 
  FiCompass, FiArrowLeft, FiBox, FiShoppingCart, 
  FiSun, FiActivity, FiStar, FiMap, FiBriefcase, 
  FiShoppingBag, FiClipboard 
} from 'react-icons/fi';

import Auth from './components/Auth'; 
import ProduceCard from './components/ProduceCard';
import ProduceModal from './components/ProduceModal';
import AddProduceModal from './components/AddProduceModal';
import AddRequirementModal from './components/AddRequirementModal';
import AnalyticsPanel from './components/AnalyticsPanel';

// AI & Utility Tools
import WeatherForecast from './components/WeatherForecast';
import DiseaseDiagnosis from './components/DiseaseDiagnosis';
import CropRecommendations from './components/CropRecommendations';
import SoilTestLabs from './components/SoilTestLabs';
import GovernmentSchemes from './components/GovernmentSchemes';

// --- Tab Configurations (Now using react-icons) ---
const FARMER_DASHBOARD_TABS = [
  { id: 'listings', label: 'My Listings', icon: <FiBox className="text-lg" /> },
  { id: 'demands', label: 'Buyer Demands', icon: <FiShoppingCart className="text-lg" /> }
];

const EXPLORE_TABS = [
  { id: 'weather', label: 'Weather', icon: <FiSun className="text-lg" /> },
  { id: 'diagnosis', label: 'Plant Health', icon: <FiActivity className="text-lg" /> },
  { id: 'crops', label: 'Crop Advice', icon: <FiStar className="text-lg" /> },
  { id: 'soil', label: 'Soil Labs', icon: <FiMap className="text-lg" /> },
  { id: 'schemes', label: 'Govt Schemes', icon: <FiBriefcase className="text-lg" /> }
];

const BUYER_TABS = [
  { id: 'marketplace', label: 'Marketplace', icon: <FiShoppingBag className="text-lg" /> },
  { id: 'requirements', label: 'My Requirements', icon: <FiClipboard className="text-lg" /> }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [userProfile, setUserProfile] = useState(null); 
  const [isAuthLoading, setIsAuthLoading] = useState(true); 

  const [produces, setProduces] = useState([]); 
  const [requirements, setRequirements] = useState([]); 
  
  const [selectedProduce, setSelectedProduce] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [produceToEdit, setProduceToEdit] = useState(null);

  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [requirementToEdit, setRequirementToEdit] = useState(null);

  // Navigation States
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'explore'
  const [activeFarmerTab, setActiveFarmerTab] = useState('listings');
  const [activeExploreTab, setActiveExploreTab] = useState('weather');
  const [activeBuyerTab, setActiveBuyerTab] = useState('marketplace');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
            setUserProfile(userDoc.data()); 
          } else {
            setUserRole('buyer'); 
          }
        } catch (error) {
          setUserRole('buyer'); 
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserProfile(null);
        setProduces([]); 
        setRequirements([]);
      }
      setIsAuthLoading(false); 
    });
    return () => unsubscribe(); 
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const produceQ = query(collection(db, 'produces'), orderBy('createdAt', 'desc'));
        const produceSnap = await getDocs(produceQ);
        setProduces(produceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const reqQ = query(collection(db, 'requirements'), orderBy('createdAt', 'desc'));
        const reqSnap = await getDocs(reqQ);
        setRequirements(reqSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (currentUser) fetchData();
  }, [currentUser]);

  const handleLogout = () => signOut(auth);

  // --- PRODUCE LOGIC ---
  const handleSaveProduce = async (produceData) => {
    try {
      let finalImageUrl = produceData.imageUrl; 
      if (produceData.imageFile) {
        const imageRef = ref(storage, `produces/${Date.now()}_${produceData.imageFile.name}`);
        const uploadResult = await uploadBytes(imageRef, produceData.imageFile);
        finalImageUrl = await getDownloadURL(uploadResult.ref);
      }
      delete produceData.imageFile;

      if (produceToEdit) {
        const produceRef = doc(db, 'produces', produceToEdit.id);
        await updateDoc(produceRef, { ...produceData, imageUrl: finalImageUrl });
        setProduces(produces.map(p => p.id === produceToEdit.id ? { ...p, ...produceData, imageUrl: finalImageUrl } : p));
      } else {
        const newProduce = {
          ...produceData, imageUrl: finalImageUrl, farmerId: currentUser.uid, farmerName: userProfile?.fullName || currentUser.email, createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'produces'), newProduce);
        setProduces([{ ...newProduce, id: docRef.id }, ...produces]); 
      }
      setIsAddModalOpen(false);
      setProduceToEdit(null);
      setActiveFarmerTab('listings'); 
      setCurrentView('dashboard'); // Return to dashboard if they were in explore view
    } catch (error) {
      alert("Failed to publish listing.");
    }
  };

  const handleEditClick = (produce) => { 
    setProduceToEdit(produce); 
    setIsAddModalOpen(true);
    setSelectedProduce(null); 
  };

  const handleDeleteProduce = async (id) => {
    try {
      await deleteDoc(doc(db, 'produces', id));
      setProduces(produces.filter(p => p.id !== id));
      setSelectedProduce(null);
    } catch (error) {
      console.error("Error deleting produce: ", error);
    }
  };

  const handleContactAction = () => { alert("Request sent successfully! The user will be notified."); };

  // --- REQUIREMENT LOGIC ---
  const handleSaveRequirement = async (reqData) => { 
    try {
      if (requirementToEdit) {
        const reqRef = doc(db, 'requirements', requirementToEdit.id);
        await updateDoc(reqRef, reqData);
        setRequirements(requirements.map(r => r.id === requirementToEdit.id ? { ...r, ...reqData } : r));
      } else {
        const newReq = {
          ...reqData,
          buyerId: currentUser.uid,
          buyerEmail: currentUser.email,
          buyerName: userProfile?.fullName || currentUser.email, 
          buyerPhone: userProfile?.phoneNumber || 'Not provided', 
          createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'requirements'), newReq);
        setRequirements([{ ...newReq, id: docRef.id }, ...requirements]);
      }
      setIsReqModalOpen(false);
      setRequirementToEdit(null);
      setActiveBuyerTab('requirements'); 
    } catch (error) {
      console.error("Error saving requirement:", error);
    }
  };

  const handleDeleteRequirement = async (id) => {
    try {
      await deleteDoc(doc(db, 'requirements', id));
      setRequirements(requirements.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting requirement:", error);
    }
  };

  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-xl font-bold">Loading Agree-Agri...</p></div>;
  if (!currentUser) return <Auth />;

  const myProduces = produces.filter(p => p.farmerId === currentUser.uid);
  const myRequirements = requirements.filter(r => r.buyerId === currentUser.uid);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-green-600 tracking-tighter">AGREE<span className="text-gray-900">-AGRI</span></span>
            <span className="hidden sm:block ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase">{userRole} Mode</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 hidden sm:block">{userProfile?.fullName || currentUser.email}</span>
            <button onClick={handleLogout} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-bold transition-colors">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ============================== */}
        {/* BUYER DASHBOARD */}
        {/* ============================== */}
        {userRole === 'buyer' && (
          <div>
            <AnalyticsPanel role="buyer" stats={{ totalSpent: 0, activeRequests: myRequirements.length, itemsProcured: 0 }} history={[]} />

            {/* Buyer Tabs Navigation */}
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 border-b border-gray-200 scrollbar-hide">
              {BUYER_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveBuyerTab(tab.id)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                    activeBuyerTab === tab.id 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Marketplace */}
            {activeBuyerTab === 'marketplace' && (
              <div className="animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Available Produce Market</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {produces.map((produce) => (
                    <ProduceCard key={produce.id} produce={produce} onClick={setSelectedProduce} />
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Requirements */}
            {activeBuyerTab === 'requirements' && (
              <div className="animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">My Active Requirements</h3>
                  <button onClick={() => { setRequirementToEdit(null); setIsReqModalOpen(true); }} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-green-700 transition-colors">
                    + Post a Requirement
                  </button>
                </div>
                {myRequirements.length === 0 ? (
                  <div className="p-12 bg-white rounded-2xl border border-gray-100 text-center flex flex-col items-center">
                    <FiClipboard className="text-4xl text-gray-400 mb-3" />
                    <p className="text-gray-500 font-medium">You haven't posted any requirements yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myRequirements.map(req => (
                      <div key={req.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{req.produceName}</h4>
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <FiClock className="text-gray-400" /> Needed by: {req.deadline}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">Quantity: {req.quantity} kg | Target: ₹{req.targetPrice}/kg</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button onClick={() => { setRequirementToEdit(req); setIsReqModalOpen(true); }} className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200">Edit</button>
                          <button onClick={() => handleDeleteRequirement(req.id)} className="flex-1 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================== */}
        {/* FARMER DASHBOARD */}
        {/* ============================== */}
        {userRole === 'farmer' && (
          <div>
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">
                  {currentView === 'explore' ? 'Explore Farm Tools' : 'My Farm Dashboard'}
                </h1>
                <p className="text-gray-500 mt-2">
                  {currentView === 'explore' 
                    ? 'Leverage AI and data to maximize your yield.' 
                    : 'Manage your listings and view buyer requests.'}
                </p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                {currentView === 'explore' ? (
                  <button onClick={() => setCurrentView('dashboard')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-100 text-gray-800 px-6 py-3 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">
                    <FiArrowLeft className="text-lg" /> Back to Dashboard
                  </button>
                ) : (
                  <>
                    <button onClick={() => setCurrentView('explore')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-6 py-3 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                      <FiCompass className="text-lg" /> Explore Tools
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex-1 sm:flex-none bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-md shadow-green-200">
                      + List New Produce
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* --- DASHBOARD VIEW --- */}
            {currentView === 'dashboard' && (
              <div className="animate-fade-in-up">
                <AnalyticsPanel role="farmer" stats={{ totalSalesValue: 0, activeListings: myProduces.length, dealsCompleted: 0 }} history={[]} />

                {/* Farmer Tabs Navigation */}
                <div className="flex overflow-x-auto gap-2 mb-6 pb-2 border-b border-gray-200 scrollbar-hide mt-8">
                  {FARMER_DASHBOARD_TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFarmerTab(tab.id)}
                      className={`whitespace-nowrap px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                        activeFarmerTab === tab.id 
                          ? 'bg-green-600 text-white shadow-md' 
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab: Listings */}
                {activeFarmerTab === 'listings' && (
                  <div className="animate-fade-in-up">
                    {myProduces.length === 0 ? (
                      <div className="p-12 bg-white rounded-2xl border border-gray-100 text-center flex flex-col items-center">
                        <FiBox className="text-4xl text-gray-400 mb-3" />
                        <p className="text-gray-500 font-medium">No active listings. Click the button above to publish your produce.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myProduces.map((produce) => (
                          <ProduceCard key={produce.id} produce={produce} onClick={setSelectedProduce} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Demands */}
                {activeFarmerTab === 'demands' && (
                  <div className="animate-fade-in-up">
                     {requirements.length === 0 ? (
                       <div className="p-12 bg-white rounded-2xl border border-gray-100 text-center flex flex-col items-center">
                         <FiShoppingCart className="text-4xl text-gray-400 mb-3" />
                         <p className="text-gray-500 font-medium">No active buyer requests in the market right now.</p>
                       </div>
                     ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {requirements.map(req => (
                           <div key={req.id} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                             <div className="mb-3 border-b border-gray-100 pb-3">
                               <div className="flex justify-between items-start">
                                 <h4 className="text-lg font-black text-gray-900 truncate pr-2">{req.produceName}</h4>
                                 <span className="bg-blue-50 text-blue-800 py-0.5 px-2 rounded text-[10px] font-bold uppercase tracking-wide border border-blue-100 whitespace-nowrap">
                                   {req.quantity} kg
                                 </span>
                               </div>
                               <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1">
                                 <FiClock className="text-red-500" /> Needed by: {req.deadline}
                               </p>
                             </div>

                             <div className="space-y-2 text-xs text-gray-700 flex-grow">
                               <p className="flex items-center gap-2">
                                 <FiUser className="text-gray-400 text-sm" /> 
                                 <span className="font-semibold text-gray-900 truncate">{req.buyerName}</span>
                               </p>
                               <p className="flex items-center gap-2">
                                 <FiPhone className="text-blue-500 text-sm" /> 
                                 <a href={`tel:${req.buyerPhone}`} className="text-blue-600 hover:underline font-medium">{req.buyerPhone}</a>
                               </p>
                               <p className="flex items-center gap-2">
                                 <FiMail className="text-blue-500 text-sm" /> 
                                 <a href={`mailto:${req.buyerEmail}`} className="text-blue-600 hover:underline font-medium truncate">{req.buyerEmail}</a>
                               </p>
                               <p className="flex items-start gap-2">
                                 <FiMapPin className="text-gray-500 text-sm mt-0.5 shrink-0" /> 
                                 <span className="font-medium text-gray-800 line-clamp-1">{req.deliveryLocation}</span>
                               </p>
                               
                               {req.notes && (
                                 <div className="mt-2 bg-gray-50 p-2 rounded border border-gray-200">
                                   <p className="text-[10px] font-bold text-gray-500 uppercase mb-0.5 flex items-center gap-1">
                                     <FiInfo className="text-gray-400" /> Notes
                                   </p>
                                   <p className="text-xs italic text-gray-700 line-clamp-2">"{req.notes}"</p>
                                 </div>
                               )}
                             </div>

                             <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                               <div>
                                 <p className="text-[10px] font-bold text-gray-500 uppercase">Target</p>
                                 <p className="text-lg font-black text-green-600">₹{req.targetPrice}<span className="text-xs font-normal text-gray-500">/kg</span></p>
                               </div>
                               <button onClick={handleContactAction} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-2">
                                 Fulfill
                               </button>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                  </div>
                )}
              </div>
            )}

            {/* --- EXPLORE VIEW --- */}
            {currentView === 'explore' && (
              <div className="animate-fade-in-up">
                
                {/* Explore Tools Navigation */}
                <div className="flex overflow-x-auto gap-2 mb-6 pb-2 border-b border-gray-200 scrollbar-hide">
                  {EXPLORE_TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveExploreTab(tab.id)}
                      className={`whitespace-nowrap px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                        activeExploreTab === tab.id 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {/* Explore Content */}
                <div className="animate-fade-in-up">
                  {activeExploreTab === 'weather' && <WeatherForecast />}
                  {activeExploreTab === 'diagnosis' && <DiseaseDiagnosis />}
                  {activeExploreTab === 'crops' && <CropRecommendations />}
                  {activeExploreTab === 'soil' && <SoilTestLabs />}
                  {activeExploreTab === 'schemes' && <GovernmentSchemes userState={userProfile?.state || "Maharashtra"} />}
                </div>

              </div>
            )}
            
          </div>
        )}
      </main>

      <ProduceModal produce={selectedProduce} onClose={() => setSelectedProduce(null)} userRole={userRole} onEdit={handleEditClick} onDelete={handleDeleteProduce} onContact={handleContactAction} />
      <AddProduceModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setProduceToEdit(null); }} onAdd={handleSaveProduce} initialData={produceToEdit} />
      <AddRequirementModal isOpen={isReqModalOpen} onClose={() => { setIsReqModalOpen(false); setRequirementToEdit(null); }} onAdd={handleSaveRequirement} initialData={requirementToEdit} />
    </div>
  );
}