import React, { useState, useEffect } from 'react';

// Brought over from your script (1).js
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

export default function GovernmentSchemes({ userState = "Maharashtra" }) {
  const [schemes, setSchemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch & filtering
    const loadSchemes = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      
      // Filter schemes for Central OR the User's specific state
      const filtered = mockGovtSchemes.filter(s => s.level === 'Central' || s.state === userState);
      setSchemes(filtered);
      setIsLoading(false);
    };

    loadSchemes();
  }, [userState]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🏛️</span>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Government Schemes & Updates</h3>
          <p className="text-sm text-gray-500">Stay informed about subsidies, loans, and official announcements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Urgent Updates */}
        <div>
          <h4 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
            <span>📢</span> Official Announcements
          </h4>
          <div className="space-y-4">
            {mockGovtUpdates.map(update => (
              <div key={update.id} className={`p-4 rounded-xl border ${update.isUrgent ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${update.isUrgent ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}`}>
                    {update.isUrgent ? '⚠️ Urgent Alert' : '✅ Verified'}
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
              <span>📄</span> Eligible Schemes
            </h4>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
              Showing for: {userState}
            </span>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-gray-400 animate-pulse">
               <span className="text-3xl block mb-2">⏳</span>
               <p className="font-bold text-sm">Fetching live schemes database...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schemes.map(scheme => (
                <div key={scheme.id} className={`p-4 rounded-xl border-l-4 bg-gray-50 border-y border-r border-gray-100 ${scheme.level === 'Central' ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-bold text-gray-900">{scheme.title}</h5>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${scheme.level === 'Central' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                      {scheme.level}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{scheme.type}</p>
                  <p className="text-sm text-gray-700 mb-3">{scheme.desc}</p>
                  <div className="inline-block bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-black text-green-700 shadow-sm">
                    💰 Benefit: {scheme.amount}
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