import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';

const Login = () => {
  const navigate = useNavigate();
  
  // View mode: 'student' or 'admin'
  const [loginMode, setLoginMode] = useState('student');
  
  // Student flow state
  const [step, setStep] = useState(1); // 1 = phone/email, 2 = otp
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);

  // Admin flow state
  const [formData, setFormData] = useState({ email: '', password: '' });

  // Common state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/home');
    }
  }, [navigate]);

  // Timer logic for OTP resend
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle Admin Input
  const handleAdminChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- Student API Handlers ---
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${config.API_BASE_URL}/api/auth/request-otp`, { 
        phone_number: phoneNumber,
        email: email 
      });
      setStep(2);
      setTimer(30); // 30 second wait before resend
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${config.API_BASE_URL}/api/auth/verify-otp`, { 
        phone_number: phoneNumber, 
        otp 
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // --- Admin API Handler ---
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${config.API_BASE_URL}/api/auth/login`, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-slate-900 p-10 rounded-3xl shadow-2xl border border-indigo-900/50 relative z-10">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
            Tarot Classes
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            {loginMode === 'student' ? 'Student Sign In' : 'Admin / Host Sign In'}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-xl text-center text-sm">
            {error}
          </div>
        )}

        {/* STUDENT LOGIN FLOW */}
        {loginMode === 'student' && (
          <>
            {step === 1 ? (
              <form className="mt-8 space-y-6" onSubmit={handleRequestOtp}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="appearance-none block w-full px-4 py-3 border border-indigo-900/50 rounded-xl bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                      placeholder="+919876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-4 py-3 border border-indigo-900/50 rounded-xl bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                      placeholder="Enter your email to receive OTP"
                    />
                    <p className="mt-2 text-xs text-slate-500">Must match the phone number used during purchase.</p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-slate-900 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send OTP via Email'}
                </button>
              </form>
            ) : (
              <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-indigo-900/50 rounded-xl bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-center tracking-widest text-lg"
                    placeholder="------"
                  />
                </div>
                <div className="flex flex-col space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-slate-900 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={timer > 0 || loading}
                    className="text-sm text-slate-400 hover:text-amber-400 disabled:opacity-50 transition-colors"
                  >
                    {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setOtp(''); setError(null); }}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Change Phone Number / Email
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* ADMIN/HOST LOGIN FLOW */}
        {loginMode === 'admin' && (
          <form className="mt-8 space-y-6" onSubmit={handleAdminSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email address</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleAdminChange}
                  className="appearance-none block w-full px-4 py-3 border border-indigo-900/50 rounded-xl bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  placeholder="admin@tarot.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleAdminChange}
                  className="appearance-none block w-full px-4 py-3 border border-indigo-900/50 rounded-xl bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-slate-900 bg-indigo-500 hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Admin Sign In'}
            </button>
          </form>
        )}

        {/* TOGGLE MODE */}
        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => {
              setLoginMode(loginMode === 'student' ? 'admin' : 'student');
              setError(null);
            }}
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {loginMode === 'student' ? 'Admin / Host Login' : 'Student Login'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
