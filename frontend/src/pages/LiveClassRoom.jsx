import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../config';

const LiveClassRoom = () => {
  const { id } = useParams();
  const isHost = new URLSearchParams(window.location.search).get('host') === 'true';
  const [email, setEmail] = useState('');
  const [authStep, setAuthStep] = useState(!isHost);
  const [loading, setLoading] = useState(isHost);
  const [error, setError] = useState(null);
  const [classData, setClassData] = useState(null);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${config.API_BASE_URL}/api/live-classes/verify-access/${id}`, { email, isHost });
      if (res.data.authorized) {
        setClassData(res.data.classData);
        setAuthStep(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to join class. It may have expired or you are not registered.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHost) {
      // If host, auto-verify without email
      handleVerify();
    }
  }, [id, isHost]);

  useEffect(() => {
    if (classData && !loading && !error) {
      // Load Jitsi script if not already present
      if (!window.JitsiMeetExternalAPI) {
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = initJitsi;
        document.body.appendChild(script);
      } else {
        initJitsi();
      }
    }
  }, [classData, loading, error]);

  const initJitsi = () => {
    const isHost = new URLSearchParams(window.location.search).get('host') === 'true';
    const domain = 'meet.jit.si';
    const options = {
      roomName: classData.meetingUrl || `TarotClass_${classData.id}`,
      width: '100%',
      height: 700,
      parentNode: document.getElementById('jitsi-container'),
      userInfo: {
        displayName: isHost ? 'Teacher / Host' : 'Student'
      },
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: true
      }
    };
    new window.JitsiMeetExternalAPI(domain, options);
  };

  if (authStep) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join Live Class
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter your registered Google email to access the class.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleVerify}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {loading ? 'Verifying...' : 'Enter Classroom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Classroom...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-white">
        <div className="bg-red-900/50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2 text-red-200">Access Denied</h2>
          <p className="text-red-100">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="p-4 bg-gray-800 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold">{classData.title}</h1>
        <span className="text-sm text-gray-400">Joined as: {isHost ? 'Teacher (Host)' : 'Student'}</span>
      </div>
      <div id="jitsi-container" className="flex-1 w-full bg-black"></div>
    </div>
  );
};

export default LiveClassRoom;
