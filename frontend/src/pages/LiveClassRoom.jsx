import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config';
import { Video, ArrowLeft, ExternalLink, AlertCircle, Sparkles, Clock, RefreshCw } from 'lucide-react';

const LiveClassRoom = () => {
  const { id } = useParams();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const studentName = localStorage.getItem('studentName') || '';
  const studentEmail = localStorage.getItem('studentEmail') || '';

  // Determine if user is host
  const isHostQuery = new URLSearchParams(window.location.search).get('host') === 'true';
  const isHost = isHostQuery || role === 'admin' || role === 'host';

  const [identifier, setIdentifier] = useState(studentEmail); // email or phone
  const [verifiedIdentifier, setVerifiedIdentifier] = useState(studentEmail);
  const [authStep, setAuthStep] = useState(!isHost && !token && !studentEmail);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classData, setClassData] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingTitle, setWaitingTitle] = useState('Live Tarot Class');

  const displayName = isHost 
    ? 'Host (Sara Tarot)' 
    : (studentName ? studentName : 'Enrolled Student');

  const getDirectMeetingUrl = (data = classData) => {
    if (!data) return '';
    const raw = data.meetingUrl || `TarotClass_${data.id}`;
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }
    if (!isHost) {
      const studentButtons = encodeURIComponent(JSON.stringify([
        'microphone', 'camera', 'chat', 'raisehand', 'tileview', 'settings', 'hangup'
      ]));
      return `https://meet.jit.si/${raw}#userInfo.displayName="${encodeURIComponent(displayName)}"&config.disableInviteFunctions=true&config.disableRemoteMute=true&config.breakoutRooms.hideAddRoomButton=true&config.breakoutRooms.hideMuteAllButton=true&config.participantsPane.hideMuteAllButton=true&config.participantsPane.hideMoreActionsButton=true&config.remoteVideoMenu.disableKick=true&config.remoteVideoMenu.disableGrantModerator=true&interfaceConfig.HIDE_INVITE_MORE_HEADER=true&interfaceConfig.SHOW_JITSI_WATERMARK=false&config.toolbarButtons=${studentButtons}&config.doNotStoreRoom=true&config.prejoinConfig.enabled=false`;
    }
    const hostButtons = encodeURIComponent(JSON.stringify([
      'microphone', 'camera', 'desktop', 'chat', 'recording', 'raisehand', 'participants-pane', 'tileview', 'settings', 'mute-everyone', 'security', 'hangup'
    ]));
    return `https://meet.jit.si/${raw}#userInfo.displayName="${encodeURIComponent(displayName)}"&config.toolbarButtons=${hostButtons}`;
  };

  const handleVerify = async (e, customIdentifier = null, silent = false) => {
    if (e) e.preventDefault();
    if (!silent) setLoading(true);
    setError(null);

    const val = customIdentifier !== null ? customIdentifier : (identifier || verifiedIdentifier);
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
        if (val) setVerifiedIdentifier(val);

        // Check if student is waiting for host to join
        if (res.data.isWaiting) {
          setIsWaiting(true);
          setWaitingTitle(res.data.classTitle || 'Live Tarot Class');
          setAuthStep(false);
          setLoading(false);
          return;
        }

        // Host is live and student is authorized -> launch room!
        setIsWaiting(false);
        setClassData(res.data.classData);
        setAuthStep(false);
        setRedirecting(true);
        
        const targetUrl = getDirectMeetingUrl(res.data.classData);
        if (targetUrl) {
          window.location.replace(targetUrl);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to join class. It may have expired or you need to register.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (isHost || token) {
      handleVerify(null, '');
    } else if (studentEmail) {
      handleVerify(null, studentEmail);
    } else {
      setLoading(false);
      setAuthStep(true);
    }
  }, [id, isHost]);

  // If waiting for host, auto-poll every 3 seconds
  useEffect(() => {
    let timer;
    if (isWaiting && !isHost) {
      timer = setInterval(() => {
        handleVerify(null, verifiedIdentifier || identifier || studentEmail, true);
      }, 3000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isWaiting, isHost, verifiedIdentifier, identifier, studentEmail]);

  // Form to verify credentials (for unregistered or unauthenticated visits)
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

  // Error screen
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

  // Waiting Screen: Host has not started yet
  if (isWaiting && !isHost) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-lg w-full bg-slate-900 border border-indigo-900/50 rounded-3xl p-8 sm:p-10 shadow-2xl text-center relative z-10">
          <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-400 relative">
            <Clock className="w-10 h-10 animate-pulse text-amber-400" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
            </span>
          </div>

          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-block mb-3 uppercase tracking-wider">
            Waiting for Teacher
          </span>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1">
            Sara Tarot Card Reader
          </h1>
          <p className="text-amber-400 font-semibold text-sm tracking-wider uppercase mb-4">
            Live Interactive Classroom
          </p>

          <div className="bg-slate-800/60 border border-indigo-900/30 rounded-2xl p-5 mb-6 text-slate-300 text-sm leading-relaxed">
            <p className="font-semibold text-white mb-1">
              The teacher has not started this live class yet.
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Please stay on this page. As soon as the host joins, you will automatically be connected to the live session!
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-medium">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Checking host status every few seconds...</span>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-center">
            <Link 
              to="/home" 
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Instant Launch / Transition Screen (Host is live, redirecting to full room!)
  const directUrl = getDirectMeetingUrl();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-lg w-full bg-slate-900 border border-indigo-900/50 rounded-3xl p-8 sm:p-10 shadow-2xl text-center relative z-10">
        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto mb-5 text-emerald-400">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-block mb-3">
          ✓ Host is Live: {displayName}
        </span>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1">
          Sara Tarot Card Reader
        </h1>
        <p className="text-emerald-400 font-semibold text-sm tracking-wider uppercase mb-4">
          Live Interactive Classroom
        </p>

        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          Connecting you to the live classroom now...
        </p>

        <a
          href={directUrl}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold rounded-2xl shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 text-base uppercase tracking-wider hover:-translate-y-0.5"
        >
          <ExternalLink className="w-5 h-5" />
          Enter Classroom Now
        </a>

        <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500">
          Protected Live Tarot Classroom • Sara Tarot Card Reader
        </div>
      </div>
    </div>
  );
};

export default LiveClassRoom;
