import React, { useState } from 'react';

// Hardcoded sample data from your JS file
const allMajorCrops = {
  "Rice": "Rice", "Wheat": "Wheat", "Maize": "Maize", "Millets": "Millets",
  "Chickpea": "Chickpea", "Sugarcane": "Sugarcane", "Cotton": "Cotton", 
  "Jute": "Jute", "Mustard": "Mustard", "Turmeric": "Turmeric", "Pepper": "Pepper",
  "Groundnut": "Groundnut", "Soybean": "Soybean", "Sunflower": "Sunflower", "Vegetables": "Vegetables"
};

export default function CropRecommendations() {
  const [formData, setFormData] = useState({
    state: '', district: '', soilType: '', ph: '', n: 'Medium', p: 'Medium', k: 'Medium'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fetchRecommendations = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Simulate API delay like your vanilla JS did
    await new Promise(r => setTimeout(r, 1500));

    let suggestedCrops = [];
    let advice = "";

    // Translated exactly from your script.js logic
    if (formData.soilType === "Clay") {
      suggestedCrops = ["Rice", "Wheat", "Sugarcane", "Chickpea"];
      advice = "Clay soil retains moisture well. Ensure good drainage to prevent waterlogging for non-paddy crops.";
    } else if (formData.soilType === "Sandy") {
      suggestedCrops = ["Groundnut", "Millets", "Maize", "Watermelon"];
      advice = "Sandy soil drains quickly. Regular irrigation and organic manure are recommended.";
    } else if (formData.soilType === "Loamy") {
      suggestedCrops = ["Cotton", "Vegetables", "Mustard", "Turmeric", "Pepper"];
      advice = "Loamy soil is excellent for most crops. Focus on NPK balance for maximum yield.";
    } else {
      suggestedCrops = ["Cotton", "Soybean", "Jute", "Sunflower"];
      advice = "Ensure soil aeration and monitor pH levels.";
    }

    setResult({ crops: suggestedCrops, advice: advice, lowN: formData.n === 'Low' });
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🌱</span>
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI Crop Recommendations</h3>
          <p className="text-sm text-gray-500">Get suggestions based on your soil type and location.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Section */}
        <form onSubmit={fetchRecommendations} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">State</label>
              <input required name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Maharashtra" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">District</label>
              <input required name="district" value={formData.district} onChange={handleChange} placeholder="e.g. Pune" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Soil Type</label>
            <select required name="soilType" value={formData.soilType} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none bg-white">
              <option value="">Select Soil Type...</option>
              <option value="Clay">Clay (Heavy)</option>
              <option value="Sandy">Sandy (Light)</option>
              <option value="Loamy">Loamy (Balanced)</option>
              <option value="Black">Black Cotton Soil</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nitrogen (N)</label>
              <select name="n" value={formData.n} onChange={handleChange} className="w-full border rounded p-1 text-sm bg-white">
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Phosphorus (P)</label>
              <select name="p" value={formData.p} onChange={handleChange} className="w-full border rounded p-1 text-sm bg-white">
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Potassium (K)</label>
              <select name="k" value={formData.k} onChange={handleChange} className="w-full border rounded p-1 text-sm bg-white">
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors shadow-md">
            {loading ? '🧠 Analyzing Soil Data...' : 'Get Recommendations'}
          </button>
        </form>

        {/* Results Section */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          {!result && !loading && (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
               <span className="text-4xl mb-2">📊</span>
               <p>Enter your soil details to see the best crops to plant this season.</p>
             </div>
          )}

          {loading && (
             <div className="h-full flex flex-col items-center justify-center text-green-600 animate-pulse text-center">
               <span className="text-4xl mb-2">⚙️</span>
               <p className="font-bold">Running algorithm...</p>
             </div>
          )}

          {result && (
            <div className="animate-fade-in-up">
              <h4 className="font-black text-lg text-green-800 bg-green-100 p-2 rounded text-center mb-4">✅ Top Recommendations</h4>
              <p className="text-sm text-gray-600 mb-3">Based on <strong>{formData.soilType}</strong> soil in <strong>{formData.district}</strong>:</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {result.crops.map((crop, idx) => (
                  <span key={idx} className="bg-white border-2 border-green-600 text-green-700 font-bold px-3 py-1 rounded-full text-sm">
                    {allMajorCrops[crop] || crop}
                  </span>
                ))}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800 mb-2">
                <strong>💡 Soil Tip:</strong> {result.advice}
              </div>

              {result.lowN && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-800">
                  ⚠️ <strong>Nitrogen is Low:</strong> Consider using Urea or organic compost before planting.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}