
// --- 1. FIREBASE INITIALIZATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCw7_XFAO3szqmLUO5qnjVNih2Zije5eDs",
    authDomain: "agree-agri.firebaseapp.com",
    projectId: "agree-agri",
    storageBucket: "agree-agri.firebasestorage.app",
    messagingSenderId: "303286118976",
    appId: "1:303286118976:web:c27fb5157f0fa5c281cda5",
    measurementId: "G-4BV6TXNX26"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore Database
const db = firebase.firestore();

// ... keep all your other code below this ...
let currentLanguage = localStorage.getItem('language') || 'en';
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
const PLANT_ID_API_KEY = 'wqkubCkxKg3t3zjNDrz3uPJ2myTbYo16pgp3BR5KY0n0NEG2Y7';
//const AGMARKNET_API_KEY = 'z5LSJp9ojHF30ezQrouzyE0ZLIJPtRKwczDO0ohu';
const MARKET_PRODUCTS_KEY = 'marketplaceProducts';
const MESSAGES_KEY_PREFIX = 'agri_messages_';
const JOURNEY_KEY_PREFIX = 'farmerJourney_';
let allMarketProducts = [];
const AGRI_TOURISM_KEY = 'agriTourismListings';
let allTourismListings = [];
const AGRI_CLASSES_KEY = 'agriClassListings';
let allClassListings = [];
// [NEW] Data source for major crops with translations
const allMajorCrops = {
    // Cereals
    "Rice": { en: "Rice", hi: "चावल", ml: "അരി", kn: "ಅಕ್ಕಿ", te: "బియ్యం", ta: "அரிசி" },
    "Wheat": { en: "Wheat", hi: "गेहूँ", ml: "ഗോതമ്പ്", kn: "ಗೋಧಿ", te: "గోధుమ", ta: "கோதுமை" },
    "Maize": { en: "Maize", hi: "मक्का", ml: "ചോളം", kn: "ಮೆಕ್ಕೆಜೋಳ", te: "మొక్కజొన్న", ta: "மக்காச்சோளம்" },
    "Millets": { en: "Millets", hi: "बाजरा", ml: "ചാമ", kn: "ಸಿರಿಧಾನ್ಯಗಳು", te: "చిరుధాన్యాలు", ta: "சிறு தானியங்கள்" },
    
    // Pulses
    "Chickpea": { en: "Chickpea (Gram)", hi: "चना", ml: "കടല", kn: "ಕಡಲೆ", te: "శనగలు", ta: "கொண்டைக்கடலை" },
    "PigeonPea": { en: "Pigeon Pea (Arhar)", hi: "अरहर (तूर)", ml: "തുവര", kn: "ತೊಗರಿ", te: "కంది", ta: "துவரம் பருப்பு" },
    "Lentil": { en: "Lentil (Masoor)", hi: "मसूर", ml: "മൈസൂർ പയർ", kn: "ಮಸೂರ್ ಬೇಳೆ", te: "మసూర్ పప్పు", ta: "மசூர் பருப்பு" },

    // Cash Crops
    "Sugarcane": { en: "Sugarcane", hi: "गन्ना", ml: "കരിമ്പ്", kn: "ಕಬ್ಬು", te: "చెరకు", ta: "கரும்பு" },
    "Cotton": { en: "Cotton", hi: "कपास", ml: "പരുത്തി", kn: "ಹತ್ತಿ", te: "పత్తి", ta: "பருத்தி" },
    "Jute": { en: "Jute", hi: "जूट", ml: "ചണം", kn: "ಸೆಣಬಿನ", te: "జనపనార", ta: "சணல்" },

    // Plantation, Spices & Fruits/Veg
    "Tea": { en: "Tea", hi: "चाय", ml: "ചായ", kn: "ಚಹಾ", te: "తేయాకు" },
    "Coffee": { en: "Coffee", hi: "कॉफ़ी", ml: "കാപ്പി", kn: "ಕಾಫಿ", te: "కాఫీ" },
    "Rubber": { en: "Rubber", hi: "रबर", ml: "റബ്ബർ", kn: "ರಬ್ಬರ್", te: "రబ్బరు" },
    "Coconut": { en: "Coconut", hi: "नारियल", ml: "തേങ്ങ", kn: "ತೆಂಗಿನಕಾಯಿ", te: "కొబ్బరి" },
    "Pepper": { en: "Pepper", hi: "काली मिर्च", ml: "കുരുമുളക്", kn: "ಕರಿಮೆಣಸು", te: "మిరియాలు" },
    "Cardamom": { en: "Cardamom", hi: "इलायची", ml: "ഏലം", kn: "ಏಲಕ್ಕಿ", te: "యాలకులు" },
    "Turmeric": { en: "Turmeric", hi: "हल्दी", ml: "മഞ്ഞൾ", kn: "ಅರಿಶಿನ", te: "పసుపు" },
    "Ginger": { en: "Ginger", hi: "अदरक", ml: "ഇഞ്ചി", kn: "ಶುಂಠಿ", te: "అల్లం" },
    "Cashew": { en: "Cashew", hi: "काजू", ml: "കശുവണ്ടി", kn: "ಗೋಡಂಬಿ", te: "జీడిపప్పు" },
    "Banana": { en: "Banana", hi: "केला", ml: "വാഴപ്പഴം", kn: "ಬಾಳೆಹಣ್ಣು", te: "అరటి" },
    "Tapioca": { en: "Tapioca", hi: "टैपिओका", ml: "മരച്ചീനി", kn: "ಮರಗೆಣಸು", te: "కర్రపెండలం" },

    // Oilseeds
    "Groundnut": { en: "Groundnut", hi: "मूँगफली", ml: "നിലക്കടല", kn: "ಕಡಲೆಕಾಯಿ", te: "వేరుశెనగ" },
    "Mustard": { en: "Mustard", hi: "सरसों", ml: "കടുക്", kn: "ಸಾಸಿವೆ", te: "ఆవాలు" },
    "Soybean": { en: "Soybean", hi: "सोयाबीन", ml: "സോയാബീൻ", kn: "ಸೋಯಾಬೀನ್", te: "సోయా చిక్కుడు" },
    "Sunflower": { en: "Sunflower", hi: "सूरजमुखी", ml: "സൂര്യകാന്തി", kn: "ಸೂರ್ಯಕಾಂತಿ", te: "పొద్దుతిరుగుడు" },

    // General Categories (from your reg form)
    "Vegetables": { en: "Vegetables (General)", hi: "सब्जियां", ml: "പച്ചക്കറികൾ", kn: "ತರಕಾರಿಗಳು", te: "కూరగాయలు", ta: "காய்கறிகள்" },
    "Fruits": { en: "Fruits (General)", hi: "फल", ml: "പഴങ്ങൾ", kn: "ಹಣ್ಣುಗಳು", te: "పండ్లు", ta: "பழங்கள்" },
    "Spices": { en: "Spices (General)", hi: "मसाले", ml: "മസാലകൾ", kn: "ಮಸಾಲೆಗಳು", te: "మసాలా దినుసులు", ta: "மசாலா பொருட்கள்" }
};
// --- MOCK DATA ---
const mockMarketplaceProducts = [
    
];

// [NEW] MOCK DATA FOR AGRI-TOURISM
const mockAgriTourismListings = [
    {
        id: 2001,
        farmName: "Green Valley Organic Farm",
        price: 2500,
        desc: "Full-day experience. Includes organic farming demo, tractor ride, and fresh farm-to-table lunch.",
        farmer: { name: "Rohan Gupta", phone: "+919112223334", address: "Bengaluru Urban, Karnataka" },
        location: "Bengaluru Urban, Karnataka"
    },
    {
        id: 2002,
        farmName: "Wayanad Spice Garden",
        price: 1500,
        desc: "Half-day tour of our spice plantation (pepper, cardamom). Includes tea and snacks.",
        farmer: { name: "Anjali Menon", phone: "+919223334445", address: "Wayanad, Kerala" },
        location: "Wayanad, Kerala"
    }
];
// [NEW] MOCK DATA FOR AGRI-CLASSES
const mockAgriClasses = [
    {
        id: 3001,
        className: "Introduction to Hydroponics",
        price: 500,
        desc: "A 1-day workshop covering the basics of setting up your own hydroponic system. All materials provided.",
        instructor: { name: "Future Farms Ltd.", phone: "+919556667778", address: "Kozhikode, Kerala" },
        location: "Kozhikode, Kerala"
    },
    {
        id: 3002,
        className: "Organic Beekeeping Basics",
        price: 1200,
        desc: "A 2-day hands-on class. Learn to manage a hive and harvest honey organically. Includes safety gear.",
        instructor: { name: "Bee-Natural", phone: "+919445556667", address: "Mysuru, Karnataka" },
        location: "Mysuru, Karnataka"
    }
];
// --- Government Schemes Data ---
const GOVT_UPDATES_KEY = 'govt_updates';
const mockGovtUpdates = [
    { id: 1, title: "Seed Subsidy Split - Kharif Season", message: "Due to budget distributions, the 2kg seed subsidy is temporarily split. You will receive 1kg now and the remaining 1kg next month. Do not let local officials charge you or claim your quota is finished.", date: "2026-02-25", isUrgent: true },
    { id: 2, title: "Fertilizer Stock Available", message: "Urea and DAP stocks have arrived at all district cooperative societies. Subsidized price is ₹266 per bag. Demand a printed receipt.", date: "2026-02-20", isUrgent: false }
];

// --- Expanded Government Schemes Data ---
const mockGovtSchemes = [
    // CENTRAL SCHEMES (Available to everyone)
    { 
        id: 101, 
        level: "Central", 
        state: "All", 
        title: "Kisan Credit Card (KCC)", 
        type: "Loan", 
        desc: "Short-term credit limit for crops and expenses. Farmers receive an interest subvention of 2% and an extra 3% benefit for timely repayment, making the effective rate 4% per year.", 
        amount: "Up to ₹3 Lakh at 4%" 
    },
    { 
        id: 102, 
        level: "Central", 
        state: "All", 
        title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)", 
        type: "Insurance", 
        desc: "Provides crop insurance to farmers against losses caused by floods, droughts, hailstorms, pests, and diseases. Premium is just 1.5% for Rabi and 2% for Kharif crops.", 
        amount: "Crop Value Coverage" 
    },
    { 
        id: 103, 
        level: "Central", 
        state: "All", 
        title: "Agriculture Infrastructure Fund (AIF)", 
        type: "Loan & Subsidy", 
        desc: "Supports investment in post-harvest infrastructure like cold storage and warehouses. Loans up to ₹2 crore are eligible for an interest subvention of 3% per year.", 
        amount: "Up to ₹2 Crore (3% Subvention)" 
    },

    // MAHARASHTRA SCHEMES
    { 
        id: 201, 
        level: "State", 
        state: "Maharashtra", 
        title: "Namo Shetkari Maha Samman Nidhi", 
        type: "Direct Transfer", 
        desc: "An additional income support scheme provided by the Maharashtra government, adding to the central PM-KISAN funds.", 
        amount: "₹6,000 / year" 
    },
    { 
        id: 202, 
        level: "State", 
        state: "Maharashtra", 
        title: "Magel Tyala Shet Tale", 
        type: "Subsidy", 
        desc: "Subsidy provided to farmers for constructing farm ponds to ensure water availability during dry spells.", 
        amount: "Up to ₹50,000 Subsidy" 
    },

    // KERALA SCHEMES
    { 
        id: 301, 
        level: "State", 
        state: "Kerala", 
        title: "Subiksha Keralam", 
        type: "Support & Subsidy", 
        desc: "Aimed at achieving self-sufficiency in food production by bringing fallow land under cultivation and supporting integrated farming.", 
        amount: "Varies by project" 
    },
    { 
        id: 302, 
        level: "State", 
        state: "Kerala", 
        title: "State Crop Insurance Scheme", 
        type: "Insurance", 
        desc: "Financial assistance for crop loss due to natural calamities or wild animal attacks, specific to crops grown in Kerala like Rubber, Coconut, and Spices.", 
        amount: "Based on crop damage" 
    },

    // KARNATAKA SCHEMES
    { 
        id: 401, 
        level: "State", 
        state: "Karnataka", 
        title: "Krishi Bhagya", 
        type: "Subsidy", 
        desc: "Focuses on rainwater harvesting and conservation. Provides subsidies for farm ponds, polythene linings, and diesel pump sets.", 
        amount: "80%-90% Subsidy" 
    },
    { 
        id: 402, 
        level: "State", 
        state: "Karnataka", 
        title: "Raitha Vidya Nidhi", 
        type: "Scholarship", 
        desc: "Scholarship program for the children of farmers to encourage higher education.", 
        amount: "₹2,000 to ₹11,000 / year" 
    }
];
// [NEW] Data source for Indian States and Districts.
// NOTE: This is a SMALL SAMPLE. For a real app, this object would
// contain all ~800 districts.
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

// Function to get all user journeys from localStorage
function getAllUserJourneys() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const allJourneys = [];
    
    users.forEach(user => {
        const journeyKey = JOURNEY_KEY_PREFIX + user.phone;
        const userJourney = JSON.parse(localStorage.getItem(journeyKey)) || [];
        if (userJourney.length > 0) {
            allJourneys.push({
                userName: user.name,
                journey: userJourney
            });
        }
    });
    
    return allJourneys;
}

// [NEW] Language display maps for the toggle buttons
const langDisplayMap = {
    en: 'English',
    ml: 'മലയാളം',
    hi: 'हिंदी',
    kn: 'ಕನ್ನಡ',
    te: 'తెలుగు',
    ta: 'தமிழ்'
};

const langShortDisplayMap = {
    en: 'English',
    ml: 'മലയാളം',
    hi: 'हिंदी',
    kn: 'ಕನ್ನಡ',
    te: 'తెలుగు',
    ta: 'தமிழ்'
};


let isChatbotVisible = false;

function setupChatbot() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatToggle = document.querySelector('.chat-toggle');
    const closeBtn = document.querySelector('.close-btn');
    
    // Initially hide the chatbot
    if (chatbotContainer) {
        chatbotContainer.style.display = 'none';
    }

    // Toggle button click handler
    if (chatToggle) {
        chatToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleChatbot();
        });
    }

    // Close button click handler
    if (closeBtn) {
        closeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            hideChatbot();
        });
    }

    // Click outside to close
    document.addEventListener('click', (event) => {
        if (isChatbotVisible && 
            !event.target.closest('.chatbot-container') && 
            !event.target.closest('.chat-toggle')) {
            hideChatbot();
        }
    });
}

function toggleChatbot() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    if (isChatbotVisible) {
        hideChatbot();
    } else {
        showChatbot();
    }
}

function showChatbot() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    if (chatbotContainer) {
        chatbotContainer.style.display = 'block';
        isChatbotVisible = true;
    }
}

function hideChatbot() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    if (chatbotContainer) {
        chatbotContainer.style.display = 'none';
        isChatbotVisible = false;
    }
}

// [HEAVILY UPDATED] setLanguage function
function setLanguage(lang, event) {
    if (event) event.preventDefault(); 
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    document.querySelectorAll('[data-en]').forEach(el => {
        el.textContent = el.dataset[lang] || el.dataset.en;
    });
    
    if (document.getElementById('modalCurrentLang')) {
        document.getElementById('modalCurrentLang').textContent = langDisplayMap[lang];
    }
    if (document.getElementById('headerCurrentLang')) {
        document.getElementById('headerCurrentLang').textContent = langShortDisplayMap[lang];
    }
    
    document.getElementById('modalLangDropdown')?.classList.remove('show');
    document.getElementById('headerLangDropdown')?.classList.remove('show');
}

function showModal() {
    document.getElementById('authModal').classList.add('show');
    document.getElementById('mainApp').classList.remove('show');
}

function closeModal() {
    document.getElementById('authModal').classList.remove('show');
}

function updateUserName() {
    const nameElement = document.getElementById('userName');
    if (!nameElement) return;
    
    if (currentUser && currentUser.name) {
        // Capitalize the first letter and display it
        const formattedName = currentUser.name.charAt(0).toUpperCase() + currentUser.name.slice(1);
        nameElement.textContent = formattedName;
    } else {
        nameElement.textContent = 'Farmer';
    }
}

function showApp() {
    document.getElementById('authModal').classList.remove('show');
    document.getElementById('mainApp').classList.add('show');
    
    // Force the name to update immediately when the app opens
    updateUserName();
    
    // Apply Retailer restrictions if they exist
    if (typeof applyRoleRestrictions === 'function') {
        applyRoleRestrictions();
    }
    
    showSection('home');
}

// [REVISED] This function now loads the profile page
// [REVISED] This function now loads the profile and journey pages
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick').includes(`'${sectionId}'`)) {
            link.classList.add('active');
        }
        if (sectionId === 'schemes') {
            loadSchemesPage();
        }
    });

    if (sectionId === 'tracker') {
        loadAndRenderExpenses();
    }
    
    if (sectionId === 'profile') {
        loadProfilePage();
    }

    if (sectionId === 'journey') {
        loadFarmerJourney();
    }
    if (sectionId === 'settings') {
        loadSettingsPage();
    }
    if (sectionId === 'classes') {
        loadClassListings();
    }
}
// --- Authentication ---

function logout(event) {
    if (event) event.preventDefault(); // Stops the page from jumping
    localStorage.removeItem('currentUser');
    currentUser = null;
    location.reload(); // Refreshes the page to show the login screen
}

function showAuthForm(formType, tabElement) {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.remove('active');
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    
    document.getElementById(`${formType}Form`).classList.add('active');
    tabElement.classList.add('active');
}
// --- FIREBASE LOGIN ---
async function handleLogin(event) {
    event.preventDefault();
    const phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;

    // SECRET ADMIN LOGIN BYPASS (Kept for testing)
    if (phone === '+910000000000' && password === 'admin') {
        currentUser = { name: 'Govt Agriculture Officer', phone: phone, role: 'admin', state: 'All', district: 'All' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        location.reload();
        return;
    }

    try {
        // 1. Fetch the user directly from Firebase using their phone number
        const userDoc = await db.collection("users").doc(phone).get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // 2. Verify password matches what is in the database
            if (userData.password === password) {
                // Save session locally so user stays logged in on refresh
                currentUser = userData;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showNotification('loginNotification', 'Login successful!', 'success');
                setTimeout(() => location.reload(), 800);
            } else {
                showNotification('loginNotification', 'Incorrect password.', 'error');
            }
        } else {
            showNotification('loginNotification', 'Phone number not found. Please register.', 'error');
        }

    } catch (error) {
        console.error("Error logging in: ", error);
        showNotification('loginNotification', 'Error connecting to database. Please check console.', 'error');
    }
}

// --- FIREBASE REGISTRATION ---
async function handleRegister(event) {
    event.preventDefault();
    
    const phone = document.getElementById('regPhone').value;
    
    // [FIX] Get the selected role from the radio buttons
    const selectedRole = document.querySelector('input[name="regRole"]:checked').value;
    
    // Create the user object matching your clean HTML form
    const newUser = {
        name: document.getElementById('regName').value,
        phone: phone,
        state: document.getElementById('regState').value, 
        district: 'Not Specified', 
        password: document.getElementById('regPassword').value,
        role: selectedRole, // [FIX] Dynamically assign the chosen role
        createdAt: firebase.firestore.FieldValue.serverTimestamp() 
    };

    try {
        // 1. Check if user already exists
        const userDoc = await db.collection("users").doc(phone).get();
        
        if (userDoc.exists) {
            showNotification('registerNotification', 'This phone number is already registered.', 'error');
            return;
        }

        // 2. Save the new user to Firebase
        await db.collection("users").doc(phone).set(newUser);
        
        // 3. Log them in immediately
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // 4. Show success message and refresh
        showNotification('registerNotification', 'Account created successfully!', 'success');
        setTimeout(() => location.reload(), 1000);

    } catch (error) {
        console.error("Error writing document: ", error);
        showNotification('registerNotification', 'Database error. Please check your internet connection.', 'error');
    }
}    
    // ... the rest of the try/catch block remains exactly the same ...


// --- User Menu & Dropdowns ---

function toggleUserMenu() {
    document.getElementById('userDropdown').classList.toggle('show');
}

function toggleLangMenu(dropdownId) {
    document.getElementById(dropdownId).classList.toggle('show');
}


window.addEventListener('click', function(event) {
    if (!event.target.closest('.user-menu')) {
        document.getElementById('userDropdown')?.classList.remove('show');
    }
    
    if (!event.target.closest('.language-toggle')) {
        document.getElementById('modalLangDropdown')?.classList.remove('show');
        document.getElementById('headerLangDropdown')?.classList.remove('show');
    }
});


// --- [NEW] Location Dropdown Functions ---

/**
 * Populates all "State" dropdowns with states from our data source.
 */
function populateStates() {
    const states = Object.keys(IndianStatesAndDistricts).sort();
    const stateDropdowns = [
        document.getElementById('regState'),
        document.getElementById('marketState'),
        document.getElementById('weatherState'),
        document.getElementById('recState'),
        document.getElementById('soilTestState'),
        document.getElementById('coldStorageState'),
        
    ];
    
    stateDropdowns.forEach(dropdown => {
        if (!dropdown) return;
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            dropdown.appendChild(option);
        });
    });
}

/**
 * Populates the corresponding "District" dropdown based on the selected state.
 * @param {string} sectionPrefix - 'reg', 'market', 'weather', or 'rec'
 */
function populateDistricts(sectionPrefix) {
    const stateDropdown = document.getElementById(`${sectionPrefix}State`);
    const districtDropdown = document.getElementById(`${sectionPrefix}District`);
    const selectedState = stateDropdown.value;
    
    // Clear old options
    districtDropdown.innerHTML = '';
    
    if (selectedState) {
        // Enable dropdown
        districtDropdown.disabled = false;
        districtDropdown.innerHTML = '<option value="">Select District</option>';
        
        const districts = IndianStatesAndDistricts[selectedState];
        if (districts) {
            districts.sort().forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                districtDropdown.appendChild(option);
            });
        }
    } else {
        
        districtDropdown.disabled = true;
        districtDropdown.innerHTML = '<option value="">Select State First</option>';
    }
}
/**
 * Helper: HTML Template for Price Card
 */
function createPriceCard(market, modal, min, max, variety, date) {
    return `
        <div class="price-card">
            <h4>${market}</h4>
            <div class="price">₹${modal} / Quintal</div>
            <p class="price-type">
                <strong>Min:</strong> ₹${min} | <strong>Max:</strong> ₹${max}
            </p>
            <p class="price-type" style="font-size: 0.8rem; border-top: 1px solid #ddd; padding-top: 0.5rem; margin-top: 0.5rem;">
                Variety: ${variety} <br>
                Updated: ${date}
            </p>
        </div>
    `;
}
// --- District Coordinates Database (Sample - Add more as needed) ---
const districtCoordinates = {
    //Andhra Pradesh
    "Anantapur": { lat: 14.6816, lon: 77.6000, name: "Anantapur" },
    "Chittoor": { lat: 13.2172, lon: 79.1000, name: "Chittoor" },
    "East Godavari": { lat: 16.7500, lon: 82.2167, name: "East Godavari" },
    "Guntur": { lat: 16.3067, lon: 80.4365, name: "Guntur" },
    "Krishna": { lat: 16.4063, lon: 80.6419, name: "Krishna" },
    "Kurnool": { lat: 15.8281, lon: 78.0373, name: "Kurnool" },
    "Nellore": { lat: 14.4426, lon: 79.9865, name: "Nellore" },
    "Prakasam": { lat: 15.5000, lon: 80.0500, name: "Prakasam" },
    "Srikakulam": { lat: 18.2964, lon: 83.8966, name: "Srikakulam" },
    "Visakhapatnam": { lat: 17.6868, lon: 83.2185, name: "Visakhapatnam" },
    "Vizianagaram": { lat: 18.1063, lon: 83.3958, name: "Vizianagaram" },
    "West Godavari": { lat: 16.7500, lon: 81.1000, name: "West Godavari" },
    "YSR Kadapa": { lat: 14.4674, lon: 78.8242, name: "YSR Kadapa" },
    
    //Arunachal Pradesh
    "Anjaw": { lat: 28.3500, lon: 97.3167, name: "Anjaw" },
    "Changlang": { lat: 27.1200, lon: 95.6200, name: "Changlang" },
    "Dibang Valley": { lat: 28.5000, lon: 95.0000, name: "Dibang Valley" },
    "East Kameng": { lat: 27.6000, lon: 93.6000, name: "East Kameng" },
    "East Siang": { lat: 28.2000, lon: 94.8000, name: "East Siang" },
    "Kamle": { lat: 27.9000, lon: 94.5000, name: "Kamle" },
    "Kra Daadi": { lat: 28.0000, lon: 94.2000, name: "Kra Daadi" },
    "Kurung Kumey": { lat: 27.8000, lon: 94.0000, name: "Kurung Kumey" },
    "Lepa Rada": { lat: 27.7000, lon: 94.3000, name: "Lepa Rada" },
    "Lohit": { lat: 27.0000, lon: 96.2000, name: "Lohit" },
    "Longding": { lat: 26.7000, lon: 95.2000, name: "Longding" },
    "Lower Dibang Valley": { lat: 28.4000, lon: 96.0000, name: "Lower Dibang Valley" },
    "Lower Siang": { lat: 28.1000, lon: 94.6000, name: "Lower Siang" },
    "Lower Subansiri": { lat: 27.9000, lon: 93.8000, name: "Lower Subansiri" },
    "Namsai": { lat: 27.5500, lon: 95.6000, name: "Namsai" },
    "Pakke Kessang": { lat: 27.3000, lon: 93.9000, name: "Pakke Kessang" },
    "Papum Pare": { lat: 27.3000, lon: 93.9000, name: "Papum Pare" },
    "Shi Yomi": { lat: 28.2000, lon: 94.9000, name: "Shi Yomi" },
    "Siang": { lat: 28.0000, lon: 94.4000, name: "Siang" },
    "Tawang": { lat: 27.5866, lon: 91.8642, name: "Tawang" },
    "Tirap": { lat: 27.0000, lon: 95.5000, name: "Tirap" },
    "Upper Siang": { lat: 28.3000, lon: 94.7000, name: "Upper Siang" },
    "Upper Subansiri": { lat: 28.1000, lon: 93.9000, name: "Upper Subansiri" },
    "West Kameng": { lat: 27.6000, lon: 93.4000, name: "West Kameng" },
    "West Siang": { lat: 28.1000, lon: 94.2000, name: "West Siang" },
    
    //Assam
    "Baksa": { lat: 26.5000, lon: 91.5000, name: "Baksa" },
    "Barpeta": { lat: 26.3176, lon: 90.9645, name: "Barpeta" },
    "Biswanath": { lat: 27.0000, lon: 93.0000, name: "Biswanath" },
    "Bongaigaon": { lat: 26.5000, lon: 90.5667, name: "Bongaigaon" },
    "Cachar": { lat: 24.8333, lon: 92.8000, name: "Cachar" },
    "Charaideo": { lat: 27.0000, lon: 94.2000, name: "Charaideo" },
    "Chirang": { lat: 26.7500, lon: 90.8333, name: "Chirang" },
    "Darrang": { lat: 26.5000, lon: 92.0000, name: "Darrang" },
    "Dhemaji": { lat: 27.4833, lon: 94.5833, name: "Dhemaji" },
    "Dhubri": { lat: 26.0000, lon: 89.9667, name: "Dhubri" },
    "Dibrugarh": { lat: 27.5000, lon: 94.9000, name: "Dibrugarh" },
    "Dima Hasao": { lat: 25.8333, lon: 93.1667, name: "Dima Hasao" },
    "Goalpara": { lat: 26.1800, lon: 90.6167, name: "Goalpara" },
    "Golaghat": { lat: 26.5000, lon: 93.9667, name: "Golaghat" },
    "Hailakandi": { lat: 24.7167, lon: 92.5833, name: "Hailakandi" },
    "Hojai": { lat: 26.7500, lon: 92.9000, name: "Hojai" },
    "Jorhat": { lat: 26.7500, lon: 94.2000, name: "Jorhat" },
    "Kamrup Metropolitan": { lat: 26.1445, lon: 91.7362, name: "Kamrup Metropolitan" },
    "Kamrup Rural": { lat: 26.3000, lon: 91.5000, name: "Kamrup Rural" },
    "Karbi Anglong": { lat: 26.0000, lon: 93.0000, name: "Karbi Anglong" },
    "Karimganj": { lat: 24.8667, lon: 92.3500, name: "Karimganj" },
    "Kokrajhar": { lat: 26.4000, lon: 90.5667, name: "Kokrajhar" },
    "Lakhimpur": { lat: 27.2333, lon: 94.1000, name: "Lakhimpur" },
    "Majuli": { lat: 26.9667, lon: 94.2167, name: "Majuli" },
    "Morigaon": { lat: 26.3333, lon: 92.4667, name: "Morigaon" },
    "Nagaon": { lat: 26.3500, lon: 92.6833, name: "Nagaon" },
    "Nalbari": { lat: 26.4333, lon: 91.4333, name: "Nalbari" },
    "Sivasagar": { lat: 26.9833, lon: 94.6167, name: "Sivasagar" },
    "Sonitpur": { lat: 26.6500, lon: 92.8000, name: "Sonitpur" },
    "South Salmara-Mankachar": { lat: 25.9500, lon: 89.9500, name: "South Salmara-Mankachar" },
    "Tinsukia": { lat: 27.5000, lon: 95.3667, name: "Tinsukia" },
    "Udalguri": { lat: 26.7500, lon: 91.9667, name: "Udalguri" },
    "West Karbi Anglong": { lat: 26.1000, lon: 92.5000, name: "West Karbi Anglong" },
    

    //Bihar
    "Araria": { lat: 26.2167, lon: 87.4667, name: "Araria" },
    "Arwal": { lat: 25.2500, lon: 84.6667, name: "Arwal" },
    "Aurangabad": { lat: 24.7500, lon: 84.3667, name: "Aurangabad" },
    "Banka": { lat: 24.8667, lon: 86.9167, name: "Banka" },
    "Begusarai": { lat: 25.4167, lon: 86.1333, name: "Begusarai" },
    "Bhagalpur": { lat: 25.2500, lon: 87.0167, name: "Bhagalpur" },
    "Bhojpur": { lat: 25.5667, lon: 84.6667, name: "Bhojpur" },
    "Buxar": { lat: 25.5667, lon: 83.9833, name: "Buxar" },
    "Darbhanga": { lat: 26.1500, lon: 85.9000, name: "Darbhanga" },
    "East Champaran": { lat: 26.6500, lon: 84.9167, name: "East Champaran" },
    "Gaya": { lat: 24.7500, lon: 85.0000, name: "Gaya" },
    "Gopalganj": { lat: 26.4700, lon: 84.4500, name: "Gopalganj" },
    "Jamui": { lat: 24.9200, lon: 86.2200, name: "Jamui" },
    "Jehanabad": { lat: 25.2000, lon: 84.9833, name: "Jehanabad" },
    "Kaimur": { lat: 25.0000, lon: 83.6000, name: "Kaimur" },
    "Katihar": { lat: 25.5333, lon: 87.5667, name: "Katihar" },
    "Khagaria": { lat: 25.5333, lon: 86.4833, name: "Khagaria" },
    "Kishanganj": { lat: 26.0990, lon: 87.9340, name: "Kishanganj" },
    "Lakhisarai": { lat: 25.1833, lon: 86.0833, name: "Lakhisarai" },
    "Madhepura": { lat: 25.9200, lon: 86.7833, name: "Madhepura" },
    "Madhubani": { lat: 26.3667, lon: 86.0667, name: "Madhubani" },
    "Munger": { lat: 25.3750, lon: 86.4700, name: "Munger" },
    "Muzaffarpur": { lat: 26.1200, lon: 85.3800, name: "Muzaffarpur" },
    "Nalanda": { lat: 25.1333, lon: 85.4167, name: "Nalanda" },
    "Nawada": { lat: 24.8833, lon: 85.5500, name: "Nawada" },
    "Patna": { lat: 25.5941, lon: 85.1376, name: "Patna" },
    "Purnia": { lat: 25.7776, lon: 87.4753, name: "Purnia" },
    "Rohtas": { lat: 24.9167, lon: 84.0333, name: "Rohtas" },
    "Saharsa": { lat: 25.8833, lon: 86.6000, name: "Saharsa" },
    "Samastipur": { lat: 25.8700, lon: 85.7800, name: "Samastipur" },
    "Saran": { lat: 26.1500, lon: 84.8000, name: "Saran" },
    "Sheikhpura": { lat: 25.1500, lon: 85.9833, name: "Sheikhpura" },
    "Sheohar": { lat: 26.6000, lon: 85.3000, name: "Sheohar" },
    "Sitamarhi": { lat: 26.6000, lon: 85.5000, name: "Sitamarhi" },
    "Siwan": { lat: 26.2200, lon: 84.3600, name: "Siwan" },
    "Supaul": { lat: 26.1700, lon: 86.6000, name: "Supaul" },
    "Vaishali": { lat: 25.6800, lon: 85.2000, name: "Vaishali" },
    "West Champaran": { lat: 27.1000, lon: 84.9000, name: "West Champaran" },



    //Chandigarh
    "Chandigarh": { lat: 30.7333, lon: 76.7794, name: "Chandigarh" },
     

    //chhattisgarh
    "Balod": { lat: 20.7000, lon: 81.3500, name: "Balod" },
    "Baloda Bazar": { lat: 21.6500, lon: 82.1500, name: "Baloda Bazar" },
    "Balrampur": { lat: 23.2500, lon: 83.4500, name: "Balrampur" },
    "Bastar": { lat: 19.0000, lon: 82.0000, name: "Bastar" },
    "Bemetara": { lat: 21.1000, lon: 81.5000, name: "Bemetara" },
    "Bijapur": { lat: 19.7500, lon: 82.1000, name: "Bijapur" },
    "Bilaspur": { lat: 22.0796, lon: 82.1391, name: "Bilaspur" },
    "Dantewada": { lat: 18.9000, lon: 81.3500, name: "Dantewada" },
    "Dhamtari": { lat: 20.6500, lon: 81.4500, name: "Dhamtari" },
    "Durg": { lat: 21.1900, lon: 81.2900, name: "Durg" },
    "Gariaband": { lat: 20.3000, lon: 82.1000, name: "Gariaband" },
    "Janjgir-Champa": { lat: 21.8667, lon: 82.6000, name: "Janjgir-Champa" },
    "Jashpur": { lat: 22.6000, lon: 83.9000, name: "Jashpur" },
    "Kabirdham": { lat: 22.3500, lon: 81.2500, name: "Kabirdham" },
    "Kanker": { lat: 20.2667, lon: 81.5000, name: "Kanker" },
    "Kondagaon": { lat: 19.6000, lon: 81.6500, name: "Kondagaon" },
    "Korba": { lat: 22.3500, lon: 82.6500, name: "Korba" },
    "Koriya": { lat: 23.2000, lon: 82.7500, name: "Koriya" },
    "Mahasamund": { lat: 21.1000, lon: 82.1000, name: "Mahasamund" },
    "Mungeli": { lat: 22.0667, lon: 81.5500, name: "Mungeli" },
    "Narayanpur": { lat: 18.3333, lon: 81.3333, name: "Narayanpur" },
    "Raigarh": { lat: 21.9000, lon: 83.4000, name: "Raigarh" },
    "Raipur": { lat: 21.2514, lon: 81.6296, name: "Raipur" },
    "Rajnandgaon": { lat: 21.1000, lon: 81.0300, name: "Rajnandgaon" },
    "Sukma": { lat: 18.4000, lon: 81.9000, name: "Sukma" },
    "Surajpur": { lat: 23.2000, lon: 82.9000, name: "Surajpur" },
    "Surguja": { lat: 23.2000, lon: 83.2000, name: "Surguja" },
    "Uttar Bastar Kanker": { lat: 19.0000, lon: 81.0000, name: "Uttar Bastar Kanker" },


    // Delhi
    "Central Delhi": { lat: 28.6448, lon: 77.2167, name: "Delhi" },
    "East Delhi": { lat: 28.6692, lon: 77.3150, name: "East Delhi" },
    "North Delhi": { lat: 28.7041, lon: 77.1025, name: "North Delhi" },
    "North East Delhi": { lat: 28.7235, lon: 77.3150, name: "North East Delhi" },
    "North West Delhi": { lat: 28.7266, lon: 77.0684, name: "North West Delhi" },
    "Shahdara": { lat: 28.6667, lon: 77.3167, name: "Shahdara" },
    "West Delhi": { lat: 28.6448, lon: 77.0500, name: "West Delhi" },
    "New Delhi": { lat: 28.6139, lon: 77.2090, name: "New Delhi" },
    "South Delhi": { lat: 28.5355, lon: 77.2500, name: "South Delhi" },
    "South East Delhi": { lat: 28.5244, lon: 77.2699, name: "South East Delhi" },
    "South West Delhi": { lat: 28.4595, lon: 77.0266, name: "South West Delhi" },
    "West Delhi": { lat: 28.6448, lon: 77.0500, name: "West Delhi" },
    
    //Goa
    "North Goa": { lat: 15.6000, lon: 73.8000, name: "North Goa" },
    "South Goa": { lat: 15.2500, lon: 73.9000, name: "South Goa" },
    
    // Gujarat
    "Ahmedabad": { lat: 23.0225, lon: 72.5714, name: "Ahmedabad" },
    "Amreli": { lat: 21.6000, lon: 71.2167, name: "Amreli" },
    "Anand": { lat: 22.5646, lon: 72.9289, name: "Anand" },
    "Aravalli": { lat: 23.4000, lon: 73.2000, name: "Aravalli" },
    "Banaskantha": { lat: 24.2500, lon: 72.4500, name: "Banaskantha" },
    "Bharuch": { lat: 21.7051, lon: 72.9959, name: "Bharuch" },
    "Bhavnagar": { lat: 21.7645, lon: 72.1519, name: "Bhavnagar" },
    "Botad": { lat: 22.1667, lon: 71.6667, name: "Botad" },
    "Chhota Udaipur": { lat: 22.3500, lon: 73.1500, name: "Chhota Udaipur" },
    "Dahod": { lat: 22.8333, lon: 74.2500, name: "Dahod" },
    "Dang": { lat: 20.8500, lon: 73.4500, name: "Dang" },
    "Devbhoomi Dwarka": { lat: 22.2500, lon: 68.9667, name: "Devbhoomi Dwarka" },
    "Gandhinagar": { lat: 23.2156, lon: 72.6369, name: "Gandhinagar" },
    "Gir Somnath": { lat: 20.9000, lon: 70.9000, name: "Gir Somnath" },
    "Jamnagar": { lat: 22.4707, lon: 70.0577, name: "Jamnagar" },
    "Junagadh": { lat: 21.5222, lon: 70.4579, name: "Junagadh" },
    "Kheda": { lat: 22.7500, lon: 72.6833, name: "Kheda" },
    "Mahisagar": { lat: 23.0000, lon: 73.0000, name: "Mahisagar" },
    "Mehsana": { lat: 23.6000, lon: 72.4000, name: "Mehsana" },
    "Morbi": { lat: 22.8167, lon: 70.8333, name: "Morbi" },
    "Narmada": { lat: 21.8000, lon: 73.6000, name: "Narmada" },
    "Navsari": { lat: 20.9467, lon: 72.9522, name: "Navsari" },
    "Panchmahal": { lat: 22.6000, lon: 73.4000, name: "Panchmahal" },
    "Patan": { lat: 23.8500, lon: 72.1000, name: "Patan" },
    "Porbandar": { lat: 21.6417, lon: 69.6097, name: "Porbandar" },
    "Rajkot": { lat: 22.3039, lon: 70.8022, name: "Rajkot" },
    "Sabarkantha": { lat: 23.7000, lon: 73.3000, name: "Sabarkantha" },
    "Surat": { lat: 21.1702, lon: 72.8311, name: "Surat" },
    "Surendranagar": { lat: 22.7179, lon: 71.6476, name: "Surendranagar" },
    "Tapi": { lat: 21.3833, lon: 73.4500, name: "Tapi" },
    "Vadodara": { lat: 22.3072, lon: 73.1812, name: "Vadodara" },
    "Valsad": { lat: 20.5996, lon: 72.9342, name: "Valsad" },




    //Haryana
    "Ambala": { lat: 30.3782, lon: 76.7767, name: "Ambala" },
    "Bhiwani": { lat: 28.7910, lon: 76.1396, name: "Bhiwani" },
    "Charkhi Dadri": { lat: 28.6167, lon: 76.2833, name: "Charkhi Dadri" },
    "Faridabad": { lat: 28.4089, lon: 77.3178, name: "Faridabad" },
    "Fatehabad": { lat: 29.5167, lon: 75.4500, name: "Fatehabad" },
    "Gurugram": { lat: 28.4595, lon: 77.0266, name: "Gurugram" },
    "Hisar": { lat: 29.1492, lon: 75.7217, name: "Hisar" },
    "Jhajjar": { lat: 28.6070, lon: 76.6576, name: "Jhajjar" },
    "Jind": { lat: 29.3167, lon: 76.3167, name: "Jind" },
    "Kaithal": { lat: 29.8000, lon: 76.4000, name: "Kaithal" },
    "Karnal": { lat: 29.6857, lon: 76.9905, name: "Karnal" },
    "Kurukshetra": { lat: 29.9690, lon: 76.8783, name: "Kurukshetra" },
    "Mahendragarh": { lat: 28.2833, lon: 76.1500, name: "Mahendragarh" },
    "Nuh": { lat: 28.1000, lon: 77.0500, name: "Nuh" },
    "Palwal": { lat: 28.1486, lon: 77.3320, name: "Palwal" },
    "Panchkula": { lat: 30.6946, lon: 76.8533, name: "Panchkula" },
    "Panipat": { lat: 29.3909, lon: 76.9635, name: "Panipat" },
    "Rewari": { lat: 28.2000, lon: 76.6167, name: "Rewari" },
    "Rohtak": { lat: 28.8955, lon: 76.6066, name: "Rohtak" },
    "Sirsa": { lat: 29.5333, lon: 75.0333, name: "Sirsa" },
    "Sonipat": { lat: 29.0249, lon: 77.0164, name: "Sonipat" },
    "Yamunanagar": { lat: 30.1290, lon: 77.2674, name: "Yamunanagar" },





    // Himachal Pradesh
    "Bilaspur": { lat: 31.4167, lon: 76.9667, name: "Bilaspur" },
    "Chamba": { lat: 32.5500, lon: 76.1000, name: "Chamba" },
    "Hamirpur": { lat: 31.7000, lon: 76.5167, name: "Hamirpur" },
    "Kangra": { lat: 32.1000, lon: 76.2500, name: "Kangra" },
    "Kinnaur": { lat: 31.6000, lon: 78.2500, name: "Kinnaur" },
    "Kullu": { lat: 31.9667, lon: 77.1333, name: "Kullu" },
    "Lahaul Spiti": { lat: 32.4000, lon: 77.8000, name: "Lahaul Spiti" },
    "Mandi": { lat: 31.7167, lon: 76.9167, name: "Mandi" },
    "Shimla": { lat: 31.1048, lon: 77.1734, name: "Shimla" },
    "Sirmaur": { lat: 30.5500, lon: 77.3000, name: "Sirmaur" },
    "Solan": { lat: 30.9000, lon: 77.1167, name: "Solan" },
    "Una": { lat: 31.4667, lon: 76.2667, name: "Una" },
    

    // Jammu and Kashmir
    "Anantnag": { lat: 33.7300, lon: 75.1500, name: "Anantnag" },
    "Bandipora": { lat: 34.4167, lon: 74.6333, name: "Bandipora" },
    "Baramulla": { lat: 34.2000, lon: 74.3500, name: "Baramulla" },
    "Budgam": { lat: 34.6500, lon: 76.0333, name: "Budgam" },
    "Doda": { lat: 33.1500, lon: 75.4500, name: "Doda" },
    "Ganderbal": { lat: 34.2500, lon: 74.7833, name: "Ganderbal" },
    "Jammu": { lat: 32.7266, lon: 74.8570, name: "Jammu" },
    "Kathua": { lat: 32.3700, lon: 75.5200, name: "Kathua" },
    "Kishtwar": { lat: 33.3110, lon: 75.7700, name: "Kishtwar" },
    "Kulgam": { lat: 33.6400, lon: 75.0200, name: "Kulgam" },
    "Kupwara": { lat: 34.5200, lon: 74.2700, name: "Kupwara" },
    "Poonch": { lat: 33.7700, lon: 74.1000, name: "Poonch" },
    "Pulwama": { lat: 33.8700, lon: 74.8800, name: "Pulwama" },
    "Rajouri": { lat: 33.3800, lon: 74.3000, name: "Rajouri" },
    "Ramban": { lat: 33.2500, lon: 75.1500, name: "Ramban" },
    "Reasi": { lat: 33.1000, lon: 74.8300, name: "Reasi" },
    "Samba": { lat: 32.5050, lon: 75.1230, name: "Samba" },
    "Shopian": { lat: 33.7167, lon: 74.8333, name: "Shopian" },
    "Srinagar": { lat: 34.0837, lon: 74.7973, name: "Srinagar" },
    "Udhampur": { lat: 32.9333, lon: 75.1333, name: "Udhampur" },



    // Jharkhand 
    "Bokaro": { lat: 23.6693, lon: 86.1511, name: "Bokaro" },
    "Chatra": { lat: 24.2000, lon: 84.8667, name: "Chatra" },
    "Deoghar": { lat: 24.4869, lon: 86.7036, name: "Deoghar" },
    "Dhanbad": { lat: 23.7957, lon: 86.4304, name: "Dhanbad" },
    "Dumka": { lat: 24.2670, lon: 87.2667, name: "Dumka" },
    "East Singhbhum": { lat: 22.8000, lon: 86.2000, name: "East Singhbhum" },
    "Garhwa": { lat: 24.1800, lon: 83.8000, name: "Garhwa" },
    "Giridih": { lat: 24.1833, lon: 86.3000, name: "Giridih" },
    "Godda": { lat: 24.8333, lon: 87.2167, name: "Godda" },
    "Gumla": { lat: 23.0500, lon: 84.5333, name: "Gumla" },
    "Hazaribagh": { lat: 24.0000, lon: 85.3500, name: "Hazaribagh" },
    "Jamtara": { lat: 23.9500, lon: 86.8000, name: "Jamtara" },
    "Khunti": { lat: 23.0500, lon: 85.3000, name: "Khunti" },
    "Koderma": { lat: 24.4500, lon: 85.6000, name: "Koderma" },
    "Latehar": { lat: 23.7333, lon: 84.6500, name: "Latehar" },
    "Lohardaga": { lat: 23.4333, lon: 84.6833, name: "Lohardaga" },
    "Pakur": { lat: 24.6333, lon: 87.8333, name: "Pakur" },
    "Palamu": { lat: 24.1000, lon: 84.1500, name: "Palamu" },
    "Ramgarh": { lat: 23.6333, lon: 85.5167, name: "Ramgarh" },
    "Ranchi": { lat: 23.3441, lon: 85.3096, name: "Ranchi" },
    "Sahibganj": { lat: 25.2667, lon: 87.6500, name: "Sahibganj" },
    "Saraikela Kharsawan": { lat: 22.6333, lon: 85.9000, name: "Saraikela Kharsawan" },
    "Simdega": { lat: 22.6167, lon: 84.5667, name: "Simdega" },
    "West Singhbhum": { lat: 22.8000, lon: 85.5500, name: "West Singhbhum" },

    // Karnataka
    "Bagalkot": { lat: 16.1800, lon: 75.6700, name: "Bagalkot" },
    "Belagavi": { lat: 15.8497, lon: 74.4977, name: "Belagavi" },
    "Bellary": { lat: 15.1394, lon: 76.9214, name: "Bellary" },
    "Bengaluru Rural": { lat: 13.1986, lon: 77.7066, name: "Bengaluru Rural" },
    "Belagavi": { lat: 15.8497, lon: 74.4977, name: "Belagavi" },
    "Bengaluru Urban": { lat: 12.9716, lon: 77.5946, name: "Bengaluru" },
    "Bidar": { lat: 17.9133, lon: 77.5294, name: "Bidar" },
    "Chamarajanagar": { lat: 11.9141, lon: 76.9496, name: "Chamarajanagar" },
    "Chikballapur": { lat: 13.4356, lon: 77.7310, name: "Chikballapur" },
    "Chikkamagaluru": { lat: 13.3189, lon: 75.7750, name: "Chikkamagaluru" },
    "Chitradurga": { lat: 14.2330, lon: 76.4000, name: "Chitradurga" },
    "Dakshina Kannada": { lat: 12.9141, lon: 74.8560, name: "Dakshina Kannada" },
    "Davangere": { lat: 14.4644, lon: 75.9217, name: "Davangere" },
    "Dharwad": { lat: 15.4589, lon: 75.0078, name: "Dharwad" },
    "Gadag": { lat: 15.4330, lon: 75.6350, name: "Gadag" },
    "Hassan": { lat: 13.0074, lon: 76.1024, name: "Hassan" },
    "Haveri": { lat: 14.8000, lon: 75.4000, name: "Haveri" },
    "Hubli": { lat: 15.3647, lon: 75.1240, name: "Hubli" },
    "Kalaburagi": { lat: 17.3297, lon: 76.8343, name: "Kalaburagi" },
    "Kodagu": { lat: 12.3375, lon: 75.8069, name: "Kodagu" },
    "Kolar": { lat: 13.1366, lon: 78.1294, name: "Kolar" },
    "Koppal": { lat: 15.3450, lon: 76.1544, name: "Koppal" },
    "Mandya": { lat: 12.5211, lon: 76.8970, name: "Mandya" },
    "Mysuru": { lat: 12.2958, lon: 76.6394, name: "Mysuru" },
    "Raichur": { lat: 16.2043, lon: 77.3450, name: "Raichur" },
    "Ramanagara": { lat: 12.7026, lon: 77.3178, name: "Ramanagara" },
    "Shivamogga": { lat: 13.9299, lon: 75.5681, name: "Shivamogga" },
    "Tumakuru": { lat: 13.3392, lon: 77.1130, name: "Tumakuru" },
    "Udupi":{lat: 13.3409, lon: 74.7421, name: "Udupi" },
    "Uttara Kannada": { lat: 14.6150, lon: 74.3144, name: "Uttara Kannada" },
    "Vijayapura": { lat: 16.8302, lon: 75.7100, name: "Vijayapura" },
    "Yadgir": { lat: 16.7685, lon: 77.1376, name: "Yadgir" },
    
    // Kerala
    "Alappuzha": { lat: 9.4981, lon: 76.3388, name: "Alappuzha" },
    "Ernakulam": { lat: 9.9816, lon: 76.2999, name: "Ernakulam" },
    "Idukki": { lat: 9.9187, lon: 77.1025, name: "Idukki" },
    "Kannur": { lat: 11.8745, lon: 75.3704, name: "Kannur" },
    "Kasaragod": { lat: 12.4996, lon: 74.9869, name: "Kasaragod" },
    "Kollam": { lat: 8.8932, lon: 76.6141, name: "Kollam" },
    "Kottayam": { lat: 9.5916, lon: 76.5222, name: "Kottayam" },
    "Kozhikode": { lat: 11.2588, lon: 75.7804, name: "Kozhikode" },
    "Malappuram": { lat: 11.0510, lon: 76.0711, name: "Malappuram" },
    "Palakkad": { lat: 10.7867, lon: 76.6548, name: "Palakkad" },
    "Pathanamthitta": { lat: 9.2648, lon: 76.7870, name: "Pathanamthitta" },
    "Thiruvananthapuram": { lat: 8.5241, lon: 76.9366, name: "Thiruvananthapuram" },
    "Thrissur": { lat: 10.5276, lon: 76.2144, name: "Thrissur" },
    "Wayanad": { lat: 11.6854, lon: 76.1320, name: "Wayanad" },



    //Ladakh
    "Kargil": { lat: 34.5600, lon: 76.1300, name: "Kargil" },
    "Leh": { lat: 34.1526, lon: 77.5770, name: "Leh" },


    //Madhya Pradesh
    "Agar Malwa": { lat: 23.5000, lon: 76.2500, name: "Agar Malwa" },
    "Alirajpur": { lat: 22.3833, lon: 74.2833, name: "Alirajpur" },
    "Anuppur": { lat: 23.1000, lon: 81.6833, name: "Anuppur" },
    "Ashoknagar": { lat: 24.5667, lon: 77.7333, name: "Ashoknagar" },
    "Balaghat": { lat: 21.8000, lon: 80.1833, name: "Balaghat" },
    "Barwani": { lat: 22.0333, lon: 74.9000, name: "Barwani" },
    "Betul": { lat: 21.9167, lon: 77.9000, name: "Betul" },
    "Bhind": { lat: 26.5667, lon: 78.7833, name: "Bhind" },
    "Bhopal": { lat: 23.2599, lon: 77.4126, name: "Bhopal" },
    "Burhanpur": { lat: 21.3000, lon: 76.2500, name: "Burhanpur" },
    "Chhatarpur": { lat: 24.9000, lon: 79.6000, name: "Chhatarpur" },
    "Chhindwara": { lat: 22.0574, lon: 78.9382, name: "Chhindwara" },
    "Damoh": { lat: 23.8333, lon: 79.4500, name: "Damoh" },
    "Datia": { lat: 25.6667, lon: 78.4667, name: "Datia" },
    "Dewas": { lat: 22.9667, lon: 76.0500, name: "Dewas" },
    "Dhar": { lat: 22.6000, lon: 75.3000, name: "Dhar" },
    "Dindori": { lat: 22.9500, lon: 81.2000, name: "Dindori" },
    "Guna": { lat: 24.6500, lon: 77.3000, name: "Guna" },
    "Gwalior": { lat: 26.2183, lon: 78.1828, name: "Gwalior" },
    "Harda": { lat: 22.3500, lon: 77.0500, name: "Harda" },
    "Hoshangabad": { lat: 22.7500, lon: 77.7333, name: "Hoshangabad" },
    "Indore": { lat: 22.7196, lon: 75.8577, name: "Indore" },
    "Jabalpur": { lat: 23.1667, lon: 79.9333, name: "Jabalpur" },
    "Jhabua": { lat: 22.7500, lon: 74.6000, name: "Jhabua" },
    "Katni": { lat: 23.8333, lon: 80.4000, name: "Katni" },
    "Khandwa": { lat: 21.8333, lon: 76.3500, name: "Khandwa" },
    "Khargone": { lat: 21.8167, lon: 75.6167, name: "Khargone" },
    "Mandla": { lat: 22.6000, lon: 80.3500, name: "Mandla" },
    "Mandsaur": { lat: 24.0500, lon: 75.1000, name: "Mandsaur" },
    "Morena": { lat: 26.5000, lon: 78.0000, name: "Morena" },
    "Narsinghpur": { lat: 22.9500, lon: 79.2000, name: "Narsinghpur" },
    "Neemuch": { lat: 24.4667, lon: 74.8667, name: "Neemuch" },
    "Panna": { lat: 24.7000, lon: 80.2000, name: "Panna" },
    "Raisen": { lat: 23.4000, lon: 77.5500, name: "Raisen" },
    "Rajgarh": { lat: 24.8500, lon: 76.5500, name: "Rajgarh" },
    "Ratlam": { lat: 23.3333, lon: 75.0333, name: "Ratlam" },
    "Rewa": { lat: 24.5333, lon: 81.3000, name: "Rewa" },
    "Sagar": { lat: 23.8333, lon: 78.7333, name: "Sagar" },
    "Satna": { lat: 24.6000, lon: 80.8333, name: "Satna" },
    "Sehore": { lat: 23.2000, lon: 77.0833, name: "Sehore" },
    "Seoni": { lat: 22.0833, lon: 79.5167, name: "Seoni" },


    // Maharashtra
    "Ahmednagar": { lat: 19.0952, lon: 74.7496, name: "Ahmednagar" },
    "Akola": { lat: 20.7050, lon: 77.0011, name: "Akola" },
    "Amravati": { lat: 20.9333, lon: 77.7500, name: "Amravati" },
    "Aurangabad": { lat: 19.8762, lon: 75.3433, name: "Aurangabad" },
    "Beed": { lat: 18.9904, lon: 75.7600, name: "Beed" },
    "Bhandara": { lat: 21.1800, lon: 79.5500, name: "Bhandara" },
    "Buldhana": { lat: 20.5333, lon: 76.1833, name: "Buldhana" },
    "Chandrapur": { lat: 19.9600, lon: 79.3000, name: "Chandrapur" },
    "Dhule": { lat: 20.9042, lon: 74.7746, name: "Dhule" },
    "Gadchiroli": { lat: 19.9800, lon: 80.1000, name: "Gadchiroli" },
    "Gondia": { lat: 21.4580, lon: 80.1980, name: "Gondia" },
    "Hingoli": { lat: 19.7167, lon: 77.1500, name: "Hingoli" },
    "Jalgaon": { lat: 21.0077, lon: 75.5626, name: "Jalgaon" },
    "Jalna": { lat: 19.8410, lon: 75.8860, name: "Jalna" },
    "Kolhapur": { lat: 16.7050, lon: 74.2433, name: "Kolhapur" },
    "Latur": { lat: 18.4083, lon: 76.5600, name: "Latur" },
    "Mumbai": { lat: 19.0760, lon: 72.8777, name: "Mumbai" },
    "Nashik": { lat: 19.9975, lon: 73.7898, name: "Nashik" },
    "Nagpur": { lat: 21.1458, lon: 79.0882, name: "Nagpur" },
    "Nanded": { lat: 19.1526, lon: 77.3210, name: "Nanded" },
    "Osmanabad": { lat: 18.1833, lon: 76.0500, name: "Osmanabad" },
    "Parbhani": { lat: 19.2700, lon: 76.7700, name: "Parbhani" },
    "Pune": { lat: 18.5204, lon: 73.8567, name: "Pune" },
    "Raigad": { lat: 18.2500, lon: 73.2000, name: "Raigad" },
    "Ratnagiri": { lat: 16.9902, lon: 73.3000, name: "Ratnagiri" },
    "Sangli": { lat: 16.8526, lon: 74.5644, name: "Sangli" },
    "Satara": { lat: 17.6800, lon: 73.9900, name: "Satara" },
    "Sindhudurg": { lat: 15.9900, lon: 73.7500, name: "Sindhudurg" },
    "Solapur": { lat: 17.6599, lon: 75.9064, name: "Solapur" },
    "Thane": { lat: 19.2183, lon: 72.9781, name: "Thane" },
    "Wardha": { lat: 20.7450, lon: 78.6022, name: "Wardha" },
    "Washim": { lat: 20.1000, lon: 76.1000, name: "Washim" },
    "Yavatmal": { lat: 20.3880, lon: 78.1300, name: "Yavatmal" },


    //Manipur
    "Bishnupur": { lat: 24.6333, lon: 93.2167, name: "Bishnupur" },
    "Churachandpur": { lat: 24.3333, lon: 93.8333, name: "Churachandpur" },
    "Imphal East": { lat: 24.8170, lon: 93.9500, name: "Imphal East" },
    "Imphal West": { lat: 24.8170, lon: 93.9333, name: "Imphal West" },
    "Jiribam": { lat: 24.5833, lon: 93.1667, name: "Jiribam" },
    "Kakching": { lat: 24.5000, lon: 93.8833, name: "Kakching" },
    "Kamjong": { lat: 24.5000, lon: 94.3333, name: "Kamjong" },
    "Kangpokpi": { lat: 24.5000, lon: 93.8833, name: "Kangpokpi" },
    "Noney": { lat: 24.4333, lon: 93.9167, name: "Noney" },
    "Pherzawl": { lat: 24.1833, lon: 93.2000, name: "Pherzawl" },
    "Senapati": { lat: 25.1000, lon: 94.1167, name: "Senapati" },
    "Tamenglong": { lat: 24.5500, lon: 93.8333, name: "Tamenglong" },
    "Tengnoupal": { lat: 24.3667, lon: 94.1000, name: "Tengnoupal" },
    "Thoubal": { lat: 24.5833, lon: 93.9167, name: "Thoubal" },
    "Ukhrul": { lat: 25.1167, lon: 94.3667, name: "Ukhrul" },

    // "Meghalaya"
    "East Garo Hills": { lat: 25.5000, lon: 90.0000, name: "East Garo Hills" },
    "East Jaintia Hills": { lat: 25.5000, lon: 91.8333, name: "East Jaintia Hills" },
    "East Khasi Hills": { lat: 25.5667, lon: 91.8833, name: "East Khasi Hills" },
    "North Garo Hills": { lat: 26.0000, lon: 90.0000, name: "North Garo Hills" },
    "Ri Bhoi": { lat: 25.6667, lon: 91.8333, name: "Ri Bhoi" },
    "South Garo Hills": { lat: 25.2500, lon: 90.0000, name: "South Garo Hills" },
    "South West Garo Hills": { lat: 25.0000, lon: 90.0000, name: "South West Garo Hills" },
    "South West Khasi Hills": { lat: 25.3333, lon: 91.5000, name: "South West Khasi Hills" },
    "West Garo Hills": { lat: 25.5000, lon: 90.0000, name: "West Garo Hills" },
    "West Jaintia Hills": { lat: 25.5000, lon: 91.8333, name: "West Jaintia Hills" },
    "West Khasi Hills": { lat: 25.5000, lon: 91.5000, name: "West Khasi Hills" },
    
    
    
    // "Mizoram"
    "Aizawl": { lat: 23.7271, lon: 92.7176, name: "Aizawl" },
    "Champhai": { lat: 23.6820, lon: 93.2540, name: "Champhai" },
    "Kolasib": { lat: 23.5220, lon: 92.7640, name: "Kolasib" },
    "Lawngtlai": { lat: 22.5180, lon: 92.8400, name: "Lawngtlai" },
    "Lunglei": { lat: 22.9140, lon: 92.7870, name: "Lunglei" },
    "Mamit": { lat: 23.0500, lon: 92.5000, name: "Mamit" },
    "Saiha": { lat: 22.4700, lon: 92.9700, name: "Saiha" },
    "Serchhip": { lat: 23.3000, lon: 92.8000, name: "Serchhip" },

    // "Nagaland"
    "Dimapur": { lat: 25.9040, lon: 93.7266, name: "Dimapur" },
    "Kiphire": { lat: 25.9000, lon: 94.8000, name: "Kiphire" },
    "Kohima": { lat: 25.6740, lon: 94.1100, name: "Kohima" },
    "Longleng": { lat: 26.1000, lon: 94.5000, name: "Longleng" },
    "Mokokchung": { lat: 26.3200, lon: 94.5300, name: "Mokokchung" },
    "Mon": { lat: 26.3000, lon: 94.8300, name: "Mon" },
    "Peren": { lat: 25.6000, lon: 93.8000, name: "Peren" },
    "Phek": { lat: 25.5500, lon: 94.3000, name: "Phek" },
    "Tuensang": { lat: 26.3200, lon: 94.8200, name: "Tuensang" },
    "Wokha": { lat: 26.1000, lon: 94.2000, name: "Wokha" },
    "Zunheboto": { lat: 26.0500, lon: 94.5300, name: "Zunheboto" },
    
    
    // "Odisha"
    "Angul": { lat: 20.8497, lon: 85.1016, name: "Angul" },
    "Balangir": { lat: 20.7100, lon: 83.4900, name: "Balangir" },
    "Balasore": { lat: 21.4900, lon: 86.9300, name: "Balasore" },
    "Bargarh": { lat: 21.3500, lon: 83.6200, name: "Bargarh" },
    "Bhadrak": { lat: 21.0600, lon: 86.7500, name: "Bhadrak" },
    "Boudh": { lat: 20.8300, lon: 84.4300, name: "Boudh" },
    "Cuttack": { lat: 20.4625, lon: 85.8828, name: "Cuttack" },
    "Deogarh": { lat: 21.4900, lon: 84.4800, name: "Deogarh" },
    "Dhenkanal": { lat: 20.6600, lon: 85.6000, name: "Dhenkanal" },
    "Gajapati": { lat: 19.0700, lon: 84.1000, name: "Gajapati" },
    "Ganjam": { lat: 19.3700, lon: 84.8300, name: "Ganjam" },
    "Jagatsinghpur": { lat: 20.2700, lon: 86.1700, name: "Jagatsinghpur" },
    "Jajpur": { lat: 20.8500, lon: 86.3500, name: "Jajpur" },
    "Jharsuguda": { lat: 21.8500, lon: 84.0000, name: "Jharsuguda" },
    "Kalahandi": { lat: 19.9000, lon: 83.2000, name: "Kalahandi" },
    "Kandhamal": { lat: 20.5000, lon: 84.0500, name: "Kandhamal" },
    "Kendrapara": { lat: 20.5000, lon: 86.4500, name: "Kendrapara" },
    "Kendujhar": { lat: 22.1000, lon: 85.6000, name: "Kendujhar" },
    "Khordha": { lat: 20.1800, lon: 85.6200, name: "Khordha" },
    "Koraput": { lat: 18.8200, lon: 82.7200, name: "Koraput" },
    "Malkangiri": { lat: 18.3500, lon: 81.8500, name: "Malkangiri" },
    "Mayurbhanj": { lat: 22.1000, lon: 86.3500, name: "Mayurbhanj" },
    "Nabarangpur": { lat: 19.2500, lon: 82.5500, name: "Nabarangpur" },
    "Nayagarh": { lat: 20.1300, lon: 85.1000, name: "Nayagarh" },
    "Nuapada": { lat: 20.2500, lon: 82.8000, name: "Nuapada" },
    "Puri": { lat: 19.8000, lon: 85.8300, name: "Puri" },
    "Rayagada": { lat: 19.1700, lon: 83.4167, name: "Rayagada" },
    "Sambalpur": { lat: 21.4700, lon: 83.9700, name: "Sambalpur" },
    "Subarnapur": { lat: 21.4300, lon: 83.8700, name: "Subarnapur" },
    "Sundargarh": { lat: 22.1200, lon: 84.0200, name: "Sundargarh" },
    
    
    
    
    // "Puducherry"
    "Karaikal": { lat: 10.9252, lon: 79.8380, name: "Karaikal" },
    "Mahe": { lat: 11.7010, lon: 75.5400, name: "Mahe" },
    "Puducherry": { lat: 11.9416, lon: 79.8083, name: "Puducherry" },
    "Yanam": { lat: 16.7333, lon: 82.2167, name: "Yanam" },

    // "Punjab" 
    "Amritsar": { lat: 31.6340, lon: 74.8723, name: "Amritsar" },
    "Barnala": { lat: 30.3782, lon: 75.5520, name: "Barnala" },
    "Bathinda": { lat: 30.2110, lon: 74.9455, name: "Bathinda" },
    "Faridkot": { lat: 30.6786, lon: 74.7560, name: "Faridkot" },
    "Fatehgarh Sahib": { lat: 30.6890, lon: 76.3980, name: "Fatehgarh Sahib" },
    "Fazilka": { lat: 30.4030, lon: 74.0280, name: "Fazilka" },
    "Ferozepur": { lat: 30.9230, lon: 74.6130, name: "Ferozepur" },
    "Gurdaspur": { lat: 32.0410, lon: 75.4050, name: "Gurdaspur" },
    "Hoshiarpur": { lat: 31.5320, lon: 75.9120, name: "Hoshiarpur" },
    "Jalandhar": { lat: 31.3260, lon: 75.5762, name: "Jalandhar" },
    "Kapurthala": { lat: 31.3800, lon: 75.3800, name: "Kapurthala" },
    "Ludhiana": { lat: 30.9010, lon: 75.8573, name: "Ludhiana" },
    "Mansa": { lat: 29.9980, lon: 75.4000, name: "Mansa" },
    "Moga": { lat: 30.8160, lon: 75.1700, name: "Moga" },
    "Muktsar": { lat: 30.4750, lon: 74.5150, name: "Muktsar" },
    "Nawanshahr": { lat: 31.1190, lon: 76.1180, name: "Nawanshahr" },
    "Pathankot": { lat: 32.2730, lon: 75.6520, name: "Pathankot" },
    "Patiala": { lat: 30.3398, lon: 76.3869, name: "Patiala" },
    "Rupnagar": { lat: 30.9660, lon: 76.5330, name: "Rupnagar" },
    "Sangrur": { lat: 30.2450, lon: 75.8420, name: "Sangrur" },
    "Shaheed Bhagat Singh Nagar": { lat: 31.1190, lon: 76.1180, name: "Shaheed Bhagat Singh Nagar" },
    "Tarn Taran": { lat: 31.4500, lon: 74.9500, name: "Tarn Taran" },
    
    
    
    
    // "Rajasthan"
    "Ajmer": { lat: 26.4499, lon: 74.6399, name: "Ajmer" },
    "Alwar": { lat: 27.5600, lon: 76.6200, name: "Alwar" },
    "Banswara": { lat: 23.5460, lon: 74.4320, name: "Banswara" },
    "Baran": { lat: 25.1000, lon: 76.5000, name: "Baran" },
    "Barmer": { lat: 25.7500, lon: 71.4000, name: "Barmer" },
    "Bharatpur": { lat: 27.2170, lon: 77.4900, name: "Bharatpur" },
    "Bhilwara": { lat: 25.3500, lon: 74.6300, name: "Bhilwara" },
    "Bikaner": { lat: 28.0229, lon: 73.3119, name: "Bikaner" },
    "Bundi": { lat: 25.4333, lon: 75.6500, name: "Bundi" },
    "Chittorgarh": { lat: 24.8880, lon: 74.6260, name: "Chittorgarh" },
    "Churu": { lat: 28.3000, lon: 74.9667, name: "Churu" },
    "Dausa": { lat: 26.8833, lon: 76.3000, name: "Dausa" },
    "Dholpur": { lat: 26.7000, lon: 77.9000, name: "Dholpur" },
    "Dungarpur": { lat: 23.8333, lon: 74.6500, name: "Dungarpur" },
    "Hanumangarh": { lat: 29.5820, lon: 74.3290, name: "Hanumangarh" },
    "Jaipur": { lat: 26.9124, lon: 75.7873, name: "Jaipur" },
    "Jaisalmer": { lat: 26.9157, lon: 70.9083, name: "Jaisalmer" },
    "Jalore": { lat: 25.3500, lon: 72.6167, name: "Jalore" },
    "Jhalawar": { lat: 24.6000, lon: 76.1667, name: "Jhalawar" },
    "Jhunjhunu": { lat: 28.1300, lon: 75.4000, name: "Jhunjhunu" },
    "Jodhpur": { lat: 26.2389, lon: 73.0243, name: "Jodhpur" },
    "Karauli": { lat: 26.5000, lon: 77.0000, name: "Karauli" },
    "Kota": { lat: 25.2138, lon: 75.8648, name: "Kota" },
    "Nagaur": { lat: 27.2000, lon: 73.7300, name: "Nagaur" },
    "Pali": { lat: 25.7720, lon: 73.3230, name: "Pali" },
    "Pratapgarh": { lat: 24.0300, lon: 74.8500, name: "Pratapgarh" },
    "Rajsamand": { lat: 25.1000, lon: 73.8800, name: "Rajsamand" },
    "Sawai Madhopur": { lat: 26.0170, lon: 76.3500, name: "Sawai Madhopur" },
    "Sikar": { lat: 27.6094, lon: 75.1396, name: "Sikar" },
    "Sirohi": { lat: 24.8833, lon: 73.0300, name: "Sirohi" },
    "Sri Ganganagar": { lat: 29.9030, lon: 73.8770, name: "Sri Ganganagar" },
    "Tonk": { lat: 26.1667, lon: 75.8000, name: "Tonk" },
    "Udaipur": { lat: 24.5854, lon: 73.7125, name: "Udaipur" },
    
    
    
    
    
    // "Sikkim"
    "East Sikkim": { lat: 27.2114, lon: 88.6366, name: "East Sikkim" },
    "North Sikkim": { lat: 28.0000, lon: 88.5000, name: "North Sikkim" },
    "South Sikkim": { lat: 27.1000, lon: 88.3000, name: "South Sikkim" },
    "West Sikkim": { lat: 27.3000, lon: 88.2000, name: "West Sikkim" },
    
    
    // Tamil Nadu
    "Ariyalur": { lat: 11.1400, lon: 79.2900, name: "Ariyalur" },
    "Chengalpattu": { lat: 12.6870, lon: 79.9865, name: "Chengalpattu" },
    "Chennai": { lat: 13.0827, lon: 80.2707, name: "Chennai" },
    "Coimbatore": { lat: 11.0168, lon: 76.9558, name: "Coimbatore" },
    "Cuddalore": { lat: 11.7486, lon: 79.7645, name: "Cuddalore" },
    "Dharmapuri": { lat: 12.1264, lon: 78.1574, name: "Dharmapuri" },
    "Dindigul": { lat: 10.3670, lon: 77.9800, name: "Dindigul" },
    "Erode": { lat: 11.3410, lon: 77.7172, name: "Erode" },
    "Kallakurichi": { lat: 11.7350, lon: 78.9580, name: "Kallakurichi" },
    "Kanchipuram": { lat: 12.8342, lon: 79.7036, name: "Kanchipuram" },
    "Kanyakumari": { lat: 8.0883, lon: 77.5385, name: "Kanyakumari" },
    "Karur": { lat: 10.9601, lon: 78.0766, name: "Karur" },
    "Krishnagiri": { lat: 12.5190, lon: 78.2138, name: "Krishnagiri" },
    "Madurai": { lat: 9.9252, lon: 78.1198, name: "Madurai" },
    "Mayiladuthurai": { lat: 11.1030, lon: 79.6520, name: "Mayiladuthurai" },
    "Nagapattinam": { lat: 10.7676, lon: 79.8428, name: "Nagapattinam" },
    "Namakkal": { lat: 11.2180, lon: 78.1674, name: "Namakkal" },
    "Nilgiris": { lat: 11.4064, lon: 76.6950, name: "Nilgiris" },
    "Perambalur": { lat: 11.2333, lon: 78.8667, name: "Perambalur" },
    "Pudukkottai": { lat: 10.3810, lon: 78.8200, name: "Pudukkottai" },
    "Ramanathapuram": { lat: 9.3667, lon: 78.8333, name: "Ramanathapuram" },
    "Ranipet": { lat: 12.9730, lon: 79.3030, name: "Ranipet" },
    "Salem": { lat: 11.6643, lon: 78.1460, name: "Salem" },
    "Sivaganga": { lat: 9.8470, lon: 78.4830, name: "Sivaganga" },
    "Tenkasi": { lat: 8.9644, lon: 77.3150, name: "Tenkasi" },
    "Thanjavur": { lat: 10.7870, lon: 79.1378, name: "Thanjavur" },
    "Theni": { lat: 10.0167, lon: 77.4833, name: "Theni" },
    "Thoothukudi": { lat: 8.7642, lon: 78.1348, name: "Thoothukudi" },
    "Tiruchirappalli": { lat: 10.7905, lon: 78.7047, name: "Tiruchirappalli" },
    "Tirunelveli": { lat: 8.7139, lon: 77.7564, name: "Tirunelveli" },
    "Tirupathur": { lat: 12.5150, lon: 78.5690, name: "Tirupathur" },
    "Tiruppur": { lat: 11.1085, lon: 77.3411, name: "Tiruppur" },
    "Tiruvallur": { lat: 13.1014, lon: 79.9663, name: "Tiruvallur" },
    "Tiruvannamalai": { lat: 12.2253, lon: 79.0747, name: "Tiruvannamalai" },
    "Tiruvarur": { lat: 10.7667, lon: 79.6333, name: "Tiruvarur" },
    "Vellore": { lat: 12.9165, lon: 79.1325, name: "Vellore" },
    "Viluppuram": { lat: 11.9400, lon: 79.4900, name: "Viluppuram" },
    "Virudhunagar": { lat: 9.5760, lon: 77.9575, name: "Virudhunagar" },
    
    
    // "Telangana"
    "Adilabad": { lat: 19.6667, lon: 78.5333, name: "Adilabad" },
    "Bhadradri Kothagudem": { lat: 17.5500, lon: 80.6500, name: "Bhadradri Kothagudem" },
    "Hyderabad": { lat: 17.3850, lon: 78.4867, name: "Hyderabad" },
    "Jagtial": { lat: 18.8000, lon: 78.9200, name: "Jagtial" },
    "Jangaon": { lat: 17.7200, lon: 79.1700, name: "Jangaon" },
    "Jayashankar Bhupalpally": { lat: 18.5500, lon: 79.6000, name: "Jayashankar Bhupalpally" },
    "Jogulamba Gadwal": { lat: 16.3000, lon: 77.8000, name: "Jogulamba Gadwal" },
    "Kamareddy": { lat: 18.3200, lon: 78.3400, name: "Kamareddy" },
    "Karimnagar": { lat: 18.4386, lon: 79.1288, name: "Karimnagar" },
    "Khammam": { lat: 17.2473, lon: 80.1514, name: "Khammam" },
    "Komaram Bheem Asifabad": { lat: 19.3500, lon: 79.5500, name: "Komaram Bheem Asifabad" },
    "Mahabubabad": { lat: 17.5500, lon: 80.6500, name: "Mahabubabad" },
    "Mahabubnagar": { lat: 16.7333, lon: 77.9833, name: "Mahabubnagar" },
    "Mancherial": { lat: 19.2667, lon: 79.4500, name: "Mancherial" },
    "Medak": { lat: 18.0000, lon: 78.2667, name: "Medak" },
    "Medchal-Malkajgiri": { lat: 17.5300, lon: 78.5700, name: "Medchal-Malkajgiri" },
    "Mulugu": { lat: 18.0833, lon: 80.6000, name: "Mulugu" },
    "Nagarkurnool": { lat: 16.1667, lon: 78.3000, name: "Nagarkurnool" },
    "Nalgonda": { lat: 17.0500, lon: 79.2667, name: "Nalgonda" },
    "Narayanpet": { lat: 16.8667, lon: 77.9833, name: "Narayanpet" },
    "Nirmal": { lat: 19.1000, lon: 78.3500, name: "Nirmal" },
    "Nizamabad": { lat: 18.6700, lon: 78.1000, name: "Nizamabad" },
    "Peddapalli": { lat: 18.6100, lon: 79.4000, name: "Peddapalli" },
    "Rajanna Sircilla": { lat: 18.8000, lon: 78.8300, name: "Rajanna Sircilla" },
    "Rangareddy": { lat: 17.3000, lon: 78.4000, name: "Rangareddy" },
    "Sangareddy": { lat: 17.6000, lon: 78.1000, name: "Sangareddy" },
    "Siddipet": { lat: 18.1000, lon: 78.8500, name: "Siddipet" },
    "Suryapet": { lat: 17.1500, lon: 79.6000, name: "Suryapet" },
    "Vikarabad": { lat: 17.3300, lon: 77.9000, name: "Vikarabad" },
    "Wanaparthy": { lat: 16.3000, lon: 78.0300, name: "Wanaparthy" },
    "Warangal Rural": { lat: 17.9700, lon: 79.6000, name: "Warangal Rural" },
    "Warangal Urban": { lat: 17.9700, lon: 79.6000, name: "Warangal Urban" },
    "Yadadri Bhuvanagiri": { lat: 17.5000, lon: 78.9000, name: "Yadadri Bhuvanagiri" },
    
    
    
    // "Tripura"
    "Dhalai": { lat: 23.8333, lon: 91.9167, name: "Dhalai" },
    "Gomati": { lat: 23.5000, lon: 91.5000, name: "Gomati" },
    "Khowai": { lat: 24.0000, lon: 91.5000, name: "Khowai" },
    "North Tripura": { lat: 24.3333, lon: 91.7500, name: "North Tripura" },
    "Sepahijala": { lat: 23.3333, lon: 91.5000, name: "Sepahijala" },
    "South Tripura": { lat: 23.0000, lon: 91.5000, name: "South Tripura" },
    "Unakoti": { lat: 24.0000, lon: 91.0000, name: "Unakoti" },
    "West Tripura": { lat: 23.5000, lon: 91.2500, name: "West Tripura" },
   
   
    // "Uttar Pradesh
    "Agra": { lat: 27.1767, lon: 78.0081, name: "Agra" },
    "Aligarh": { lat: 27.8974, lon: 78.0880, name: "Aligarh" },
    "Allahabad": { lat: 25.4358, lon: 81.8463, name: "Allahabad" },
    "Ambedkar Nagar": { lat: 26.5094, lon: 82.1860, name: "Ambedkar Nagar" },
    "Amethi": { lat: 26.1545, lon: 81.9016, name: "Amethi" },
    "Amroha": { lat: 28.9195, lon: 78.4724, name: "Amroha" },
    "Auraiya": { lat: 26.7483, lon: 79.4855, name: "Auraiya" },
    "Azamgarh": { lat: 26.0736, lon: 83.1859, name: "Azamgarh" },
    "Baghpat": { lat: 28.9445, lon: 77.3910, name: "Baghpat" },
    "Bahraich": { lat: 27.5744, lon: 81.6005, name: "Bahraich" },
    "Ballia": { lat: 25.7560, lon: 84.1486, name: "Ballia" },
    "Balrampur": { lat: 27.4400, lon: 82.1833, name: "Balrampur" },
    "Banda": { lat: 25.4900, lon: 80.3300, name: "Banda" },
    "Barabanki": { lat: 26.9300, lon: 81.2000, name: "Barabanki" },
    "Bareilly": { lat: 28.3670, lon: 79.4304, name: "Bareilly" },
    "Basti": { lat: 26.7896, lon: 82.6783, name: "Basti" },
    "Bhadohi": { lat: 25.3960, lon: 82.5670, name: "Bhadohi" },
    "Bijnor": { lat: 29.3724, lon: 78.1356, name: "Bijnor" },
    "Budaun": { lat: 28.0333, lon: 79.1000, name: "Budaun" },
    "Bulandshahr": { lat: 28.4100, lon: 77.8499, name: "Bulandshahr" },
    "Chandauli": { lat: 25.2667, lon: 83.2833, name: "Chandauli" },
    "Chitrakoot": { lat: 25.2000, lon: 80.9000, name: "Chitrakoot" },
    "Deoria": { lat: 26.4896, lon: 83.7800, name: "Deoria" },
    "Etah": { lat: 27.5700, lon: 78.6700, name: "Etah" },
    "Etawah": { lat: 26.7850, lon: 79.0150, name: "Etawah" },
    "Faizabad": { lat: 26.7606, lon: 82.1350, name: "Faizabad" },
    "Farrukhabad": { lat: 27.3900, lon: 79.5800, name: "Farrukhabad" },
    "Fatehpur": { lat: 25.9300, lon: 80.8100, name: "Fatehpur" },
    "Firozabad": { lat: 27.1500, lon: 78.3947, name: "Firozabad" },
    "Gautam Buddha Nagar": { lat: 28.4744, lon: 77.5033, name: "Gautam Buddha Nagar" },
    "Ghaziabad": { lat: 28.6692, lon: 77.4538, name: "Ghaziabad" },
    "Ghazipur": { lat: 25.5833, lon: 83.5800, name: "Ghazipur" },
    "Gonda": { lat: 27.1333, lon: 81.9500, name: "Gonda" },
    "Gorakhpur": { lat: 26.7606, lon: 83.3732, name: "Gorakhpur" },
    "Hamirpur": { lat: 25.9500, lon: 80.1500, name: "Hamirpur" },
    "Hapur": { lat: 28.7300, lon: 77.7800, name: "Hapur" },
    "Hardoi": { lat: 27.4000, lon: 80.1300, name: "Hardoi" },
    "Hathras": { lat: 27.6000, lon: 78.0500, name: "Hathras" },
    "Jalaun": { lat: 26.1000, lon: 79.2000, name: "Jalaun" },
    "Jaunpur": { lat: 25.7333, lon: 82.6833, name: "Jaunpur" },
    "Jhansi": { lat: 25.4486, lon: 78.5696, name: "Jhansi" },
    "Kannauj": { lat: 27.0600, lon: 79.9200, name: "Kannauj" },
    "Kanpur Dehat": { lat: 26.4500, lon: 79.9500, name: "Kanpur Dehat" },
    "Kanpur Nagar": { lat: 26.4499, lon: 80.3319, name: "Kanpur Nagar" },
    "Kasganj": { lat: 27.8000, lon: 78.6500, name: "Kasganj" },
    "Kaushambi": { lat: 25.4000, lon: 81.3000, name: "Kaushambi" },
    "Kheri": { lat: 27.8000, lon: 80.3500, name: "Kheri" },
    "Kushinagar": { lat: 26.7400, lon: 83.8900, name: "Kushinagar" },
    "Lalitpur": { lat: 24.7000, lon: 78.4000, name: "Lalitpur" },
    "Lucknow": { lat: 26.8467, lon: 80.9462, name: "Lucknow" },
    "Maharajganj": { lat: 27.1000, lon: 83.1000, name: "Maharajganj" },
    "Mahoba": { lat: 25.3000, lon: 79.9000, name: "Mahoba" },
    "Mainpuri": { lat: 27.2333, lon: 79.0167, name: "Mainpuri" },
    "Mathura": { lat: 27.4924, lon: 77.6737, name: "Mathura" },
    "Mau": { lat: 25.9400, lon: 83.5600, name: "Mau" },
    "Meerut": { lat: 28.9845, lon: 77.7064, name: "Meerut" },
    "Mirzapur": { lat: 25.1500, lon: 82.5800, name: "Mirzapur" },
    "Moradabad": { lat: 28.8386, lon: 78.7736, name: "Moradabad" },
    "Muzaffarnagar": { lat: 29.4724, lon: 77.7036, name: "Muzaffarnagar" },
    "Pilibhit": { lat: 28.6300, lon: 79.8000, name: "Pilibhit" },
    "Pratapgarh": { lat: 26.2000, lon: 81.0000, name: "Pratapgarh" },
    "Raebareli": { lat: 26.2300, lon: 81.2500, name: "Raebareli" },
    "Rampur": { lat: 28.8170, lon: 79.0250, name: "Rampur" },
    "Saharanpur": { lat: 29.9670, lon: 77.5500, name: "Saharanpur" },
    "Sambhal": { lat: 28.5800, lon: 78.5700, name: "Sambhal" },
    "Sant Kabir Nagar": { lat: 26.7500, lon: 83.0500, name: "Sant Kabir Nagar" },
    "Shahjahanpur": { lat: 27.8800, lon: 79.9050, name: "Shahjahanpur" },
    "Shamli": { lat: 29.4500, lon: 77.3000, name: "Shamli" },
    "Shravasti": { lat: 27.5500, lon: 82.0000, name: "Shravasti" },
    "Siddharthnagar": { lat: 27.4333, lon: 83.1000, name: "Siddharthnagar" },
    "Sitapur": { lat: 27.5700, lon: 80.6700, name: "Sitapur" },
    "Sonbhadra": { lat: 24.2000, lon: 83.0000, name: "Sonbhadra" },
    "Sultanpur": { lat: 26.2640, lon: 82.0700, name: "Sultanpur" },
    "Unnao": { lat: 26.5500, lon: 80.5000, name: "Unnao" },
    "Varanasi": { lat: 25.3176, lon: 82.9739, name: "Varanasi" },
    
    
    
    // "Uttarakhand"
    "Almora": { lat: 29.5978, lon: 79.6536, name: "Almora" },
    "Bageshwar": { lat: 29.8500, lon: 79.8333, name: "Bageshwar" },
    "Chamoli": { lat: 30.5550, lon: 79.5600, name: "Chamoli" },
    "Champawat": { lat: 29.3000, lon: 80.2500, name: "Champawat" },
    "Dehradun": { lat: 30.3165, lon: 78.0322, name: "Dehradun" },
    "Haridwar": { lat: 29.9457, lon: 78.1642, name: "Haridwar" },
    "Nainital": { lat: 29.3919, lon: 79.4542, name: "Nainital" },
    "Pauri Garhwal": { lat: 30.1500, lon: 78.7800, name: "Pauri Garhwal" },
    "Pithoragarh": { lat: 29.5833, lon: 80.2167, name: "Pithoragarh" },
    "Rudraprayag": { lat: 30.2800, lon: 78.9700, name: "Rudraprayag" },
    "Tehri Garhwal": { lat: 30.3300, lon: 78.5000, name: "Tehri Garhwal" },
    "Udham Singh Nagar": { lat: 28.9800, lon: 79.4000, name: "Udham Singh Nagar" },
    "Uttarkashi": { lat: 30.7300, lon: 78.4500, name: "Uttarkashi" },
    
    
    
    
    // "West Bengal
    "Alipurduar": { lat: 26.4833, lon: 89.5333, name: "Alipurduar" },
    "Bankura": { lat: 23.2500, lon: 87.0667, name: "Bankura" },
    "Birbhum": { lat: 23.6500, lon: 87.7167, name: "Birbhum" },
    "Cooch Behar": { lat: 26.3167, lon: 89.4500, name: "Cooch Behar" },
    "Dakshin Dinajpur": { lat: 25.2500, lon: 88.6333, name: "Dakshin Dinajpur" },
    "Darjeeling": { lat: 27.0360, lon: 88.2627, name: "Darjeeling" },
    "Hooghly": { lat: 22.9000, lon: 88.3667, name: "Hooghly" },
    "Howrah": { lat: 22.5958, lon: 88.2636, name: "Howrah" },
    "Jalpaiguri": { lat: 26.5167, lon: 88.7333, name: "Jalpaiguri" },
    "Kalimpong": { lat: 27.0667, lon: 88.4667, name: "Kalimpong" },
    "Kolkata": { lat: 22.5726, lon: 88.3639, name: "Kolkata" },
    "Malda": { lat: 25.0000, lon: 88.1500, name: "Malda" },
    "Murshidabad": { lat: 24.1750, lon: 88.2700, name: "Murshidabad" },
    "Nadia": { lat: 23.4100, lon: 88.5000, name: "Nadia" },
    "North 24 Parganas": { lat: 22.8300, lon: 88.4300, name: "North 24 Parganas" },
    "Paschim Bardhaman": { lat: 23.5500, lon: 87.3200, name: "Paschim Bardhaman" },
    "Paschim Medinipur": { lat: 22.4000, lon: 87.3000, name: "Paschim Medinipur" },
    "Purba Bardhaman": { lat: 23.2500, lon: 87.8500, name: "Purba Bardhaman" },
    "Purba Medinipur": { lat: 22.5000, lon: 87.7500, name: "Purba Medinipur" },
    "Purulia": { lat: 23.3300, lon: 86.3600, name: "Purulia" },
    "South 24 Parganas": { lat: 22.2000, lon: 88.4000, name: "South 24 Parganas" },
    "Uttar Dinajpur": { lat: 25.6200, lon: 88.1500, name: "Uttar Dinajpur" },


};
/**
 * [MISSING FUNCTION ADDED]
 * Fetches coordinates from OpenStreetMap if not found in local database.
 */
async function getCoordinatesFromAPI(district, state) {
    try {
        const query = `${district}, ${state}, India`;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                name: data[0].display_name.split(',')[0] // Use the first part of the name
            };
        } else {
            throw new Error("Location not found in API");
        }
    } catch (error) {
        console.error("Geocoding API failed:", error);
        // Final Fallback: Return a default location (e.g., New Delhi) so app doesn't freeze
        return { lat: 28.6139, lon: 77.2090, name: "Location Not Found (Defaulting to Delhi)" };
    }
}
// --- [IMPROVED] Weather Forecast Functionality ---

// [MODIFIED] This function now just gets coords from the dropdowns and passes them on
async function fetchWeatherForecast() {
    const state = document.getElementById('weatherState').value;
    const district = document.getElementById('weatherDistrict').value;
    const reportContainer = document.getElementById('weatherReportContainer');

    if (!state || !district) {
        reportContainer.style.display = 'block';
        reportContainer.innerHTML = `<p style="color:red;">Please select a State and District.</p>`;
        return;
    }
    
    reportContainer.style.display = 'block';
    reportContainer.innerHTML = `<p>Finding coordinates for ${district}...</p>`;

    // Step 1: Get coordinates from dropdowns
    const coords = await getCoordinatesForLocation(district, state);
    
    if (!coords) {
        reportContainer.innerHTML = `<p>Could not find location data for ${district}.</p>`;
        return;
    }
    
    reportContainer.innerHTML = `<p>Loading forecast for ${coords.name}...</p>`;
    
    // Step 2: Call the new central function with the coords and name
    // We pass coords.name because the geocoding API already gave it to us
    await fetchWeatherByCoords(coords.lat, coords.lon, coords.name);
}
/**
 * [NEW] Handles the "Use My Current Location" button click
 */
function handleFetchLiveLocationWeather() {
    const reportContainer = document.getElementById('weatherReportContainer');
    reportContainer.style.display = 'block';
    reportContainer.innerHTML = `<p>Requesting your location... Please check your browser for a permission prompt.</p>`;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                // On success, get coords
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                reportContainer.innerHTML = `<p>Location found! Fetching weather data...</p>`;
                
                // Call the central function. We pass null for the name
                // because we need to look it up via reverse geocoding.
                await fetchWeatherByCoords(lat, lon, null);
            },
            (error) => {
                // On failure, show a user-friendly error
                handleGeolocationError(error);
            }
        );
    } else {
        // Geolocation not supported by browser
        reportContainer.innerHTML = `<p style="color:red;">Geolocation is not supported by your browser. Please use the manual search.</p>`;
    }
}

/**
 * [FINAL VERSION] Please REPLACE your fetchWeatherByCoords function with this one.
 * * This version adds a FINAL fallback. If the API returns data
 * but has NO NAME, it will display the Latitude and Longitude
 * instead of "Current Location".
 */
async function fetchWeatherByCoords(lat, lon, locationName = null) {
    const reportContainer = document.getElementById('weatherReportContainer');

    // Step 1: Get location name IF it wasn't provided (from live location)
    if (!locationName) {
        locationName = 'Current Location'; // This is our default fallback
        
        const reverseGeocodeUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&current_weather=true`;
        
        try {
            const geoResponse = await fetch(reverseGeocodeUrl);
            const geoData = await geoResponse.json();
            
            let foundName = null;
            let foundState = null;

            // 1. Try to get state
            if (geoData.admin1) {
                foundState = geoData.admin1; // e.g., "Karnataka"
            }

            // 2. Try to get the city/town/district
            if (geoData.name) {
                foundName = geoData.name; // Best case: "Bengaluru"
            } else if (geoData.city) {
                foundName = geoData.city;
            } else if (geoData.locality) {
                foundName = geoData.locality;
            } else if (geoData.village) {
                foundName = geoData.village;
            } else if (geoData.admin2) {
                foundName = geoData.admin2; // e.g., "Davanagere"
            } else if (geoData.admin3) {
                foundName = geoData.admin3; // e.g., "Bangalore North"
            }

            // 3. Combine them intelligently
            if (foundName && foundState) {
                if (foundName === foundState) {
                    locationName = foundName;
                } else {
                    locationName = `${foundName}, ${foundState}`; // "Bengaluru, Karnataka"
                }
            } else if (foundName) {
                locationName = foundName; // "Bengaluru"
            } else if (foundState) {
                locationName = foundState; // "Karnataka"
            }
            
            // --- [NEW FALLBACK LOGIC] ---
            // If the name is *still* "Current Location" after all those checks,
            // it means the API didn't return a useful name.
            // Let's show the coordinates as proof it worked.
            if (locationName === 'Current Location') {
                locationName = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
            }
            // --- [END OF NEW FALLBACK] ---

        } catch (geoError) {
            console.error('Reverse geocoding failed:', geoError);
            // If the entire API call fails, show coordinates too.
            locationName = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
        }
    }
    
    // Step 2: Get the weather forecast (This part is unchanged)
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,precipitation_probability&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=10`;
    
    try {
        const response = await fetch(forecastUrl);
        const data = await response.json();
        
        fullForecastData = data; 
        reportContainer.innerHTML = ''; 
        
        const todayStr = new Date().toISOString().split('T')[0];
        const todayIndex = data.daily.time.indexOf(todayStr);
        const startIndex = todayIndex === -1 ? 0 : todayIndex;

        renderCurrentWeather(data.current, locationName); 
        renderDailyForecast(data.daily, startIndex);
        renderHourlyDetail(startIndex);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        reportContainer.innerHTML = `<p style="color:red;">Could not fetch weather data. Please try again later.</p>`;
    }
}/**
 * [NEW] Shows user-friendly messages for different geolocation errors
 */
function handleGeolocationError(error) {
    const reportContainer = document.getElementById('weatherReportContainer');
    switch (error.code) {
        case error.PERMISSION_DENIED:
            reportContainer.innerHTML = `<p style="color:red;">You denied the request for Geolocation. Please enable it in your browser settings or use the manual search.</p>`;
            break;
        case error.POSITION_UNAVAILABLE:
            reportContainer.innerHTML = `<p style="color:red;">Location information is unavailable. Please try again or use the manual search.</p>`;
            break;
        case error.TIMEOUT:
            reportContainer.innerHTML = `<p style="color:red;">The request to get user location timed out. Please try again.</p>`;
            break;
        default:
            reportContainer.innerHTML = `<p style="color:red;">An unknown error occurred while getting your location. Please use the manual search.</p>`;
            break;
    }
}
// Fallback API geocoding
/**
 * Prioritizes the local hardcoded map (districtCoordinates) 
 * over the slower, less reliable external API lookup.
 */
async function getCoordinatesForLocation(district, state) {
    // 1. Check the local hardcoded map (District as Key)
    const localCoord = districtCoordinates[district];
    if (localCoord) {
        return localCoord;
    }
    
    // 2. Check the local hardcoded map (Name property check)
    const exactMatch = Object.values(districtCoordinates).find(c => c.name === district && c.state === state);
    if (exactMatch) {
        return exactMatch;
    }

    // 3. Fallback to API geocoding (use the existing function)
    console.warn(`District ${district}, ${state} not found in local map. Falling back to API.`);
    return await getCoordinatesFromAPI(district, state);
}

/**
 * [REPLACE] This function renders the top weather card.
 * This version correctly uses the 'name' variable for the <h2>
 * and says "Now" in the <p> tag.
 */
function renderCurrentWeather(currentData, name) {
    const container = document.getElementById('weatherReportContainer');
    const weatherInfo = getWeatherInfo(currentData.weather_code);

    const currentWeatherHtml = `
        <div class="current-weather-card">
            <div>
                <h2>${name}</h2>
                <p data-en="Now" data-ml="ഇപ്പോൾ" data-hi="अभी" data-kn="ಈಗ" data-te="ఇప్పుడు">Now</p>
            </div>
            <div class="current-temp-details">
                <span class="current-temp">${Math.round(currentData.temperature_2m)}°C</span>
                <span class="current-weather-icon">${weatherInfo.icon}</span>
            </div>
            <div class="current-desc">
                <p>${weatherInfo.description}</p>
                <p data-en="Precipitation" data-ml="മഴ" data-hi="वर्षा" data-kn="ಮಳೆ" data-te="వర్షపాతం">Precipitation: ${currentData.precipitation_probability}%</p>
            </div>
        </div>
    `;
    // We use insertAdjacentHTML to add this *before* the other forecast elements
    container.insertAdjacentHTML('beforeend', currentWeatherHtml);
}
function renderDailyForecast(dailyData, startIndex) {
    const container = document.getElementById('weatherReportContainer');
    
    if (!dailyData || !dailyData.time || dailyData.time.length === 0) {
        container.insertAdjacentHTML('beforeend', '<p style="color:red;">Daily forecast unavailable</p>');
        return;
    }
    
    let dailyForecastHtml = `<h3 class="forecast-heading">10-Day Forecast</h3><div class="daily-forecast-container">`;

    const times = dailyData.time.slice(startIndex, startIndex + 10);
    const codes = dailyData.weather_code.slice(startIndex, startIndex + 10);
    const maxTemps = dailyData.temperature_2m_max.slice(startIndex, startIndex + 10);
    const minTemps = dailyData.temperature_2m_min.slice(startIndex, startIndex + 10);

    times.forEach((day, index) => {
        const weatherInfo = getWeatherInfo(codes[index] || 0);
        const originalIndex = startIndex + index;
        
        dailyForecastHtml += `
            <div class="day-card ${index === 0 ? 'active' : ''}" onclick="showHourlyForDay(${originalIndex}, this)">
                <p class="day-name">${formatDate(day)}</p>
                <div class="day-icon">${weatherInfo.icon}</div>
                <p class="day-temp">
                    <span class="temp-high">${Math.round(maxTemps[index])}°</span> / 
                    <span class="temp-low">${Math.round(minTemps[index])}°</span>
                </p>
            </div>
        `;
    });
    
    dailyForecastHtml += `</div>`;
    container.insertAdjacentHTML('beforeend', dailyForecastHtml);
}

function renderHourlyDetail(dayIndex) {
    const container = document.getElementById('weatherReportContainer');
    
    if (!fullForecastData || !fullForecastData.hourly) {
        return;
    }
    
    let hourlyContainer = document.getElementById('hourlyDetailContainer');
    let hourlyHeading = document.getElementById('hourlyHeading');
    
    if (hourlyContainer) hourlyContainer.remove();
    if (hourlyHeading) hourlyHeading.remove();

    container.insertAdjacentHTML('beforeend', `<h3 class="forecast-heading" id="hourlyHeading">Hourly Details</h3><div id="hourlyDetailContainer" class="hourly-detail-container"></div>`);
    hourlyContainer = document.getElementById('hourlyDetailContainer');
    
    const hourlyData = fullForecastData.hourly;
    const startIndex = dayIndex * 24;
    const endIndex = Math.min(startIndex + 24, hourlyData.time.length);

    const dayTimes = hourlyData.time.slice(startIndex, endIndex);
    const dayTemps = hourlyData.temperature_2m.slice(startIndex, endIndex);
    const dayCodes = hourlyData.weather_code.slice(startIndex, endIndex);
    const dayPrecip = hourlyData.precipitation_probability.slice(startIndex, endIndex);

    let hourlyDetailHtml = '';
    let itemsFound = 0;
    const now = new Date();
    
    const todayStr = now.toISOString().split('T')[0];
    const selectedDayStr = fullForecastData.daily.time[dayIndex];
    const isToday = todayStr === selectedDayStr;
    
    dayTimes.forEach((time, i) => {
        const timeDate = new Date(time);
        
        if (isToday && timeDate < now) {
            return;
        }
        
        itemsFound++;
        const weatherInfo = getWeatherInfo(dayCodes[i] || 0);
        const temp = dayTemps[i] !== undefined ? Math.round(dayTemps[i]) : '--';
        const precip = dayPrecip[i] !== undefined ? dayPrecip[i] : 0;
        
        hourlyDetailHtml += `
            <div class="hour-detail">
                <p class="hour-time">${formatTime(time)}</p>
                <div class="hour-icon">${weatherInfo.icon}</div>
                <p class="hour-temp">${temp}°</p>
                <div class="hour-precip">
                    <span class="precip-icon">💧</span>
                    <span>${precip}%</span>
                </div>
            </div>
        `;
    });
    
    if (itemsFound === 0) {
        hourlyDetailHtml = `<p style="padding: 1rem; color: #666;">No more hourly data for today.</p>`;
    }
    
    hourlyContainer.innerHTML = hourlyDetailHtml;
    document.getElementById('hourlyHeading').innerText = `Hourly Details for ${formatDate(fullForecastData.daily.time[dayIndex])}`;
}

function showHourlyForDay(dayIndex, element) {
    document.querySelectorAll('.day-card').forEach(card => card.classList.remove('active'));
    element.classList.add('active');
    renderHourlyDetail(dayIndex);
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString + 'T12:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        
        if (compareDate.getTime() === today.getTime()) {
            return 'Today';
        }
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (compareDate.getTime() === tomorrow.getTime()) {
            return 'Tomorrow';
        }
        
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (error) {
        return dateString;
    }
}

function formatTime(isoString) {
    try {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }).toLowerCase();
    } catch (error) {
        return isoString;
    }
}

function getWeatherInfo(wmoCode) {
    const codes = {
        0: { description: 'Clear sky', icon: '☀️' },
        1: { description: 'Mainly clear', icon: '🌤️' },
        2: { description: 'Partly cloudy', icon: '⛅' },
        3: { description: 'Overcast', icon: '☁️' },
        45: { description: 'Fog', icon: '🌫️' },
        48: { description: 'Depositing rime fog', icon: '🌫️' },
        51: { description: 'Light drizzle', icon: '🌦️' },
        53: { description: 'Moderate drizzle', icon: '🌦️' },
        55: { description: 'Dense drizzle', icon: '🌧️' },
        56: { description: 'Light freezing drizzle', icon: '🌧️' },
        57: { description: 'Dense freezing drizzle', icon: '🌧️' },
        61: { description: 'Slight rain', icon: '🌧️' },
        63: { description: 'Moderate rain', icon: '🌧️' },
        65: { description: 'Heavy rain', icon: '🌧️' },
        66: { description: 'Light freezing rain', icon: '🌨️' },
        67: { description: 'Heavy freezing rain', icon: '🌨️' },
        71: { description: 'Slight snow fall', icon: '🌨️' },
        73: { description: 'Moderate snow fall', icon: '❄️' },
        75: { description: 'Heavy snow fall', icon: '❄️' },
        77: { description: 'Snow grains', icon: '🌨️' },
        80: { description: 'Slight rain showers', icon: '🌦️' },
        81: { description: 'Moderate rain showers', icon: '🌦️' },
        82: { description: 'Violent rain showers', icon: '⛈️' },
        85: { description: 'Slight snow showers', icon: '🌨️' },
        86: { description: 'Heavy snow showers', icon: '❄️' },
        95: { description: 'Thunderstorm', icon: '⛈️' },
        96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
        99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' }
    };
    return codes[wmoCode] || { description: 'Unknown', icon: '🤷' };
}


// --- Diagnosis and Crop Recommendation Functions ---

// --- Camera + file support for Diagnosis ---
let _cameraStreamTrack = null;        // will hold MediaStreamTrack so we can stop it later
let capturedImageBlob = null;        // captured image blob (if user used camera)

/**
 * Called when the hidden file input changes (user chose a file).
 */
function handleFileInput(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  // clear any previously captured camera blob
  capturedImageBlob = null;

  // show preview
  const img = document.getElementById('diagnosisPreview');
  img.src = URL.createObjectURL(file);
  img.style.display = 'block';
}

/**
 * Open device camera (uses getUserMedia). Shows video element.
 * Upgraded to fall back to laptop webcams if mobile back-camera is unavailable.
 */
async function openCamera() {
  const cameraContainer = document.getElementById('cameraContainer');
  const video = document.getElementById('cameraStream');
  const preview = document.getElementById('diagnosisPreview');

  // clear previous preview and file input
  document.getElementById('cropImage').value = '';

  try {
    let stream;
    try {
        // First, try to open the back camera (for mobile phones)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "environment" } },
          audio: false
        });
    } catch (mobileErr) {
        // If that fails (like on a laptop), fallback to ANY available camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true, 
          audio: false
        });
    }
    
    video.srcObject = stream;
    cameraContainer.style.display = 'block';
    preview.style.display = 'none';

    // keep the video track so we can stop it on close
    _cameraStreamTrack = stream;
    
  } catch (err) {
    console.error('Could not open camera:', err);
    alert('Unable to access camera!\n\n1. Ensure you allow camera permissions.\n2. If testing locally, you MUST use a local server (like VS Code Live Server) instead of just double-clicking the HTML file.');
  }
}
/**
 * Capture current video frame to a Blob and show preview.
 * The captured blob will be used by handleDiagnosis.
 */
function captureFromCamera() {
  const video = document.getElementById('cameraStream');
  const canvas = document.getElementById('cameraCanvas');
  const preview = document.getElementById('diagnosisPreview');

  if (!video || !video.srcObject) {
    alert('Camera not started.');
    return;
  }

  // Set canvas size to video size
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert to blob (jpeg)
  canvas.toBlob((blob) => {
    if (!blob) {
      alert('Capture failed.');
      return;
    }
    capturedImageBlob = blob;

    // Show preview image
    const img = document.getElementById('diagnosisPreview');
    img.src = URL.createObjectURL(blob);
    img.style.display = 'block';

    // Close/hide camera UI (but keep stream until closeCamera called)
    document.getElementById('cameraContainer').style.display = 'none';
  }, 'image/jpeg', 0.9);
}

/**
 * Close camera and stop tracks
 */
function closeCamera() {
  const cameraContainer = document.getElementById('cameraContainer');
  const video = document.getElementById('cameraStream');

  if (_cameraStreamTrack) {
    try {
      // stop all tracks
      _cameraStreamTrack.getTracks().forEach(t => t.stop());
    } catch (e) { console.warn(e); }
    _cameraStreamTrack = null;
  }

  if (video) {
    video.srcObject = null;
  }

  cameraContainer.style.display = 'none';
}
function handleDiagnosis(event) {
    event.preventDefault();

    // --- 1. CAMERA FIX: Check for captured blob first ---
    let imageFile = null;
    if (typeof capturedImageBlob !== 'undefined' && capturedImageBlob) {
        imageFile = capturedImageBlob;
    } else {
        const fileInput = document.getElementById('cropImage');
        if (fileInput && fileInput.files && fileInput.files[0]) {
            imageFile = fileInput.files[0];
        }
    }

    const resultDiv = document.getElementById('diagnosisResult');
    const apiKey = 'wqkubCkxKg3t3zjNDrz3uPJ2myTbYo16pgp3BR5KY0n0NEG2Y7'; 

    if (!imageFile) {
        resultDiv.innerHTML = `<p style="color:red;">Please select an image or take a photo first.</p>`;
        return;
    }
    
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `<p>Uploading and analyzing image... This might take a moment.</p>`;

    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = () => {
        const base64Image = reader.result.split(',')[1];
        const requestBody = {
            "images": [base64Image],
            "modifiers": ["health_assessment"],
            "disease_details": ["common_names", "description", "treatment"]
        };

        fetch('https://api.plant.id/v2/health_assessment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Api-Key': apiKey },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(data => {
            // --- 2. NOT A PLANT FIX: Check probability first ---
            if (data.is_plant_probability < 0.5) {
                resultDiv.innerHTML = `
                    <div style="background:#f8d7da; color:#721c24; padding:15px; border-radius:10px; border: 1px solid #f5c6cb; text-align:center;">
                        <h3>⚠️ Not a Plant</h3>
                        <p>The AI detected that this image is likely <strong>not a plant</strong>.</p>
                        <p>Please upload a clear photo of a crop leaf.</p>
                    </div>
                `;
                return; // Stop here, don't show healthy/unhealthy
            }

            // If it IS a plant, proceed with health check
            const assessment = data.health_assessment;
            
            if (assessment.is_healthy) {
                resultDiv.innerHTML = `
                    <h3>Diagnosis Report</h3>
                    <p style="color:green;"><strong>The plant appears to be healthy!</strong></p>
                    <p>Confidence: ${Math.round(assessment.is_healthy_probability * 100)}%</p>
                `;
            } else if (assessment.diseases && assessment.diseases.length > 0) {
                const disease = assessment.diseases[0];
                resultDiv.innerHTML = `
                    <h3>Diagnosis Report</h3>
                    <p><strong>Disease Detected:</strong> ${disease.disease_details.common_names && disease.disease_details.common_names.length > 0 ? disease.disease_details.common_names[0] : disease.name}</p>
                    <p><strong>Confidence:</strong> ${Math.round(disease.probability * 100)}%</p>
                    <p><strong>Description:</strong> ${disease.disease_details.description}</p>
                    <h4>Treatment Suggestions:</h4>
                    <ul>
                        ${disease.disease_details.treatment.biological ? `<li><strong>Biological:</strong> ${disease.disease_details.treatment.biological.join(', ')}</li>` : ''}
                        ${disease.disease_details.treatment.chemical ? `<li><strong>Chemical:</strong> ${disease.disease_details.treatment.chemical.join(', ')}</li>` : ''}
                        ${disease.disease_details.treatment.prevention ? `<li><strong>Prevention:</strong> ${disease.disease_details.treatment.prevention.join(', ')}</li>` : ''}
                    </ul>
                `;
            } else {
                resultDiv.innerHTML = `
                    <h3>Diagnosis Report</h3>
                    <p style="color:red;"><strong>Disease detected, but no details available.</strong></p>
                    <p>Please try another image or consult an expert for further diagnosis.</p>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resultDiv.innerHTML = `<p style="color:red;">An error occurred during diagnosis. Please try again.</p>`;
        });
    };
    reader.onerror = error => {
        console.error('Error reading file:', error);
        resultDiv.innerHTML = `<p style="color:red;">Could not read the image file.</p>`;
    };
}// --- Marketplace and Chatbot Functions (Unchanged) ---

// --- BULLETPROOF TAB SWITCHER ---
function showMarketplaceTab(tabName, btnElement) {
    // 1. Highlight the correct button
    if (btnElement) {
        const buttons = btnElement.parentElement.querySelectorAll('.tab-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
    }

    // 2. Safely get all tabs from HTML (Handles any ID version)
    const buyTab = document.getElementById('marketBuyTab') || document.getElementById('marketplaceBuyTab');
    const sellTab = document.getElementById('marketSellTab');
    const chatTab = document.getElementById('marketChatTab');

    // 3. Hide all tabs
    if (buyTab) buyTab.classList.remove('active');
    if (sellTab) sellTab.classList.remove('active');
    if (chatTab) chatTab.classList.remove('active');

    // 4. Show the selected tab and LOAD its data!
    if (tabName === 'buy' && buyTab) {
        buyTab.classList.add('active');
        loadMarketplaceProducts(); // Forces products to refresh every time you click "Buy"
    } else if (tabName === 'sell' && sellTab) {
        sellTab.classList.add('active');
    } else if (tabName === 'chat' && chatTab) {
        chatTab.classList.add('active');
        if (typeof loadChatThreads === 'function') loadChatThreads(); // Loads WhatsApp Sidebar
    }
}
/**
 * [NEW] Handles switching tabs in the Agri-Tourism section
 */
function showTourismTab(tabName, tabElement) {
    // 1. Hide all tab content
    document.querySelectorAll('#tourism .market-tab').forEach(tab => tab.classList.remove('active'));
    
    // 2. Deactivate all tab buttons
    document.querySelectorAll('#tourism .marketplace-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // 3. Show the correct tab content
    const tabId = (tabName === 'find') ? 'tourismFindTab' : 'tourismListTab';
    document.getElementById(tabId).classList.add('active');
    
    // 4. Activate the clicked button
    tabElement.classList.add('active');
}
// --- [CLOUD UPGRADE] LOAD PRODUCTS FROM FIREBASE (WITH B2B BADGES) ---
async function loadMarketplaceProducts() {
    let container = document.getElementById('marketProductsList');
    if (!container) container = document.getElementById('marketBuyProducts');
    if (!container) return; 
    
    // Show a loading state while fetching from cloud
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 2rem;">⏳ Syncing Live Cloud Marketplace...</p>';

    try {
        // Fetch live data from Firebase
        const snapshot = await db.collection("products").get();
        let products = [];
        snapshot.forEach(doc => {
            products.push(doc.data());
        });
        
        allMarketProducts = products; 
        container.innerHTML = ''; 

        const searchQuery = document.getElementById('marketSearch')?.value.toLowerCase() || "";
        const categoryFilter = document.getElementById('marketCategoryFilter')?.value || "all";
        
        let activeProducts = products.filter(p => !p.isSold);
        
        if (searchQuery) activeProducts = activeProducts.filter(p => (p.name || '').toLowerCase().includes(searchQuery));
        if (categoryFilter && categoryFilter !== 'all') activeProducts = activeProducts.filter(p => p.category === categoryFilter);

        // Smart Sorting: Proximity First
        if (currentUser) {
            activeProducts.sort((a, b) => {
                const addrA = a.seller?.address || '';
                const addrB = b.seller?.address || '';
                const scoreA = (addrA.includes(currentUser.district) ? 2 : 0) + (addrA.includes(currentUser.state) ? 1 : 0);
                const scoreB = (addrB.includes(currentUser.district) ? 2 : 0) + (addrB.includes(currentUser.state) ? 1 : 0);
                return scoreB - scoreA;
            });
        }

        if (activeProducts.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 2rem;">No products found in the cloud. Be the first to list one!</p>';
            return;
        }

        activeProducts.forEach(prod => {
            const seller = prod.seller || { name: 'Unknown', phone: 'N/A', address: 'N/A' };
            const isMyProduct = (currentUser && seller.phone === currentUser.phone);
            
            let proximityBadge = '';
            if (currentUser) {
                if (seller.address.includes(currentUser.district)) {
                    proximityBadge = `<span style="background: #dcfce7; color: #16a34a; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">📍 Near You</span>`;
                } else if (seller.address.includes(currentUser.state)) {
                    proximityBadge = `<span style="background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">🗺️ In your State</span>`;
                } else {
                    proximityBadge = `<span style="background: #f1f5f9; color: #64748b; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">🚚 Ships from afar</span>`;
                }
            }

            const actionButtons = isMyProduct 
                ? `<button class="feature-btn" style="width: 100%; background: #94a3b8; cursor: not-allowed; margin-top:1rem;">Your Listing</button>`
                : `<div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                      <button onclick="openPaymentModal(${prod.id})" class="feature-btn" style="flex: 2; background: #2563eb; font-size: 0.9rem; padding: 0.5rem;">Buy now</button>
                      <button onclick="initiateChat(${prod.id})" class="feature-btn" style="flex: 1; font-size: 0.9rem; padding: 0.5rem; background: #10b981;">Chat 💬</button>
                   </div>`;

            // --- B2B UI BADGES (CERTIFICATION & MIN ORDER) ---
            const certBadge = prod.isCertified ? `<span style="background:#16a34a; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold; margin-left:5px; vertical-align: middle;">✓ Certified Quality</span>` : '';
            const minBulkHtml = (prod.minOrder && prod.minOrder > 1) ? `<span style="display:block; font-size:0.8rem; color:#e67e22; margin-top:5px; font-weight: bold;">📦 Min Bulk Order: ${prod.minOrder} kg</span>` : '';

            const card = `
                <div class="product-card" style="position: relative; text-align: left; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                        <img src="${prod.icon}" alt="${prod.name}" onerror="this.src='https://placehold.co/100x100?text=No+Image'" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-color);">
                        ${proximityBadge}
                    </div>
                    
                    <h3 style="margin: 0.5rem 0 0.2rem 0; font-size: 1.25rem; display: flex; align-items: center; flex-wrap: wrap; gap: 5px;">
                        ${prod.name} ${certBadge}
                    </h3>
                    <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 1rem;">By ${seller.name}</p>
                    
                    <div style="background: #f8fafc; padding: 0.75rem; border-radius: 8px; margin-bottom: auto;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span style="color: #64748b; font-size: 0.9rem;">Total Stock:</span>
                            <strong style="color: #1e293b;">${prod.qty || 'N/A'} kg</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #64748b; font-size: 0.9rem;">Wholesale Price:</span>
                            <strong style="color: #16a34a; font-size: 1.1rem;">₹${prod.price} /kg</strong>
                        </div>
                        ${minBulkHtml}
                    </div>
                    
                    ${actionButtons}
                </div>
            `;
            container.innerHTML += card;
        });
    } catch (error) {
        console.error("Firebase Read Error:", error);
        container.innerHTML = '<p style="color:red; text-align:center; grid-column:1/-1;">Could not connect to the cloud marketplace.</p>';
    }
}

// --- TRANSPARENT CHECKOUT & LOGISTICS ENGINE (DYNAMIC UI) ---
let currentPaymentProduct = null;

function openPaymentModal(productId) {
    if (!currentUser) return alert("Please login to book products.");
    currentPaymentProduct = allMarketProducts.find(p => p.id === productId);
    
    if (currentPaymentProduct) {
        // Reset the dropdown to "Self Pickup" by default when opening
        document.getElementById('payLogistics').value = 'pickup';
        
        document.getElementById('payProductName').innerText = currentPaymentProduct.name;
        
        const minQ = currentPaymentProduct.minOrder || 1;
        const maxQ = currentPaymentProduct.qty;
        
        const qtyInput = document.getElementById('payOrderQty');
        qtyInput.value = minQ;
        qtyInput.min = minQ;
        qtyInput.max = maxQ;
        
        document.getElementById('payMinOrderNote').innerText = `Note: Min bulk order is ${minQ} kg. Max: ${maxQ} kg`;
        
        // Auto-fill details just in case they switch to delivery
        document.getElementById('payBuyerName').value = currentUser.name || '';
        document.getElementById('payBuyerPhone').value = currentUser.phone || '';
        const savedAddress = currentUser.district ? `${currentUser.district}, ${currentUser.state}` : '';
        document.getElementById('payBuyerAddress').value = savedAddress;

        updateCheckoutCalc(); 
        document.getElementById('paymentModal').classList.add('show');
    }
}

function updateCheckoutCalc() {
    if (!currentPaymentProduct) return;
    
    let orderQty = parseFloat(document.getElementById('payOrderQty').value) || 0;
    const minQ = currentPaymentProduct.minOrder || 1;
    if (orderQty < minQ) orderQty = minQ; 
    if (orderQty > currentPaymentProduct.qty) orderQty = currentPaymentProduct.qty;

    const basePrice = orderQty * currentPaymentProduct.price;
    const logisticsOpt = document.getElementById('payLogistics').value;
    
    // --- SHOW OR HIDE THE ADDRESS FORM ---
    const addressSection = document.getElementById('deliveryAddressSection');
    if (logisticsOpt === 'delivery') {
        addressSection.style.display = 'block'; // Show it!
    } else {
        addressSection.style.display = 'none';  // Hide it!
    }
    
    // Delivery Math: ₹5 per kg for delivery, ₹0 for pickup
    const logisticsFee = logisticsOpt === 'delivery' ? (orderQty * 5) : 0; 
    
    const totalValue = basePrice + logisticsFee;
    const advanceValue = totalValue * 0.10; 

    document.getElementById('calcBasePrice').innerText = `₹${basePrice.toLocaleString()}`;
    document.getElementById('calcLogistics').innerText = `₹${logisticsFee.toLocaleString()}`;
    document.getElementById('calcTotal').innerText = `₹${totalValue.toLocaleString()}`;
    document.getElementById('calcAdvance').innerText = `₹${advanceValue.toLocaleString()}`;
}

function closePaymentModal() { document.getElementById('paymentModal').classList.remove('show'); }

async function processMockPayment() {
    const logisticsOpt = document.getElementById('payLogistics').value;
    const name = document.getElementById('payBuyerName').value;
    const phone = document.getElementById('payBuyerPhone').value;
    const address = document.getElementById('payBuyerAddress').value;

    // Smart Validation based on what they chose
    if (logisticsOpt === 'delivery') {
        if (!name || !phone || !address.trim()) {
            alert("⚠️ Please fill out your Name, Phone, and complete Delivery Address to schedule delivery.");
            return;
        }
    } else {
        if (!name || !phone) {
            alert("⚠️ Please provide your Name and Phone number so the farmer knows who is coming to pick it up.");
            return;
        }
    }

    let orderQty = parseFloat(document.getElementById('payOrderQty').value);
    const totalAdvanceStr = document.getElementById('calcAdvance').innerText;

    const btn = document.querySelector('#paymentModal .feature-btn');
    btn.innerHTML = '🔄 Processing UPI Transfer...';
    btn.style.background = '#64748b';
    btn.disabled = true;
    
    setTimeout(async () => {
        let successMessage = `✅ DEAL SECURED!\n\nYou booked ${orderQty}kg of ${currentPaymentProduct.name}.\nAdvance paid: ${totalAdvanceStr}.\n\n`;
        
        if (logisticsOpt === 'delivery') {
            successMessage += `Delivery scheduled to: ${address}\nThe logistics team & farmer have been notified.`;
        } else {
            successMessage += `Self-Pickup confirmed!\nPlease check the Chat tab to message the farmer for their exact location.`;
        }

        alert(successMessage);
        
        closePaymentModal();
        btn.innerHTML = '💳 Confirm & Pay via UPI';
        btn.style.background = '#2563eb';
        btn.disabled = false;
    }, 2000);
}
/**
 * [NEW] Loads and renders all agri-tourism listings
 * MOVED TO GLOBAL SCOPE
 */
function loadTourismListings() {
    let listings = JSON.parse(localStorage.getItem(AGRI_TOURISM_KEY));

    if (!listings) {
        listings = mockAgriTourismListings;
        localStorage.setItem(AGRI_TOURISM_KEY, JSON.stringify(listings));
    }
    
    allTourismListings = listings; // Save to global variable
    
    const container = document.getElementById('tourismListingsGrid');
    container.innerHTML = ''; 

    if (listings.length === 0) {
        container.innerHTML = '<p>No farm experiences listed yet.</p>';
        return;
    }

    listings.slice().reverse().forEach(listing => {
        const isMyListing = (currentUser && listing.farmer.phone === currentUser.phone);

        const card = `
            <div class="listing-card">
                <h4>${listing.farmName}</h4>
                <p><strong>Location:</strong> ${listing.location}</p>
                <p>${listing.desc}</p>
                <div class="price">₹${listing.price} <span style="font-size: 1rem; color: #666;">/ day</span></div>
                
                <button 
                    class="feature-btn" 
                    style="width:100%;" 
                    onclick="openTourismContactModal(${listing.id})"
                    ${isMyListing ? 'disabled' : ''}
                >
                    ${isMyListing ? 'This is Your Farm' : 'Contact Farmer'}
                </button>
            </div>
        `;
        container.innerHTML += card;
    });
}

// --- [CLOUD UPGRADE] SELL PRODUCT TO FIREBASE (WITH BULK & CERTIFICATION) ---
function handleMarketSellProduct(event) {
    event.preventDefault();

    if (!currentUser || currentUser.role === 'retailer') {
        alert('Only registered Farmers can sell products.');
        return;
    }

    const name = document.getElementById('prodName').value;
    const qty = document.getElementById('prodQty').value;
    const price = document.getElementById('prodPrice').value;
    const category = document.getElementById('prodCategory').value;
    const imageInput = document.getElementById('prodImage');
    const file = imageInput.files[0];

    if (!file) { alert("Please select an image for your product."); return; }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "Uploading to Cloud ☁️...";
    submitBtn.disabled = true;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = async function() { 
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 400; 
            const MAX_HEIGHT = 400;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
                if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }

            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

            // --- THE NEW BULK & CERTIFICATION LOGIC ---
            const isCertified = document.getElementById('prodCertified') ? document.getElementById('prodCertified').checked : false;
            const minOrderInput = document.getElementById('prodMinOrder');
            const minOrder = minOrderInput && minOrderInput.value ? minOrderInput.value : 1;

            const newProduct = {
                id: Date.now(), 
                name: name,
                qty: parseFloat(qty),
                minOrder: parseFloat(minOrder), // Added Bulk Logic
                price: parseFloat(price),
                category: category,
                isCertified: isCertified,       // Added Quality Logic
                icon: compressedBase64, 
                isSold: false,
                seller: {
                    name: currentUser.name,
                    phone: currentUser.phone,
                    address: currentUser.district || 'Unknown District'
                }
            };

            try {
                // Upload to Firebase Cloud
                await db.collection("products").doc(newProduct.id.toString()).set(newProduct);

                event.target.reset();
                alert('✅ Certified Product live on the Cloud Marketplace!');
                
                loadMarketplaceProducts();
                const buyTabButton = document.querySelector('.marketplace-tabs .tab-btn[onclick*="\'buy\'"]');
                if (buyTabButton) showMarketplaceTab('buy', buyTabButton);

            } catch (firebaseError) {
                console.error("Firebase Upload Failed:", firebaseError);
                alert("Database error. Please check your internet connection.");
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
/**
 * [FIXED] Handles listing a farm (Agri-Tourism)
 * Now completely separate from market logic.
 */
function handleTourismSubmit(event) {
    event.preventDefault();
    // Add this right after the login check in handleTourismSubmit:
    if (currentUser.role === 'retailer') {
        alert('Access Denied: Retailers are not authorized to list farms.');
        return;
    }

    if (!currentUser) {
        alert('Please log in to list your farm.');
        return;
    }
    
    const newListing = {
        id: Date.now(),
        farmName: document.getElementById('tourismFarmName').value,
        price: document.getElementById('tourismPrice').value,
        desc: document.getElementById('tourismDesc').value,
        location: `${currentUser.district || 'Unknown'}, ${currentUser.state || 'Unknown'}`,
        farmer: {
            name: currentUser.name,
            phone: currentUser.phone,
            address: `${currentUser.district || 'Unknown'}, ${currentUser.state || 'Unknown'}`
        }
    };

    // Get existing listings safely
    let listings = JSON.parse(localStorage.getItem(AGRI_TOURISM_KEY));
    
    // Safety Check
    if (!Array.isArray(listings)) {
        listings = [];
    }

    listings.push(newListing);
    localStorage.setItem(AGRI_TOURISM_KEY, JSON.stringify(listings));
    
    showNotification('tourismListNotification', 'Successfully listed your farm!', 'success');
    document.getElementById('tourismListForm').reset();
    
    loadTourismListings();
    
    const findTabButton = document.querySelector('#tourism .marketplace-tabs .tab-btn[onclick*="\'find\'"]');
    if (findTabButton) {
        showTourismTab('find', findTabButton);
    }
}

function showNotification(id, message, type = 'success') {
    const notif = document.getElementById(id);
    notif.textContent = message;
    notif.className = `notification show ${type}`;
    setTimeout(() => {
        notif.classList.remove('show');
    }, 4000);
}

function setupChatbot() {
  const chatContainer = document.getElementById('chatbot-container');
  const toggleBtn = document.getElementById('chat-toggle-btn');
  const closeBtn = document.getElementById('close-chat-btn');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  // Guard: if any element is missing, exit quietly
  if (!chatContainer || !toggleBtn || !closeBtn || !chatForm || !chatInput || !chatMessages) return;

  // Function to show chatbot
  const showChatbot = () => {
    chatContainer.classList.add('show');
    chatContainer.style.display = 'flex';
    chatInput.focus();
  };

  // Function to hide chatbot
  const hideChatbot = () => {
    chatContainer.classList.remove('show');
    chatContainer.style.display = 'none';
  };

  // Add event listeners
  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (chatContainer.classList.contains('show')) {
      hideChatbot();
    } else {
      showChatbot();
    }
  });
  
  // Close button event
  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    hideChatbot();
  });

  // Close chatbot when clicking outside
  document.addEventListener('click', (e) => {
    if (chatContainer.classList.contains('show') && 
        !chatContainer.contains(e.target) && 
        e.target !== toggleBtn) {
      hideChatbot();
    }
  });

  // Prevent clicks inside chatbot from triggering document click
  chatContainer.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  addMessage('bot', 'Hello! I am your agriii-AI assistant. How can I help you with your farming questions today?');

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    addMessage('user', text);
    chatInput.value = '';
    chatInput.focus(); // Keep focus on input after sending
    setTimeout(() => addMessage('bot', getBotResponse(text)), 600);
  });

  function addMessage(sender, text) {
    const el = document.createElement('div');
    el.classList.add('message', sender);
    el.textContent = text;
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function getBotResponse(userInput) {
    const input = userInput.toLowerCase();

    if (input.includes('hello') || input.includes('hi')) {
      return 'Hello there! What can I help you with?';
    }
    if (input.includes('weather') || input.includes('rain')) {
      return 'You can get a detailed 10-day weather forecast in the “Weather Report” section.';
    }
    if (input.includes('price') || input.includes('market')) {
      return 'Check the latest crop prices in the “Market Prices” section.';
    }
    if (input.includes('disease') || input.includes('pest')) {
      return 'If you suspect a crop disease, use the “Disease Diagnosis” feature. Upload a plant photo and the AI will analyze it for you.';
    }
    if (input.includes('crop') || input.includes('soil') || input.includes('grow')) {
      return 'For crop recommendations based on your district and soil type, open “Crop Recommendations”.';
    }
    if (input.includes('buy') || input.includes('sell') || input.includes('tools')) {
      return 'You can buy tools/seeds or sell your harvest in the “Marketplace”.';
    }
    return "I can answer about this app’s features like weather, market prices, diseases, and crops. Try one of those topics!";
  }
}
 /**
 * [NEW] Populates crop dropdowns using the translated crop data.
 */
function populateCropDropdowns() {
    // Add any crop dropdown ID here
    const cropSelects = [
        document.getElementById('marketCrop'),
    ];

    // Get all crop keys and sort them by the English name
    const sortedCropKeys = Object.keys(allMajorCrops).sort((a, b) => {
        return allMajorCrops[a].en.localeCompare(allMajorCrops[b].en);
    });

    cropSelects.forEach(select => {
        if (!select) return; // Skip if the element doesn't exist
        
        // Get the first "Select..." option to preserve it
        const firstOption = select.querySelector('option');
        select.innerHTML = ''; // Clear all options
        
        // Add back the "Select..." option
        if(firstOption) {
            select.appendChild(firstOption);
        }

        // Add all the crops from our new object
        sortedCropKeys.forEach(key => {
            const crop = allMajorCrops[key];
            const option = document.createElement('option');
            option.value = key; // Use the key (e.g., "Rice") as the value
            
            // Add all data attributes for the language switcher
            option.dataset.en = crop.en;
            option.dataset.hi = crop.hi;
            option.dataset.ml = crop.ml;
            option.dataset.kn = crop.kn;
            option.dataset.te = crop.te;
            
            // Set the initial text based on the current language
            option.textContent = crop[currentLanguage] || crop.en;
            
            select.appendChild(option);
        });
    });
}
// --- [NEW] Expense Tracker Functionality ---

document.addEventListener('DOMContentLoaded', () => {
    // Also setup the expense form listener when the page loads
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
    }
    const journeyForm = document.getElementById('journeyForm');
    if (journeyForm) {
        journeyForm.addEventListener('submit', handleJourneySubmit);
    }
    // [NEW] Listener for Agri-Tourism form
    const tourismForm = document.getElementById('tourismListForm');
    if (tourismForm) {
        tourismForm.addEventListener('submit', handleTourismSubmit);
    }
    const classForm = document.getElementById('classListForm');
    if (classForm) {
        classForm.addEventListener('submit', handleClassSubmit);
    }
    const liveLocationColdStorageBtn = document.getElementById('fetchLiveLocationColdStorageBtn');
    if (liveLocationColdStorageBtn) {
        liveLocationColdStorageBtn.addEventListener('click', handleFetchLiveLocationColdStorage);
    }
});


/**
 * Handles the submission of the new expense form
 */
function handleExpenseSubmit(event) {
  event.preventDefault();
  if (!currentUser) return;

  const desc = document.getElementById('expenseDesc').value.trim();
  const amountValue = document.getElementById('expenseAmount').value;
  const type = document.getElementById('expenseType').value;

  const amount = Number(amountValue);
  if (!desc) return alert('Please enter a description.');
  if (!Number.isFinite(amount)) return alert('Please enter a valid amount.');

  const userKey = `expenses_${currentUser.phone}`;
  let expenses = JSON.parse(localStorage.getItem(userKey)) || [];

  if (currentEditingId !== null) {
    // UPDATE existing
    const idx = expenses.findIndex(x => x.id === currentEditingId);
    if (idx !== -1) {
      expenses[idx] = { ...expenses[idx], desc, amount, type };
    }
    currentEditingId = null; // exit edit mode
  } else {
    // ADD new
    const newTransaction = { id: Date.now(), desc, amount, type };
    expenses.unshift(newTransaction);
  }

  localStorage.setItem(userKey, JSON.stringify(expenses));

  // reset form and button text
  const form = document.getElementById('expenseForm');
  if (form) form.reset();
  const submitBtn = document.querySelector('#expenseForm button[type="submit"]');
  if (submitBtn) submitBtn.textContent = 'Log Transaction';

  renderExpenses(expenses);
}
let currentEditingId = null; // To track if we are editing an existing transaction
/**
 * Loads expenses from localStorage for the current user and renders them
 */
function loadAndRenderExpenses() {
    if (!currentUser) return; // Safety check
    
    const userKey = `expenses_${currentUser.phone}`;
    const expenses = JSON.parse(localStorage.getItem(userKey)) || [];
    renderExpenses(expenses);
}

/**
 
 * Renders the list of expenses AND calculates the total balance
 */
function renderExpenses(expenses) {
  const expenseListDiv = document.getElementById('expenseList');
  const totalBalanceEl = document.getElementById('totalBalance');
  if (!expenseListDiv || !totalBalanceEl) return;

  // Sanitize all amounts; drop invalid records
  const cleaned = expenses
    .map(item => ({ ...item, amount: Number(item.amount) }))
    .filter(item => Number.isFinite(item.amount));

  // If anything changed, re-save (removes NaNs already stored)
  if (cleaned.length !== expenses.length ||
      cleaned.some((c, i) => (expenses[i] && c.amount !== expenses[i].amount))) {
    const userKey = `expenses_${currentUser.phone}`;
    localStorage.setItem(userKey, JSON.stringify(cleaned));
  }

  // Compute total safely
  const totalBalance = cleaned.reduce((acc, item) => {
    return item.type === 'income' ? acc + item.amount : acc - item.amount;
  }, 0);

  // Display total
  totalBalanceEl.textContent = `₹${totalBalance.toFixed(2)}`;
  totalBalanceEl.classList.remove('income', 'cost');
  if (totalBalance < 0) totalBalanceEl.classList.add('cost');
  else if (totalBalance > 0) totalBalanceEl.classList.add('income');

  // List items
  if (cleaned.length === 0) {
    expenseListDiv.innerHTML = `<p data-en="No transactions logged yet.">No transactions logged yet.</p>`;
  } else {
    expenseListDiv.innerHTML = cleaned.map(item => {
      const isIncome = item.type === 'income';
      const amountClass = isIncome ? 'income' : 'cost';
      const amountSign = isIncome ? '+' : '-';
      return `
        <div class="expense-item ${amountClass}">
          <div class="expense-details">
            <div class="expense-desc">${item.desc}</div>
            <div class="expense-amount">${amountSign} ₹${item.amount.toFixed(2)}</div>
          </div>
          <div class="expense-actions">
            <button class="expense-btn edit" onclick="handleEditTransaction(${item.id})" title="Edit">✏️</button>
            <button class="expense-btn remove" onclick="handleRemoveTransaction(${item.id})" title="Remove">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Keep translations in sync
  setLanguage(currentLanguage);
}

/**
 * [NEW] Clears ALL expenses for the current user
 */
function handleClearAllExpenses() {
    if (!currentUser) return;
    
    // Show a confirmation popup first
    if (confirm('Are you sure you want to delete ALL transactions? This cannot be undone.')) {
        const userKey = `expenses_${currentUser.phone}`;
        localStorage.removeItem(userKey);
        loadAndRenderExpenses(); // Re-render the empty list
    }
}

/**
 * [NEW] Removes a single transaction by its ID
 */
function handleRemoveTransaction(transactionId) {
    if (!currentUser) return;
    
    const userKey = `expenses_${currentUser.phone}`;
    let expenses = JSON.parse(localStorage.getItem(userKey)) || [];
    
    // Create a new array *without* the item to be removed
    const newExpenses = expenses.filter(item => item.id !== transactionId);
    
    // Save the new, smaller array
    localStorage.setItem(userKey, JSON.stringify(newExpenses));
    
    // Re-render the list immediately
    renderExpenses(newExpenses);
}
function handleEditTransaction(transactionId) {
  if (!currentUser) return;

  const userKey = `expenses_${currentUser.phone}`;
  const expenses = JSON.parse(localStorage.getItem(userKey)) || [];
  const tx = expenses.find(item => item.id === transactionId);
  if (!tx) return;

  // enter edit mode
  currentEditingId = transactionId;

  // prefill form
  document.getElementById('expenseDesc').value = tx.desc;
  document.getElementById('expenseAmount').value = tx.amount;
  document.getElementById('expenseType').value = tx.type;

  // change button text
  const submitBtn = document.querySelector('#expenseForm button[type="submit"]');
  if (submitBtn) submitBtn.textContent = 'Update Transaction';
}
// --- [CLOUD UPGRADE] LOAD PROFILE DATA FROM FIREBASE (WITH FINANCIALS) ---
async function loadProfilePage() {
    if (!currentUser) {
        showSection('home');
        return;
    }

    document.getElementById('profileName').value = currentUser.name || '';
    document.getElementById('profilePhone').value = currentUser.phone || '';
    document.getElementById('profileAddress').value = `${currentUser.district}, ${currentUser.state}` || '';

    try {
        // Fetch ONLY products listed by this specific user from Firebase
        const snapshot = await db.collection("products").where("seller.phone", "==", currentUser.phone).get();
        let myListings = [];
        snapshot.forEach(doc => {
            myListings.push(doc.data());
        });
        
        const activeListings = myListings.filter(p => !p.isSold);
        const soldListings = myListings.filter(p => p.isSold);

        // Render the UI cards
        renderMyListings(activeListings);
        renderSoldListings(soldListings);

        // --- NEW FINANCIAL CALCULATOR ENGINE ---
        let totalAdvances = 0;
        let totalPending = 0;
        
        soldListings.forEach(item => {
            const qty = item.qty || 0;
            const price = item.price || 0;
            const totalValue = price * qty;
            
            totalAdvances += (totalValue * 0.10); // 10% already received
            totalPending += (totalValue * 0.90);  // 90% pending on delivery
        });
        
        // Update the HTML Dashboard safely
        const advancesEl = document.getElementById('trackAdvances');
        const pendingEl = document.getElementById('trackPending');
        
        if (advancesEl) advancesEl.innerText = `₹${totalAdvances.toLocaleString()}`;
        if (pendingEl) pendingEl.innerText = `₹${totalPending.toLocaleString()}`;

    } catch (error) {
        console.error("Firebase Profile Load Error:", error);
    }

    // Load old messages if they exist locally
    const messageKey = MESSAGES_KEY_PREFIX + currentUser.phone;
    const myMessages = JSON.parse(localStorage.getItem(messageKey)) || [];
    if (typeof renderMyMessages === 'function') renderMyMessages(myMessages);
    
    setLanguage(currentLanguage);
}
/**
 * [NEW] Renders the filtered list of the user's own products
 */
/**
 * [NEW] Renders the filtered list of the user's own products with images
 */
function renderMyListings(listings) {
    const container = document.getElementById('myListingsContainer');
    container.innerHTML = '';

    if (listings.length === 0) {
        container.innerHTML = '<p data-en="You have not listed any products for sale.">You have not listed any products for sale.</p>';
        return;
    }

    // Render newest first
    listings.slice().reverse().forEach(prod => {
        const card = `
            <div class="product-card">
                <img src="${prod.icon}" alt="${prod.name}" onerror="this.src='https://placehold.co/100x100?text=No+Image'" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-color); margin-bottom: 10px;">
                <div class="product-info">
                    <h4 class="product-title">${prod.name}</h4>
                    <p class="product-description">${prod.desc}</p>
                    <div class="product-price">₹${prod.price} / kg</div>
                    
                    <button class="feature-btn danger" style="width:100%; margin-top: 1rem;" onclick="markProductAsSold(${prod.id})">
                        Mark as Sold
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}
/**
 * [NEW] Handles the "Use My Current Location" button for Soil Test Labs
 */
function handleFetchLiveLocationSoil() {
    const resultDiv = document.getElementById('soilTestResultContainer');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `<p style="text-align:center;">📍 Requesting your location... Please check your browser for a permission prompt.</p>`;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Create a search query for Google Maps using exact coordinates
                const searchQuery = encodeURIComponent(`Soil Testing Laboratory near ${lat},${lon}`);
                
                let html = `
                    <h3 class="forecast-heading">Labs Found Near You</h3>
                    <p style="text-align:center; color:#666; margin-bottom: 1rem;">
                       Showing soil testing facilities closest to your current location.
                    </p>
                    
                    <div style="width: 100%; height: 450px; border-radius: 12px; overflow: hidden; border: 2px solid #6ba030; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                        <iframe
                            width="100%"
                            height="100%"
                            frameborder="0"
                            style="border:0"
                            src="https://maps.google.com/maps?q=${searchQuery}&t=&z=10&ie=UTF8&iwloc=&output=embed"
                            allowfullscreen>
                        </iframe>
                    </div>
                `;
                resultDiv.innerHTML = html;
            },
            (error) => {
                resultDiv.innerHTML = `<p style="color:red; text-align:center;">Unable to retrieve location. Please check your browser permissions or use the state/district dropdowns below.</p>`;
            }
        );
    } else {
        resultDiv.innerHTML = `<p style="color:red; text-align:center;">Geolocation is not supported by your browser. Please use the manual search.</p>`;
    }
}
/**
 * [FINAL] This is the one and only startup function for the entire app.
 * It runs once the HTML page is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fetchLiveLocationBtn')
        .addEventListener('click', handleFetchLiveLocationWeather);

    
    // --- 1. Core initializations ---
    setLanguage(currentLanguage);
    populateStates();
    populateCropDropdowns(); 
    setupChatbot();
    
    // --- 2. Check login state ---
    if (currentUser) {
        // If logged in, show the app and load user's name
        showApp();
        updateUserName(currentUser.name);
    } else {
        // If not logged in, show the login/register modal
        showModal();
    }
    
    // --- 3. Load dynamic content ---
    loadMarketplaceProducts();
    loadTourismListings();
    loadClassListings();
    // Note: loadAndRenderExpenses() is called by showSection('tracker'), so it's not needed here.

    // --- 4. Add all event listeners ---

    // Listener for "Use My Location" button in Weather
    const liveLocationBtn = document.getElementById('fetchLiveLocationBtn');
    if (liveLocationBtn) {
        liveLocationBtn.addEventListener('click', handleFetchLiveLocationWeather);
    }

    // Listeners for Expense Tracker
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
    }

    const clearBtn = document.getElementById('clearExpensesBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', handleClearAllExpenses);
    }
    // Listener for "Use My Location" button in Soil Test Labs
    const liveLocationSoilBtn = document.getElementById('fetchLiveLocationSoilBtn');
    if (liveLocationSoilBtn) {
        liveLocationSoilBtn.addEventListener('click', handleFetchLiveLocationSoil);
    }
});
/**
 * [NEW] Handles the submission of the new journey entry form
 */
function handleJourneySubmit(event) {
    event.preventDefault();
    if (!currentUser) return;

    const text = document.getElementById('journeyText').value.trim();
    const file = document.getElementById('journeyPhoto').files[0];

    if (!text && !file) {
        alert('Please add notes or a photo to save an entry.');
        return;
    }

    // To save an image in localStorage, we must convert it to a Base64 string
    // This happens asynchronously using a FileReader
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const photoData = e.target.result; // This is the Base64 string
            saveJourneyEntry(text, photoData);
        };
        reader.onerror = (e) => {
            console.error("File reading error:", e);
            alert("Error reading photo. Please try again.");
        };
        reader.readAsDataURL(file); // This starts the reading process
    } else {
        // If there's no file, just save the text entry
        saveJourneyEntry(text, null);
    }
}

/**
 * [NEW] Helper function to save the entry to localStorage
 */
function saveJourneyEntry(text, photoData) {
    const userKey = JOURNEY_KEY_PREFIX + currentUser.phone;
    let journey = JSON.parse(localStorage.getItem(userKey)) || [];

    const newEntry = {
        id: Date.now(),
        text: text,
        photo: photoData, // This is the Base64 string or null
        timestamp: new Date().toISOString()
    };

    journey.push(newEntry);
    localStorage.setItem(userKey, JSON.stringify(journey));

    // Re-render the timeline to show the new post immediately
    renderJourney(journey);
    
    // Reset the form
    document.getElementById('journeyForm').reset();
    showNotification('journeyNotification', 'Journey entry saved!', 'success');
}

/**
 * [NEW] Loads the user's journey from localStorage
 */
function loadFarmerJourney() {
    if (!currentUser) {
        showSection('home');
        return;
    }
    const userKey = JOURNEY_KEY_PREFIX + currentUser.phone;
    const journey = JSON.parse(localStorage.getItem(userKey)) || [];
    renderJourney(journey);
    setLanguage(currentLanguage); // Update translations
}

/**
 * [NEW] Renders the journey entries into the timeline
 */
function renderJourney(journey) {
    const timeline = document.getElementById('journeyTimeline');
    if (!timeline) return;

    if (journey.length === 0) {
        timeline.innerHTML = '<p data-en="Your journey timeline is empty. Add an entry above to get started!" data-ml="നിങ്ങളുടെ ടൈംലൈൻ ശൂന്യമാണ്. ആരംഭിക്കുന്നതിന് മുകളിൽ ഒരു എൻട്രി ചേർക്കുക!" data-hi="आपकी यात्रा टाइमलाइन खाली है। आरंभ करने के लिए ऊपर एक प्रविष्टि जोड़ें!" data-kn="ನಿಮ್ಮ ಜರ್ನಿ ಟೈಮ್‌ಲೈನ್ ಖಾಲಿಯಾಗಿದೆ. ಪ್ರಾರಂಭಿಸಲು ಮೇಲೆ ಒಂದು ನಮೂದನ್ನು ಸೇರಿಸಿ!" data-te="మీ ప్రయాణ టైమ్‌లైన్ ఖాళీగా ఉంది. ప్రారంభించడానికి పైన ఒక ఎంట్రీని జోడించండి!" data-ta="உங்கள் பயண காலவரிசை காலியாக உள்ளது. தொடங்குவதற்கு மேலே ஒரு பதிவைச் சேர்க்கவும்.">Your journey timeline is empty. Add an entry above to get started!</p>';
        return;
    }

    // Show newest entries first
    timeline.innerHTML = journey.slice().reverse().map(entry => {
        // Only create an <img> tag if a photo exists for this entry
        const photoHtml = entry.photo 
            ? `<img src="${entry.photo}" alt="Journey photo">` 
            : '';
        
        // Format the timestamp to be readable
        const date = new Date(entry.timestamp);
        const readableDate = date.toLocaleDateString(currentLanguage, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <div class="journey-card">
                ${photoHtml}
                <div class="journey-content">
                    <p>${entry.text || ''}</p>
                    <div class="timestamp">${readableDate}</div>
                </div>
            </div>
        `;
    }).join('');
}
/**
 * [NEW] Renders the filtered list of the user's SOLD products with images
 */
function renderSoldListings(listings) {
    const container = document.getElementById('mySoldListingsContainer');
    container.innerHTML = '';

    if (listings.length === 0) {
        container.innerHTML = '<p data-en="You have no sold products.">You have no sold products.</p>';
        return;
    }

    // Render newest first
    listings.slice().reverse().forEach(prod => {
        const card = `
            <div class="product-card">
                <img src="${prod.icon}" alt="${prod.name}" onerror="this.src='https://placehold.co/100x100?text=No+Image'" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-color); margin-bottom: 10px; filter: grayscale(100%); opacity: 0.7;">
                <div class="product-info">
                    <h4 class="product-title">${prod.name}</h4>
                    <p class="product-description">${prod.desc}</p>
                    <div class="product-price">₹${prod.price} / kg</div>
                    <div class="product-info-sold" data-en="SOLD">SOLD</div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// --- [CLOUD UPGRADE] UPDATE STATUS ON FIREBASE ---
async function markProductAsSold(productId) {
    if (!confirm('Are you sure you want to mark this product as sold?')) {
        return;
    }

    try {
        // ---> FIREBASE MAGIC: Find the specific document ID and update the isSold field <---
        await db.collection("products").doc(productId.toString()).update({
            isSold: true
        });
        
        // Refresh the UI from the cloud
        await loadProfilePage();
        await loadMarketplaceProducts();
        alert("Product successfully marked as sold in the cloud!");

    } catch (error) {
        console.error("Firebase Update Error:", error);
        alert("Failed to update status on the server. Please try again.");
    }
}

/**
 * [NEW] Fixes the Community Tab functionality
 */
function showJourneyTab(tabName, tabElement) {
    // 1. Hide all tab content
    document.querySelectorAll('#journey .market-tab').forEach(tab => tab.classList.remove('active'));
    
    // 2. Deactivate all tab buttons
    document.querySelectorAll('#journey .marketplace-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // 3. Show the correct tab content
    const tabId = (tabName === 'my') ? 'myJourneyTab' : 'communityJourneyTab';
    document.getElementById(tabId).classList.add('active');
    
    // 4. Activate the clicked button
    tabElement.classList.add('active');

    // 5. Load data for the clicked tab
    if (tabName === 'my') {
        loadFarmerJourney(); // Reload your journey
    } else if (tabName === 'community') {
        loadCommunityJourney(); // Load the community journey
    }
}

/**
 * [NEW] Loads and renders all posts from all users
 */
function loadCommunityJourney() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const communityTimeline = document.getElementById('communityTimeline');
    communityTimeline.innerHTML = '';
    let allEntries = [];

    users.forEach(user => {
        const userKey = JOURNEY_KEY_PREFIX + user.phone;
        const journey = JSON.parse(localStorage.getItem(userKey)) || [];
        
        journey.forEach(entry => {
            allEntries.push({
                ...entry,
                userName: user.name
            });
        });
    });

    allEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (allEntries.length === 0) {
        communityTimeline.innerHTML = '<p data-en="No community posts yet!" data-ml="കമ്മ്യൂണിറ്റി പോസ്റ്റുകളൊന്നുമില്ല!" data-hi="अभी तक कोई सामुदायिक पोस्ट नहीं है!" data-kn="ಇನ್ನೂ ಯಾವುದೇ ಸಮುದಾಯ ಪೋಸ್ಟ್‌ಗಳಿಲ್ಲ!" data-te="సంఘం పోస్ట్‌లు ఇంకా లేవు!" data-ta="சமூக இடுகைகள் எதுவும் இல்லை!">No community posts yet!</p>';
        return;
    }

    communityTimeline.innerHTML = allEntries.map(entry => {
        const photoHtml = entry.photo ? `<img src="${entry.photo}" alt="Journey photo">` : '';
        const date = new Date(entry.timestamp);
        const readableDate = date.toLocaleDateString(currentLanguage, {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        return `
            <div class="journey-card">
                ${photoHtml}
                <div class="journey-content">
                    <p style="font-weight: 700; color: #333;">${entry.userName || 'A Farmer'} shared:</p>
                    <p>${entry.text || ''}</p>
                    <div class="timestamp">${readableDate}</div>
                </div>
            </div>
        `;
    }).join('');
    
    setLanguage(currentLanguage);
}
/**
 * [UPDATED] Finds and displays soil test labs using a live embedded Map
 */
function findSoilTestLabs() {
    const state = document.getElementById('soilTestState').value;
    const district = document.getElementById('soilTestDistrict').value;
    const resultDiv = document.getElementById('soilTestResultContainer');

    resultDiv.innerHTML = ''; // Clear previous results

    if (!state || !district) {
        resultDiv.innerHTML = `<p style="color:red; text-align:center;">Please select both a State and a District.</p>`;
        return;
    }

    // Create a search query for Google Maps
    const searchQuery = encodeURIComponent(`Soil Testing Laboratory in ${district}, ${state}, India`);

    // Build the HTML with a responsive Google Maps iframe
    let html = `
        <h3 class="forecast-heading" 
            data-en="Labs Found near ${district}" 
            data-ml="${district}-ൽ കണ്ടെത്തിയ ലാബുകൾ" 
            data-hi="${district} के पास पाई गई लैब्स" 
            data-kn="${district} ಹತ್ತಿರ ಲ್ಯಾಬ್‌ಗಳು" 
            data-te="${district} సమీపంలో ప్రయోగశాలలు" 
            data-ta="${district} அருகில் ஆய்வகங்கள்">
            Labs Found near ${district}
        </h3>
        <p style="text-align:center; color:#666; margin-bottom: 1rem;" 
           data-en="Interact with the map below to see addresses, phone numbers, and directions.">
           Interact with the map below to see addresses, phone numbers, and directions.
        </p>
        
        <div style="width: 100%; height: 450px; border-radius: 12px; overflow: hidden; border: 2px solid #6ba030; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <iframe
                width="100%"
                height="100%"
                frameborder="0"
                style="border:0"
                src="https://maps.google.com/maps?q=${searchQuery}&t=&z=10&ie=UTF8&iwloc=&output=embed"
                allowfullscreen>
            </iframe>
        </div>
        
        <div style="margin-top: 1.5rem; text-align: center;">
            <a href="https://www.google.com/maps/search/${searchQuery}" target="_blank" class="feature-btn" style="text-decoration: none;">
                🗺️ Open in Google Maps App
            </a>
        </div>
    `;
    
    resultDiv.innerHTML = html;
    setLanguage(currentLanguage); // Ensure UI updates to correct language
}
/**
 * [NEW] Handles the "Use My Current Location" button for Cold Storage
 */
function handleFetchLiveLocationColdStorage() {
    const resultDiv = document.getElementById('coldStorageResultContainer');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `<p style="text-align:center;">📍 Requesting your location... Please check your browser for a permission prompt.</p>`;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Note: Fixed the Google Maps embed URL format here
                const searchQuery = encodeURIComponent(`Cold Storage near ${lat},${lon}`);
                
                let html = `
                    <h3 class="forecast-heading">Cold Storage Near You</h3>
                    <p style="text-align:center; color:#666; margin-bottom: 1rem;">
                       Showing cold storage facilities closest to your current location.
                    </p>
                    
                    <div style="width: 100%; height: 450px; border-radius: 12px; overflow: hidden; border: 2px solid #4a90e2; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                        <iframe
                            width="100%"
                            height="100%"
                            frameborder="0"
                            style="border:0"
                            src="https://maps.google.com/maps?q=${searchQuery}&t=&z=10&ie=UTF8&iwloc=&output=embed"
                            allowfullscreen>
                        </iframe>
                    </div>
                `;
                resultDiv.innerHTML = html;
            },
            (error) => {
                resultDiv.innerHTML = `<p style="color:red; text-align:center;">Unable to retrieve location. Please check your browser permissions or use the state/district dropdowns below.</p>`;
            }
        );
    } else {
        resultDiv.innerHTML = `<p style="color:red; text-align:center;">Geolocation is not supported by your browser. Please use the manual search.</p>`;
    }
}

/**
 * [NEW] Finds and displays cold storage labs using a manual dropdown search
 */
function findColdStorage() {
    const state = document.getElementById('coldStorageState').value;
    const district = document.getElementById('coldStorageDistrict').value;
    const resultDiv = document.getElementById('coldStorageResultContainer');

    resultDiv.innerHTML = ''; 

    if (!state || !district) {
        resultDiv.innerHTML = `<p style="color:red; text-align:center;">Please select both a State and a District.</p>`;
        return;
    }

    const searchQuery = encodeURIComponent(`Cold Storage in ${district}, ${state}, India`);

    let html = `
        <h3 class="forecast-heading" data-en="Cold Storage near ${district}">
            Cold Storage near ${district}
        </h3>
        <p style="text-align:center; color:#666; margin-bottom: 1rem;" data-en="Interact with the map below to see addresses, phone numbers, and directions.">
           Interact with the map below to see addresses, phone numbers, and directions.
        </p>
        
        <div style="width: 100%; height: 450px; border-radius: 12px; overflow: hidden; border: 2px solid #4a90e2; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <iframe
                width="100%"
                height="100%"
                frameborder="0"
                style="border:0"
                src="https://maps.google.com/maps?q=${searchQuery}&t=&z=10&ie=UTF8&iwloc=&output=embed"
                allowfullscreen>
            </iframe>
        </div>
        
        <div style="margin-top: 1.5rem; text-align: center;">
            <a href="https://maps.google.com/maps?q=${searchQuery}" target="_blank" class="feature-btn" style="text-decoration: none; background-color: #4a90e2;">
                🗺️ Open in Google Maps App
            </a>
        </div>
    `;
    
    resultDiv.innerHTML = html;
    setLanguage(currentLanguage); 
}


/**
 * [NEW] Opens the contact modal, populated with tourism data
 */
function openTourismContactModal(listingId) {
    const listing = allTourismListings.find(l => l.id === listingId);
    if (!listing) {
        console.error('Listing not found!');
        return;
    }
    
    if (!currentUser) {
        alert('Please log in or register to contact farmers.');
        showModal();
        return;
    }

    const seller = listing.farmer;
    const modal = document.getElementById('contactModal');

    // 1. Populate the seller info
    document.getElementById('contactProductName').textContent = listing.farmName; // Use farm name as "product"
    document.getElementById('contactSellerName').value = seller.name;
    document.getElementById('contactSellerPhone').value = seller.phone;
    document.getElementById('contactSellerAddress').value = seller.address;

    // 2. Store data on the modal for the generic sendMessage function
    modal.dataset.sellerPhone = seller.phone;
    modal.dataset.productId = listing.id;
    modal.dataset.productName = listing.farmName; // Pass farm name

    // 3. Show the modal
    modal.classList.add('show');
    setLanguage(currentLanguage);
}
/**
 * [NEW] Loads the settings page and pre-fills the name form
 */
function loadSettingsPage() {
    if (!currentUser) return;
    
    // Pre-fill the current name
    document.getElementById('settingsName').value = currentUser.name;
    
    // Clear any old password fields and notifications
    document.getElementById('settingsPasswordForm').reset();
    document.getElementById('settingsNameNotification').classList.remove('show');
    document.getElementById('settingsPasswordNotification').classList.remove('show');
}

/**
 * [NEW] Handles the user updating their name
 */
function handleUpdateName(event) {
    event.preventDefault();
    if (!currentUser) return;

    const newName = document.getElementById('settingsName').value.trim();
    if (!newName) {
        showNotification('settingsNameNotification', 'Name cannot be empty.', 'error');
        return;
    }
    
    if (newName === currentUser.name) {
        showNotification('settingsNameNotification', 'Name is unchanged.', 'error');
        return;
    }

    // 1. Update the global 'users' array in localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.map(user => {
        if (user.phone === currentUser.phone) {
            return { ...user, name: newName };
        }
        return user;
    });
    localStorage.setItem('users', JSON.stringify(users));

    // 2. Update the 'currentUser' object in localStorage
    currentUser.name = newName;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // 3. Update the UI
    updateUserName(newName); // Updates the header
    showNotification('settingsNameNotification', 'Name updated successfully!', 'success');
}

/**
 * [NEW] Handles the user changing their password
 */
function handleUpdatePassword(event) {
    event.preventDefault();
    if (!currentUser) return;

    const oldPassword = document.getElementById('settingsOldPassword').value;
    const newPassword = document.getElementById('settingsNewPassword').value;

    // 1. Validate old password
    if (oldPassword !== currentUser.password) {
        showNotification('settingsPasswordNotification', 'Old password does not match.', 'error');
        return;
    }

    if (!newPassword || newPassword.length < 4) { // Simple validation
        showNotification('settingsPasswordNotification', 'New password must be at least 4 characters.', 'error');
        return;
    }

    // 2. Update the global 'users' array in localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.map(user => {
        if (user.phone === currentUser.phone) {
            return { ...user, password: newPassword };
        }
        return user;
    });
    localStorage.setItem('users', JSON.stringify(users));

    // 3. Update the 'currentUser' object in localStorage
    currentUser.password = newPassword;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // 4. Update UI
    showNotification('settingsPasswordNotification', 'Password changed successfully!', 'success');
    document.getElementById('settingsPasswordForm').reset();
}
/**
 * [NEW] Handles switching tabs in the Agri-Classes section
 */
function showClassesTab(tabName, tabElement) {
    // 1. Hide all tab content
    document.querySelectorAll('#classes .market-tab').forEach(tab => tab.classList.remove('active'));
    
    // 2. Deactivate all tab buttons
    document.querySelectorAll('#classes .marketplace-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // 3. Show the correct tab content
    const tabId = (tabName === 'find') ? 'classesFindTab' : 'classesListTab';
    document.getElementById(tabId).classList.add('active');
    
    // 4. Activate the clicked button
    tabElement.classList.add('active');
}

/**
 * [NEW] Handles submission of a new Agri-Class listing
 */
function handleClassSubmit(event) {
    event.preventDefault();
    if (!currentUser) {
        alert('Please log in to list your class.');
        return;
    }
    
    // 1. Get data from the form
    const newListing = {
        id: Date.now(),
        className: document.getElementById('className').value,
        price: document.getElementById('classPrice').value,
        desc: document.getElementById('classDesc').value,
        location: `${currentUser.district}, ${currentUser.state}`,
        instructor: { // Use 'instructor' instead of 'farmer'
            name: currentUser.name,
            phone: currentUser.phone,
            address: `${currentUser.district}, ${currentUser.state}`
        }
    };

    // 2. Get existing listings, add new one, save
    let listings = JSON.parse(localStorage.getItem(AGRI_CLASSES_KEY)) || [];
    listings.push(newListing);
    localStorage.setItem(AGRI_CLASSES_KEY, JSON.stringify(listings));
    
    // 3. Show notification and reset form
    showNotification('classListNotification', 'Successfully listed your class!', 'success');
    document.getElementById('classListForm').reset();
    
    // 4. Refresh the "Find" tab list
    loadClassListings();
    
    // 5. Switch back to the "Find" tab
    const findTabButton = document.querySelector('#classes .marketplace-tabs .tab-btn[onclick*="\'find\'"]');
    if (findTabButton) {
        showClassesTab('find', findTabButton);
    }
}

/**
 * [NEW] Loads and renders all agri-class listings
 */
function loadClassListings() {
    let listings = JSON.parse(localStorage.getItem(AGRI_CLASSES_KEY));

    if (!listings) {
        listings = mockAgriClasses;
        localStorage.setItem(AGRI_CLASSES_KEY, JSON.stringify(listings));
    }
    
    allClassListings = listings; // Save to global variable
    
    const container = document.getElementById('classListingsGrid');
    container.innerHTML = ''; 

    if (listings.length === 0) {
        container.innerHTML = '<p>No classes or workshops listed yet.</p>';
        return;
    }

    listings.slice().reverse().forEach(listing => {
        const isMyListing = (currentUser && listing.instructor.phone === currentUser.phone);

        const card = `
            <div class="listing-card">
                <h4>${listing.className}</h4>
                <p><strong>Location:</strong> ${listing.location}</p>
                <p>${listing.desc}</p>
                <div class="price">₹${listing.price} <span style="font-size: 1rem; color: #666;">/ person</span></div>
                
                <button 
                    class="feature-btn" 
                    style="width:100%;" 
                    onclick="openClassContactModal(${listing.id})"
                    ${isMyListing ? 'disabled' : ''}
                >
                    ${isMyListing ? 'This is Your Class' : 'Contact Instructor'}
                </button>
            </div>
        `;
        container.innerHTML += card;
    });
}

/**
 * [NEW] Opens the contact modal, populated with class data
 */
function openClassContactModal(listingId) {
    const listing = allClassListings.find(l => l.id === listingId);
    if (!listing) {
        console.error('Class listing not found!');
        return;
    }
    
    if (!currentUser) {
        alert('Please log in or register to contact instructors.');
        showModal();
        return;
    }

    const instructor = listing.instructor;
    const modal = document.getElementById('contactModal');

    // 1. Populate the seller info
    document.getElementById('contactProductName').textContent = listing.className; // Use class name
    document.getElementById('contactSellerName').value = instructor.name;
    document.getElementById('contactSellerPhone').value = instructor.phone;
    document.getElementById('contactSellerAddress').value = instructor.address;

    // 2. Store data on the modal for the generic sendMessage function
    modal.dataset.sellerPhone = instructor.phone;
    modal.dataset.productId = listing.id;
    modal.dataset.productName = listing.className; // Pass class name

    // 3. Show the modal
    modal.classList.add('show');
    setLanguage(currentLanguage);
}
/**
 * Toggles the mobile menu visibility
 */
function toggleMobileMenu() {
    const headerContent = document.querySelector('.header-content');
    headerContent.classList.toggle('mobile-open');
}

// Optional: Close menu when a link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.header-content').classList.remove('mobile-open');
    });
});
// --- [NEW] AI-POWERED CROP RECOMMENDATION ENGINE ---
async function fetchCropRecommendations() {
    const state = document.getElementById('recState').value;
    const district = document.getElementById('recDistrict').value;
    const soilType = document.getElementById('recSoilType').value;
    const recDiv = document.getElementById('cropRecommendations');

    // Get the optional lab values
    const ph = document.getElementById('recPH').value;
    const n = document.getElementById('recN').value;
    const p = document.getElementById('recP').value;
    const k = document.getElementById('recK').value;

    // 1. Validation
    if (!state || !district || !soilType) {
        recDiv.style.display = 'block';
        recDiv.innerHTML = `<p style="color:red; text-align:center; padding: 1rem;">Please select at least your State, District, and Soil Type.</p>`;
        return;
    }

    // 2. Show Loading UI
    recDiv.style.display = 'block';
    recDiv.innerHTML = `
        <div style="text-align:center; padding: 3rem 1rem; background: var(--surface-color); border-radius: 12px; border: 1px solid var(--border-color);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🧠</div>
            <p style="font-weight: 800; font-size: 1.2rem; color: var(--primary);">AI Engine Analyzing Soil Data...</p>
            <p style="font-size:0.9rem; color:var(--text-muted);">Cross-referencing ${soilType} soil parameters in ${district} against ideal NPK ratios...</p>
        </div>`;

    // Simulate AI Calculation delay
    await new Promise(r => setTimeout(r, 1500));

    // 3. The Agricultural Database (Ideal Conditions)
    const cropRequirements = {
        "Rice": { soil: ["Clay", "Loamy"], ph: ["Acidic (5.5 - 6.5)", "Neutral (6.5 - 7.5)"], N: "High", P: "Medium", K: "Medium" },
        "Wheat": { soil: ["Loamy", "Clay"], ph: ["Neutral (6.5 - 7.5)"], N: "High", P: "Medium", K: "Medium" },
        "Cotton": { soil: ["Clay"], ph: ["Neutral (6.5 - 7.5)", "Alkaline (> 7.5)"], N: "High", P: "High", K: "High" },
        "Groundnut": { soil: ["Sandy", "Loamy"], ph: ["Acidic (5.5 - 6.5)"], N: "Low", P: "Medium", K: "High" },
        "Sugarcane": { soil: ["Clay", "Loamy"], ph: ["Neutral (6.5 - 7.5)"], N: "High", P: "High", K: "High" },
        "Millets": { soil: ["Sandy", "Loamy"], ph: ["Acidic (5.5 - 6.5)", "Neutral (6.5 - 7.5)", "Alkaline (> 7.5)"], N: "Low", P: "Low", K: "Low" },
        "Maize": { soil: ["Loamy", "Sandy"], ph: ["Neutral (6.5 - 7.5)"], N: "High", P: "Medium", K: "Medium" },
        "Chickpea": { soil: ["Loamy", "Clay"], ph: ["Neutral (6.5 - 7.5)"], N: "Low", P: "Medium", K: "Medium" },
        "Tea": { soil: ["Loamy"], ph: ["Very Acidic (< 5.5)", "Acidic (5.5 - 6.5)"], N: "High", P: "Medium", K: "Medium" },
        "Banana": { soil: ["Loamy", "Clay"], ph: ["Acidic (5.5 - 6.5)", "Neutral (6.5 - 7.5)"], N: "High", P: "Medium", K: "High" },
        "Turmeric": { soil: ["Loamy"], ph: ["Acidic (5.5 - 6.5)", "Neutral (6.5 - 7.5)"], N: "Medium", P: "Medium", K: "High" },
        "Soybean": { soil: ["Loamy", "Clay"], ph: ["Neutral (6.5 - 7.5)"], N: "Low", P: "Medium", K: "Medium" }
    };

    // Helper to score levels mathematically
    const getLevelScore = (val) => {
        if (val === 'Low') return 1;
        if (val === 'Medium') return 2;
        if (val === 'High') return 3;
        return 0;
    };

    let scoredCrops = [];

    // 4. The Scoring Algorithm
    for (const [crop, reqs] of Object.entries(cropRequirements)) {
        let score = 100;
        let feedback = [];

        // Soil Match (Heavy penalty if wrong soil)
        if (!reqs.soil.includes(soilType)) {
            score -= 25;
            feedback.push(`Requires ${reqs.soil.join(' or ')} soil.`);
        }

        // pH Match
        if (ph && !reqs.ph.includes(ph)) {
            score -= 15;
            feedback.push(`Prefers ${reqs.ph[0].split('(')[0].trim()} pH.`);
        }

        // NPK Matching
        if (n) {
            const diff = Math.abs(getLevelScore(n) - getLevelScore(reqs.N));
            if (diff > 0) { score -= (diff * 10); feedback.push(`Needs ${reqs.N} Nitrogen (Currently ${n}).`); }
        }
        if (p) {
            const diff = Math.abs(getLevelScore(p) - getLevelScore(reqs.P));
            if (diff > 0) { score -= (diff * 10); feedback.push(`Needs ${reqs.P} Phosphorus.`); }
        }
        if (k) {
            const diff = Math.abs(getLevelScore(k) - getLevelScore(reqs.K));
            if (diff > 0) { score -= (diff * 10); feedback.push(`Needs ${reqs.K} Potassium.`); }
        }

        // Only keep crops that score above a failure threshold
        if (score > 35) {
            scoredCrops.push({ name: crop, score: score, feedback: feedback });
        }
    }

    // Sort by highest score and take the top 4
    scoredCrops.sort((a, b) => b.score - a.score);
    const topCrops = scoredCrops.slice(0, 4);

    if (topCrops.length === 0) {
        recDiv.innerHTML = `
            <div style="padding: 2rem; text-align: center; border: 2px solid #ef4444; border-radius: 12px; background: #fef2f2;">
                <h4 style="color: #b91c1c; font-size: 1.2rem; margin-bottom: 0.5rem;">⚠️ High Risk Conditions</h4>
                <p style="color: #7f1d1d;">No optimal crops found for these exact chemical conditions. Consider soil remediation (pH balancing or heavy fertilization) before planting.</p>
            </div>`;
        return;
    }

    // 5. Build the UI
    let html = `
        <div style="border: 2px solid var(--primary); border-radius: 12px; overflow: hidden; background: var(--surface-color); box-shadow: var(--shadow-card);">
            <div style="background: var(--primary); color: white; padding: 15px 20px; font-weight: bold; font-size: 1.1rem; display: flex; justify-content: space-between; align-items: center;">
                <span>✅ AI Analysis Complete</span>
                <span style="font-size: 0.85rem; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px;">📍 ${district}, ${state}</span>
            </div>
            <div style="padding: 20px;">
                <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 0.95rem;">Based on your <strong>${soilType}</strong> soil and laboratory inputs, here are the most scientifically viable crops ranked by compatibility.</p>
                
                <div style="display: flex; flex-direction: column; gap: 15px;">
    `;

    topCrops.forEach(crop => {
        // Use translation logic to show the name in the user's selected language
        const cropData = allMajorCrops[crop.name];
        const displayName = cropData ? (cropData[currentLanguage] || cropData.en) : crop.name;
        
        // Dynamic colors based on score
        let color = '#16a34a'; // Green
        let bgTint = '#f0fdf4';
        if (crop.score < 75) { color = '#f59e0b'; bgTint = '#fffbeb'; } // Orange
        if (crop.score < 55) { color = '#ef4444'; bgTint = '#fef2f2'; } // Red

        let adviceHtml = '';
        if (crop.feedback.length > 0) {
            adviceHtml = `<div style="margin-top: 12px; font-size: 0.85rem; color: #92400e; background: #fef3c7; padding: 10px; border-radius: 6px; border-left: 3px solid #f59e0b;">
                <strong>⚠️ Action Needed:</strong> ${crop.feedback.join(' ')}
            </div>`;
        } else {
            adviceHtml = `<div style="margin-top: 12px; font-size: 0.85rem; color: #15803d; background: #f0fdf4; padding: 10px; border-radius: 6px; border-left: 3px solid #16a34a;">
                <strong>🌟 Perfect Match:</strong> Your soil conditions are absolutely ideal for this crop!
            </div>`;
        }

        html += `
            <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; background: ${bgTint};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--text-dark);">${displayName}</h4>
                    <span style="font-weight: 800; color: ${color}; font-size: 1.2rem;">${crop.score}% Match</span>
                </div>
                
                <div style="width: 100%; background: #cbd5e1; height: 10px; border-radius: 5px; overflow: hidden;">
                    <div style="width: ${crop.score}%; background: ${color}; height: 100%; border-radius: 5px;"></div>
                </div>
                
                ${adviceHtml}
            </div>
        `;
    });

    html += `
                </div>
            </div>
        </div>
    `;

    recDiv.innerHTML = html;
}
// --- Government Schemes Logic ---

function showSchemesTab(tabName, tabElement) {
    document.querySelectorAll('#schemes .market-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('#schemes .marketplace-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const tabId = `schemes${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`;
    const tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');
    
    if (tabElement) tabElement.classList.add('active');
}

// --- Government Schemes Logic ---

function showSchemesTab(tabName, tabElement) {
    document.querySelectorAll('#schemes .market-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('#schemes .marketplace-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));

    const tabId = `schemes${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`;
    document.getElementById(tabId).classList.add('active');
    tabElement.classList.add('active');
}

function loadSchemesPage() {
    const adminContainer = document.getElementById('adminUpdateContainer');
    if (adminContainer) {
        if (currentUser && currentUser.role === 'admin') {
            adminContainer.style.display = 'block';
        } else {
            adminContainer.style.display = 'none';
        }
    }

    const stateDropdown = document.getElementById('schemeStateFilter');
    if (stateDropdown && currentUser && currentUser.state && currentUser.state !== 'All') {
        for (let i = 0; i < stateDropdown.options.length; i++) {
            if (stateDropdown.options[i].value === currentUser.state) {
                stateDropdown.selectedIndex = i;
                break;
            }
        }
    }

    fetchLiveGovtSchemes();
    fetchLiveGovtUpdates(); 
}

// 1. Fetch Updates (Live Scams/Alerts)
async function fetchLiveGovtUpdates() {
    const updatesContainer = document.getElementById('govtUpdatesList');
    if (!updatesContainer) return;

    updatesContainer.innerHTML = `<div style="text-align:center; padding: 2rem;">⏳ Fetching live official updates...</div>`;

    const apiUrl = 'https://gist.githubusercontent.com/pranavpatil1310/2fbacd0bd0b10586c6728411972c1b47/raw/updates.json';
    const cacheBusterUrl = apiUrl + '?time=' + new Date().getTime();

    let allUpdates = [];

    try {
        const response = await fetch(cacheBusterUrl);
        if (!response.ok) throw new Error("Network error");
        allUpdates = await response.json();
    } catch (error) {
        allUpdates = mockGovtUpdates; 
    }

    const localAdminUpdates = JSON.parse(localStorage.getItem(GOVT_UPDATES_KEY)) || [];
    allUpdates = [...localAdminUpdates, ...allUpdates];

    const userState = (currentUser && currentUser.state) ? currentUser.state : 'All';
    const applicableUpdates = allUpdates.filter(update => {
        if (currentUser && currentUser.role === 'admin') return true; 
        return !update.state || update.state === 'All' || update.state === userState;
    });

    updatesContainer.innerHTML = '';
    
    applicableUpdates.forEach(update => {
        const safeState = (update.state && String(update.state) !== 'undefined') ? update.state : 'All';
        const stateTag = safeState === 'All' ? '🇮🇳 Central Update' : `📍 ${safeState} Update`;
        const localTag = update.id > 1000000000000 ? `<span style="background:#0cc832; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; margin-left:5px;">Live Post</span>` : '';

        updatesContainer.innerHTML += `
            <div class="update-card ${update.isUrgent ? 'urgent' : ''}" style="text-align: left;">
                <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap: 10px;">
                    <div><span class="official-badge ${update.isUrgent ? 'urgent' : ''}">${update.isUrgent ? '⚠️ URGENT ALERT' : '✅ VERIFIED GOVT UPDATE'}</span>${localTag}</div>
                    <span style="font-size: 0.8rem; color: #666; font-weight: bold;">${stateTag}</span>
                </div>
                <h3 style="margin: 0.5rem 0; color: #333;">${update.title}</h3>
                <p style="font-size: 1.05rem; line-height: 1.5;">${update.message}</p>
                <span style="font-size: 0.85rem; color: #666;">Posted on: ${update.date}</span>
            </div>
        `;
    });
}

// 2. Fetch Schemes (Live Cloud API)
async function fetchLiveGovtSchemes() {
    const schemesContainer = document.getElementById('govtSchemesList');
    if (!schemesContainer) return;

    schemesContainer.innerHTML = `<div style="text-align:center; padding: 2rem;">⏳ Fetching live schemes from Cloud Server...</div>`;

    const stateDropdown = document.getElementById('schemeStateFilter');
    const targetState = stateDropdown ? stateDropdown.value : 'All';

    // REMOVED COMMIT HASH - Now it's dynamic!
    const apiUrl = 'https://gist.githubusercontent.com/pranavpatil1310/eaf11cf67d3fb9e309787a2ceb868e73/raw/schemes.json';
    const cacheBusterUrl = apiUrl + '?time=' + new Date().getTime();

    try {
        const response = await fetch(cacheBusterUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        const allCloudSchemes = await response.json();

        const applicableSchemes = allCloudSchemes.filter(scheme =>
            scheme.level === 'Central' || scheme.state === targetState
        );

        renderSchemeCards(applicableSchemes, targetState, true);

    } catch (error) {
        console.error("Cloud Fetch Failed:", error);
        const fallbackSchemes = mockGovtSchemes.filter(scheme =>
            scheme.level === 'Central' || scheme.state === targetState
        );
        renderSchemeCards(fallbackSchemes, targetState, false);
    }
}

function renderSchemeCards(schemesArray, state, isLive) {
    const schemesContainer = document.getElementById('govtSchemesList');
    schemesContainer.innerHTML = '';

    const statusBadge = isLive
        ? `<span style="background:#0cc832; color:white; padding:3px 8px; border-radius:4px; font-size:0.8rem;">🟢 Live API Data</span>`
        : `<span style="background:#f39c12; color:white; padding:3px 8px; border-radius:4px; font-size:0.8rem;">🟡 Offline Database</span>`;

    schemesContainer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
            <h3 style="color: #2d5016; margin:0;">Showing schemes for: <strong>${state}</strong></h3>
            ${statusBadge}
        </div>
    `;

    if (schemesArray.length === 0) {
        schemesContainer.innerHTML += `<p>No specific state schemes found. Viewing Central schemes is recommended.</p>`;
        return;
    }

    schemesArray.forEach(scheme => {
        const badgeColor = scheme.level === 'Central' ? '#4a90e2' : '#e67e22';
        schemesContainer.innerHTML += `
            <div class="listing-card" style="border-left: 5px solid ${badgeColor}; text-align: left;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h4 style="margin:0;">${scheme.title}</h4>
                    <span style="background:${badgeColor}20; color:${badgeColor}; padding:3px 8px; border-radius:8px; font-weight:bold; font-size:0.8rem;">
                        ${scheme.level || 'State'} Scheme
                    </span>
                </div>
                <p style="margin-top: 1rem;">${scheme.desc || scheme.description}</p>
                <div class="price" style="text-align:left; color:#2d5016; font-size: 1.1rem; font-weight:bold; margin-top: 5px;">${scheme.amount || ''}</div>
            </div>
        `;
    });
}

// 3. Admin Posting Logic
function handlePostGovtUpdate(event) {
    event.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') {
        alert("Unauthorized.");
        return;
    }

    const targetStateDropdown = document.getElementById('updateState');
    const targetState = targetStateDropdown ? targetStateDropdown.value : 'All';
    const title = document.getElementById('updateTitle').value;
    const message = document.getElementById('updateMessage').value;
    const isUrgent = document.getElementById('updateUrgent').checked;

    let updates = JSON.parse(localStorage.getItem(GOVT_UPDATES_KEY)) || [];

    updates.push({
        id: Date.now(),
        state: targetState,
        title: title,
        message: message,
        isUrgent: isUrgent,
        date: new Date().toLocaleDateString('en-IN')
    });

    localStorage.setItem(GOVT_UPDATES_KEY, JSON.stringify(updates));
    showNotification('updateNotification', 'Official update posted successfully!', 'success');
    document.getElementById('govtUpdateForm').reset();
    
    loadSchemesPage();
}
// --- Government Schemes & Vigilance Logic ---

function loadSchemesPage() {
    const adminContainer = document.getElementById('adminUpdateContainer');
    if (currentUser && currentUser.role === 'admin') {
        adminContainer.style.display = 'block';
    } else {
        adminContainer.style.display = 'none';
    }

    const stateDropdown = document.getElementById('schemeStateFilter');
    if (stateDropdown && currentUser && currentUser.state && currentUser.state !== 'All') {
        for (let i = 0; i < stateDropdown.options.length; i++) {
            if (stateDropdown.options[i].value === currentUser.state) {
                stateDropdown.selectedIndex = i; break;
            }
        }
    }

    fetchLiveGovtSchemes(); 
    fetchLiveGovtUpdates(); 
}

function showSchemesTab(tabName, btnElement) {
    const tabs = document.querySelectorAll('#schemes .market-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const btns = document.querySelectorAll('#schemes .tab-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    
    const selectedTab = document.getElementById('schemes' + tabName.charAt(0).toUpperCase() + tabName.slice(1) + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    if (btnElement) {
        btnElement.classList.add('active');
    }
}

function handlePostGovtUpdate(event) {
    event.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') return;

    const targetStateDropdown = document.getElementById('updateState');
    const targetState = targetStateDropdown ? targetStateDropdown.value : 'All';
    
    let updates = JSON.parse(localStorage.getItem(GOVT_UPDATES_KEY)) || [];
    updates.push({
        id: Date.now(),
        state: targetState,
        title: document.getElementById('updateTitle').value,
        message: document.getElementById('updateMessage').value,
        isUrgent: document.getElementById('updateUrgent').checked,
        date: new Date().toLocaleDateString('en-IN')
    });

    localStorage.setItem(GOVT_UPDATES_KEY, JSON.stringify(updates));
    showNotification('updateNotification', 'Official update posted successfully!', 'success');
    document.getElementById('govtUpdateForm').reset();
    loadSchemesPage();
}

async function fetchLiveGovtSchemes() {
    const schemesContainer = document.getElementById('govtSchemesList');
    if(!schemesContainer) return; 
    
    schemesContainer.innerHTML = `<div style="text-align:center; padding: 2rem;">⏳ Fetching live schemes from Cloud Server...</div>`;
    
    const stateDropdown = document.getElementById('schemeStateFilter');
    const targetState = stateDropdown ? stateDropdown.value : 'All';

    // Cloud Database Connection
    const apiUrl = 'https://gist.githubusercontent.com/pranavpatil1310/eaf11cf67d3fb9e309787a2ceb868e73/raw/schemes.json';
    const cacheBusterUrl = apiUrl + '?time=' + new Date().getTime();

    try {
        const response = await fetch(cacheBusterUrl);
        if (!response.ok) throw new Error("Network error");
        const allCloudSchemes = await response.json();

        const applicableSchemes = allCloudSchemes.filter(scheme => 
            scheme.level === 'Central' || scheme.state === targetState
        );
        renderSchemeCards(applicableSchemes, targetState, true); 
    } catch (error) {
        console.error("Cloud Fetch Failed:", error);
        const fallbackSchemes = mockGovtSchemes.filter(scheme => 
            scheme.level === 'Central' || scheme.state === targetState
        );
        renderSchemeCards(fallbackSchemes, targetState, false); 
    }
}

function renderSchemeCards(schemesArray, state, isLive) {
    const schemesContainer = document.getElementById('govtSchemesList');
    schemesContainer.innerHTML = ''; 

    if(schemesArray.length === 0) {
        schemesContainer.innerHTML = `<p style="text-align:center;">No specific state schemes found. Viewing Central schemes is recommended.</p>`;
        return;
    }

    schemesArray.forEach(scheme => {
        const badgeColor = scheme.level === 'Central' ? '#4a90e2' : '#e67e22'; 
        
        const docsHtml = scheme.documents ? `<div style="margin-top: 10px; background: #fff3cd; padding: 8px; border-left: 3px solid #ffc107; font-size: 0.85rem; border-radius: 4px;"><strong>📋 Required Documents:</strong><br> ${scheme.documents}</div>` : '';
        const linkHtml = scheme.link ? `<a href="${scheme.link}" target="_blank" style="display: inline-block; margin-top: 12px; background: #2d5016; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 0.9rem; font-weight: bold;">🌐 Apply Directly Online</a>` : '';

        schemesContainer.innerHTML += `
            <div class="listing-card" style="border-left: 5px solid ${badgeColor}; display: block; text-align: left;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h4 style="margin:0;">${scheme.title}</h4>
                    <span style="background:${badgeColor}20; color:${badgeColor}; padding:3px 8px; border-radius:8px; font-weight:bold; font-size:0.8rem;">${scheme.level || 'State'} Scheme</span>
                </div>
                <p style="margin-top: 1rem;">${scheme.desc || scheme.description}</p>
                <div style="text-align:left; color:#2d5016; font-size: 1.1rem; font-weight: bold; margin-top: 5px;">${scheme.amount || ''}</div>
                ${docsHtml}
                ${linkHtml}
            </div>
        `;
    });
}

async function fetchLiveGovtUpdates() {
    const updatesContainer = document.getElementById('govtUpdatesList');
    if (!updatesContainer) return;
    updatesContainer.innerHTML = `<div style="text-align:center; padding: 2rem;">⏳ Fetching live official updates...</div>`;

    const apiUrl = 'https://gist.githubusercontent.com/pranavpatil1310/2fbacd0bd0b10586c6728411972c1b47/raw/updates.json';
    const cacheBusterUrl = apiUrl + '?time=' + new Date().getTime();

    let allUpdates = [];
    try {
        const response = await fetch(cacheBusterUrl);
        if (!response.ok) throw new Error("Network error");
        allUpdates = await response.json();
    } catch (error) {
        allUpdates = mockGovtUpdates; 
    }

    const localAdminUpdates = JSON.parse(localStorage.getItem(GOVT_UPDATES_KEY)) || [];
    allUpdates = [...localAdminUpdates, ...allUpdates];

    const userState = (currentUser && currentUser.state) ? currentUser.state : 'All';
    const applicableUpdates = allUpdates.filter(update => {
        if (currentUser && currentUser.role === 'admin') return true; 
        return !update.state || update.state === 'All' || update.state === userState;
    });

    updatesContainer.innerHTML = '';
    
    if (applicableUpdates.length === 0) {
        updatesContainer.innerHTML = '<p style="text-align:center;">No official updates at this time.</p>';
        return;
    }

    applicableUpdates.forEach(update => {
        const safeState = (update.state && String(update.state) !== 'undefined') ? update.state : 'All';
        const stateTag = safeState === 'All' ? '🇮🇳 Central Update' : `📍 ${safeState} Update`;
        const localTag = update.id > 1000000000000 ? `<span style="background:#0cc832; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; margin-left:5px;">Live Post</span>` : '';

        updatesContainer.innerHTML += `
            <div class="update-card ${update.isUrgent ? 'urgent' : ''}" style="text-align: left;">
                <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap: 10px;">
                    <div><span class="official-badge ${update.isUrgent ? 'urgent' : ''}">${update.isUrgent ? '⚠️ URGENT ALERT' : '✅ VERIFIED GOVT UPDATE'}</span>${localTag}</div>
                    <span style="font-size: 0.8rem; color: #666; font-weight: bold;">${stateTag}</span>
                </div>
                <h3 style="margin: 0.5rem 0; color: #333;">${update.title}</h3>
                <p style="font-size: 1.05rem; line-height: 1.5;">${update.message}</p>
                <span style="font-size: 0.85rem; color: #666;">Posted on: ${update.date}</span>
            </div>
        `;
    });
}

function openCorruptionModal() {
    document.getElementById('corruptionModal').classList.add('show');
    document.getElementById('corruptionForm').style.display = 'block';
    document.getElementById('vigilanceSuccess').style.display = 'none';
}
function closeCorruptionModal() { document.getElementById('corruptionModal').classList.remove('show'); }
function submitCorruptionReport(event) {
    event.preventDefault();
    const trackingId = `VIG-${new Date().getFullYear()}-MH-${Math.floor(100000 + Math.random() * 900000)}`; 
    document.getElementById('corruptionForm').style.display = 'none';
    document.getElementById('trackingIdDisplay').innerText = trackingId;
    document.getElementById('vigilanceSuccess').style.display = 'block';
    document.getElementById('corruptionForm').reset();
}
// --- [NEW] STOCK MARKET STYLE PRICING ENGINE ---

const cropCategories = {
    fruits: ["Apple", "Banana", "Pomegranate", "Grapes", "Mango", "Papaya", "Orange"],
    vegetables: ["Tomato", "Onion", "Potato", "Carrot", "Cabbage", "Spinach", "Garlic"],
    grains: ["Rice", "Wheat", "Maize", "Millets", "Barley", "Sorghum", "Oats"],
    pulses: ["Chickpea", "Pigeon Pea (Toor)", "Lentil (Masoor)", "Moong Dal", "Urad Dal"],
    spices: ["Cardamom", "Black Pepper", "Turmeric", "Ginger", "Cumin", "Clove"],
    cash: ["Cotton", "Sugarcane", "Jute", "Tobacco", "Tea", "Coffee"]
};
// --- [NEW] HYBRID MARKET ENGINE (REAL GOVT DATA + SMART FALLBACK) ---

const AGMARKNET_API_KEY = 'z5LSJp9ojHF30ezQrouzyE0ZLIJPtRKwczDO0ohu';

const categoryMapping = {
    fruits: ["apple", "banana", "pomegranate", "grapes", "mango", "papaya", "orange", "pineapple"],
    vegetables: ["tomato", "onion", "potato", "carrot", "cabbage", "brinjal", "garlic", "cauliflower", "bhindi"],
    grains: ["rice", "wheat", "maize", "jowar", "bajra", "paddy(dhan)"],
    pulses: ["bengal gram(gram)", "arhar (tur/red gram)", "lentil (masur)", "green gram (moong)", "urad"],
    spices: ["turmeric", "garlic", "ginger", "coriander", "chilly capsicum"],
    cash: ["cotton", "sugarcane", "jute", "tobacco"]
};

// Fallback display names if Govt API is down
const displayCrops = {
    fruits: ["Apple", "Banana", "Pomegranate", "Grapes", "Mango", "Papaya", "Orange"],
    vegetables: ["Tomato", "Onion", "Potato", "Carrot", "Cabbage", "Spinach", "Garlic"],
    grains: ["Rice", "Wheat", "Maize", "Millets", "Barley", "Sorghum", "Oats"],
    pulses: ["Chickpea", "Pigeon Pea (Toor)", "Lentil (Masoor)", "Moong Dal", "Urad Dal"],
    spices: ["Cardamom", "Black Pepper", "Turmeric", "Ginger", "Cumin", "Clove"],
    cash: ["Cotton", "Sugarcane", "Jute", "Tobacco", "Tea", "Coffee"]
};

async function showMarketCategory(categoryKey) {
    document.getElementById('marketCategories').style.display = 'none';
    document.getElementById('marketDetailView').style.display = 'block';
    
    const title = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
    document.getElementById('marketCategoryTitle').innerText = `${title} Market Tracker`;

    const tickerGrid = document.getElementById('stockTickerGrid');
    tickerGrid.innerHTML = '<p style="text-align:center; width:100%; font-weight:600; padding: 2rem;">⏳ Connecting to Government API...</p>';

    try {
        const userState = (currentUser && currentUser.state !== "Not Specified") ? currentUser.state : "Maharashtra";
        const apiUrl = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${AGMARKNET_API_KEY}&format=json&filters[state]=${userState}&limit=200`;
        
        // 1. Set a 4-second timeout so the app never freezes if the Govt server is slow
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        
        // 2. Use a stronger proxy
        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(apiUrl)}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error("API Connection Failed");
        const data = await response.json();
        
        if (!data.records || data.records.length === 0) throw new Error("No Govt Data Reported Today");

        const allowedCrops = categoryMapping[categoryKey];
        const uniqueCrops = {};

        // Parse Govt Data
        data.records.forEach(record => {
            const cropName = record.commodity.toLowerCase();
            const matchedCrop = allowedCrops.find(c => cropName.includes(c));
            if (matchedCrop && !uniqueCrops[matchedCrop]) {
                uniqueCrops[matchedCrop] = record;
            }
        });

        const cropsToShow = Object.values(uniqueCrops);
        if (cropsToShow.length === 0) throw new Error("No specific crops in this category today");

        tickerGrid.innerHTML = ''; 

        cropsToShow.forEach(record => {
            const minPrice = parseFloat(record.min_price);
            const maxPrice = parseFloat(record.max_price);
            const modalPrice = parseFloat(record.modal_price);
            
            const spread = maxPrice - minPrice;
            const changeAmount = (spread * 0.15).toFixed(2); 
            const isPositive = Math.random() > 0.4; 

            tickerGrid.innerHTML += buildMarketCard(
                record.commodity, modalPrice, changeAmount, isPositive, 
                minPrice, maxPrice, `📍 ${record.market}, ${record.district}`
            );
        });

    } catch (error) {
        // 3. THE SMART FALLBACK: If anything goes wrong, generate realistic math-based data immediately!
        console.warn("Govt API unavailable. Falling back to offline estimation engine:", error.message);
        renderSimulatedMarketData(categoryKey, tickerGrid);
    }
}

/**
 * Handles rendering the realistic offline data if the Government API fails
 */
function renderSimulatedMarketData(categoryKey, tickerGrid) {
    // Show a polite warning that we are using estimated data instead of crashing
    tickerGrid.innerHTML = `
        <div style="width: 100%; grid-column: 1 / -1; text-align: center; background: #fff3cd; color: #856404; padding: 10px; border-radius: 8px; font-size: 0.9rem; margin-bottom: 1rem; border: 1px solid #ffeeba;">
            ⚠️ Live Govt connection delayed. Displaying estimated local market trends.
        </div>
    `;
    
    const crops = displayCrops[categoryKey];
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    crops.forEach(crop => {
        let basePrice = 0;
        for(let i=0; i<crop.length; i++) basePrice += crop.charCodeAt(i);
        basePrice = (basePrice % 100) * 30 + 1500; 

        const randomMultiplier = Math.sin(dateSeed + basePrice) * 10000;
        const pseudoRandom = randomMultiplier - Math.floor(randomMultiplier);

        const changePercent = (pseudoRandom * 12) - 6; 
        const changeAmount = (basePrice * (changePercent / 100));
        const currentPrice = (basePrice + changeAmount).toFixed(2);
        const isPositive = changePercent >= 0;

        tickerGrid.innerHTML += buildMarketCard(
            crop, currentPrice, Math.abs(changeAmount).toFixed(2), isPositive, 
            (basePrice - 200).toFixed(2), (basePrice + 200).toFixed(2), "📍 Estimated Local Mandi"
        );
    });
}

/**
 * Helper function to build the HTML for the cards cleanly
 */
function buildMarketCard(title, price, change, isPositive, min, max, location) {
    const colorClass = isPositive ? 'stock-up' : 'stock-down';
    const arrow = isPositive ? '▲' : '▼';
    const bgTint = isPositive ? 'rgba(22, 163, 74, 0.05)' : 'rgba(220, 38, 38, 0.05)';
    const borderColor = isPositive ? '#16a34a' : '#dc2626';

    return `
        <div class="listing-card" style="background: ${bgTint}; border-left: 4px solid ${borderColor}; text-align: left;">
            <h4 style="margin-bottom: 0.2rem; font-size: 1.2rem; text-transform: capitalize;">${title}</h4>
            <div style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem; font-weight: 600;">${location}</div>
            
            <div style="font-size: 1.6rem; font-weight: 800; color: var(--text-dark);">
                ₹${price} <span style="font-size: 0.85rem; color: #666; font-weight: normal;">/ Quintal</span>
            </div>
            
            <div class="${colorClass}" style="margin-top: 0.5rem; font-size: 1.1rem;">
                ${arrow} ₹${change}
            </div>
            
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #888; margin-top: 1rem; border-top: 1px solid #ddd; padding-top: 0.5rem;">
                <span>Min: ₹${min}</span>
                <span>Max: ₹${max}</span>
            </div>
        </div>
    `;
}

function backToMarketCategories() {
    document.getElementById('marketCategories').style.display = 'grid';
    document.getElementById('marketDetailView').style.display = 'none';
}
/**
 * Applies UI restrictions based on user role (Farmer vs Retailer)
 */
function applyRoleRestrictions() {
    if (!currentUser) return;

    const isRetailer = currentUser.role === 'retailer';

    // 1. Define allowed sections for Retailers 
    const allowedRetailerSections = ['home', 'market', 'marketplace', 'profile', 'settings', 'tourism'];

    // 2. Filter Navigation Menu Links
    const allNavLinks = document.querySelectorAll('.nav-link');
    allNavLinks.forEach(link => {
        const onclickAttr = link.getAttribute('onclick');
        if (onclickAttr) {
            const sectionMatch = onclickAttr.match(/showSection\('([^']+)'\)/);
            if (sectionMatch) {
                const section = sectionMatch[1];
                if (isRetailer && !allowedRetailerSections.includes(section)) {
                    link.parentElement.style.display = 'none'; // Hide the menu item
                } else {
                    link.parentElement.style.display = 'block'; // Show it
                }
            }
        }
    });

    // 3. Filter Home Page Feature Cards
    const allFeatureCards = document.querySelectorAll('.feature-card');
    allFeatureCards.forEach(card => {
        const onclickAttr = card.getAttribute('onclick');
        if (onclickAttr) {
            const sectionMatch = onclickAttr.match(/showSection\('([^']+)'\)/);
            if (sectionMatch) {
                const section = sectionMatch[1];
                if (isRetailer && !allowedRetailerSections.includes(section)) {
                    card.style.display = 'none'; // Hide card
                } else {
                    card.style.display = 'flex'; // Show card
                }
            }
        }
    });

    // Replace the old Step 4 in applyRoleRestrictions with this:
    // 4. Enforce OLX Marketplace UI (Farmers: Buy/Sell/Chat, Retailers: Buy/Chat)
    const sellTabBtn = document.getElementById('marketSellTabBtn');
    const marketSellContent = document.getElementById('marketSellTab');
    
    if (isRetailer) {
        if (sellTabBtn) sellTabBtn.style.display = 'none';
        if (marketSellContent) marketSellContent.style.display = 'none';
    } else {
        if (sellTabBtn) sellTabBtn.style.display = 'inline-block';
        if (marketSellContent) marketSellContent.style.display = ''; 
    }
    
    // 5. Hide "Products You Are Selling" in Profile for Retailers
    if (isRetailer) {
        const profileSellingHeaders = Array.from(document.querySelectorAll('#profile .forecast-heading'));
        profileSellingHeaders.forEach(heading => {
            if (heading.textContent.includes('Products You Are Selling') || heading.textContent.includes('Sold Products')) {
                heading.style.display = 'none';
            }
        });
        const myListings = document.getElementById('myListingsContainer');
        const mySoldListings = document.getElementById('mySoldListingsContainer');
        if (myListings) myListings.style.display = 'none';
        if (mySoldListings) mySoldListings.style.display = 'none';
    }

    // 6. Hide "List Your Farm" in Agri-Tourism for Retailers
    const listFarmTabBtn = document.querySelector('#tourism .marketplace-tabs .tab-btn[onclick*="\'list\'"]');
    const tourismListContent = document.getElementById('tourismListTab');
    
    if (isRetailer) {
        if (listFarmTabBtn) listFarmTabBtn.style.display = 'none';
        if (tourismListContent) tourismListContent.style.display = 'none';
    } else {
        if (listFarmTabBtn) listFarmTabBtn.style.display = 'inline-block';
        if (tourismListContent) tourismListContent.style.display = '';
    }
}
// ==========================================================================
//   OLX / WHATSAPP STYLE CHAT ENGINE (WITH EXPIRY)
// ==========================================================================
const CHAT_DB_KEY = 'agri_conversations_db';
let currentActiveChatId = null;

/**
 * Initiates a chat when a buyer clicks "Chat" on a product card
 */
function initiateChat(productId) {
    if (!currentUser) {
        alert("Please login to chat with sellers.");
        showModal();
        return;
    }

    const products = JSON.parse(localStorage.getItem(MARKET_PRODUCTS_KEY)) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) return alert("Product no longer exists.");

    // Generate a unique Conversation ID based on Product + Buyer Phone
    const convoId = `conv_${productId}_${currentUser.phone}`;
    let allConvos = JSON.parse(localStorage.getItem(CHAT_DB_KEY)) || {};

    // If chat doesn't exist, create it
    if (!allConvos[convoId]) {
        allConvos[convoId] = {
            id: convoId,
            productId: product.id,
            productName: product.name,
            sellerPhone: product.seller.phone,
            sellerName: product.seller.name,
            buyerPhone: currentUser.phone,
            buyerName: currentUser.name,
            lastUpdated: Date.now(),
            messages: []
        };
        localStorage.setItem(CHAT_DB_KEY, JSON.stringify(allConvos));
    }

    // Switch to the Chat Tab
    const chatTabBtn = document.getElementById('marketChatTabBtn');
    showMarketplaceTab('chat', chatTabBtn);
    
    // Load threads and open this specific chat
    loadChatThreads();
    openConversation(convoId);
}

/**
 * Loads the sidebar list of conversations, enforcing Expiry Logic
 */
function loadChatThreads() {
    if (!currentUser) return;
    
    let allConvos = JSON.parse(localStorage.getItem(CHAT_DB_KEY)) || {};
    const products = JSON.parse(localStorage.getItem(MARKET_PRODUCTS_KEY)) || [];
    
    const threadsList = document.getElementById('chatThreadsList');
    threadsList.innerHTML = '';
    
    let myThreads = [];
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

    // 1. Filter out chats that don't belong to the user, and check EXPIRY
    for (const key in allConvos) {
        const convo = allConvos[key];
        
        // Does this belong to the logged-in user?
        if (convo.buyerPhone === currentUser.phone || convo.sellerPhone === currentUser.phone) {
            
            // EXPIRY CHECK 1: Inactive for 3 Days
            if (Date.now() - convo.lastUpdated > THREE_DAYS_MS) {
                delete allConvos[key]; // Delete from DB
                continue;
            }
            
            // EXPIRY CHECK 2: Product marked as Sold
            const linkedProduct = products.find(p => p.id === convo.productId);
            if (!linkedProduct || linkedProduct.isSold) {
                delete allConvos[key]; // Delete from DB
                continue;
            }
            
            myThreads.push(convo);
        }
    }
    
    // Save the cleaned database back to storage
    localStorage.setItem(CHAT_DB_KEY, JSON.stringify(allConvos));

    // 2. Render the sidebar
    if (myThreads.length === 0) {
        threadsList.innerHTML = '<p style="padding: 1rem; color: #666; text-align: center;">No active chats.</p>';
        return;
    }

    // Sort by most recent
    myThreads.sort((a, b) => b.lastUpdated - a.lastUpdated);

    myThreads.forEach(convo => {
        // Determine who we are talking to
        const isBuyer = currentUser.phone === convo.buyerPhone;
        const otherPartyName = isBuyer ? convo.sellerName : convo.buyerName;
        const lastMsg = convo.messages.length > 0 ? convo.messages[convo.messages.length - 1].text : "No messages yet.";
        
        const dateObj = new Date(convo.lastUpdated);
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        threadsList.innerHTML += `
            <div class="chat-thread-item" onclick="openConversation('${convo.id}')" id="thread_${convo.id}">
                <span class="time">${timeStr}</span>
                <h4>${otherPartyName}</h4>
                <p><strong>${convo.productName}:</strong> ${lastMsg}</p>
            </div>
        `;
    });
}

/**
 * Opens a specific conversation in the main chat window
 */
function openConversation(convoId) {
    currentActiveChatId = convoId;
    const allConvos = JSON.parse(localStorage.getItem(CHAT_DB_KEY)) || {};
    const convo = allConvos[convoId];
    
    if (!convo) return;

    // UI Updates
    document.getElementById('chatPlaceholder').style.display = 'none';
    document.getElementById('activeChatArea').style.display = 'flex';
    document.getElementById('chatMain').classList.add('active-mobile'); // For mobile sliding
    
    // Highlight sidebar
    document.querySelectorAll('.chat-thread-item').forEach(el => el.classList.remove('active'));
    const threadEl = document.getElementById(`thread_${convoId}`);
    if (threadEl) threadEl.classList.add('active');

    // Header info
    const isBuyer = currentUser.phone === convo.buyerPhone;
    document.getElementById('activeChatUserName').innerText = isBuyer ? convo.sellerName : convo.buyerName;
    document.getElementById('activeChatProductName').innerText = convo.productName;

    renderMessages(convo.messages);
}

/**
 * Renders the actual message bubbles
 */
function renderMessages(messages) {
    const msgArea = document.getElementById('activeChatMessages');
    msgArea.innerHTML = '';
    
    if (messages.length === 0) {
        msgArea.innerHTML = '<p style="text-align: center; color: #888; margin-top: auto; margin-bottom: auto;">Start the conversation!</p>';
        return;
    }

    messages.forEach(msg => {
        const isSentByMe = msg.senderPhone === currentUser.phone;
        const bubbleClass = isSentByMe ? 'sent' : 'received';
        const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        msgArea.innerHTML += `
            <div class="chat-bubble ${bubbleClass}">
                ${msg.text}
                <span class="time">${timeStr}</span>
            </div>
        `;
    });
    
    // Auto-scroll to bottom
    msgArea.scrollTop = msgArea.scrollHeight;
}

/**
 * Sends a message, updates timestamps (resets the 3-day expiry)
 */
function sendChatMessage() {
    if (!currentActiveChatId) return;
    
    const input = document.getElementById('chatMsgInput');
    const text = input.value.trim();
    if (!text) return;

    let allConvos = JSON.parse(localStorage.getItem(CHAT_DB_KEY)) || {};
    const convo = allConvos[currentActiveChatId];
    
    if (!convo) return;

    const newMessage = {
        senderPhone: currentUser.phone,
        text: text,
        timestamp: Date.now()
    };

    convo.messages.push(newMessage);
    convo.lastUpdated = Date.now(); // Resets the 3-day expiry timer!
    
    allConvos[currentActiveChatId] = convo;
    localStorage.setItem(CHAT_DB_KEY, JSON.stringify(allConvos));

    input.value = '';
    renderMessages(convo.messages);
    loadChatThreads(); // Refresh sidebar to move this to the top
}

function handleChatEnter(event) {
    if (event.key === 'Enter') sendChatMessage();
}

function closeMobileChat() {
    document.getElementById('chatMain').classList.remove('active-mobile');
    currentActiveChatId = null;
}