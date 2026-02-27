import React from 'react';

export default function AnalyticsPanel({ stats, role, history = [] }) {
  const isFarmer = role === 'farmer';

  return (
    <div className="space-y-6 mb-10">
      {/* 1. Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {isFarmer ? 'Total Earnings' : 'Total Spent'}
          </p>
          <p className="text-3xl font-black text-green-600 mt-1">
            ₹{isFarmer ? (stats?.totalSalesValue || 0) : (stats?.totalSpent || 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {isFarmer ? 'Active Listings' : 'Active Requirements'}
          </p>
          <p className="text-3xl font-black text-gray-900 mt-1">
            {isFarmer ? (stats?.activeListings || 0) : (stats?.activeRequests || 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {isFarmer ? 'Deals Closed' : 'Items Procured'}
          </p>
          <p className="text-3xl font-black text-blue-600 mt-1">
            {isFarmer ? (stats?.dealsCompleted || 0) : (stats?.itemsProcured || 0)}
          </p>
        </div>
      </div>

      {/* 2. The Transaction History Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg">Transaction History</h3>
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded uppercase tracking-wider">
            Live Records
          </span>
        </div>
        
        <div className="overflow-x-auto">
          {history.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <span className="text-4xl mb-3">📭</span>
              <p className="text-gray-500 font-medium">No transactions recorded yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                {isFarmer ? 'Mark a listing as "Sold Out" to see it here.' : 'Confirm a purchase to generate your receipt history.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-medium">{item.date}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded">
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-green-600 text-base">
                      ₹{item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}