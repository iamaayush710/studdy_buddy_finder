import React, { useState } from 'react';
import { loginUser } from '../api/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    setLoading(true); // Show loading state

    try {
      // Attempt to log in with email and password
      const response = await loginUser({ email, password });
      localStorage.setItem('token', response.data.token); // Store JWT token in localStorage
      alert("Login successful!"); // Notify user on successful login
    } catch (err) {
      // Set error message if login fails
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-800">Welcome Back!</h2>
          <p className="mt-2 text-sm text-gray-600">Please login to your account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Display error message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-200"
            disabled={loading} // Disable button when loading
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-gray-600">
            Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
