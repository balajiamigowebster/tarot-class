import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const LiveClassRoom = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classData, setClassData] = useState(null);

  useEffect(() => {
    const fetchClassAndVerify = async () => {
      try {
        const res = await axios.post(`http://localhost:5000/api/live-classes/verify-access/${id}`, {});
        if (res.data.authorized) {
          setClassData(res.data.classData);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to join class. It may have expired.');
      } finally {
        setLoading(false);
      }
    };
    fetchClassAndVerify();
  }, [id]);

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

  const isHost = new URLSearchParams(window.location.search).get('host') === 'true';

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
