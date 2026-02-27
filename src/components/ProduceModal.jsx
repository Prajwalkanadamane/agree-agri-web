import React from 'react';

export default function ProduceModal({ produce, onClose, userRole, onEdit, onDelete, onContact }) {
  if (!produce) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in-up">
        
        <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors">✕</button>

        <div className="w-full h-56 sm:h-72 relative bg-gray-100">
          {produce.imageUrl && <img src={produce.imageUrl} alt={produce.name} className="w-full h-full object-cover" />}
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{produce.name}</h2>
              <p className="text-md text-gray-600 font-medium mt-1">Grown by {produce.farmerName}</p>
              <p className="text-sm text-gray-500 mt-1">{produce.location}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-right min-w-[140px]">
              <p className="text-xs text-green-800 uppercase font-bold">Current Rate</p>
              <p className="text-xl font-bold text-green-700">₹{produce.price}</p>
              <p className="text-xs text-gray-600">per kg</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Order Constraints</h4>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Min Order:</span> <span className="font-bold text-gray-900">{produce.minQuantity} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Max Order:</span> <span className="font-bold text-gray-900">{produce.maxQuantity} kg</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Produce Details</h4>
              <p className="text-sm text-gray-700">{produce.description}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            {userRole === 'buyer' ? (
              <button 
                onClick={() => onContact(produce)} 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-100"
              >
                🛒 Confirm Purchase
              </button>
            ) : (
              <div className="flex flex-1 gap-2">
                <button onClick={() => onEdit(produce)} className="flex-1 bg-blue-50 border-2 border-blue-200 text-blue-700 hover:bg-blue-100 font-bold py-3 rounded-lg transition-colors">Edit Details</button>
                <button onClick={() => onDelete(produce.id)} className="flex-1 bg-red-50 border-2 border-red-200 text-red-700 hover:bg-red-100 font-bold py-3 rounded-lg transition-colors">Mark Sold Out</button>
              </div>
            )}
            <button onClick={onClose} className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg transition-colors">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}