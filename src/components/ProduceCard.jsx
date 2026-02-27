import React from 'react';

export default function ProduceCard({ produce, onClick }) {
  return (
    <div 
      onClick={() => onClick(produce)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border border-gray-100 flex flex-col h-full group"
    >
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {produce.imageUrl ? (
          <img 
            src={produce.imageUrl} 
            alt={produce.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">No Image</div>
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
            <span className="font-medium text-gray-900">Farmer:</span> {produce.farmerName}
          </p>
          <p className="flex items-center gap-2 truncate">
            <span className="font-medium text-gray-900">Location:</span> {produce.location}
          </p>
        </div>
        
        {/* Footer / Price */}
        <div className="pt-4 mt-4 border-t border-gray-50 flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Wholesale Price</p>
            <p className="text-lg font-bold text-green-600">
              ₹{produce.priceMin} <span className="text-xs font-normal text-gray-500">/ kg</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}