'use client';

import { useState, useEffect } from 'react';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import env from '@/config/env';

// Helper function to get auth token
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
  }
  return null;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

interface WebsitePage {
  id: string;
  title: string;
  slug: string;
  page_type: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  display_order: number;
  template: string;
  created_by_name?: string;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  created_by_name?: string;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
}

interface PageStats {
  totalStats: {
    total_pages: number;
    published_pages: number;
    draft_pages: number;
  };
}

const PAGE_TYPES = [
  { value: 'privacy_policy', label: 'Privacy Policy' },
  { value: 'terms_of_service', label: 'Terms of Service' },
  { value: 'cancellation_policy', label: 'Cancellation Policy' }
];

const STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'published', label: 'Published', color: 'bg-green-100 text-green-800' },
  { value: 'archived', label: 'Archived', color: 'bg-red-100 text-red-800' }
];

export default function WebsitePages() {
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  // const [stats, setStats] = useState<PageStats | null>(null); // Currently unused
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pages' | 'faq'>('pages');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'page' | 'faq-item'>('page');
  const [editingItem, setEditingItem] = useState<WebsitePage | FAQItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Form state for page creation/editing
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    page_type: 'custom',
    content: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    is_featured: false,
    display_order: 0,
    template: 'default'
  });


  // Form state for FAQ item
  const [faqItemForm, setFaqItemForm] = useState({
    question: '',
    answer: '',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, [searchTerm, statusFilter, typeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('page_type', typeFilter);
      
      // Fetch data with individual error handling
      let pagesData = { data: [] };
      let faqData = { data: [] };

      try {
        const pagesRes = await fetch(`${env.API_BASE_URL}/admin/website-pages?${params}`, {
          headers: getAuthHeaders(),
          credentials: 'include'
        });
        if (pagesRes.ok) {
          pagesData = await pagesRes.json();
        } else {
          console.error('Pages API failed:', pagesRes.status, pagesRes.statusText);
        }
      } catch (err) {
        console.error('Error fetching pages:', err);
      }

      try {
        const faqRes = await fetch(`${env.API_BASE_URL}/admin/website-pages/faq`, {
          headers: getAuthHeaders(),
          credentials: 'include'
        });
        if (faqRes.ok) {
          faqData = await faqRes.json();
        } else {
          console.error('FAQ API failed:', faqRes.status, faqRes.statusText);
        }
      } catch (err) {
        console.error('Error fetching FAQ items:', err);
      }


      setPages(pagesData.data || []);
      setFaqItems(faqData.data || []);
      
      // Debug: Log FAQ data
      console.log('FAQ data received:', faqData);
    } catch (err) {
      setError('Failed to load website pages data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'page' | 'faq-item', item?: WebsitePage | FAQItem) => {
    setModalType(type);
    setEditingItem(item || null);
    
    if (type === 'page') {
      if (item && 'title' in item) {
        const pageItem = item as WebsitePage;
        setPageForm({
          title: pageItem.title || '',
          slug: pageItem.slug || '',
          page_type: pageItem.page_type || 'custom',
          content: pageItem.content || '',
          meta_title: pageItem.meta_title || '',
          meta_description: pageItem.meta_description || '',
          meta_keywords: pageItem.meta_keywords || '',
          status: pageItem.status || 'draft',
          is_featured: pageItem.is_featured || false,
          display_order: pageItem.display_order || 0,
          template: pageItem.template || 'default'
        });
      } else {
        setPageForm({
          title: '',
          slug: '',
          page_type: 'custom',
          content: '',
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
          status: 'draft',
          is_featured: false,
          display_order: 0,
          template: 'default'
        });
      }
    } else if (type === 'faq-item') {
      if (item && 'question' in item) {
        const faqItem = item as FAQItem;
        setFaqItemForm({
          question: faqItem.question || '',
          answer: faqItem.answer || '',
          display_order: faqItem.display_order || 0,
          is_active: faqItem.is_active !== undefined ? faqItem.is_active : true
        });
      } else {
        setFaqItemForm({
          question: '',
          answer: '',
          display_order: 0,
          is_active: true
        });
      }
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setError('');
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handlePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Auto-generate slug if empty
    if (!pageForm.slug && pageForm.title) {
      setPageForm(prev => ({ ...prev, slug: generateSlug(pageForm.title) }));
    }

    try {
      const url = editingItem 
        ? `${env.API_BASE_URL}/admin/website-pages/${editingItem.id}`
        : `${env.API_BASE_URL}/admin/website-pages`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(pageForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save page');
      }

      await fetchData();
      closeModal();
      
      // Show success message
      const message = editingItem ? 'Page updated successfully!' : 'Page created successfully!';
      toast.success(message);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save page';
      setError(errorMessage);
    }
  };

  const handleFaqItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingItem 
        ? `${env.API_BASE_URL}/admin/website-pages/faq/items/${editingItem.id}`
        : `${env.API_BASE_URL}/admin/website-pages/faq/items`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(faqItemForm)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to save FAQ item';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            // If not JSON, it might be HTML error page
            const errorText = await response.text();
            console.error('Non-JSON error response:', errorText);
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      await fetchData();
      closeModal();
      
      // Show success message
      const message = editingItem ? 'FAQ item updated successfully!' : 'FAQ item created successfully!';
      toast.success(message);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save page';
      setError(errorMessage);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const response = await fetch(`${env.API_BASE_URL}/admin/website-pages/${pageId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete page');
      }

      await fetchData();
    } catch (err) {
      setError('Failed to delete page');
    }
  };

  const handleDeleteFaqItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ item?')) return;

    try {
      const response = await fetch(`${env.API_BASE_URL}/admin/website-pages/faq/items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete FAQ item');
      }

      await fetchData();
    } catch (err) {
      setError('Failed to delete FAQ item');
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Website Pages</h1>
          <p className="text-gray-600">Manage FAQ pages and policy documents only</p>
        </div>


        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pages')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pages'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Website Pages
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'faq'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              FAQ Management
            </button>
          </nav>
        </div>

        {/* Website Pages Tab */}
        {activeTab === 'pages' && (
          <div className="space-y-4">
            {/* Filters and Search */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div className="sm:flex sm:items-center sm:space-x-4">
                    <div className="relative min-w-80 flex-shrink-0">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search pages..."
                        className="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="mt-1 sm:mt-0 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                    >
                      <option value="">All Statuses</option>
                      {STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>

                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="mt-1 sm:mt-0 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                    >
                      <option value="">All Types</option>
                      {PAGE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                      onClick={() => openModal('page')}
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Page
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pages Table */}
            <div className="flex flex-col">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Page
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Updated
                          </th>
                          <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                              Loading website pages...
                            </td>
                          </tr>
                        ) : pages.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                              No website pages found
                            </td>
                          </tr>
                        ) : (
                          pages.map((page) => (
                            <tr key={page.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{page.title}</div>
                                  <div className="text-sm text-gray-500">/{page.slug}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">
                                  {PAGE_TYPES.find(t => t.value === page.page_type)?.label || page.page_type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  STATUSES.find(s => s.value === page.status)?.color || 'bg-gray-100 text-gray-800'
                                }`}>
                                  {STATUSES.find(s => s.value === page.status)?.label || page.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(page.updated_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => openModal('page', page)}
                                  className="text-orange-600 hover:text-orange-900 mr-3"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePage(page.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Management Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            {/* FAQ Controls */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">FAQ Management</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage your frequently asked questions
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                      onClick={() => openModal('faq-item')}
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add FAQ Item
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Items */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {faqItems.length > 0 ? (
                  <div className="space-y-4">
                    {faqItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h4 className="text-sm font-medium text-gray-900 mr-3">{item.question}</h4>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {item.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-3" dangerouslySetInnerHTML={{ __html: item.answer }} />
                            <div className="flex items-center text-xs text-gray-500">
                              <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => openModal('faq-item', item)}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFaqItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium mb-2">No FAQ items found</p>
                    <p className="mb-4">Create your first FAQ item to get started.</p>
                    <button
                      onClick={() => openModal('faq-item')}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
                    >
                      Create FAQ Item
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingItem ? 'Edit' : 'Create'} {
                      modalType === 'page' ? 'Website Page' : 'FAQ Item'
                    }
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {/* Page Form */}
                {modalType === 'page' && (
                  <form onSubmit={handlePageSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={pageForm.title}
                          onChange={(e) => {
                            setPageForm(prev => ({ ...prev, title: e.target.value }));
                            if (!editingItem && !pageForm.slug) {
                              setPageForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                            }
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Slug *
                        </label>
                        <input
                          type="text"
                          required
                          value={pageForm.slug}
                          onChange={(e) => setPageForm(prev => ({ ...prev, slug: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Page Type
                        </label>
                        <select
                          value={pageForm.page_type}
                          onChange={(e) => setPageForm(prev => ({ ...prev, page_type: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        >
                          {PAGE_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={pageForm.status}
                          onChange={(e) => setPageForm(prev => ({ ...prev, status: e.target.value as any }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        >
                          {STATUSES.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content *
                      </label>
                      <textarea
                        required
                        rows={8}
                        value={pageForm.content}
                        onChange={(e) => setPageForm(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter HTML content..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={pageForm.meta_title}
                          onChange={(e) => setPageForm(prev => ({ ...prev, meta_title: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={pageForm.display_order}
                          onChange={(e) => setPageForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Description
                      </label>
                      <textarea
                        rows={3}
                        value={pageForm.meta_description}
                        onChange={(e) => setPageForm(prev => ({ ...prev, meta_description: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={pageForm.is_featured}
                        onChange={(e) => setPageForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                        Featured page
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                      >
                        {editingItem ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                )}


                {/* FAQ Item Form */}
                {modalType === 'faq-item' && (
                  <form onSubmit={handleFaqItemSubmit} className="space-y-4">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question *
                      </label>
                      <input
                        type="text"
                        required
                        value={faqItemForm.question}
                        onChange={(e) => setFaqItemForm(prev => ({ ...prev, question: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Answer *
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={faqItemForm.answer}
                        onChange={(e) => setFaqItemForm(prev => ({ ...prev, answer: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter HTML content for the answer..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={faqItemForm.display_order}
                          onChange={(e) => setFaqItemForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={faqItemForm.is_active}
                          onChange={(e) => setFaqItemForm(prev => ({ ...prev, is_active: e.target.checked }))}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                          Active
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                      >
                        {editingItem ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}