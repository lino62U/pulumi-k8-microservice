import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// Fix: Corrected import from 'react-router-dom' to resolve module export errors.
import { useNavigate, Link } from 'react-router-dom';

const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
    </svg>
);


const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Hint: admin@adv.com / password');
    }
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-dark-accent">
        
        {/* Branding Section */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-700 to-purple-600 p-12 text-white flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-wider">Ad-Vantage</h1>
            <p className="mt-4 text-blue-100 opacity-90">The all-in-one HR platform for the modern advertising agency.</p>
          </div>
          <div className="mt-auto">
            <p className="text-sm font-light">© {new Date().getFullYear()} Ad-Vantage Inc. All rights reserved.</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-1/2 p-8 md:p-12">
            <div className="text-center lg:text-left mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Login</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome back! Please sign in to your account.</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                 <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-md font-medium rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition duration-300"
                >
                  Sign in
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <Link to="/" className="inline-flex items-center text-sm font-medium text-primary hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Home
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;