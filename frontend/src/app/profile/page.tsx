"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MainLayout } from '@/components/layout/main-layout'
import { apiService } from '@/lib/api'
import { Eye, EyeOff, Package, Calendar } from 'lucide-react'
import OrderDetailsModal from '@/components/profile/OrderDetailsModal'
import { Order, OrdersResponse, OrderDetailsResponse } from '@/lib/types'

const ProfilePage = () => {
  const { user, refreshUser, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'personal' | 'orders' | 'password'>('personal')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  
  // Personal details form state
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  })

  // Password change form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Password visibility state
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      const [firstName = '', lastName = ''] = (user.full_name || '').split(' ', 2)
      // Remove +234 country code if present for display
      let phoneNumber = user.mobile || ''
      if (phoneNumber.startsWith('+234')) {
        phoneNumber = phoneNumber.slice(4)
      } else if (phoneNumber.startsWith('234')) {
        phoneNumber = phoneNumber.slice(3)
      }
      
      const newFormData = {
        firstName,
        lastName,
        phone: phoneNumber,
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        zipCode: user.zipCode || ''
      }
      
      setPersonalData(newFormData)
    }
  }, [user])

  // Check if user has incomplete address information
  const hasIncompleteAddress = user && (
    !user.address || 
    !user.city || 
    !user.state || 
    !user.country
  )

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const updateData = {
        full_name: `${personalData.firstName} ${personalData.lastName}`.trim(),
        mobile: personalData.phone ? `+234${personalData.phone}` : '',
        address: personalData.address,
        city: personalData.city,
        state: personalData.state,
        country: personalData.country,
        postal_code: personalData.zipCode
      }
      
      const response = await apiService.updateProfile(updateData)
      
      if (response.success) {
        await refreshUser()
        setMessage('Profile updated successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(response.message || 'Failed to update profile')
      }
    } catch {
      setMessage('An error occurred while updating your profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await apiService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      if (response.success) {
        setMessage('Password changed successfully!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(response.message || 'Failed to change password')
      }
    } catch {
      setMessage('An error occurred while changing your password')
    } finally {
      setIsLoading(false)
    }
  }

  const loadOrders = async (page: number = 1) => {
    setOrdersLoading(true)
    try {
      const response = await apiService.getUserOrders(page, 10)
      
      if (response.success && response.data) {
        // Handle new response structure with pagination
        if (Array.isArray(response.data)) {
          // Old format (array)
          const orders = response.data as Order[]
          setOrders(orders)
          setTotalPages(1)
          setTotalOrders(orders.length)
          setCurrentPage(1)
        } else {
          // New format with pagination
          const responseData = response.data as OrdersResponse
          if (responseData.orders && responseData.pagination) {
            setOrders(responseData.orders)
            setTotalPages(responseData.pagination.total_pages)
            setTotalOrders(responseData.pagination.total_orders)
            setCurrentPage(responseData.pagination.current_page)
          } else {
            // Fallback for old format (array)
            const orders: Order[] = []
            setOrders(orders)
            setTotalPages(1)
            setTotalOrders(orders.length)
            setCurrentPage(page)
          }
        }
      } else {
        console.error('API Response failed:', response.message || 'Unknown error')
        setMessage(`Failed to load orders: ${response.message || 'Please try again.'}`)
      }
    } catch {
      console.error('Exception loading orders')
      setMessage('Error loading orders: Please try again.')
    } finally {
      setOrdersLoading(false)
    }
  }

  const loadOrderDetails = async (orderId: string) => {
    try {
      const response = await apiService.getOrderDetails(orderId)
      
      if (response.success && response.data) {
        // Backend returns order data wrapped in { order: {...} }
        const responseData = response.data as OrderDetailsResponse
        const orderData = responseData.order || (response.data as Order)
        setSelectedOrder(orderData)
        setIsModalOpen(true)
        setMessage('') // Clear any previous messages
      } else {
        setMessage(`Failed to load order details: ${response.message || 'Unknown error'}`)
      }
    } catch {
      setMessage('Error loading order details')
    }
  }

  const handleTabChange = (tab: 'personal' | 'orders' | 'password') => {
    setActiveTab(tab)
    setMessage('')
    
    if (tab === 'orders' && orders.length === 0) {
      loadOrders(1)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }


  // Show loading spinner while authentication is being verified
  if (authLoading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FE4501] mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading profile...</p>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="mt-2 text-gray-600">Manage your account settings and view your orders</p>
            </div>

            {/* Address Notice */}
            {hasIncompleteAddress && (
              <div className="mb-6 p-4 rounded-md bg-orange-50 border border-orange-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-orange-800">
                      Complete Your Profile
                    </h3>
                    <div className="mt-2 text-sm text-orange-700">
                      <p>
                        Please add your address information to ensure smooth order delivery. 
                        Complete your address details in the Personal Details section below.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-md ${message.includes('success') ? 'bg-orange-50 text-orange-800' : 'bg-red-50 text-red-800'}`}>
                {message}
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={() => handleTabChange('personal')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'personal'
                        ? 'border-[#FE4501] text-[#FE4501]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Personal Details
                  </button>
                  <button
                    onClick={() => handleTabChange('orders')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'orders'
                        ? 'border-[#FE4501] text-[#FE4501]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Order History
                  </button>
                  <button
                    onClick={() => handleTabChange('password')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'password'
                        ? 'border-[#FE4501] text-[#FE4501]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Change Password
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Personal Details Tab */}
                {activeTab === 'personal' && (
                  <form onSubmit={handlePersonalSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <Input
                          id="firstName"
                          type="text"
                          value={personalData.firstName}
                          onChange={(e) => setPersonalData({ ...personalData, firstName: e.target.value })}
                          required
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <Input
                          id="lastName"
                          type="text"
                          value={personalData.lastName}
                          onChange={(e) => setPersonalData({ ...personalData, lastName: e.target.value })}
                          required
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full bg-gray-100"
                        />
                        <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                            +234
                          </span>
                          <Input
                            id="phone"
                            type="tel"
                            value={personalData.phone}
                            onChange={(e) => {
                              // Only allow digits and limit to 10 characters
                              const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                              setPersonalData({ ...personalData, phone: value })
                            }}
                            className="flex-1 rounded-l-none"
                          />
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Enter 10 digits without the country code</p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <Input
                        id="address"
                        type="text"
                        value={personalData.address}
                        onChange={(e) => setPersonalData({ ...personalData, address: e.target.value })}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <Input
                          id="city"
                          type="text"
                          value={personalData.city}
                          onChange={(e) => setPersonalData({ ...personalData, city: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <Input
                          id="state"
                          type="text"
                          value={personalData.state}
                          onChange={(e) => setPersonalData({ ...personalData, state: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                          Postal Code
                        </label>
                        <Input
                          id="zipCode"
                          type="text"
                          value={personalData.zipCode}
                          onChange={(e) => setPersonalData({ ...personalData, zipCode: e.target.value })}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <Input
                        id="country"
                        type="text"
                        value={personalData.country}
                        onChange={(e) => setPersonalData({ ...personalData, country: e.target.value })}
                        className="w-full"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-[#FE4501] hover:bg-[#FE4501]/90 text-white px-6 py-2"
                      >
                        {isLoading ? 'Updating...' : 'Update Profile'}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Your Orders</h3>
                      {totalOrders > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          {totalOrders} order{totalOrders !== 1 ? 's' : ''} total
                        </p>
                      )}
                    </div>

                    {ordersLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FE4501] mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h4>
                        <p className="text-gray-600">When you place your first order, it will appear here.</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {orders.map((order) => (
                            <div 
                              key={order.id} 
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                              onClick={() => loadOrderDetails(order.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-10 h-10 bg-[#FE4501]/10 rounded-lg">
                                    <Package className="w-5 h-5 text-[#FE4501]" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      Order #{order.order_number || order.id.slice(-8).toUpperCase()}
                                    </h4>
                                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                                      <Calendar className="w-4 h-4" />
                                      <span>{formatDate(order.created_at)}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-base font-medium text-gray-900">
                                      ₦{parseFloat(String(order.total_amount || 0)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                  <div className="text-[#FE4501] text-sm font-medium">
                                    View Details →
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalOrders)} of {totalOrders} orders</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => loadOrders(currentPage - 1)}
                                disabled={currentPage === 1 || ordersLoading}
                                variant="outline"
                                size="sm"
                                className="border-[#FE4501] text-[#FE4501] hover:bg-[#FE4501] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                ←
                              </Button>
                              
                              {/* Page numbers */}
                              <div className="flex items-center gap-1">
                                {(() => {
                                  const pages = [];
                                  const maxPages = 5; // Show max 5 page numbers
                                  let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
                                  const endPage = Math.min(totalPages, startPage + maxPages - 1);
                                  
                                  if (endPage - startPage + 1 < maxPages) {
                                    startPage = Math.max(1, endPage - maxPages + 1);
                                  }
                                  
                                  if (startPage > 1) {
                                    pages.push(
                                      <Button
                                        key={1}
                                        onClick={() => loadOrders(1)}
                                        disabled={ordersLoading}
                                        variant="outline"
                                        size="sm"
                                        className="w-8 h-8 p-0 text-xs border-gray-300 hover:bg-gray-100"
                                      >
                                        1
                                      </Button>
                                    );
                                    if (startPage > 2) {
                                      pages.push(<span key="ellipsis1" className="text-gray-500 text-sm">...</span>);
                                    }
                                  }
                                  
                                  for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                      <Button
                                        key={i}
                                        onClick={() => loadOrders(i)}
                                        disabled={ordersLoading}
                                        variant={currentPage === i ? "default" : "outline"}
                                        size="sm"
                                        className={`w-8 h-8 p-0 text-xs ${
                                          currentPage === i 
                                            ? "bg-[#FE4501] text-white border-[#FE4501] hover:bg-[#FE4501]/90" 
                                            : "border-gray-300 hover:bg-gray-100"
                                        }`}
                                      >
                                        {i}
                                      </Button>
                                    );
                                  }
                                  
                                  if (endPage < totalPages) {
                                    if (endPage < totalPages - 1) {
                                      pages.push(<span key="ellipsis2" className="text-gray-500 text-sm">...</span>);
                                    }
                                    pages.push(
                                      <Button
                                        key={totalPages}
                                        onClick={() => loadOrders(totalPages)}
                                        disabled={ordersLoading}
                                        variant="outline"
                                        size="sm"
                                        className="w-8 h-8 p-0 text-xs border-gray-300 hover:bg-gray-100"
                                      >
                                        {totalPages}
                                      </Button>
                                    );
                                  }
                                  
                                  return pages;
                                })()}
                              </div>
                              
                              <Button
                                onClick={() => loadOrders(currentPage + 1)}
                                disabled={currentPage === totalPages || ordersLoading}
                                variant="outline"
                                size="sm"
                                className="border-[#FE4501] text-[#FE4501] hover:bg-[#FE4501] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                →
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password *
                      </label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          required
                          className="w-full pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password *
                      </label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          required
                          className="w-full pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Must be at least 8 characters with uppercase, lowercase, and number
                      </p>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          required
                          className="w-full pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-[#FE4501] hover:bg-[#FE4501]/90 text-white px-6 py-2"
                      >
                        {isLoading ? 'Changing...' : 'Change Password'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Modal */}
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedOrder(null)
          }}
        />
      </MainLayout>
    </ProtectedRoute>
  )
}

export default ProfilePage