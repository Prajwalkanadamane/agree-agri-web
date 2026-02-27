import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer'); // Default to buyer for signups
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Log in existing user
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Create new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save their role in the Firestore database!
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: role,
          isVerified: false, // <-- NEW: Lock them out initially
          createdAt: new Date()
        });
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', '')); // Clean up error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-green-600 tracking-tighter">AGREE<span className="text-gray-900">-AGRI</span></h1>
          <p className="text-gray-500 mt-2">{isLogin ? 'Welcome back!' : 'Create your account'}</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none" placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none" placeholder="••••••••" />
          </div>

          {/* Only show Role selection if they are Signing Up */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setRole('buyer')} className={`py-2 px-4 rounded-lg border-2 font-bold text-sm transition-colors ${role === 'buyer' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>Buyer</button>
                <button type="button" onClick={() => setRole('farmer')} className={`py-2 px-4 rounded-lg border-2 font-bold text-sm transition-colors ${role === 'farmer' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>Farmer</button>
              </div>
            </div>
          )}

          <button disabled={loading} type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md mt-6">
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-green-600 font-bold hover:underline focus:outline-none">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}