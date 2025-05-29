import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('request_otp'); // 'request_otp' or 'reset_password'
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Basic email validation
    if (!email) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStep('reset_password'); // Move to the next step
      } else {
        setError(data.message || 'Failed to send OTP.');
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans">
      <div className="w-full max-w-md px-8 py-12 bg-white rounded-2xl">
      <div className="flex items-center justify-center gap-6 mb-8">
            <img src="/Logo.png" alt="KampusKart Logo" className="h-12 w-12 object-contain" style={{ background: 'none', border: 'none', borderRadius: 0, boxShadow: 'none' }} />
            <span className="text-h4 font-extrabold text-black tracking-tight font-sans">Kampuskart</span>
          </div>
        <h2 className="mb-6 text-h3 font-bold text-black text-center">Forgot Password</h2>
        
        {step === 'request_otp' && (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-orange/10 p-4">
                <div className="text-sm text-orange-700">{error}</div>
              </div>
            )}
            {message && (
              <div className="rounded-md bg-green-100 p-4">
                <div className="text-sm text-green-700">{message}</div>
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full pl-3 pr-3 py-3 border-b border-gray-300 focus:border-black focus:ring-0 text-black placeholder-gray-400 bg-transparent"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 rounded-full text-lg font-semibold text-white bg-[#181818] shadow-lg hover:bg-[#00C6A7] hover:text-white transition`}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'reset_password' && (
          <form className="space-y-6" onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError('');
            setMessage('');

            // Basic validation
            if (!otp || !newPassword || !confirmPassword) {
              setError('Please fill in all fields.');
              setLoading(false);
              return;
            }
            if (newPassword !== confirmPassword) {
              setError('New password and confirm password do not match.');
              setLoading(false);
              return;
            }

            try {
              const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp, newPassword }),
              });

              const data = await response.json();

              if (response.ok) {
                setMessage(data.message);
                // Optionally redirect to login page after successful reset
                 // navigate('/login');
              } else {
                setError(data.message || 'Failed to reset password. Please check your OTP.');
              }
            } catch (err: any) {
              setError('An error occurred. Please try again.');
            } finally {
              setLoading(false);
            }
          }}>
            {error && (
              <div className="rounded-md bg-orange/10 p-4">
                <div className="text-sm text-orange-700">{error}</div>
              </div>
            )}
            {message && (
              <div className="rounded-md bg-green-100 p-4">
                <div className="text-sm text-green-700">{message}</div>
              </div>
            )}
            <div>
              <label htmlFor="otp" className="sr-only">OTP</label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className="block w-full pl-3 pr-3 py-3 border-b border-gray-300 focus:border-black focus:ring-0 text-black placeholder-gray-400 bg-transparent"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="new-password" className="sr-only">New Password</label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full pl-3 pr-3 py-3 border-b border-gray-300 focus:border-black focus:ring-0 text-black placeholder-gray-400 bg-transparent"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm New Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="block w-full pl-3 pr-3 py-3 border-b border-gray-300 focus:border-black focus:ring-0 text-black placeholder-gray-400 bg-transparent"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 rounded-full text-lg font-semibold text-white bg-[#181818] shadow-lg hover:bg-[#00C6A7] hover:text-white transition`}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="text-center text-sm mt-6 text-gray-500">
          Remember your password?{' '}
          <Link to="/login" className="text-[#F05A25] font-semibold hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 