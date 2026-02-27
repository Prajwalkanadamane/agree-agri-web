import React, { useState } from 'react';

export default function SoilTestLabs() {
  const [formData, setFormData] = useState({ state: '', district: '' });
  const [mapQuery, setMapQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!formData.state || !formData.district) {
      setError('Please enter both State and District.');
      return;
    }
    setError('');
    const query = encodeURIComponent(`Soil Testing Laboratory in ${formData.district}, ${formData.state}, India`);
    setMapQuery(query);
  };

  const handleLiveLocation = () => {
    setIsLocating(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const query = encodeURIComponent(`Soil Testing Laboratory near ${lat},${lon}`);
        setMapQuery(query);
        setIsLocating(false);
      },
      (err) => {
        setError('Unable to retrieve location. Please check browser permissions or use manual search.');
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧪</span>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Find Soil Test Labs</h3>
            <p className="text-sm text-gray-500">Locate government and private soil testing facilities near you.</p>
          </div>
        </div>
        
        <button 
          onClick={handleLiveLocation} 
          disabled={isLocating}
          className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          {isLocating ? '📍 Locating...' : '📍 Use My Live Location'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Form */}
        <div className="lg:col-span-1 space-y-4">
          <form onSubmit={handleManualSearch} className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">State</label>
              <input 
                required 
                name="state" 
                value={formData.state} 
                onChange={handleChange} 
                placeholder="e.g. Karnataka" 
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">District</label>
              <input 
                required 
                name="district" 
                value={formData.district} 
                onChange={handleChange} 
                placeholder="e.g. Mysuru" 
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" 
              />
            </div>
            <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-2.5 rounded-lg transition-colors shadow-md">
              🔍 Search Region
            </button>
          </form>

          {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}
        </div>

        {/* Map Display */}
        <div className="lg:col-span-2 h-64 sm:h-80 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden relative flex items-center justify-center">
          {!mapQuery && !isLocating && (
             <div className="text-center text-gray-400 p-6">
               <span className="text-4xl mb-2 block">🗺️</span>
               <p>Enter your district or use live location to see nearby labs.</p>
             </div>
          )}

          {isLocating && (
             <div className="text-center text-blue-600 animate-pulse p-6">
               <span className="text-4xl mb-2 block">📡</span>
               <p className="font-bold">Requesting GPS coordinates...</p>
             </div>
          )}

          {mapQuery && !isLocating && (
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=11&ie=UTF8&iwloc=&output=embed`}
              allowFullScreen
              title="Soil Labs Map"
            ></iframe>
          )}
        </div>
      </div>
    </div>
  );
}