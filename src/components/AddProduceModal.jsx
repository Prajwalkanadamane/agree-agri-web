import React, { useState, useEffect } from 'react';

export default function AddProduceModal({ isOpen, onClose, onAdd, initialData }) {
  const defaultForm = { name: '', category: 'Vegetables', priceMin: '', 
    minQuantity: '', maxQuantity: '', location: '', description: '' };
  const [formData, setFormData] = useState(defaultForm);
  
  // State to handle arrays of files and previews
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If initialData is provided (meaning we are editing), populate the form!
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      // Support old single images or new multiple images
      setPreviewUrls(initialData.imageUrls || (initialData.imageUrl ? [initialData.imageUrl] : []));
    } else {
      setFormData(defaultForm);
      setPreviewUrls([]);
      setImageFiles([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // Logic to handle multiple file selections (Max 4)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) {
      alert("Please select a maximum of 4 photos.");
      return;
    }
    if (files.length > 0) {
      setImageFiles(files);
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // THE FIX: Removed the hardcoded farmerName! 
      // Now App.jsx will automatically attach your real Google Account name.
      await onAdd({ ...formData, imageFiles });
    } catch (error) {
      console.error("Modal caught an error:", error);
    } finally {
      // THE FIX: This ensures the button resets and stops saying "Processing..."
      setIsSubmitting(false);
    }
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await response.json();
        
        const city = data.city || data.locality || "Unknown City";
        const state = data.principalSubdivision || "";
        const locationString = `${city}, ${state}`;

        setFormData(prev => ({ ...prev, location: locationString }));
      } catch (error) {
        console.error("Error fetching location name:", error);
        alert("Could not determine city name. Please enter manually.");
      }
    }, () => {
      alert("Unable to retrieve your location. Please check browser permissions.");
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-800 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors">✕</button>

        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{initialData ? 'Edit Produce Listing' : 'List New Produce'}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Produce Name</label><input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" /></div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none bg-white">
                  <option>Vegetables</option><option>Fruits</option><option>Grains</option><option>Spices</option>
                </select>
              </div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label><input required type="number" name="priceMin" value={formData.priceMin} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Min Qty (kg)</label><input required type="number" name="minQuantity" value={formData.minQuantity} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Max Qty (kg)</label><input required type="number" name="maxQuantity" value={formData.maxQuantity} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" /></div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                <label className="block text-sm font-bold text-gray-700 mb-2 cursor-pointer">
                  {initialData ? 'Update Produce Photos' : 'Upload Up to 4 Photos'}
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  <div className="mt-2 text-green-600 underline text-sm">Click to browse your device</div>
                </label>
                
                {previewUrls.length > 0 && (
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative">
                        <img src={url} alt={`Preview ${idx}`} className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-lg shadow-sm border border-gray-200" />
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-tr-lg rounded-bl-lg font-bold">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex justify-between">
                Location
                <button type="button" onClick={fetchLocation} className="text-xs text-green-600 hover:underline font-bold">
                  📍 Locate Me
                </button>
              </label>
              <input required type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Pune, Maharashtra" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" />
            </div>

            <div><label className="block text-sm font-bold text-gray-700 mb-1">Description</label><textarea required name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none resize-none"></textarea></div>
            
            <div className="pt-4 flex gap-3">
              <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md disabled:opacity-70">
                {isSubmitting ? 'Processing...' : (initialData ? 'Save Changes' : 'Publish Listing')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}