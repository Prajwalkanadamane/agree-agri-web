import React, { useState, useEffect } from 'react';
import { auth, db, storage } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth'; 
import { doc, getDoc, collection, addDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 

import { FiUser, FiPhone, FiMail, FiMapPin, FiClock, FiInfo } from 'react-icons/fi';

import Auth from './components/Auth'; 
import ProduceCard from './components/ProduceCard';
import ProduceModal from './components/ProduceModal';
import AddProduceModal from './components/AddProduceModal';
import AddRequirementModal from './components/AddRequirementModal';
import AnalyticsPanel from './components/AnalyticsPanel';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [userProfile, setUserProfile] = useState(null); 
  const [isAuthLoading, setIsAuthLoading] = useState(true); 

  const [produces, setProduces] = useState([]); 
  const [requirements, setRequirements] = useState([]); 
  const [transactions, setTransactions] = useState([]); // NEW: State for transactions
  
  const [selectedProduce, setSelectedProduce] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [produceToEdit, setProduceToEdit] = useState(null);

  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [requirementToEdit, setRequirementToEdit] = useState(null);

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
        setTransactions([]);
      }
      setIsAuthLoading(false); 
    });
    return () => unsubscribe(); 
  }, []);

  // NEW: Fetching Transactions alongside Produces and Requirements
  useEffect(() => {
    const fetchData = async () => {
      try {
        const produceQ = query(collection(db, 'produces'), orderBy('createdAt', 'desc'));
        const produceSnap = await getDocs(produceQ);
        setProduces(produceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const reqQ = query(collection(db, 'requirements'), orderBy('createdAt', 'desc'));
        const reqSnap = await getDocs(reqQ);
        setRequirements(reqSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const txQ = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
        const txSnap = await getDocs(txQ);
        setTransactions(txSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

  // --- NEW: TRANSACTION LOGIC ---

  // 1. Buyer buying from Farmer's Produce Listing
  const handleBuyProduce = async (produce) => {
    const qtyStr = window.prompt(`Enter quantity to buy (Min: ${produce.minQuantity}kg, Max: ${produce.maxQuantity}kg):`, produce.minQuantity);
    if (!qtyStr) return; // User cancelled
    
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty < parseInt(produce.minQuantity) || qty > parseInt(produce.maxQuantity)) {
      alert("Invalid quantity entered. Please respect the Min/Max limits.");
      return;
    }
    
    const totalAmount = qty * produce.priceMin;
    
    if(window.confirm(`Total cost will be ₹${totalAmount}. Confirm purchase?`)) {
      try {
        const newTx = {
          type: 'produce_purchase',
          itemId: produce.id,
          itemName: produce.name,
          buyerId: currentUser.uid,
          farmerId: produce.farmerId,
          amount: totalAmount,
          quantity: qty,
          createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'transactions'), newTx);
        
        // Update local state instantly so the UI feels fast
        setTransactions([{ ...newTx, id: docRef.id, createdAt: { toDate: () => new Date() } }, ...transactions]);
        setSelectedProduce(null);
        alert("Purchase successful! A receipt has been generated in your Transaction History.");
      } catch (err) {
        console.error(err);
        alert("Failed to process transaction.");
      }
    }
  };

  // 2. Farmer fulfilling a Buyer's Requirement Request
  const handleFulfillRequirement = async (req) => {
    const totalAmount = req.quantity * req.targetPrice;
    
    if(window.confirm(`You are agreeing to supply ${req.quantity}kg of ${req.produceName} to ${req.buyerName} for ₹${totalAmount}. Confirm?`)) {
      try {
        const newTx = {
          type: 'requirement_fulfillment',
          itemId: req.id,
          itemName: req.produceName,
          buyerId: req.buyerId,
          farmerId: currentUser.uid,
          amount: totalAmount,
          quantity: req.quantity,
          createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'transactions'), newTx);
        setTransactions([{ ...newTx, id: docRef.id, createdAt: { toDate: () => new Date() } }, ...transactions]);
        
        // Once fulfilled, remove the requirement from the market board!
        await deleteDoc(doc(db, 'requirements', req.id));
        setRequirements(requirements.filter(r => r.id !== req.id));
        
        alert("Deal completed successfully! Check your Dashboard Analytics.");
      } catch (err) {
        console.error(err);
        alert("Failed to process deal.");
      }
    }
  };


  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-xl font-bold">Loading Agree-Agri...</p></div>;
  if (!currentUser) return <Auth />;

  // --- PREPARE DATA FOR DASHBOARDS ---
  const myProduces = produces.filter(p => p.farmerId === currentUser.uid);
  const myRequirements = requirements.filter(r => r.buyerId === currentUser.uid);
  
  // Buyer Analytics Prep
  const myBuyerTxs = transactions.filter(t => t.buyerId === currentUser.uid);
  const buyerStats = {
    totalSpent: myBuyerTxs.reduce((sum, t) => sum + (t.amount || 0), 0),
    activeRequests: myRequirements.length,
    itemsProcured: myBuyerTxs.length
  };
  const buyerHistory = myBuyerTxs.map(t => ({
    date: t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString(),
    name: t.itemName,
    amount: t.amount
  }));

  // Farmer Analytics Prep
  const myFarmerTxs = transactions.filter(t => t.farmerId === currentUser.uid);
  const farmerStats = {
    totalSalesValue: myFarmerTxs.reduce((sum, t) => sum + (t.amount || 0), 0),
    activeListings: myProduces.length,
    dealsCompleted: myFarmerTxs.length
  };
  const farmerHistory = myFarmerTxs.map(t => ({
    date: t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString(),
    name: t.itemName,
    amount: t.amount
  }));


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
            <button onClick={handleLogout} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-bold">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ============================== */}
        {/* BUYER DASHBOARD */}
        {/* ============================== */}
        {userRole === 'buyer' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Marketplace</h1>
                <p className="text-gray-500 mt-2">Source directly from verified farmers.</p>
              </div>
              <button onClick={() => { setRequirementToEdit(null); setIsReqModalOpen(true); }} className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-md">
                + Post a Requirement
              </button>
            </div>

            {/* NEW: Passing calculated stats to the panel */}
            <AnalyticsPanel role="buyer" stats={buyerStats} history={buyerHistory} />

            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 mt-8">My Active Requirements</h3>
            {myRequirements.length === 0 ? (
              <p className="text-gray-500 mb-8 bg-white p-6 rounded-xl border border-gray-100 text-center">You haven't posted any requirements yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
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

            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Available Produce Market</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {produces.map((produce) => (
                <ProduceCard key={produce.id} produce={produce} onClick={setSelectedProduce} />
              ))}
            </div>
          </div>
        )}

        {/* ============================== */}
        {/* FARMER DASHBOARD */}
        {/* ============================== */}
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

            {/* NEW: Passing calculated stats to the panel */}
            <AnalyticsPanel role="farmer" stats={farmerStats} history={farmerHistory} />

            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 mt-8">My Active Listings</h3>
            {myProduces.length === 0 ? (
              <p className="text-gray-500 mb-12 bg-white p-6 rounded-xl border border-gray-100 text-center">No active listings. Click the button above to publish your produce.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {myProduces.map((produce) => (
                  <ProduceCard key={produce.id} produce={produce} onClick={setSelectedProduce} />
                ))}
              </div>
            )}

            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Market Demands (Buyer Requests)</h3>
            
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
                    {/* NEW: Wired up the Fulfill button */}
                    <button onClick={() => handleFulfillRequirement(req)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-2">
                      Fulfill
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* NEW: Passed handleBuyProduce to onContact so the Produce Modal triggers a purchase */}
      <ProduceModal produce={selectedProduce} onClose={() => setSelectedProduce(null)} userRole={userRole} onEdit={handleEditClick} onDelete={handleDeleteProduce} onContact={handleBuyProduce} />
      
      <AddProduceModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setProduceToEdit(null); }} onAdd={handleSaveProduce} initialData={produceToEdit} />
      <AddRequirementModal isOpen={isReqModalOpen} onClose={() => { setIsReqModalOpen(false); setRequirementToEdit(null); }} onAdd={handleSaveRequirement} initialData={requirementToEdit} />
    </div>
  );
}