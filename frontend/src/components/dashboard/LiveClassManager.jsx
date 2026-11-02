import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../../config';
import { Video, Film, Plus, Calendar, Clock, Copy, Check, Trash2, ExternalLink, Play, AlertCircle, Info } from 'lucide-react';
import VideoModal from '../VideoModal';

const getTodayStr = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const getFutureDateStr = (days = 30, fromDateStr = null) => {
  const d = fromDateStr ? new Date(fromDateStr) : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const LiveClassManager = () => {
  const [activeSubTab, setActiveSubTab] = useState('classes'); // 'classes' | 'recordings'
  
  // Live Classes State
  const [classes, setClasses] = useState([]);
  const [classForm, setClassForm] = useState({
    title: '',
    startDate: getTodayStr(),
    endDate: getFutureDateStr(30)
  });
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classError, setClassError] = useState(null);
  const [copiedClassId, setCopiedClassId] = useState(null);

  // Recordings State
  const [recordings, setRecordings] = useState([]);
  const [recordingSource, setRecordingSource] = useState('file'); // 'file' | 'url'
  const [recordingForm, setRecordingForm] = useState({
    title: '',
    description: '',
    duration: '',
    recordedDate: getTodayStr(),
    validityDays: '30',
    videoUrl: '',
    liveClassId: ''
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [loadingRecordings, setLoadingRecordings] = useState(false);
  const [recordingError, setRecordingError] = useState(null);
  const [recordingSuccess, setRecordingSuccess] = useState(null);
  const [selectedPreviewVideo, setSelectedPreviewVideo] = useState(null);

  // Fetch Live Classes
  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${config.API_BASE_URL}/api/live-classes`);
      setClasses(res.data);
    } catch (err) {
      console.error(err);
      setClassError('Failed to fetch live classes');
    }
  };

  // Fetch Recordings
  const fetchRecordings = async () => {
    try {
      const res = await axios.get(`${config.API_BASE_URL}/api/live-classes/recordings`);
      setRecordings(res.data);
    } catch (err) {
      console.error(err);
      setRecordingError('Failed to fetch recordings');
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchRecordings();
  }, []);

  // Handle Class Creation
  const handleClassSubmit = async (e) => {
    e.preventDefault();
    setLoadingClasses(true);
    setClassError(null);
    try {
      const generatedMeetingUrl = `tarot-class-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await axios.post(`${config.API_BASE_URL}/api/live-classes`, {
        title: classForm.title,
        meetingUrl: generatedMeetingUrl,
        startDate: classForm.startDate,
        endDate: classForm.endDate,
        allowedEmails: []
      });
      setClassForm({
        title: '',
        startDate: getTodayStr(),
        endDate: getFutureDateStr(30)
      });
      fetchClasses();
    } catch (err) {
      console.error(err);
      setClassError('Failed to create live class');
    } finally {
      setLoadingClasses(false);
    }
  };

  // Delete Live Class
  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this live class?')) return;
    try {
      await axios.delete(`${config.API_BASE_URL}/api/live-classes/${id}`);
      fetchClasses();
    } catch (err) {
      console.error(err);
      alert('Failed to delete live class');
    }
  };

  // Copy Student Link
  const handleCopyLink = (classId) => {
    const url = `${window.location.origin}/live-class/${classId}`;
    navigator.clipboard.writeText(url);
    setCopiedClassId(classId);
    setTimeout(() => setCopiedClassId(null), 2500);
  };

  // Handle Recording Creation
  const handleRecordingSubmit = async (e) => {
    e.preventDefault();
    setLoadingRecordings(true);
    setRecordingError(null);
    setRecordingSuccess(null);

    try {
      const formData = new FormData();
      formData.append('title', recordingForm.title);
      formData.append('description', recordingForm.description);
      formData.append('duration', recordingForm.duration);
      formData.append('recordedDate', recordingForm.recordedDate);
      formData.append('validityDays', recordingForm.validityDays);
      if (recordingForm.liveClassId) {
        formData.append('liveClassId', recordingForm.liveClassId);
      }

      if (recordingSource === 'file') {
        if (!videoFile) {
          throw new Error('Please select a video file to upload');
        }
        formData.append('video', videoFile);
      } else {
        if (!recordingForm.videoUrl) {
          throw new Error('Please provide a video URL');
        }
        formData.append('videoUrl', recordingForm.videoUrl);
      }

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      await axios.post(`${config.API_BASE_URL}/api/live-classes/recordings`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setRecordingSuccess('Live class recording added successfully! It will be accessible for 30 days.');
      setRecordingForm({
        title: '',
        description: '',
        duration: '',
        recordedDate: getTodayStr(),
        validityDays: '30',
        videoUrl: '',
        liveClassId: ''
      });
      setVideoFile(null);
      setThumbnailFile(null);
      fetchRecordings();
    } catch (err) {
      console.error(err);
      setRecordingError(err.response?.data?.error || err.message || 'Failed to save recording');
    } finally {
      setLoadingRecordings(false);
    }
  };

  // Delete Recording
  const handleDeleteRecording = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recording?')) return;
    try {
      await axios.delete(`${config.API_BASE_URL}/api/live-classes/recordings/${id}`);
      fetchRecordings();
    } catch (err) {
      console.error(err);
      alert('Failed to delete recording');
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-indigo-900/50 rounded-2xl shadow-xl w-full text-white">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-indigo-900/50">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Video className="w-6 h-6 text-amber-500" />
            Live Classes & Recordings
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage real-time live video sessions and 30-day recorded class archives.
          </p>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-xl border border-indigo-900/50">
          <button
            onClick={() => setActiveSubTab('classes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeSubTab === 'classes'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            Live Meetings
          </button>
          <button
            onClick={() => setActiveSubTab('recordings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeSubTab === 'recordings'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            Recordings (30 Days)
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: LIVE CLASSES / MEETINGS                       */}
      {/* ==================================================== */}
      {activeSubTab === 'classes' && (
        <div>
          {classError && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{classError}</span>
            </div>
          )}

          {/* Create Live Class Form */}
          <div className="bg-slate-800/40 border border-indigo-900/40 rounded-xl p-5 mb-8">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Schedule New Live Class
            </h3>

            <form onSubmit={handleClassSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Class Title <span className="text-amber-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="title" 
                  value={classForm.title} 
                  onChange={(e) => setClassForm({ ...classForm, title: e.target.value })} 
                  required
                  className="w-full rounded-xl bg-slate-800 border-indigo-900/50 text-white shadow-sm p-3 border focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g., Major Arcana Deep Dive - Batch 1"
                />
              </div>

              {/* Date Range Selection (Default 30 days) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    Start Date
                  </label>
                  <input 
                    type="date" 
                    value={classForm.startDate} 
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setClassForm({
                        ...classForm,
                        startDate: newStart,
                        endDate: getFutureDateStr(30, newStart)
                      });
                    }}
                    required
                    className="w-full rounded-xl bg-slate-800 border-indigo-900/50 text-white p-3 border focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    End Date (Expiration)
                  </label>
                  <input 
                    type="date" 
                    value={classForm.endDate} 
                    onChange={(e) => setClassForm({ ...classForm, endDate: e.target.value })}
                    required
                    className="w-full rounded-xl bg-slate-800 border-indigo-900/50 text-white p-3 border focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-slate-400 font-medium">Quick Duration:</span>
                <button
                  type="button"
                  onClick={() => setClassForm({ ...classForm, endDate: getFutureDateStr(30, classForm.startDate) })}
                  className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold hover:bg-amber-500/20 transition"
                >
                  30 Days (Default)
                </button>
                <button
                  type="button"
                  onClick={() => setClassForm({ ...classForm, endDate: getFutureDateStr(60, classForm.startDate) })}
                  className="px-3 py-1 bg-slate-800 text-slate-300 border border-indigo-900/50 rounded-lg text-xs hover:bg-slate-700 transition"
                >
                  60 Days
                </button>
                <button
                  type="button"
                  onClick={() => setClassForm({ ...classForm, endDate: getFutureDateStr(90, classForm.startDate) })}
                  className="px-3 py-1 bg-slate-800 text-slate-300 border border-indigo-900/50 rounded-lg text-xs hover:bg-slate-700 transition"
                >
                  90 Days
                </button>
                <span className="text-xs text-emerald-400 ml-auto flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Link valid for 30 days by default
                </span>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loadingClasses}
                  className="bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  {loadingClasses ? 'Creating Class...' : 'Create Live Class'}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Live Classes Table */}
          <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
            <span>Existing Live Classes</span>
            <span className="text-xs font-normal text-slate-400">Total: {classes.length}</span>
          </h3>

          <div className="overflow-x-auto border border-indigo-900/50 rounded-xl">
            <table className="min-w-full divide-y divide-indigo-900/50">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Title</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">End Date (30 Days)</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Host Access</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Student Link</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-slate-900 divide-y divide-indigo-900/50">
                {classes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-500 text-sm">
                      No live classes scheduled yet. Create one above!
                    </td>
                  </tr>
                ) : (
                  classes.map(cls => {
                    const isExpired = cls.isExpired || cls.dynamicStatus === 'expired';
                    const startDateDisplay = cls.startDate 
                      ? new Date(cls.startDate).toLocaleDateString() 
                      : new Date(cls.createdAt).toLocaleDateString();
                    const endDateDisplay = cls.endDate 
                      ? new Date(cls.endDate).toLocaleDateString() 
                      : '30 days from creation';

                    return (
                      <tr key={cls.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap text-slate-200 font-medium">
                          {cls.title}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-slate-400 text-sm">
                          {startDateDisplay}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-slate-400 text-sm">
                          {endDateDisplay}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-bold rounded-full ${
                            isExpired 
                              ? 'bg-red-900/40 text-red-400 border border-red-500/40' 
                              : 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/40'
                          }`}>
                            {isExpired ? 'Expired' : 'Active'}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm">
                          <a 
                            href={`/live-class/${cls.id}?host=true`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-semibold transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Join Room as Host
                          </a>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleCopyLink(cls.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-700/40 hover:bg-indigo-900 hover:text-white transition text-xs font-medium"
                            title="Copy Student Link"
                          >
                            {copiedClassId === cls.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Student Link</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleDeleteClass(cls.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition"
                            title="Delete Live Class"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: LIVE CLASS RECORDINGS (30 DAYS POLICY)        */}
      {/* ==================================================== */}
      {activeSubTab === 'recordings' && (
        <div>
          {/* Policy Info Box */}
          <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-800/40 p-4 rounded-xl mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-bold text-amber-300">30-Day Recording Storage Policy:</span>
              <p className="text-slate-300 mt-0.5">
                All uploaded live class recordings are stored and made accessible on the website for <strong>30 days</strong> from the recording date. Students can watch replays anytime during this window from the <strong>"Live Class Recorded"</strong> menu.
              </p>
            </div>
          </div>

          {recordingError && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{recordingError}</span>
            </div>
          )}

          {recordingSuccess && (
            <div className="bg-emerald-900/50 border border-emerald-500/50 text-emerald-200 p-3 rounded-xl mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span>{recordingSuccess}</span>
            </div>
          )}

          {/* Add Recording Form */}
          <div className="bg-slate-800/40 border border-indigo-900/40 rounded-xl p-5 mb-8">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Upload Live Class Recording
            </h3>

            <form onSubmit={handleRecordingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Recording Title <span className="text-amber-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={recordingForm.title} 
                    onChange={(e) => setRecordingForm({ ...recordingForm, title: e.target.value })} 
                    required
                    className="w-full rounded-xl bg-slate-800 border-indigo-900/50 text-white shadow-sm p-3 border focus:ring-amber-500 focus:border-amber-500"
                    placeholder="e.g., Major Arcana Deep Dive - Class 1 Recording"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Related Live Class (Optional)
                  </label>
                  <select
                    value={recordingForm.liveClassId}
                    onChange={(e) => setRecordingForm({ ...recordingForm, liveClassId: e.target.value })}
                    className="w-full rounded-xl bg-slate-800 border-indigo-900/50 text-white shadow-sm p-3 border focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">Select an existing live class...</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Description / Topics Covered
                </label>
                <textarea 
                  value={recordingForm.description} 
                  onChange={(e) => setRecordingForm({ ...recordingForm, description: e.target.value })} 
                  rows="2"
                  className="w-full rounded-xl bg-slate-800 border-indigo-900/50 text-white shadow-sm p-3 border focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Summary of what was taught in this recorded session..."
                />
              </div>

              {/* Video Source Choice */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Video Source</label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                    <input 
                      type="radio" 
                      name="source" 
                      value="file" 
                      checked={recordingSource === 'file'}
                      onChange={() => setRecordingSource('file')}
                      className="accent-amber-500"
                    />
                    Upload Video File (MP4/WebM)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                    <input 
                      type="radio" 
                      name="source" 
                      value="url" 
                      checked={recordingSource === 'url'}
                      onChange={() => setRecordingSource('url')}
                      className="accent-amber-500"
                    />
                    External Video Link / URL
                  </label>
                </div>

                {recordingSource === 'file' ? (
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    required
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer bg-slate-800/50 p-2 rounded-xl border border-indigo-900/50"
                  />
                ) : (
                  <input 
                    type="url" 
                    placeholder="https://... (Direct MP4, Cloud URL, or streaming link)"
                    value={recordingForm.videoUrl} 
                    onChange={(e) => setRecordingForm({ ...recordingForm, videoUrl: e.target.value })}
                    required
                    className="w-full rounded-xl bg-slate-800 border-indigo-900/50 text-white p-3 border focus:ring-amber-500 focus:border-amber-500"
                  />
                )}
              </div>

              {/* Dates & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    Recorded Date
                  </label>
                  <input 
                    type="date" 
                    value={recordingForm.recordedDate} 
                    onChange={(e) => setRecordingForm({ ...recordingForm, recordedDate: e.target.value })}
                    required
                    className="w-full rounded-xl bg-slate-800 border-indigo-900/50 text-white p-3 border focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Retention Period (Days)
                  </label>
                  <input 
                    type="number" 
                    value={recordingForm.validityDays} 
                    onChange={(e) => setRecordingForm({ ...recordingForm, validityDays: e.target.value })}
                    min="1"
                    max="365"
                    required
                    className="w-full rounded-xl bg-slate-800 border-indigo-900/50 text-white p-3 border focus:ring-amber-500 focus:border-amber-500"
                  />
                  <span className="text-xs text-amber-400 mt-1 block font-medium">Default: 30 days stored on website</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Duration (e.g., 45m or 1h 10m)
                  </label>
                  <input 
                    type="text" 
                    value={recordingForm.duration} 
                    onChange={(e) => setRecordingForm({ ...recordingForm, duration: e.target.value })}
                    placeholder="e.g., 45 mins"
                    className="w-full rounded-xl bg-slate-800 border-indigo-900/50 text-white p-3 border focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Thumbnail Image */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Optional Thumbnail Image
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setThumbnailFile(e.target.files[0])}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer bg-slate-800/50 p-2 rounded-xl border border-indigo-900/50"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loadingRecordings}
                  className="bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  {loadingRecordings ? 'Uploading & Processing...' : 'Save & Publish Recording'}
                </button>
              </div>
            </form>
          </div>

          {/* Recordings List */}
          <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
            <span>Stored Live Class Recordings</span>
            <span className="text-xs font-normal text-slate-400">Total: {recordings.length}</span>
          </h3>

          <div className="overflow-x-auto border border-indigo-900/50 rounded-xl">
            <table className="min-w-full divide-y divide-indigo-900/50">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Title</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Recorded Date</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Expires On</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">30-Day Status</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Preview</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-slate-900 divide-y divide-indigo-900/50">
                {recordings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500 text-sm">
                      No live class recordings uploaded yet.
                    </td>
                  </tr>
                ) : (
                  recordings.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-slate-200 font-medium">{rec.title}</div>
                        {rec.duration && <span className="text-xs text-slate-400">{rec.duration}</span>}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-400 text-sm">
                        {new Date(rec.recordedDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-400 text-sm">
                        {new Date(rec.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {rec.isExpired ? (
                          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-900/40 text-red-400 border border-red-500/40">
                            Expired
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-500/40">
                            {rec.daysRemaining} days left
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedPreviewVideo(rec)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-semibold text-xs transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Watch Replay
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDeleteRecording(rec.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition"
                          title="Delete Recording"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {selectedPreviewVideo && (
        <VideoModal 
          isOpen={!!selectedPreviewVideo} 
          onClose={() => setSelectedPreviewVideo(null)} 
          video={{
            ...selectedPreviewVideo,
            video_url: selectedPreviewVideo.videoUrl,
            thumbnail_url: selectedPreviewVideo.thumbnailUrl
          }} 
        />
      )}
    </div>
  );
};

export default LiveClassManager;
