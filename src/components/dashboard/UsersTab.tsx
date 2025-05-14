// src/components/dashboard/UsersTab.tsx
import React, { useState, useEffect } from 'react';
import { getAllUsers, getIntractionsByUserId, getUserAnalytics } from '../../services/user';
import type { UserData, UserAnalytics, Interaction } from '../../types/user';
import { formatInteractionDescription, getInteractionDetails } from '../../utils/Interactions';
import Card from '../ui/Card';
import Button from '../ui/button';
import Dialog from '../ui/Dialog'

// import EmailAnalytics from './EmailAnalytics';

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [intractions, setInteractions] = useState<Interaction[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [showEnrichDialog, setShowEnrichDialog] = useState(false);
  const [enrichedUser, setEnrichedUser] = useState<UserData | null>(null);

  const handleEnrichClick = (e: React.MouseEvent<HTMLButtonElement>, user: UserData) => {
    e.stopPropagation();
    setEnrichedUser(user);
    setShowEnrichDialog(true);
  };

  const closeDialog = () => {
    setShowEnrichDialog(false);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    const fetchAnalytics = async () => {
      try {
        const data = await getUserAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        // Don't show error for analytics, just log it
      }
    };

    fetchUsers();
    fetchAnalytics();
  }, []);

  const handleUserSelect = async (user: UserData) => {

    if (selectedUser?.id === user.id) {
      setSelectedUser(null);
      setInteractions([]);
      return;
    }



    setSelectedUser(user);
    setAnalyticsLoading(true);

    try {
      // In a real implementation, you would fetch specific user interactions here
      // For now, we're just using the selected user data

      const interactions = await getIntractionsByUserId(user.id);
      setInteractions(interactions);
      setAnalyticsLoading(false);
      console.log('User interactions:', interactions);
    } catch (err) {
      console.error('Error fetching user interactions:', err);
      setError('Failed to load user interactions');
      setAnalyticsLoading(false);
    }
  };

  // Helper function to render the appropriate status badge
  const renderStatusBadge = (interaction: Interaction) => {
    const details = getInteractionDetails(interaction);

    if (!details.badgeType) {
      return details.text;
    }

    let badgeClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full ";

    switch (details.badgeType) {
      case 'success':
        badgeClasses += "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        break;
      case 'warning':
        badgeClasses += "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        break;
      case 'error':
        badgeClasses += "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        break;
      case 'info':
      default:
        badgeClasses += "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        break;
    }

    return (
      <span className={badgeClasses}>
        {details.text}
      </span>
    );
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Analytics Summary */}
      {/* {analytics && (
        <Card title="User Analytics Overview" className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-300">Total Users</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{analytics.totalUsers}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-300">Active Today</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-200">{analytics.activeToday}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-sm text-purple-600 dark:text-purple-300">New This Week</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">{analytics.newThisWeek}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
              <p className="text-sm text-amber-600 dark:text-amber-300">Avg. Visits</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-200">{analytics.averageVisits}</p>
            </div>
          </div>
        </Card>
      )} */}

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users by name, email, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card title={`Users (${filteredUsers.length})`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Visits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${selectedUser?.id === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{user.username}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">ID: {user.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {user.location || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {user.visitCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {user.phoneNumber}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        {user.phoneNumber ? user.phoneNumber : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserSelect(user);
                        }}
                        className="text-sm"
                      >
                       {selectedUser == user ? "Hide Details" : "View Details"} 
                      </Button>
                       <Button
                          onClick={(e) => handleEnrichClick(e, user)}
                          className="text-sm bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          Enrich User
                        </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No users found. Try a different search term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>


        {/* Enrich Dialog */}
      {showEnrichDialog && enrichedUser && (
        <Dialog
          isOpen={showEnrichDialog}
          onClose={closeDialog}
          title={`Email Analytics for ${enrichedUser.email}`}
          size="lg"
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Email Analytics</h2>
            {/* <EmailAnalytics email={enrichedUser.email} /> */}
            <p>Analytics data will be displayed here.</p>
          </div>
        </Dialog>
      )}




      {/* User Interactions */}
      {
        selectedUser && (
          <Card title={`${selectedUser.username}'s Interactions`} className="mt-6">
            {analyticsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">User Since</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Visits</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedUser.visitCount}
                    </div>
                  </div>
                </div>

                {/* User Interactions Table */}
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activities</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Activity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {intractions.length > 0 ? (
                        intractions.map((interaction) => (
                          <tr key={interaction.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                              {formatInteractionDescription(interaction)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                              {new Date(interaction.createdAt).toLocaleDateString()}
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                {new Date(interaction.createdAt).toLocaleTimeString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                              {renderStatusBadge(interaction)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            No interactions found for this user.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Export or Actions section */}
                <div className="mt-6 flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    className="text-sm"
                    onClick={() => {
                      // Logic for exporting user data
                      alert('Export functionality will be implemented here');
                    }}
                    disabled
                  >
                    Export User Data
                  </Button>
                  {/* <Button
                    variant="outline"
                    className="text-sm text-red-600 border-red-600 hover:bg-red-50 dark:text-red-500 dark:border-red-500 dark:hover:bg-red-950/20"
                    onClick={() => {
                      // Logic for resetting password
                      alert('Password reset functionality will be implemented here');
                    }}
                  >
                    Reset Password
                  </Button> */}
                </div>
              </div>
            )}
          </Card>

        )
      }





      {/* No users message */}
      {users.length === 0 && (
        <div className="mt-8 text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-300">No users available.</p>
        </div>
      )}
    </div>
  );
};

export default UsersTab;