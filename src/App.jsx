import React, { useState, useEffect } from 'react';
import { auth, db, storage } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth'; 
import { doc, getDoc, collection, addDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 

import Auth from './components/Auth'; 
import ProduceCard from './components/ProduceCard';
import ProduceModal from './components/ProduceModal';
import AddProduceModal from './components/AddProduceModal';
import AddRequirementModal from './components/AddRequirementModal';
// Notice: We completely removed the VerificationScreen!

const INITIAL_REQUIREMENTS = [
  { id: '101', produceName: 'Sona Masoori Rice', quantity: '5000', targetPrice: '45', deadline: '2026-03-15', deliveryLocation: 'Pune, Maharashtra', buyerName: 'Urban Grocers Ltd.' }
];

export default function App() {
  // --- AUTHENTICATION STATES ---
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [isAuthLoading, setIsAuthLoading] = useState(true); // No more isVerified state!

  // --- APP STATES ---
  const [produces, setProduces] = useState([]); 
  const [requirements, setRequirements] = useState(INITIAL_REQUIREMENTS);
  const [selectedProduce, setSelectedProduce] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [produceToEdit, setProduceToEdit] = useState(null);

  // --- LISTEN FOR LOGIN STATUS (No Verification Block) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            setUserRole('buyer'); 
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole('buyer'); 
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setProduces([]); 
      }
      setIsAuthLoading(false); // Hide the loading screen immediately
    });

    return () => unsubscribe(); 
  }, []);

  // --- FETCH DATA FROM FIRESTORE ---
  useEffect(() => {
    const fetchProduces = async () => {
      try {
        const q = query(collection(db, 'produces'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedListings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProduces(fetchedListings);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    if (currentUser) {
      fetchProduces();
    }
  }, [currentUser]);

  const handleLogout = () => {
    signOut(auth);
  };

  // --- REAL FIREBASE PUBLISH LOGIC ---
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
          ...produceData,
          imageUrl: finalImageUrl,
          farmerId: currentUser.uid,
          farmerName: currentUser.email, 
          createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'produces'), newProduce);
        setProduces([{ ...newProduce, id: docRef.id }, ...produces]); 
      }
      
      setIsAddModalOpen(false);
      setProduceToEdit(null);
    } catch (error) {
      console.error("Error saving listing: ", error);
      alert("Failed to publish listing. Check your console for details.");
    }
  };

  const handleEditClick = (produce) => { 
    setProduceToEdit(produce); 
    setIsAddModalOpen(true);   
  };

  const handleDeleteProduce = async (id) => {
    try {
      await deleteDoc(doc(db, 'produces', id));
      setProduces(produces.filter(p => p.id !== id));
      setSelectedProduce(null);
      alert("Listing marked as sold out and removed from market!");
    } catch (error) {
      console.error("Error deleting produce: ", error);
    }
  };

  const handleContactAction = () => { 
    alert("Request sent successfully! You will be connected shortly."); 
  };
  
  const handleAddNewRequirement = (newReqData) => { 
    setRequirements([{ ...newReqData, id: Date.now().toString() }, ...requirements]);
    setIsReqModalOpen(false);
    alert("Requirement Posted! Farmers will now see your request.");
  };

  // --- RENDERING ROUTER ---

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl font-bold text-gray-500">Loading Agree-Agri...</p></div>;
  }

  if (!currentUser) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-green-600 tracking-tighter">AGREE<span className="text-gray-900">-AGRI</span></span>
            <span className="hidden sm:block ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase">
              {userRole} Mode
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 hidden sm:block">{currentUser.email}</span>
            <button onClick={handleLogout} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-bold transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* === BUYER DASHBOARD === */}
        {userRole === 'buyer' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Marketplace</h1>
                <p className="text-gray-500 mt-2">Source directly from verified farmers.</p>
              </div>
              <button onClick={() => setIsReqModalOpen(true)} className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-md">
                + Post a Requirement
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {produces.map((produce) => (
                <ProduceCard key={produce.id} produce={produce} onClick={setSelectedProduce} />
              ))}
            </div>
          </div>
        )}

        {/* === FARMER DASHBOARD === */}
        {userRole === 'farmer' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">My Farm Dashboard</h1>
                <p className="text-gray-500 mt-2">Manage your listings and view buyer requests.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(true)} className="bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-md shadow-green-200">
                + List New Produce
              </button>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">My Active Listings</h3>
            {produces.length === 0 ? (
              <p className="text-gray-500 mb-12">No active listings. Click the button above to publish your produce.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {produces.map((produce) => (
                  <ProduceCard key={produce.id} produce={produce} onClick={setSelectedProduce} />
                ))}
              </div>
            )}

            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Market Demands (Buyer Requests)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {requirements.map(req => (
                <div key={req.id} className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{req.produceName}</h4>
                    <p className="text-sm text-gray-600">Needed by: {req.deadline}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-lg font-bold text-green-600">₹{req.targetPrice}/kg</p>
                    <button onClick={handleContactAction} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Fulfill Request</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* --- ALL MODALS --- */}
      <ProduceModal produce={selectedProduce} onClose={() => setSelectedProduce(null)} userRole={userRole} onEdit={handleEditClick} onDelete={handleDeleteProduce} onContact={handleContactAction} />
      <AddProduceModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setProduceToEdit(null); }} onAdd={handleSaveProduce} initialData={produceToEdit} />
      <AddRequirementModal isOpen={isReqModalOpen} onClose={() => setIsReqModalOpen(false)} onAdd={handleAddNewRequirement} />
    </div>
  );
}