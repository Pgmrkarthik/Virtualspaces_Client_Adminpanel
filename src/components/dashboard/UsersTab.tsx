// src/components/dashboard/UsersTab.tsx
import React, { useState, useEffect } from 'react';
import { getAllUsers, getIntractionsByUserId, getUserAnalytics } from '../../services/user';
import type { UserData, UserAnalytics, Interaction } from '../../types/user';
import { formatInteractionDescription, getInteractionDetails } from '../../utils/Interactions';
import Card from '../ui/Card';
import Button from '../ui/button';
import Dialog from '../ui/Dialog';
import { getTimeAgo } from '../../utils/timeAgo';

// import EmailAnalytics from './EmailAnalytics';

// Define filter types
type InteractionFilterType = 'all' | 'pdf' | 'video' | 'image' | 'login' | 'entry' | 'exit';

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [filteredInteractions, setFilteredInteractions] = useState<Interaction[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<InteractionFilterType>('all');
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

  // Apply filters to interactions whenever interactions or selectedFilter change
  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredInteractions(interactions);
      return;
    }

    // Apply the filter
    const filtered = interactions.filter(interaction => {
      const actionType = interaction.actionType?.toLowerCase() || '';
      
      switch (selectedFilter) {
        case 'pdf':
          return actionType.includes('pdf');
        case 'video':
          return actionType.includes('video');
        case 'image':
          return actionType.includes('image');
        case 'login':
          return actionType.includes('login');
        case 'entry':
          return actionType.includes('entry');
        case 'exit':
          return actionType.includes('exit');
        default:
          return true;
      }
    });
    
    setFilteredInteractions(filtered);
  }, [interactions, selectedFilter]);

  const handleUserSelect = async (user: UserData) => {
    if (selectedUser?.id === user.id) {
      setSelectedUser(null);
      setInteractions([]);
      setFilteredInteractions([]);
      return;
    }

    setSelectedUser(user);
    setAnalyticsLoading(true);
    setSelectedFilter('all'); // Reset filter when selecting a new user

    try {
      const fetchedInteractions = await getIntractionsByUserId(user.id);
      setInteractions(fetchedInteractions);
      setFilteredInteractions(fetchedInteractions); // Initialize filtered interactions with all interactions
      setAnalyticsLoading(false);
      console.log('User interactions:', fetchedInteractions);
    } catch (err) {
      console.error('Error fetching user interactions:', err);
      setError('Failed to load user interactions');
      setAnalyticsLoading(false);
    }
  };

  // Helper function to count interaction types
  const countInteractionsByType = (type: InteractionFilterType) => {
    if (type === 'all') return interactions.length;
    
    return interactions.filter(interaction => {
      const actionType = interaction.actionType?.toLowerCase() || '';
      
      switch (type) {
        case 'pdf':
          return actionType.includes('pdf');
        case 'video':
          return actionType.includes('video');
        case 'image':
          return actionType.includes('image');
        case 'login':
          return actionType.includes('login');
        case 'entry':
          return actionType.includes('entry');
        case 'exit':
          return actionType.includes('exit');
        default:
          return false;
      }
    }).length;
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

  // Function to handle filter change
  const handleFilterChange = (filter: InteractionFilterType) => {
    setSelectedFilter(filter);
  };

  // Helper function to get formatted interaction name
  const getFormattedInteractionName = (interaction: Interaction) => {
    const actionType = interaction.actionType || '';
    
    if (actionType.toLowerCase().includes('pdf')) {
      // Extract number if available, otherwise generate from the id
      const match = actionType.match(/PDF_(\d+)/i);
      if (match && match[1]) {
        return `PDF_${match[1]}`;
      }
      // Use the last 1-2 characters of the ID to create a number
      const idNumber = interaction.id.slice(-2).replace(/\D/g, '') || '1';
      return `PDF_${idNumber}`;
    }
    
    if (actionType.toLowerCase().includes('video')) {
      const match = actionType.match(/video(\d+)/i);
      if (match && match[1]) {
        return `Video ${match[1]}`;
      }
      const idNumber = interaction.id.slice(-2).replace(/\D/g, '') || '1';
      return `Video ${idNumber}`;
    }
    
    return formatInteractionDescription(interaction);
  };

  // Render user details component
  const renderUserDetails = (user: UserData) => {
    return (
      <tr>
        <td colSpan={6} className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">User Since</div>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Visits</div>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {user.visitCount}
                </div>
              </div>
            </div>

            {/* Interaction Filter Tabs */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Recent Activities
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({filteredInteractions.length} of {interactions.length} activities)
                </span>
              </h3>
              
              <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pdf', label: 'PDF' },
                  { id: 'video', label: 'Video' },
                  { id: 'image', label: 'Image' },
                  { id: 'login', label: 'Login' },
                  { id: 'entry', label: 'Entry' },
                  { id: 'exit', label: 'Exit' },
                ].map((filter) => {
                  const count = countInteractionsByType(filter.id as InteractionFilterType);
                  return (
                    <button
                      key={filter.id}
                      onClick={() => handleFilterChange(filter.id as InteractionFilterType)}
                      className={`px-4 py-2 border-b-2 ${
                        selectedFilter === filter.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-medium'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      } flex items-center`}
                    >
                      {filter.label}
                      {count > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-orange-500 dark:bg-orange-400 rounded-full text-white">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User Interactions Table */}
            {analyticsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-white dark:bg-gray-900">
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
                    {filteredInteractions.length > 0 ? (
                      filteredInteractions.map((interaction) => (
                        <tr key={interaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                            {getFormattedInteractionName(interaction)}
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
                          {interactions.length > 0 
                            ? `No ${selectedFilter} interactions found for this user.` 
                            : 'No interactions found for this user.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

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
            </div>
          </div>
        </td>
      </tr>
    );
  };

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
                  Last Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    <tr
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
                          {user.recentExitTime ? getTimeAgo(user.recentExitTime) : 'N/A'}
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
                          {selectedUser?.id === user.id ? "Hide Details" : "View Details"} 
                        </Button>
                        <Button
                          onClick={(e) => handleEnrichClick(e, user)}
                          className="text-sm bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          Enrich User
                        </Button>
                      </td>
                    </tr>
                    {selectedUser?.id === user.id && renderUserDetails(user)}
                  </React.Fragment>
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