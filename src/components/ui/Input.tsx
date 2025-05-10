import React from 'react';

interface InputProps {
  type?: string;
  name: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  name,
  id,
  value,
  onChange,
  label,
  placeholder,
  error,
  required = false,
  className = '',
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} 
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;