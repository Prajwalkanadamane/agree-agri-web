import React, { useState } from 'react';
import { 
  FiActivity, FiCamera, FiCpu, FiSearch, 
  FiSettings, FiCheckCircle, FiAlertTriangle, 
  FiShield, FiDroplet, FiImage 
} from 'react-icons/fi';

export default function DiseaseDiagnosis() {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const API_KEY = 'wqkubCkxKg3t3zjNDrz3uPJ2myTbYo16pgp3BR5KY0n0NEG2Y7'; // From your JS file

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); // Clear previous results
      setError('');
    }
  };

  const handleDiagnosis = async () => {
    if (!imageFile) {
      setError('Please select an image or take a photo first.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = async () => {
      const base64Image = reader.result.split(',')[1];
      const requestBody = {
        images: [base64Image],
        modifiers: ["health_assessment"],
        disease_details: ["common_names", "description", "treatment"]
      };

      try {
        const response = await fetch('https://api.plant.id/v2/health_assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Api-Key': API_KEY },
          body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();

        // Check if it's actually a plant
        if (data.is_plant_probability < 0.5) {
          setError('The AI detected that this image is likely NOT a plant. Please upload a clear photo of a crop leaf.');
          setLoading(false);
          return;
        }

        setResult(data.health_assessment);
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred during diagnosis. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <FiActivity className="text-3xl text-green-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI Disease Diagnosis</h3>
          <p className="text-sm text-gray-500">Upload a leaf photo to instantly detect diseases and get treatment advice.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Upload & Preview */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-xl p-6 text-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Crop Preview" className="h-48 w-auto mx-auto rounded-lg shadow-sm object-cover" />
            ) : (
              <div className="text-gray-400 py-8 flex flex-col items-center justify-center gap-2">
                <FiImage className="text-3xl" />
                <span>No image selected</span>
              </div>
            )}
            
            {/* The capture="environment" attribute forces mobile phones to open the back camera! */}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handleImageChange} 
              className="hidden" 
              id="cameraInput" 
            />
            <label 
              htmlFor="cameraInput" 
              className="mt-4 inline-flex items-center justify-center gap-2 bg-white border border-green-600 text-green-700 font-bold py-2 px-6 rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
            >
              <FiCamera className="text-lg" /> Take Photo / Upload
            </label>
          </div>

          <button 
            onClick={handleDiagnosis} 
            disabled={loading || !imageFile}
            className={`w-full font-bold py-3 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 ${
              loading || !imageFile ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? (
              <><FiCpu className="animate-pulse" /> AI is analyzing...</>
            ) : (
              'Run Health Check'
            )}
          </button>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-start gap-2">
              <FiAlertTriangle className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Side: Results */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 h-full">
          {!result && !loading && (
             <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <FiSearch className="text-4xl mb-2" />
               <p>Diagnosis results will appear here.</p>
             </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-green-600">
               <FiSettings className="text-4xl mb-3 animate-spin" />
               <p className="font-bold animate-pulse">Scanning leaf patterns...</p>
            </div>
          )}

          {result && (
            <div className="animate-fade-in-up">
              {result.is_healthy ? (
                <div className="bg-green-100 text-green-800 p-4 rounded-lg border border-green-200">
                  <h4 className="font-black text-lg flex items-center gap-2">
                    <FiCheckCircle /> Plant appears healthy!
                  </h4>
                  <p className="text-sm mt-1">Confidence: {Math.round(result.is_healthy_probability * 100)}%</p>
                </div>
              ) : result.diseases && result.diseases.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200">
                    <h4 className="font-black text-lg flex items-center gap-2">
                      <FiAlertTriangle /> Disease Detected
                    </h4>
                    <p className="text-xl font-bold mt-1">
                      {result.diseases[0].disease_details.common_names?.[0] || result.diseases[0].name}
                    </p>
                    <p className="text-sm mt-1">Confidence: {Math.round(result.diseases[0].probability * 100)}%</p>
                  </div>
                  
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm uppercase mb-1">Description</h5>
                    <p className="text-sm text-gray-700">{result.diseases[0].disease_details.description}</p>
                  </div>

                  {result.diseases[0].disease_details.treatment && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h5 className="font-bold text-gray-900 text-sm uppercase mb-2">Treatment Plan</h5>
                      <ul className="text-sm text-gray-700 space-y-3">
                        {result.diseases[0].disease_details.treatment.biological && (
                          <li className="flex items-start gap-2">
                            <FiShield className="text-green-600 mt-1 shrink-0" />
                            <span><strong>Biological:</strong> {result.diseases[0].disease_details.treatment.biological.join(', ')}</span>
                          </li>
                        )}
                        {result.diseases[0].disease_details.treatment.chemical && (
                          <li className="flex items-start gap-2">
                            <FiDroplet className="text-blue-500 mt-1 shrink-0" />
                            <span><strong>Chemical:</strong> {result.diseases[0].disease_details.treatment.chemical.join(', ')}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-orange-50 text-orange-800 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-bold flex items-center gap-2">
                    <FiAlertTriangle /> Issue detected, but no details available.
                  </h4>
                  <p className="text-sm mt-1">Please try taking a closer, clearer photo of the affected area.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}