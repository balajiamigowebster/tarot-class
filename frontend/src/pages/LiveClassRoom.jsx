import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config';
import { Video, ShieldCheck, ArrowLeft, User, Phone, Mail, AlertCircle } from 'lucide-react';

const LiveClassRoom = () => {
  const { id } = useParams();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const studentName = localStorage.getItem('studentName') || '';

  // Determine if user is host
  const isHostQuery = new URLSearchParams(window.location.search).get('host') === 'true';
  const isHost = isHostQuery || role === 'admin' || role === 'host';

  const [identifier, setIdentifier] = useState(''); // email or phone
  const [authStep, setAuthStep] = useState(!isHost && !token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classData, setClassData] = useState(null);

  const handleVerify = async (e, customIdentifier = null) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const val = customIdentifier !== null ? customIdentifier : identifier;
    const isEmail = val.includes('@');

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(
        `${config.API_BASE_URL}/api/live-classes/verify-access/${id}`,
        {
          email: isEmail ? val : '',
          phone: !isEmail ? val : '',
          isHost
        },
        { headers }
      );

      if (res.data.authorized) {
        setClassData(res.data.classData);
        setAuthStep(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to join class. It may have expired or you need to register.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If host or logged-in student, try immediate auto-verify
    if (isHost || token) {
      handleVerify(null, '');
    } else {
      setLoading(false);
      setAuthStep(true);
    }
  }, [id, isHost]);

  useEffect(() => {
    if (classData && !loading && !error && !authStep) {
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
  }, [classData, loading, error, authStep]);

  const initJitsi = () => {
    const domain = 'meet.jit.si';
    const roomName = classData.meetingUrl || `TarotClass_${classData.id}`;
    
    // Ensure clean container
    const container = document.getElementById('jitsi-container');
    if (container) {
      container.innerHTML = '';
    }

    const displayName = isHost 
      ? 'Host (Sara Tarot)' 
      : (studentName ? studentName : 'Enrolled Student');

    const options = {
      roomName,
      width: '100%',
      height: '100%',
      parentNode: container,
      userInfo: {
        displayName
      },
      configOverwrite: {
        startWithAudioMuted: !isHost,
        startWithVideoMuted: !isHost,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        enableWelcomePage: false,
        toolbarButtons: isHost ? [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fminitial', 'hangup', 'chat', 'recording', 'livestreaming',
          'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'mute-everyone', 'security'
        ] : [
          'microphone', 'camera', 'fullscreen', 'hangup', 'chat',
          'raisehand', 'tileview', 'settings'
        ]
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_REMOTE_DISPLAY_NAME: 'Student'
      }
    };

    try {
      new window.JitsiMeetExternalAPI(domain, options);
    } catch (err) {
      console.error('Jitsi Meet initialization error:', err);
    }
  };

  if (authStep) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-md w-full bg-slate-900 border border-indigo-900/50 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 text-white">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-500">
              <Video className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Join Live Tarot Class</h2>
            <p className="text-slate-400 text-sm mt-1">
              Please enter your registered Google email or 10-digit mobile number to verify access.
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Registered Email or Mobile Number
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. student@gmail.com or 9876543210"
                  required
                  className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-800 border border-indigo-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm uppercase tracking-wider"
            >
              {loading ? 'Verifying Access...' : 'Enter Live Classroom'}
            </button>

            <div className="text-center pt-2">
              <Link 
                to="/home" 
                className="text-xs text-slate-400 hover:text-amber-400 transition inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Website
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Connecting to live classroom...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 text-white">
        <div className="bg-red-950/60 border border-red-500/50 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-red-200 mb-2">Access Denied</h2>
          <p className="text-red-300 text-sm leading-relaxed mb-6">{error}</p>
          <div className="flex justify-center gap-3">
            <Link 
              to="/home" 
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-sm font-semibold transition"
            >
              Back to Home
            </Link>
            {isHost && (
              <Link 
                to="/dashboard" 
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 text-sm font-bold transition"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-white overflow-hidden">
      {/* Classroom Header Bar */}
      <div className="h-14 bg-slate-900 border-b border-indigo-900/50 px-4 sm:px-6 flex justify-between items-center shadow-lg flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link 
            to={isHost ? "/dashboard" : "/home"} 
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Leave classroom"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {classData?.title || 'Live Tarot Class'}
            </h1>
            <span className="text-xs text-amber-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Room Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            isHost 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
              : 'bg-indigo-950 text-indigo-300 border-indigo-800/40'
          }`}>
            {isHost ? '👑 Host / Teacher' : '🎓 Student'}
          </span>
          <Link 
            to={isHost ? "/dashboard" : "/home"}
            className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-semibold border border-red-800/40 transition"
          >
            Leave
          </Link>
        </div>
      </div>

      {/* Jitsi Meet Container */}
      <div id="jitsi-container" className="flex-1 w-full bg-black relative"></div>
    </div>
  );
};

export default LiveClassRoom;
