import React, { useState, useEffect } from 'react';

export default function AddRequirementModal({ isOpen, onClose, onAdd, initialData }) {
  const defaultForm = {
    produceName: '', quantity: '', targetPrice: '', deadline: '', deliveryLocation: '', notes: ''
  };
  const [formData, setFormData] = useState(defaultForm);

  // Allow the modal to populate with existing data if we are editing!
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultForm);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData); // Removed the hardcoded buyerName, App.jsx will handle it
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-800 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors">
          ✕
        </button>

        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {initialData ? 'Edit Requirement' : 'Post a Bulk Requirement'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">What do you need?</label>
                <input required type="text" name="produceName" value={formData.produceName} onChange={handleChange} placeholder="e.g., Potatoes" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Quantity Needed (kg)</label>
                <input required type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="e.g., 2000" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Target Price (₹/kg)</label>
                <input required type="number" name="targetPrice" value={formData.targetPrice} onChange={handleChange} placeholder="Max price you can pay" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Needed By (Date)</label>
                <input required type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Delivery Location</label>
              <input required type="text" name="deliveryLocation" value={formData.deliveryLocation} onChange={handleChange} placeholder="City, State, or Warehouse Address" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Additional Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" placeholder="Specific quality constraints..." className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none resize-none"></textarea>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-colors shadow-md">
                {initialData ? 'Save Changes' : 'Post Requirement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}