import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/button';
import Input from '../ui/Input';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    secretCode: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { register, loading } = useAuth();
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
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.secretCode) {
      newErrors.secretCode = 'Secret code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        secretCode: formData.secretCode,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ 
        form: (err as Error).message || 'Registration failed. Please check your information.' 
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Admin Registration</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Create a new admin account</p>
      </div>
      
      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.form}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Input
          name="username"
          id="username"
          value={formData.username}
          onChange={handleChange}
          label="Username"
          placeholder="admin_user"
          error={errors.username}
          required
        />
        
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
        
        <Input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          label="Confirm Password"
          placeholder="••••••••"
          error={errors.confirmPassword}
          required
        />
        
        <Input
          name="secretCode"
          id="secretCode"
          value={formData.secretCode}
          onChange={handleChange}
          label="App Secret Code"
          placeholder="Enter the app secret code"
          error={errors.secretCode}
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-6"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
        <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default Register;