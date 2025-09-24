'use client';

import React, { useEffect, useState, Fragment } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import EmptyState from '@/components/EmptyState';
import ImageUpload from '@/components/ImageUpload';
import toast from 'react-hot-toast';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { getProxiedImageUrl } from '@/utils/imageProxy';

interface Product {
  id: string;
  name: string;
  description?: string;
  short_description?: string;
  sku?: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  stock_status: string;
  status: string;
  featured: boolean;
  featured_image?: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedStatusOption, setSelectedStatusOption] = useState({ value: '', label: 'All Products' });

  const statusOptions = [
    { value: '', label: 'All Products' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' }
  ];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  
  // Variable product state
  const [showVariableSection, setShowVariableSection] = useState(false);
  const [variableType, setVariableType] = useState('');
  const [variableTypeSuggestions, setVariableTypeSuggestions] = useState<string[]>([]);
  const [variables, setVariables] = useState<Array<{ name: string; price: string; sale_price: string }>>([
    { name: '', price: '', sale_price: '' }
  ]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://freshcounty.com/api';

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [currentPage, statusFilter]);

  const handleStatusChange = (status: typeof statusOptions[0]) => {
    setSelectedStatusOption(status);
    setStatusFilter(status.value);
    setCurrentPage(1);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      let url = `${API_BASE_URL}/products?page=${currentPage}&limit=20`;
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
        setProducts(data.data.items || []);
        setPagination(data.data.pagination);
      } else {
        toast.error('Failed to load products');
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      const response = await fetch(`${API_BASE_URL}/products/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadVariableTypeSuggestions = async (query = '') => {
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      const response = await fetch(`${API_BASE_URL}/product-variations/types/suggestions?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setVariableTypeSuggestions(data.data);
      }
    } catch (error) {
      console.error('Failed to load variable type suggestions:', error);
    }
  };

  const addVariableRow = () => {
    setVariables([...variables, { name: '', price: '', sale_price: '' }]);
  };

  const updateVariable = (index: number, field: string, value: string) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = { ...updatedVariables[index], [field]: value };
    setVariables(updatedVariables);
  };

  const removeVariable = (index: number) => {
    if (variables.length > 1) {
      const updatedVariables = variables.filter((_, i) => i !== index);
      setVariables(updatedVariables);
    }
  };

  const resetVariableSection = () => {
    setShowVariableSection(false);
    setVariableType('');
    setVariables([{ name: '', price: '', sale_price: '' }]);
    setVariableTypeSuggestions([]);
  };

  const loadExistingVariations = async (productId: string) => {
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      const response = await fetch(`${API_BASE_URL}/product-variations/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const variations = data.data;
        
        if (variations && variations.length > 0) {
          // Get the variable type from the first variation
          const firstVariation = variations[0];
          if (firstVariation.combinations && firstVariation.combinations.length > 0) {
            const variableTypeName = firstVariation.combinations[0].type_display_name || firstVariation.combinations[0].type_name;
            setVariableType(variableTypeName);
            
            // Convert variations to our format
            const formattedVariables = variations.map((variation: any) => ({
              name: variation.combinations[0]?.display_name || variation.combinations[0]?.name || '',
              price: variation.price.toString(),
              sale_price: variation.sale_price ? variation.sale_price.toString() : ''
            }));
            
            setVariables(formattedVariables);
            setShowVariableSection(true);
          }
        } else {
          resetVariableSection();
        }
      } else if (response.status === 404) {
        // No variations found, reset to default
        resetVariableSection();
      }
    } catch (error) {
      console.error('Failed to load existing variations:', error);
      resetVariableSection();
    }
  };

  const searchProducts = () => {
    setCurrentPage(1);
    loadProducts();
  };

  const editProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    setUploadedImageUrl(product.featured_image || '');
    loadExistingVariations(product.id);
    setShowProductModal(true);
  };

  const showAddProductModal = () => {
    setSelectedProduct({
      id: '',
      name: '',
      description: '',
      short_description: '',
      sku: '',
      price: 0,
      sale_price: 0,
      stock_quantity: 0,
      stock_status: 'in_stock',
      status: 'active',
      featured: false,
      category_id: '',
      created_at: '',
      updated_at: ''
    });
    setIsEditMode(false);
    setUploadedImageUrl('');
    resetVariableSection();
    setShowProductModal(true);
  };

  const saveProduct = async (productData: any) => {
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      // Check if this is a variable product
      const hasVariables = showVariableSection && variableType && variables.some(v => v.name && v.price);
      
      let url, method;
      let payload = { ...productData };

      if (isEditMode) {
        // For editing, check if it has variables
        if (hasVariables) {
          // Update product with variables (we'll need to create this endpoint)
          url = `${API_BASE_URL}/product-variations/products-with-variations/${selectedProduct?.id}`;
          method = 'PUT';
          
          // Add variable product data to payload
          payload.variable_type = variableType;
          payload.variables = variables.filter(v => v.name && v.price);
        } else {
          // Regular product update
          url = `${API_BASE_URL}/products/${selectedProduct?.id}`;
          method = 'PUT';
        }
      } else {
        // For creating new products, check if it's a variable product
        if (hasVariables) {
          url = `${API_BASE_URL}/product-variations/products-with-variations`;
          method = 'POST';
          
          // Add variable product data to payload
          payload.variable_type = variableType;
          payload.variables = variables.filter(v => v.name && v.price);
        } else {
          url = `${API_BASE_URL}/products`;
          method = 'POST';
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const productType = hasVariables ? 'variable product' : 'product';
        toast.success(`${productType} ${isEditMode ? 'updated' : 'created'} successfully`);
        setShowProductModal(false);
        resetVariableSection();
        loadProducts();
      } else {
        console.error('API Error:', data);
        console.error('Request URL:', url);
        console.error('Request Payload:', payload);
        toast.error(data.message || `Failed to ${isEditMode ? 'update' : 'create'} product`);
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} product`);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Product deleted successfully');
        loadProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      case 'draft':
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
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
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
        <button
          onClick={showAddProductModal}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
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
            onClick={searchProducts}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Search
          </button>
        </div>
      </div>

      {/* Products Table */}
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
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!products || products.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-0">
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
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          }
                          title="No products found"
                          description="You haven't added any products yet. Start by creating your first product to begin selling."
                          action={{
                            label: "Add Product",
                            onClick: showAddProductModal
                          }}
                        />
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={getProxiedImageUrl(product.featured_image || '/placeholder.jpg')}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{formatCurrency(product.price)}</div>
                          {product.sale_price && product.sale_price > 0 && (
                            <div className="text-sm text-red-600">Sale: {formatCurrency(product.sale_price)}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{product.stock_quantity}</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.stock_status)}`}>
                            {capitalizeFirst(product.stock_status.replace('_', ' '))}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {capitalizeFirst(product.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.featured ? '⭐' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => editProduct(product)}
                          className="text-orange-600 hover:text-orange-900 mr-3"
                          title="Edit Product"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Product"
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

      {/* Product Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-4">
          <div className="relative mx-auto my-4 p-5 border w-11/12 md:w-3/4 lg:w-1/2 max-w-4xl shadow-lg rounded-md bg-white max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
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
                
                // Validate required fields
                const categoryId = (e.currentTarget.category_id as HTMLSelectElement).value;
                if (!categoryId) {
                  toast.error('Please select a category');
                  return;
                }
                
                if (!isEditMode && !uploadedImageUrl) {
                  toast.error('Please upload a featured image');
                  return;
                }
                
                const formData = new FormData(e.currentTarget);
                const productData = {
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  short_description: formData.get('short_description') as string,
                  sku: formData.get('sku') as string,
                  price: parseFloat(formData.get('price') as string),
                  sale_price: parseFloat(formData.get('sale_price') as string) || undefined,
                  stock_quantity: parseInt(formData.get('stock_quantity') as string),
                  stock_status: formData.get('stock_status') as string,
                  status: formData.get('status') as string,
                  featured: formData.get('featured') === 'on',
                  category_id: categoryId,
                  featured_image: uploadedImageUrl || selectedProduct.featured_image,
                  gallery: [], // Include empty gallery array
                  // Include variable product data if present
                  variable_type: showVariableSection && variableType ? variableType : undefined,
                  variables: showVariableSection && variableType ? variables.filter(v => v.name && v.price) : undefined
                };
                saveProduct(productData);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={selectedProduct.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU <span className="text-sm text-gray-500 font-normal">(optional - auto-generated if empty)</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    placeholder="Will be auto-generated based on category and product name"
                    defaultValue={selectedProduct.sku}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  name="short_description"
                  defaultValue={selectedProduct.short_description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={selectedProduct.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image *
                </label>
                <ImageUpload
                  currentImage={isEditMode ? selectedProduct.featured_image : undefined}
                  onImageUploaded={(url) => setUploadedImageUrl(url)}
                  onImageRemoved={() => setUploadedImageUrl('')}
                  className="mb-4"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    step="0.01"
                    defaultValue={selectedProduct.price}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Price
                  </label>
                  <input
                    type="number"
                    name="sale_price"
                    step="0.01"
                    defaultValue={selectedProduct.sale_price}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    required
                    defaultValue={selectedProduct.stock_quantity}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Status
                  </label>
                  <select
                    name="stock_status"
                    defaultValue={selectedProduct.stock_status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="low_stock">Low Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={selectedProduct.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category_id"
                    required
                    defaultValue={selectedProduct.category_id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={selectedProduct.featured}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Product</span>
                </label>
              </div>

              {/* Variable Product Section */}
              <div className="border-t pt-6">
                  {!showVariableSection ? (
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setShowVariableSection(true);
                          loadVariableTypeSuggestions();
                        }}
                        className="flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-orange-500 hover:text-orange-600"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Variable Product
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-medium text-gray-900">Variable Product</h4>
                        <button
                          type="button"
                          onClick={resetVariableSection}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Remove
                        </button>
                      </div>
                      
                      {/* Variable Type Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Variable Type (e.g., Size, Flavor, Cup Size)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={variableType}
                            onChange={(e) => {
                              setVariableType(e.target.value);
                              loadVariableTypeSuggestions(e.target.value);
                            }}
                            placeholder="Enter variable type..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          
                          {/* Suggestions Dropdown */}
                          {variableTypeSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                              {variableTypeSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => {
                                    setVariableType(suggestion);
                                    setVariableTypeSuggestions([]);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Variable Options */}
                      {variableType && (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
                            {variableType} Options
                          </label>
                          
                          {variables.map((variable, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder={`${variableType} name (e.g., Small, Medium, Large)`}
                                  value={variable.name}
                                  onChange={(e) => updateVariable(index, 'name', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                              <div className="w-32">
                                <input
                                  type="number"
                                  placeholder="Price"
                                  step="0.01"
                                  value={variable.price}
                                  onChange={(e) => updateVariable(index, 'price', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                              <div className="w-32">
                                <input
                                  type="number"
                                  placeholder="Sale Price"
                                  step="0.01"
                                  value={variable.sale_price}
                                  onChange={(e) => updateVariable(index, 'sale_price', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeVariable(index)}
                                disabled={variables.length === 1}
                                className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          
                          <button
                            type="button"
                            onClick={addVariableRow}
                            className="flex items-center px-3 py-2 text-sm text-orange-600 hover:text-orange-800"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Another {variableType}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  {isEditMode ? 'Update Product' : 'Create Product'}
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