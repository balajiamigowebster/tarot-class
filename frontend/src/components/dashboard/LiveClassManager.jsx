import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../../../config';

const LiveClassManager = () => {
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    title: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${config.API_BASE_URL}/api/live-classes`);
      setClasses(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch live classes');
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const generatedMeetingUrl = `tarot-class-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await axios.post(`${config.API_BASE_URL}/api/live-classes`, {
        title: formData.title,
        meetingUrl: generatedMeetingUrl,
        allowedEmails: []
      });
      setFormData({ title: '' });
      fetchClasses();
    } catch (err) {
      console.error(err);
      setError('Failed to create live class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-indigo-900/50 rounded-2xl shadow-xl w-full">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">Manage Live Classes</h2>
      
      {error && <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300">Class Title</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            required
            className="mt-1 block w-full rounded-xl bg-slate-800 border-indigo-900/50 text-white shadow-sm p-3 border focus:ring-amber-500 focus:border-amber-500"
            placeholder="e.g., Major Arcana Deep Dive"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-amber-500 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-amber-400 transition"
        >
          {loading ? 'Creating...' : 'Create Live Class'}
        </button>
      </form>

      <h3 className="text-xl font-bold mb-4 text-white">Existing Classes</h3>
      <div className="overflow-x-auto border border-indigo-900/50 rounded-xl">
        <table className="min-w-full divide-y divide-indigo-900/50">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Link</th>
            </tr>
          </thead>
          <tbody className="bg-slate-900 divide-y divide-indigo-900/50">
            {classes.map(cls => {
              const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
              const isExpired = Date.now() - new Date(cls.createdAt).getTime() > thirtyDaysInMs;
              
              return (
                <tr key={cls.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">{cls.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400">{new Date(cls.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${isExpired ? 'bg-red-900/50 text-red-400 border border-red-500/50' : 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/50'}`}>
                      {isExpired ? 'Expired' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-500 hover:text-amber-400 hover:underline">
                    <a href={`/live-class/${cls.id}?host=true`} target="_blank" rel="noopener noreferrer">Join Room as Host</a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveClassManager;
