'use client';

import React, { useEffect, useState, Fragment } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import EmptyState from '@/components/EmptyState';
import toast from 'react-hot-toast';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, PencilIcon, TrashIcon, UserIcon, UsersIcon, ShieldCheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

interface UserStats {
  roleStats: Array<{ role: string; count: number; percentage: number }>;
  statusStats: Array<{ status: string; count: number; percentage: number }>;
  totalStats: {
    total_users: number;
    total_customers: number;
    total_staff: number;
    total_managers: number;
    total_admins: number;
    active_users: number;
    inactive_users: number;
    new_last_30_days: number;
  };
  monthlyStats: Array<{ month: string; new_users: number }>;
}

export default function Users() {
  const { } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedRoleOption, setSelectedRoleOption] = useState({ value: '', label: 'All Users' });
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedStatusOption, setSelectedStatusOption] = useState({ value: '', label: 'All Status' });

  const roleOptions = [
    { value: '', label: 'All Users' },
    { value: 'customer', label: 'Customers' },
    { value: 'staff', label: 'Staff' },
    { value: 'manager', label: 'Managers' },
    { value: 'admin', label: 'Admins' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active Users' },
    { value: 'inactive', label: 'Inactive Users' }
  ];
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://freshcounty.com/api';

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadUsers();
    fetchUserStats();
  }, [currentPage, roleFilter, statusFilter, debouncedSearchQuery]);

  const handleRoleChange = (role: typeof roleOptions[0]) => {
    setSelectedRoleOption(role);
    setRoleFilter(role.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: typeof statusOptions[0]) => {
    setSelectedStatusOption(status);
    setStatusFilter(status.value);
    setCurrentPage(1);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      let url = `${API_BASE_URL}/admin/users?page=${currentPage}&limit=20`;
      if (roleFilter) url += `&role=${roleFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (debouncedSearchQuery) url += `&search=${encodeURIComponent(debouncedSearchQuery)}`;
      // Add cache-busting parameter to ensure fresh data
      url += `&t=${Date.now()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Raw API response:', data);
        console.log('Users loaded:', data.data.users?.slice(0, 2)); // Log first 2 users for debugging
        
        // Debug each user's ID specifically
        if (data.data.users && data.data.users.length > 0) {
          data.data.users.slice(0, 3).forEach((user: any, index: number) => {
            console.log(`User ${index} ID debug:`, {
              id: user.id,
              idType: typeof user.id,
              idLength: user.id ? user.id.length : 'N/A',
              email: user.email,
              fullUser: user
            });
          });
        }
        
        setUsers(data.data.users || []);
        setPagination(data.data.pagination);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      const response = await fetch(`${API_BASE_URL}/admin/users/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStats(data.data);
      } else {
        console.error('Failed to load user stats');
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setRoleFilter('');
    setSelectedRoleOption({ value: '', label: 'All Users' });
    setStatusFilter('');
    setSelectedStatusOption({ value: '', label: 'All Status' });
    setCurrentPage(1);
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    // Debug logging
    console.log('toggleUserStatus called with:', { userId, type: typeof userId, isActive });
    
    // Add confirmation dialog
    const action = isActive ? 'activate' : 'deactivate';
    const confirmMessage = `Are you sure you want to ${action} this user? ${!isActive ? 'Deactivated users will not be able to log in.' : 'The user will regain access to their account.'}`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    // Validate userId
    if (!userId || userId === '' || typeof userId !== 'string') {
      console.error('Invalid userId:', userId);
      toast.error('Invalid user ID. Please refresh the page and try again.');
      return;
    }

    try {
      setUpdatingUserId(userId);
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      console.log('Making API call to:', `${API_BASE_URL}/admin/users/${userId}/status`);
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ is_active: isActive })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
        loadUsers();
      } else {
        console.error('Server response:', data);
        const errorMessage = data.message || data.error || 'Failed to update user status';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const editUser = (user: User) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setShowUserModal(true);
  };

  const showAddUserModal = () => {
    setSelectedUser({
      id: '',
      first_name: '',
      last_name: '',
      email: '',
      role: 'customer',
      is_active: true,
      total_orders: 0,
      total_spent: 0,
      created_at: '',
      updated_at: ''
    });
    setIsEditMode(false);
    setShowUserModal(true);
  };

  const saveUser = async (userData: Partial<User> & { password?: string }) => {
    try {
      console.log('Saving user with data:', { ...userData, password: userData.password ? '[HIDDEN]' : undefined });
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      const url = isEditMode 
        ? `${API_BASE_URL}/admin/users/${selectedUser?.id}`
        : `${API_BASE_URL}/admin/users`;
      
      const method = isEditMode ? 'PUT' : 'POST';
      console.log('Request URL:', url);
      console.log('Request method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`User ${isEditMode ? 'updated' : 'created'} successfully`);
        setShowUserModal(false);
        loadUsers();
      } else {
        console.error('Server response:', data);
        const errorMessage = data.message || data.error || `Failed to ${isEditMode ? 'update' : 'create'} user`;
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} user`);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone and will remove all user data including order history.')) return;

    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('User deleted successfully');
        loadUsers();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-purple-100 text-purple-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const totalPages = pagination.total_pages;
    const currentPage = pagination.current_page;
    
    // Calculate page range to show
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        // Show all pages if total is less than max visible
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Always show first page
        pages.push(1);
        
        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);
        
        // Adjust range if we're near the beginning or end
        if (currentPage <= 3) {
          start = 2;
          end = Math.min(4, totalPages - 1);
        } else if (currentPage >= totalPages - 2) {
          start = Math.max(totalPages - 3, 2);
          end = totalPages - 1;
        }
        
        // Add ellipsis if needed
        if (start > 2) {
          pages.push('...');
        }
        
        // Add middle pages
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        
        // Add ellipsis if needed
        if (end < totalPages - 1) {
          pages.push('...');
        }
        
        // Always show last page
        if (totalPages > 1) {
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          {/* Mobile pagination */}
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{((currentPage - 1) * pagination.items_per_page) + 1}</span>
              {' '}to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pagination.items_per_page, pagination.total_items)}
              </span>
              {' '}of{' '}
              <span className="font-medium">{pagination.total_items}</span>
              {' '}results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              {/* Previous button */}
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:z-10 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              
              {/* Page numbers */}
              {getPageNumbers().map((pageNum, index) => (
                pageNum === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum as number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 ${
                      pageNum === currentPage
                        ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              ))}
              
              {/* Next button */}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:z-10 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={showAddUserModal}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {/* User Stats Cards */}
      {stats && (
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Customers */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalStats.total_customers.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Total Staff */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShieldCheckIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Staff Members</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalStats.total_staff.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalStats.active_users.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* New Users (30 days) */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserIcon className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">New Users (30 days)</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalStats.new_last_30_days.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users... (auto-search as you type)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <Listbox value={selectedRoleOption} onChange={handleRoleChange}>
              <div className="relative">
                <Listbox.Button className="relative w-48 cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm">
                  <span className="block truncate">{selectedRoleOption.label}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>

                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {roleOptions.map((role, roleIdx) => (
                      <Listbox.Option
                        key={roleIdx}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-orange-100 text-orange-900' : 'text-gray-900'
                          }`
                        }
                        value={role}
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              {role.label}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-600">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
          <div>
            <Listbox value={selectedStatusOption} onChange={handleStatusChange}>
              <div className="relative">
                <Listbox.Button className="relative w-48 cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm">
                  <span className="block truncate">{selectedStatusOption.label}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>

                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {statusOptions.map((status, statusIdx) => (
                      <Listbox.Option
                        key={statusIdx}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-orange-100 text-orange-900' : 'text-gray-900'
                          }`
                        }
                        value={status}
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              {status.label}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-600">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!users || users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-0">
                        <div className="flex justify-center items-center py-16">
                          <EmptyState
                            icon={
                              <svg
                                className="h-24 w-24 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                            }
                            title="No users found"
                            description="No customers have registered yet. Users will appear here when customers create accounts on your website."
                            action={{
                              label: "Add User",
                              onClick: showAddUserModal
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                    <tr key={user.id} className={`hover:bg-gray-50 ${!user.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${user.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                          {user.first_name} {user.last_name}
                          {!user.is_active && <span className="ml-2 text-xs text-red-600">(Inactive)</span>}
                          {(!user.id || user.id === '') && <span className="ml-2 text-xs text-red-600 bg-red-100 px-1 rounded">(Missing ID)</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${user.is_active ? 'text-gray-900' : 'text-gray-500'}`}>{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {capitalizeFirst(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.total_orders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(user.total_spent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => editUser(user)}
                          disabled={!user.id || user.id === ''}
                          className="text-orange-600 hover:text-orange-900 mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id, !user.is_active)}
                          disabled={updatingUserId === user.id || !user.id || user.id === ''}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border disabled:opacity-50 disabled:cursor-not-allowed ${
                            user.is_active 
                              ? 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100' 
                              : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                          }`}
                        >
                          {updatingUserId === user.id ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Updating...
                            </>
                          ) : (
                            user.is_active ? 'Deactivate' : 'Activate'
                          )}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={!user.id || user.id === ''}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>

            {renderPagination()}
          </>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {isEditMode ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const userData: Partial<User> = {
                  first_name: formData.get('first_name') as string,
                  last_name: formData.get('last_name') as string,
                  email: formData.get('email') as string,
                  role: formData.get('role') as string,
                  is_active: formData.get('is_active') === 'on'
                };

                // Only include password for new users or if provided for existing users
                const password = formData.get('password') as string;
                const userDataWithPassword = !isEditMode || password 
                  ? { ...userData, password } 
                  : userData;

                saveUser(userDataWithPassword);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    defaultValue={selectedUser.first_name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    defaultValue={selectedUser.last_name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={selectedUser.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {!isEditMode && '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  required={!isEditMode}
                  placeholder={isEditMode ? 'Leave blank to keep current password' : ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  name="role"
                  required
                  defaultValue={selectedUser.role}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff (Order Management Only)</option>
                  <option value="manager">Manager (Business Operations)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  <strong>Customer:</strong> No admin access &bull; 
                  <strong> Staff:</strong> Orders only &bull; 
                  <strong> Manager:</strong> Products & orders &bull; 
                  <strong> Admin:</strong> Full system access
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={selectedUser.is_active}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Active User</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  {isEditMode ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AuthenticatedLayout>
  );
}