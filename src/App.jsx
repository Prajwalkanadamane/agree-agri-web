import React, { useState, useEffect } from 'react';
import { auth, db, storage } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth'; 
import { doc, getDoc, collection, addDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore'; 
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

// --- Tab Configurations ---
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

// --- Location Database for Dropdowns ---
const IndianStatesAndDistricts = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Arunachal Pradesh": ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"],
  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup Rural", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja","Uttar Bastar Kanker"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
  "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Saraikela Kharsawan", "Simdega", "West Singhbhum"],
  "Karnataka": ["Bagalkot", "Bellary", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar","Chamarajanagar", "Chikballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri","Hubli", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Ladakh": ["Kargil", "Leh"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
  "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Nawanshahr", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "Shaheed Bhagat Singh Nagar", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"]
};

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
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeFarmerTab, setActiveFarmerTab] = useState('listings');
  const [activeExploreTab, setActiveExploreTab] = useState('weather');
  const [activeBuyerTab, setActiveBuyerTab] = useState('marketplace');

  const [targetLocation, setTargetLocation] = useState({ state: 'Maharashtra', district: 'Pune' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role);
            setUserProfile(data); 
            if(data.state && data.district) {
               setTargetLocation({ state: data.state, district: data.district });
            }
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
    if (!currentUser) return;

    const produceQ = query(collection(db, 'produces'), orderBy('createdAt', 'desc'));
    const unsubscribeProduces = onSnapshot(produceQ, (snapshot) => {
      setProduces(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const reqQ = query(collection(db, 'requirements'), orderBy('createdAt', 'desc'));
    const unsubscribeReqs = onSnapshot(reqQ, (snapshot) => {
      setRequirements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeProduces();
      unsubscribeReqs();
    };
  }, [currentUser]);

  const handleLogout = () => signOut(auth);

  // --- THE FINAL FIX: CORRECTLY ATTACHING FARMER NAME FROM PROFILE ---
  const handleSaveProduce = async (produceData) => {
    try {
      let uploadedUrls = [];
      
      if (produceData.imageFiles && produceData.imageFiles.length > 0) {
        const uploadPromises = produceData.imageFiles.map(async (file, index) => {
          const imageRef = ref(storage, `produces/${Date.now()}_${index}_${file.name}`);
          const uploadResult = await uploadBytes(imageRef, file);
          return await getDownloadURL(uploadResult.ref);
        });
        
        uploadedUrls = await Promise.all(uploadPromises);
      }

      delete produceData.imageFiles;
      delete produceData.imageUrl; 

      // SAFETY CHECK: Ensure we use the real name from the logged-in profile
      const realFarmerName = userProfile?.fullName || currentUser.email;

      if (produceToEdit) {
        const finalUrls = uploadedUrls.length > 0 ? uploadedUrls : (produceToEdit.imageUrls || [produceToEdit.imageUrl]);
        const mainImageUrl = finalUrls && finalUrls.length > 0 ? finalUrls[0] : '';
        
        await updateDoc(doc(db, 'produces', produceToEdit.id), { 
          ...produceData, 
          imageUrls: finalUrls,
          imageUrl: mainImageUrl,
          farmerName: realFarmerName // Update to real name if it was wrong
        });
      } else {
        const mainImageUrl = uploadedUrls.length > 0 ? uploadedUrls[0] : '';
        const newProduce = {
          ...produceData, 
          imageUrls: uploadedUrls, 
          imageUrl: mainImageUrl,  
          farmerId: currentUser.uid, 
          farmerName: realFarmerName, // Save actual profile name here
          createdAt: serverTimestamp(),
          status: 'active'
        };
        await addDoc(collection(db, 'produces'), newProduce);
      }
      
      setIsAddModalOpen(false);
      setProduceToEdit(null);
      setActiveFarmerTab('listings'); 
      setCurrentView('dashboard'); 
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to publish listing.");
      throw error;
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
    } catch (error) {
      console.error("Error deleting produce: ", error);
    }
  };

  const handleContactAction = () => { alert("Request sent successfully! The user will be notified."); };

  const handleSaveRequirement = async (reqData) => { 
    try {
      if (requirementToEdit) {
        await updateDoc(doc(db, 'requirements', requirementToEdit.id), reqData);
      } else {
        const newReq = {
          ...reqData,
          buyerId: currentUser.uid,
          buyerEmail: currentUser.email,
          buyerName: userProfile?.fullName || currentUser.email, 
          buyerPhone: userProfile?.phoneNumber || 'Not provided', 
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'requirements'), newReq);
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
                
                <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center bg-gradient-to-r from-indigo-50 to-white">
                  <div className="flex items-center gap-2 text-indigo-800 font-bold min-w-max">
                    <FiMapPin className="text-xl" /> Target Region:
                  </div>
                  
                  <select 
                    value={targetLocation.state} 
                    onChange={(e) => {
                      const newState = e.target.value;
                      setTargetLocation({ 
                        state: newState, 
                        district: IndianStatesAndDistricts[newState]?.[0] || '' 
                      });
                    }}
                    className="flex-1 border border-gray-200 bg-white shadow-inner rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-gray-800 font-medium"
                  >
                    <option value="">Select State...</option>
                    {Object.keys(IndianStatesAndDistricts).sort().map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>

                  <select 
                    value={targetLocation.district} 
                    onChange={(e) => setTargetLocation({...targetLocation, district: e.target.value})}
                    className="flex-1 border border-gray-200 bg-white shadow-inner rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-gray-800 font-medium disabled:opacity-50 disabled:bg-gray-100"
                    disabled={!targetLocation.state}
                  >
                    <option value="">Select District...</option>
                    {targetLocation.state && IndianStatesAndDistricts[targetLocation.state].map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

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

                <div className="animate-fade-in-up">
                  {activeExploreTab === 'weather' && <WeatherForecast state={targetLocation.state} district={targetLocation.district} />}
                  {activeExploreTab === 'diagnosis' && <DiseaseDiagnosis />}
                  {activeExploreTab === 'crops' && <CropRecommendations state={targetLocation.state} district={targetLocation.district} />}
                  {activeExploreTab === 'soil' && <SoilTestLabs state={targetLocation.state} district={targetLocation.district} />}
                  {activeExploreTab === 'schemes' && <GovernmentSchemes userState={targetLocation.state} />}
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