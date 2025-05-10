import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/button';
import Input from '../ui/Input';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setErrors({ form: 'Invalid email or password' });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Admin Login</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to your admin account</p>
      </div>
      
      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.form}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          label="Email Address"
          placeholder="admin@example.com"
          error={errors.email}
          required
        />
        
        <Input
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          label="Password"
          placeholder="••••••••"
          error={errors.password}
          required
        />

        <div className="flex items-center justify-between mb-6 mt-4">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Forgot password?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
        <Link to="/auth/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          Register now
        </Link>
      </div>
    </div>
  );
};

export default Login;