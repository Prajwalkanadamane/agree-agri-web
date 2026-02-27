import React, { useState, useEffect } from 'react';
import { 
  FiSun, FiCloud, FiCloudRain, FiCloudSnow, 
  FiCloudLightning, FiCloudDrizzle, FiWind, 
  FiHelpCircle, FiMapPin, FiRadio 
} from 'react-icons/fi';

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

// WMO Weather interpretation codes mapped to React Icons
const getWeatherInfo = (code) => {
  const codes = {
    0: { desc: 'Clear sky', icon: <FiSun /> },
    1: { desc: 'Mainly clear', icon: <FiSun /> },
    2: { desc: 'Partly cloudy', icon: <FiCloud /> },
    3: { desc: 'Overcast', icon: <FiCloud /> },
    45: { desc: 'Fog', icon: <FiWind /> },
    48: { desc: 'Depositing rime fog', icon: <FiWind /> },
    51: { desc: 'Light drizzle', icon: <FiCloudDrizzle /> },
    61: { desc: 'Slight rain', icon: <FiCloudRain /> },
    63: { desc: 'Moderate rain', icon: <FiCloudRain /> },
    65: { desc: 'Heavy rain', icon: <FiCloudRain /> },
    71: { desc: 'Slight snow', icon: <FiCloudSnow /> },
    80: { desc: 'Slight rain showers', icon: <FiCloudRain /> },
    81: { desc: 'Moderate rain showers', icon: <FiCloudRain /> },
    82: { desc: 'Violent rain showers', icon: <FiCloudLightning /> },
    95: { desc: 'Thunderstorm', icon: <FiCloudLightning /> },
  };
  return codes[code] || { desc: 'Unknown', icon: <FiHelpCircle /> };
};

export default function WeatherForecast() {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  
  const [weatherData, setWeatherData] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Central Weather Fetcher logic
  const fetchWeather = async (lat, lon, name) => {
    setLoading(true);
    setError('');
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=10`;
      const response = await fetch(url);
      const data = await response.json();
      setWeatherData(data);
      setLocationName(name);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Improved Geocoding search logic for manual selection
  const handleLocationSearch = async (district, state) => {
    setLoading(true);
    setError('');
    
    try {
      // Primary search using comma separation for better geocoding accuracy
      const searchQuery = encodeURIComponent(`${district}, ${state}`);
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${searchQuery}&count=5&language=en&format=json`);
      const geoData = await geoRes.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        // FALLBACK: Search for just the district name if combined search fails
        const fallbackRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(district)}&count=1`);
        const fallbackData = await fallbackRes.json();

        if (!fallbackData.results || fallbackData.results.length === 0) {
           setError(`Could not find "${district}" in the weather database.`);
           setLoading(false);
           return;
        }
        
        const { latitude, longitude, name, admin1 } = fallbackData.results[0];
        fetchWeather(latitude, longitude, `${name}, ${admin1 || state}`);
        return;
      }
      
      // Use the first (most accurate) result from primary search
      const { latitude, longitude, name, admin1 } = geoData.results[0];
      fetchWeather(latitude, longitude, `${name}, ${admin1 || state}`);
    } catch (err) {
      setError('Error connecting to the meteorological service.');
      setLoading(false);
    }
  };

  // 3. Handle Live Location
  const handleLiveLocation = () => {
    setLoading(true);
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}`);
          const geoData = await geoRes.json();
          const name = geoData.city || geoData.locality || `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;
          fetchWeather(latitude, longitude, name);
          
          // Clear dropdowns when using live GPS for UI clarity
          setSelectedState('');
          setSelectedDistrict('');
        } catch {
          fetchWeather(latitude, longitude, `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`);
        }
      },
      (err) => {
        setError('Unable to retrieve live location. Please allow permissions.');
        setLoading(false);
      }
    );
  };

  // 4. AUTO-TRIGGER API FETCH on manual dropdown selection
  useEffect(() => {
    if (selectedState && selectedDistrict) {
      handleLocationSearch(selectedDistrict, selectedState);
    }
  }, [selectedState, selectedDistrict]); // Watch these variables!

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <FiSun className="text-3xl text-blue-500" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">10-Day Farm Weather Forecast</h3>
            <p className="text-sm text-gray-500">Real-time data from global meteorological servers.</p>
          </div>
        </div>
        
        <button 
          onClick={handleLiveLocation} 
          disabled={loading}
          className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
        >
          {loading && !weatherData ? (
             <><FiRadio className="animate-pulse" /> Locating...</>
          ) : (
             <><FiMapPin /> Use My Live Location</>
          )}
        </button>
      </div>

      {/* Manual Selection Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select 
          value={selectedState} 
          onChange={(e) => {
            setSelectedState(e.target.value);
            setSelectedDistrict(''); 
          }}
          className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800 font-medium cursor-pointer"
        >
          <option value="">Select State...</option>
          {Object.keys(IndianStatesAndDistricts).sort().map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>

        <select 
          value={selectedDistrict} 
          onChange={(e) => setSelectedDistrict(e.target.value)}
          disabled={!selectedState}
          className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800 font-medium cursor-pointer disabled:opacity-50"
        >
          <option value="">Select District...</option>
          {selectedState && IndianStatesAndDistricts[selectedState].map(district => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>
      </div>

      {error && <div className="p-3 mb-6 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-center gap-2"><FiHelpCircle /> {error}</div>}

      {/* Loading State */}
      {loading && (
        <div className="py-12 text-center text-blue-600 flex flex-col items-center">
           <FiRadio className="text-4xl block mb-2 animate-pulse" />
           <p className="font-bold">Contacting Weather API...</p>
        </div>
      )}

      {/* Weather Results rendering logic remains the same */}
      {weatherData && !loading && (
        <div className="animate-fade-in-up">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-black">{locationName}</h2>
              <p className="text-blue-100">Current Conditions</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{getWeatherInfo(weatherData.current.weather_code).icon}</span>
              <div>
                <p className="text-4xl font-black">{Math.round(weatherData.current.temperature_2m)}°C</p>
                <p className="text-sm font-medium">{getWeatherInfo(weatherData.current.weather_code).desc}</p>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm text-center min-w-[120px]">
              <p className="text-xs uppercase tracking-wider font-bold text-blue-100 mb-1 flex items-center justify-center gap-1">Precip</p>
              <p className="text-xl font-black">{weatherData.current.precipitation_probability}%</p>
            </div>
          </div>

          <h4 className="font-bold text-gray-800 mb-4">Upcoming 10 Days</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {weatherData.daily.time.map((day, index) => {
              const date = new Date(day);
              const isToday = index === 0;
              return (
                <div key={day} className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${isToday ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100'}`}>
                  <p className="text-xs font-bold text-gray-500 uppercase">{isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <span className="text-3xl block my-2 text-blue-600">
                    {getWeatherInfo(weatherData.daily.weather_code[index]).icon}
                  </span>
                  <div className="flex justify-center gap-2 text-sm font-bold">
                    <span className="text-gray-900">{Math.round(weatherData.daily.temperature_2m_max[index])}°</span>
                    <span className="text-gray-400">{Math.round(weatherData.daily.temperature_2m_min[index])}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}