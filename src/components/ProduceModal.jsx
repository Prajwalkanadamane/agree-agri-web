import React, { useState, useEffect } from 'react';
import { 
  FiX, FiShoppingCart, FiChevronLeft, FiChevronRight, 
  FiEdit2, FiTag, FiUser, FiMapPin, FiImage
} from 'react-icons/fi';

export default function ProduceModal({ produce, onClose, userRole, onEdit, onDelete, onContact }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset the image index whenever a new produce is opened
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [produce]);

  if (!produce) return null;

  // Extract images cleanly, filtering out old broken local blob tests
  let images = [];
  if (produce.imageUrls && produce.imageUrls.length > 0) {
    images = produce.imageUrls;
  } else if (produce.imageUrl) {
    images = [produce.imageUrl];
  }
  images = images.filter(url => !url.startsWith('blob:')); 

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };

  return (
    // Changed z-index to an extreme value to guarantee it sits above the dashboard
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in-up">
        
        <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center z-20 transition-colors">
          <FiX className="text-lg" />
        </button>

        {/* --- IMAGE CAROUSEL --- */}
        <div className="w-full h-56 sm:h-80 relative bg-gray-100 flex items-center justify-center group overflow-hidden">
          {images.length > 0 ? (
            <>
              <img 
                src={images[currentImageIndex]} 
                alt={produce.name} 
                className="w-full h-full object-cover transition-opacity duration-300" 
              />
              
              {/* Navigation arrows (Only show if multiple valid images exist) */}
              {images.length > 1 && (
                <>
                  <button onClick={handlePrev} className="absolute left-4 bg-white/80 hover:bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <FiChevronLeft className="text-2xl" />
                  </button>
                  <button onClick={handleNext} className="absolute right-4 bg-white/80 hover:bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <FiChevronRight className="text-2xl" />
                  </button>
                  
                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm z-10">
                    {images.map((_, idx) => (
                      <button 
                        key={idx} 
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                        className={`h-2 rounded-full transition-all ${currentImageIndex === idx ? 'bg-white w-5' : 'bg-white/50 hover:bg-white/80 w-2'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              <FiImage className="text-4xl mb-2" />
              <span className="text-sm">No valid image available</span>
            </div>
          )}
        </div>

        {/* --- MODAL CONTENT --- */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{produce.name}</h2>
              <p className="text-md text-gray-600 font-medium mt-2 flex items-center gap-2">
                <FiUser className="text-gray-400" /> Grown by {produce.farmerName}
              </p>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <FiMapPin className="text-gray-400" /> {produce.location}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-right min-w-[140px]">
              <p className="text-xs text-green-800 uppercase font-bold">Wholesale Rate</p>
              <p className="text-2xl font-black text-green-700">₹{produce.priceMin || produce.price}</p>
              <p className="text-xs text-gray-600 font-medium">per kg</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Constraints</h4>
              <div className="flex justify-between text-sm mb-2 border-b border-gray-200 pb-2">
                <span className="text-gray-600">Minimum Order:</span> 
                <span className="font-bold text-gray-900">{produce.minQuantity || 0} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Maximum Order:</span> 
                <span className="font-bold text-gray-900">{produce.maxQuantity || "N/A"} kg</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Produce Details</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{produce.description}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            {userRole === 'buyer' ? (
              <button 
                onClick={() => { onClose(); onContact(produce); }} 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-100"
              >
                <FiShoppingCart className="text-lg" /> Confirm Purchase
              </button>
            ) : (
              <div className="flex flex-1 gap-2 sm:gap-4">
                <button onClick={() => { onClose(); onEdit(produce); }} className="flex-1 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <FiEdit2 /> <span className="hidden sm:inline">Edit Details</span>
                </button>
                <button onClick={() => { onClose(); onDelete(produce.id); }} className="flex-1 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <FiTag /> <span className="hidden sm:inline">Mark Sold Out</span>
                </button>
              </div>
            )}
            <button onClick={onClose} className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}