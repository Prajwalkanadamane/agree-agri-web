import React from 'react';
import { FiUser, FiMapPin, FiImage } from 'react-icons/fi';

export default function ProduceCard({ produce, onClick }) {
  const hasMultipleImages = produce.imageUrls && produce.imageUrls.length > 1;

  // Safely extract the main image, ignoring broken local blob tests
  let mainImage = null;
  if (produce.imageUrl && !produce.imageUrl.startsWith('blob:')) {
    mainImage = produce.imageUrl;
  } else if (produce.imageUrls && produce.imageUrls.length > 0 && !produce.imageUrls[0].startsWith('blob:')) {
    mainImage = produce.imageUrls[0];
  }

  return (
    <div 
      onClick={() => onClick(produce)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border border-gray-100 flex flex-col h-full group"
    >
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {mainImage ? (
          <img 
            src={mainImage} 
            alt={produce.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.style.display = 'none'; }} // Hides broken links gracefully
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
            <FiImage className="text-3xl mb-2" />
            <span className="text-sm">No valid image</span>
          </div>
        )}
        
        {/* Badge showing how many images are inside */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
            <FiImage /> {produce.imageUrls.length} Photos
          </div>
        )}

        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-green-700 shadow-sm">
          {produce.category}
        </div>
      </div>
      
      {/* Card Details */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 truncate">{produce.name}</h3>
        
        <div className="text-sm text-gray-600 mt-2 space-y-1 flex-grow">
          <p className="flex items-center gap-2 truncate">
            <FiUser className="text-gray-400 shrink-0" />
            <span className="truncate">{produce.farmerName}</span>
          </p>
          <p className="flex items-center gap-2 truncate">
            <FiMapPin className="text-gray-400 shrink-0" />
            <span className="truncate">{produce.location}</span>
          </p>
        </div>
        
        {/* Footer / Price */}
        <div className="pt-4 mt-4 border-t border-gray-50 flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Wholesale Price</p>
            <p className="text-lg font-bold text-green-600">
              ₹{produce.priceMin || produce.price} <span className="text-xs font-normal text-gray-500">/ kg</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}