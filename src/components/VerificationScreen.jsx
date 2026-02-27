import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function VerificationScreen({ userRole, userId, onVerified }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    idType: userRole === 'farmer' ? 'Aadhaar Card' : 'GSTIN / Business PAN',
    idNumber: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. In a real app, you would upload their document image to Firebase Storage here
      // 2. Update their profile in Firestore to mark them as verified
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        fullName: formData.fullName,
        phone: formData.phone,
        idType: formData.idType,
        idNumber: formData.idNumber,
        isVerified: true // Unlocks the dashboard!
      });

      // 3. Tell App.jsx to switch the view
      onVerified();
    } catch (error) {
      console.error("Error updating verification:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="bg-blue-50 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🛡️
          </div>
          <h1 className="text-2xl font-black text-gray-900">Identity Verification</h1>
          <p className="text-gray-500 mt-2">
            To maintain a safe marketplace, all {userRole}s must be verified before accessing the platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Legal Full Name / Business Name</label>
            <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="As it appears on your ID" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+91" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Government ID Type</label>
            <select name="idType" value={formData.idType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              {userRole === 'farmer' ? (
                <>
                  <option>Aadhaar Card</option>
                  <option>Farmer Registration ID</option>
                  <option>Kisan Credit Card (KCC)</option>
                </>
              ) : (
                <>
                  <option>GSTIN / Business PAN</option>
                  <option>FSSAI License</option>
                  <option>Trade License</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">ID Number</label>
            <input required type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter document number" />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors mt-4">
            <label className="block text-sm font-bold text-gray-700 mb-2 cursor-pointer">
              Upload ID Proof (Photo or PDF)
              <input required type="file" accept="image/*,.pdf" className="hidden" />
              <div className="mt-2 text-blue-600 underline text-sm">Click to browse your device</div>
            </label>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md mt-6">
            {loading ? 'Submitting...' : 'Submit Verification'}
          </button>
        </form>
      </div>
    </div>
  );
}