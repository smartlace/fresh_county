'use client';

import React, { useEffect, useState, Fragment, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import EmptyState from '@/components/EmptyState';
import toast from 'react-hot-toast';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, Cog6ToothIcon, TruckIcon, CheckCircleIcon, XCircleIcon, CreditCardIcon, UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CalendarIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

interface Order {
  id: string;
  order_number: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  user_email?: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  shipping_address: {
    address_line_1: string;
    city: string;
    state: string;
    country: string;
    phone: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    line_total: number;
    variation_id?: string;
    variation_name?: string;
    product: {
      id: string;
      name: string;
      slug: string;
      image: string;
      sku: string;
    };
  }>;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  coupon_code?: string;
  delivery_type?: string;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

interface OrderStats {
  statusStats: Array<{ status: string; count: number; percentage: number }>;
  totalStats: {
    total_orders: number;
    pending_orders: number;
    processing_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    new_last_30_days: number;
    total_revenue: number;
  };
  monthlyStats: Array<{ month: string; new_orders: number; monthly_revenue: number }>;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

const updateStatusOptions = [
  { value: '', label: 'Update Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]); // Default to "All Statuses"
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmingPayment, setConfirmingPayment] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://freshcounty.com/api';

  // Helper function to get image URL - uses proxy to avoid CSP issues
  const getImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl) return '';
    
    let fullImageUrl = '';
    
    // If it's already a full URL, use it as is
    if (imageUrl.startsWith('http')) {
      fullImageUrl = imageUrl;
    }
    // If it's a relative path, build the full URL
    else if (imageUrl.startsWith('/uploads/')) {
      fullImageUrl = `${API_BASE_URL}${imageUrl}`;
    }
    // If it's just a filename, assume it's in the products folder
    else {
      fullImageUrl = `${API_BASE_URL}/uploads/products/${imageUrl}`;
    }
    
    // Use the image proxy to avoid CSP issues
    return `/api/proxy-image?url=${encodeURIComponent(fullImageUrl)}`;
  };

  const handleStatusChange = (status: typeof statusOptions[0]) => {
    setSelectedStatus(status);
    setStatusFilter(status.value);
    setCurrentPage(1);
  };

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      let url = `${API_BASE_URL}/admin/orders?page=${currentPage}&limit=20`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;


      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrders(data.data.orders || []);
        setPagination(data.data.pagination);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery, API_BASE_URL]);

  const fetchOrderStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      const response = await fetch(`${API_BASE_URL}/admin/orders/stats`, {
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
        console.error('Failed to load order stats');
      }
    } catch (error) {
      console.error('Failed to load order stats:', error);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    loadOrders();
    fetchOrderStats();
  }, [loadOrders, fetchOrderStats]);

  const searchOrders = () => {
    setCurrentPage(1);
    loadOrders();
  };

  const viewOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedOrder(data.data.order);
        setShowOrderModal(true);
      } else {
        toast.error('Failed to load order details');
      }
    } catch (error) {
      console.error('Failed to load order:', error);
      toast.error('Failed to load order details');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Order status updated successfully');
        loadOrders();
        fetchOrderStats(); // Refresh stats after status update
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const confirmPayment = async (orderId: string) => {
    try {
      setConfirmingPayment(orderId);
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/confirm-payment`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notes: 'Payment confirmed by admin' })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Payment confirmed successfully! Confirmation email sent to customer.');
        loadOrders();
        fetchOrderStats(); // Refresh stats after payment confirmation
      } else {
        toast.error(data.message || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      toast.error('Failed to confirm payment');
    } finally {
      setConfirmingPayment(null);
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
      case 'shipped':
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
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
      </div>

      {/* Order Stats Cards */}
      {stats && (
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Pending Orders */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalStats.pending_orders.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Processing Orders */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Cog6ToothIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Processing Orders</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalStats.processing_orders.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Delivered Orders */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Delivered Orders</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalStats.delivered_orders.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Cancelled Orders */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Cancelled Orders</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalStats.cancelled_orders.toLocaleString()}</dd>
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
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchOrders()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <Listbox value={selectedStatus} onChange={handleStatusChange}>
              <div className="relative">
                <Listbox.Button className="relative w-48 cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm">
                  <span className="block truncate">{selectedStatus.label}</span>
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
            onClick={searchOrders}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Search
          </button>
        </div>
      </div>

      {/* Orders Table */}
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
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!orders || orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <EmptyState
                          icon={
                            <svg
                              className="h-24 w-24"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                              />
                            </svg>
                          }
                          title="No orders found"
                          description="No orders have been placed yet. Orders will appear here once customers start making purchases."
                        />
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => viewOrder(order.id)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {order.order_number}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.first_name ? `${order.first_name} ${order.last_name}` : 'Guest'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.email || order.user_email || 'No email'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {capitalizeFirst(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                          {capitalizeFirst(order.payment_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{formatDate(order.created_at)}</div>
                          <div className="text-xs text-gray-500">{formatTime(order.created_at)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Listbox
                            value={updateStatusOptions[0]}
                            onChange={(status) => {
                              if (status.value && status.value !== order.status) {
                                updateOrderStatus(order.id, status.value);
                              }
                            }}
                          >
                            <div className="relative">
                              <Listbox.Button className="relative w-32 cursor-pointer rounded-md border border-gray-300 bg-white py-1 pl-2 pr-8 text-left text-xs shadow-sm hover:border-orange-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
                                <span className="block truncate text-green-600">Update Status</span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
                                  <ChevronUpDownIcon
                                    className="h-3 w-3 text-gray-400"
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
                                <Listbox.Options className="absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                  {updateStatusOptions.slice(1).map((status, statusIdx) => (
                                    <Listbox.Option
                                      key={statusIdx}
                                      className={({ active }) =>
                                        `relative cursor-pointer select-none py-1 pl-2 pr-4 ${
                                          active ? 'bg-orange-100 text-orange-900' : 'text-gray-900'
                                        } ${status.value === order.status ? 'bg-gray-50 text-gray-400' : ''}`
                                      }
                                      value={status}
                                      disabled={status.value === order.status}
                                    >
                                      <span className="block truncate font-normal">
                                        {status.label}
                                      </span>
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>
                          
                          {order.payment_status === 'pending' && (
                            <button
                              onClick={() => confirmPayment(order.id)}
                              disabled={confirmingPayment === order.id}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Confirm Payment"
                            >
                              {confirmingPayment === order.id ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                              ) : (
                                <CreditCardIcon className="w-3 h-3 mr-1" />
                              )}
                              {confirmingPayment === order.id ? 'Confirming...' : 'Confirm Payment'}
                            </button>
                          )}
                        </div>
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

      {/* Modern Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <ShoppingBagIcon className="h-6 w-6" />
                  <div>
                    <h3 className="text-xl font-bold">Order Details</h3>
                    <p className="text-gray-100 text-sm">#{selectedOrder.order_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-100 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-6 space-y-6">
                {/* Status and Date Header */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${selectedOrder.status === 'delivered' ? 'bg-green-400' : selectedOrder.status === 'processing' ? 'bg-blue-400' : selectedOrder.status === 'cancelled' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order Status</p>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {capitalizeFirst(selectedOrder.status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${selectedOrder.payment_status === 'paid' ? 'bg-green-400' : selectedOrder.payment_status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Status</p>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.payment_status)}`}>
                          {capitalizeFirst(selectedOrder.payment_status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Order Date & Time</p>
                        <p className="font-medium text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                        <p className="text-sm text-gray-500">{formatTime(selectedOrder.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer & Shipping Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center space-x-2 mb-4">
                      <UserIcon className="h-5 w-5 text-orange-500" />
                      <h4 className="text-lg font-semibold text-gray-900">Customer Information</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 font-medium">
                          {selectedOrder.first_name ? `${selectedOrder.first_name} ${selectedOrder.last_name}` : 'Guest Customer'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{selectedOrder.user_email || 'No email provided'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{selectedOrder.shipping_address.phone || 'No phone provided'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center space-x-2 mb-4">
                      <MapPinIcon className="h-5 w-5 text-orange-500" />
                      <h4 className="text-lg font-semibold text-gray-900">Shipping Address</h4>
                    </div>
                    <div className="text-gray-600 space-y-1">
                      <p className="font-medium text-gray-900">{selectedOrder.shipping_address.address_line_1}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</p>
                      <p>{selectedOrder.shipping_address.country}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <ShoppingBagIcon className="h-5 w-5 text-orange-500" />
                      <h4 className="text-lg font-semibold text-gray-900">Order Items</h4>
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        {selectedOrder.items.length} item{selectedOrder.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variation</th>
                          <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-5 py-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  {item.product.image ? (
                                    <img
                                      className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                      src={getImageUrl(item.product.image)}
                                      alt={item.product.name}
                                    />
                                  ) : (
                                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                      <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-sm">{item.product.name}</div>
                                  <div className="text-xs text-gray-500">SKU: {item.product.sku}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-sm text-gray-600">
                                {item.variation_name || 'Regular'}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                                ×{item.quantity}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-gray-600 font-medium">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-5 py-4 font-semibold text-gray-900">
                              {formatCurrency(item.line_total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-5">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.tax_amount)}</span>
                    </div>
                    {selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount{selectedOrder.coupon_code ? ` (${selectedOrder.coupon_code})` : ''}</span>
                        <span className="font-medium">-{formatCurrency(selectedOrder.discount_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>{selectedOrder.delivery_type === 'pickup' ? 'Pickup' : 'Shipping'}</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.shipping_cost)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-orange-600">{formatCurrency(selectedOrder.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AuthenticatedLayout>
  );
}