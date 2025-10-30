import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    department: '',
    avatarUrl: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        department: user.department,
        avatarUrl: user.avatarUrl,
      });
    }
  }, [user]);

  if (!user) {
    return <div>Loading user profile...</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setIsEditing(false);
  };
  
  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  return (
    <div className="bg-white dark:bg-dark-accent p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <div className="flex flex-col items-center">
        <img
          src={user.avatarUrl}
          alt="User Avatar"
          className="w-32 h-32 rounded-full border-4 border-primary shadow-lg mb-4"
        />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
        <p className="text-lg text-secondary font-medium">{user.role}</p>
      </div>

      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        {!isEditing ? (
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full name</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">{user.name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email address</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">{user.email}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">{user.role}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">{user.department}</dd>
            </div>
          </dl>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={inputClass} required />
            </div>
             <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} required />
            </div>
             <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleInputChange} className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Avatar URL</label>
              <input type="text" name="avatarUrl" value={formData.avatarUrl} onChange={handleInputChange} className={inputClass} required />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
       <div className="mt-8 text-center">
          {!isEditing && (
             <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                Edit Profile
            </button>
          )}
       </div>
    </div>
  );
};

export default Profile;