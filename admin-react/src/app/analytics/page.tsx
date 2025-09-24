'use client';

import React, { useEffect, useState, Fragment, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import EmptyState from '@/components/EmptyState';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement);

interface AnalyticsData {
  revenue_data: Array<{
    date?: string;
    year?: number;
    month?: number;
    week?: number;
    revenue: number;
  }>;
  product_performance: Array<{
    id: number;
    name: string;
    total_revenue: number;
    total_sold: number;
  }>;
  customer_insights: {
    unique_customers: number;
    avg_order_value: number;
    avg_orders_per_customer: number;
    repeat_customer_rate: number;
  };
  payment_methods: Array<{
    payment_method: string;
    total_amount: number;
    percentage: number;
    order_count: number;
  }>;
  geographical_data: Array<{
    state: string;
    total_orders: number;
    total_revenue: number;
  }>;
  time_period_comparison: {
    current_period: {
      revenue: number;
      orders: number;
      customers: number;
    };
    previous_period: {
      revenue: number;
      orders: number;
      customers: number;
    };
  };
}

export default function Analytics() {
  const { } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState('day');
  const [selectedGroupByOption, setSelectedGroupByOption] = useState({ value: 'day', label: 'Daily' });

  const groupByOptions = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' }
  ];

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://freshcounty.com/api';

  useEffect(() => {
    // Set default dates (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      let url = `${API_BASE_URL}/admin/analytics?group_by=${groupBy}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAnalytics(data.data);
      } else {
        toast.error('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, groupBy, API_BASE_URL]);

  useEffect(() => {
    if (startDate && endDate) {
      loadAnalytics();
    }
  }, [startDate, endDate, loadAnalytics]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Chart configurations
  const revenueChartData = analytics ? {
    labels: analytics.revenue_data.map(item => 
      item.date || `${item.year}-${item.month}` || `${item.year}-W${item.week}`
    ),
    datasets: [{
      label: 'Revenue',
      data: analytics.revenue_data.map(item => item.revenue),
      borderColor: '#FE4501',
      backgroundColor: 'rgba(254, 69, 1, 0.1)',
      tension: 0.4,
      fill: true
    }]
  } : { labels: [], datasets: [] };

  const productPerformanceData = analytics ? {
    labels: analytics.product_performance.slice(0, 10).map(item => item.name),
    datasets: [{
      label: 'Revenue',
      data: analytics.product_performance.slice(0, 10).map(item => item.total_revenue),
      backgroundColor: '#FE4501',
      borderColor: '#FE4501',
      borderWidth: 1
    }]
  } : { labels: [], datasets: [] };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: unknown) {
            return formatCurrency(Number(value));
          }
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: unknown) {
            return formatCurrency(Number(value));
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
      </div>

      {/* Date Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group By
            </label>
            <Listbox value={selectedGroupByOption} onChange={(option) => { setSelectedGroupByOption(option); setGroupBy(option.value); }}>
              <div className="relative">
                <Listbox.Button className="relative w-40 cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm">
                  <span className="block truncate">{selectedGroupByOption.label}</span>
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
                    {groupByOptions.map((option, optionIdx) => (
                      <Listbox.Option
                        key={optionIdx}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-orange-100 text-orange-900' : 'text-gray-900'
                          }`
                        }
                        value={option}
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              {option.label}
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
            onClick={loadAnalytics}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Update
          </button>
        </div>
      </div>

      {analytics ? (
        <>
          {/* Period Comparison */}
          {analytics.time_period_comparison && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analytics.time_period_comparison.current_period.revenue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      calculateGrowth(
                        analytics.time_period_comparison.current_period.revenue,
                        analytics.time_period_comparison.previous_period.revenue
                      ) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(calculateGrowth(
                        analytics.time_period_comparison.current_period.revenue,
                        analytics.time_period_comparison.previous_period.revenue
                      ))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Orders</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.time_period_comparison.current_period.orders.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      calculateGrowth(
                        analytics.time_period_comparison.current_period.orders,
                        analytics.time_period_comparison.previous_period.orders
                      ) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(calculateGrowth(
                        analytics.time_period_comparison.current_period.orders,
                        analytics.time_period_comparison.previous_period.orders
                      ))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Customers</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.time_period_comparison.current_period.customers.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      calculateGrowth(
                        analytics.time_period_comparison.current_period.customers,
                        analytics.time_period_comparison.previous_period.customers
                      ) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(calculateGrowth(
                        analytics.time_period_comparison.current_period.customers,
                        analytics.time_period_comparison.previous_period.customers
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <div style={{ height: '400px' }}>
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Customer Insights */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Unique Customers:</span>
                  <span className="font-medium">{analytics.customer_insights.unique_customers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Order Value:</span>
                  <span className="font-medium">{formatCurrency(analytics.customer_insights.avg_order_value)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Orders per Customer:</span>
                  <span className="font-medium">{analytics.customer_insights.avg_orders_per_customer.toFixed(2)}</span>
                </div>
                {analytics.customer_insights.repeat_customer_rate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Repeat Customer Rate:</span>
                    <span className="font-medium">{analytics.customer_insights.repeat_customer_rate.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <div className="space-y-4">
                {analytics.payment_methods.map((method, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600 capitalize">{method.payment_method.replace('_', ' ')}</span>
                      <span className="font-medium">{method.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full" 
                        style={{ width: `${method.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>{formatCurrency(method.total_amount)}</span>
                      <span>{method.order_count} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Performance Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Product Performance</h3>
            <div style={{ height: '400px' }}>
              <Bar data={productPerformanceData} options={barChartOptions} />
            </div>
          </div>

          {/* Geographical Data */}
          {analytics.geographical_data && analytics.geographical_data.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by State</h3>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analytics.geographical_data.map((location, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{location.state}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{location.total_orders}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(location.total_revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
            title="No analytics data found"
            description="Analytics data will appear here once customers start placing orders and making purchases on your website."
          />
        </div>
      )}
      </div>
    </AuthenticatedLayout>
  );
}