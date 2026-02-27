import React, { useState, useEffect } from 'react';
import { 
  FiBriefcase, FiVolume2, FiAlertCircle, 
  FiCheckCircle, FiFileText, FiAward 
} from 'react-icons/fi';

const mockGovtUpdates = [
  { id: 1, title: "Seed Subsidy Split - Kharif Season", message: "Due to budget distributions, the 2kg seed subsidy is temporarily split. You will receive 1kg now and the remaining 1kg next month. Do not let local officials charge you or claim your quota is finished.", date: "2026-02-25", isUrgent: true },
  { id: 2, title: "Fertilizer Stock Available", message: "Urea and DAP stocks have arrived at all district cooperative societies. Subsidized price is ₹266 per bag. Demand a printed receipt.", date: "2026-02-20", isUrgent: false }
];

const mockGovtSchemes = [
  { id: 101, level: "Central", state: "All", title: "Kisan Credit Card (KCC)", type: "Loan", desc: "Short-term credit limit for crops and expenses. Farmers receive an interest subvention of 2% and an extra 3% benefit for timely repayment.", amount: "Up to ₹3 Lakh at 4%" },
  { id: 102, level: "Central", state: "All", title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)", type: "Insurance", desc: "Provides crop insurance to farmers against losses caused by floods, droughts, hailstorms, pests, and diseases.", amount: "Crop Value Coverage" },
  { id: 201, level: "State", state: "Maharashtra", title: "Namo Shetkari Maha Samman Nidhi", type: "Direct Transfer", desc: "An additional income support scheme provided by the Maharashtra government, adding to the central PM-KISAN funds.", amount: "₹6,000 / year" },
  { id: 202, level: "State", state: "Maharashtra", title: "Magel Tyala Shet Tale", type: "Subsidy", desc: "Subsidy provided to farmers for constructing farm ponds to ensure water availability during dry spells.", amount: "Up to ₹50,000 Subsidy" },
  { id: 401, level: "State", state: "Karnataka", title: "Krishi Bhagya", type: "Subsidy", desc: "Focuses on rainwater harvesting and conservation. Provides subsidies for farm ponds, polythene linings, and diesel pump sets.", amount: "80%-90% Subsidy" }
];

export default function GovernmentSchemes({ userState }) {
  const [schemes, setSchemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSchemes = async () => {
      setIsLoading(true);
      // Simulate network delay to show the clean loading state
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
      // Filter schemes based on the global state dropdown
      const filtered = mockGovtSchemes.filter(s => 
        s.level === 'Central' || 
        (userState && s.state.toLowerCase() === userState.toLowerCase())
      );
      setSchemes(filtered);
      setIsLoading(false);
    };

    loadSchemes();
  }, [userState]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <FiBriefcase className="text-3xl text-indigo-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">Government Schemes & Updates</h3>
          <p className="text-sm text-gray-500">Stay informed about subsidies, loans, and official announcements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Urgent Updates */}
        <div>
          <h4 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
            <FiVolume2 className="text-indigo-500" /> Official Announcements
          </h4>
          <div className="space-y-4">
            {mockGovtUpdates.map(update => (
              <div key={update.id} className={`p-4 rounded-xl border ${update.isUrgent ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full ${update.isUrgent ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}`}>
                    {update.isUrgent ? <><FiAlertCircle /> Urgent Alert</> : <><FiCheckCircle /> Verified</>}
                  </span>
                  <span className="text-xs font-bold text-gray-500">{update.date}</span>
                </div>
                <h5 className="font-bold text-gray-900 mb-1">{update.title}</h5>
                <p className="text-sm text-gray-700">{update.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Schemes */}
        <div>
          <div className="flex justify-between items-end mb-4 border-b pb-2">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <FiFileText className="text-indigo-500" /> Eligible Schemes
            </h4>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
              Showing for: {userState || 'All India'}
            </span>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-indigo-400 flex flex-col items-center">
               <FiBriefcase className="text-3xl mb-2 animate-pulse" />
               <p className="font-bold text-sm">Fetching live database...</p>
            </div>
          ) : schemes.length === 0 ? (
            <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No specific state schemes found for {userState}.
            </div>
          ) : (
            <div className="space-y-4">
              {schemes.map(scheme => (
                <div key={scheme.id} className={`p-4 rounded-xl border-l-4 bg-gray-50 border-y border-r border-gray-100 ${scheme.level === 'Central' ? 'border-l-blue-500' : 'border-l-orange-500'} hover:shadow-md transition-shadow`}>
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-bold text-gray-900 pr-2">{scheme.title}</h5>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap ${scheme.level === 'Central' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                      {scheme.level}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">{scheme.type}</p>
                  <p className="text-sm text-gray-700 mb-3">{scheme.desc}</p>
                  
                  {/* Replaced the money bag emoji with a modern Award icon */}
                  <div className="inline-flex items-center gap-1.5 bg-white border border-green-200 px-3 py-1.5 rounded-lg text-sm font-black text-green-700 shadow-sm">
                    <FiAward className="text-green-600 text-lg" /> Benefit: {scheme.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}