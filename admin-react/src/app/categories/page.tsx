'use client';

import React, { useEffect, useState, Fragment } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import EmptyState from '@/components/EmptyState';
import ImageUpload from '@/components/ImageUpload';
import toast from 'react-hot-toast';
import env from '@/config/env';
import { getProxiedImageUrl } from '@/utils/imageProxy';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  parent_name?: string;
  sort_order: number;
  is_active: boolean;
  product_count: number;
  children?: Category[];
  created_at: string;
  updated_at: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  image: string;
  parent_id: string;
  sort_order: number;
  is_active: boolean;
  meta_title: string;
  meta_description: string;
}

export default function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    image: '',
    parent_id: '',
    sort_order: 0,
    is_active: true,
    meta_title: '',
    meta_description: ''
  });
  const [selectedParentOption, setSelectedParentOption] = useState({ value: '', label: 'No Parent (Root Category)' });

  const API_BASE_URL = env.API_URL;

  useEffect(() => {
    loadCategories();
    loadAllCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      const response = await fetch(`${API_BASE_URL}/api/products/categories/tree`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCategories(data.data.categories || []);
      } else {
        toast.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadAllCategories = async () => {
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      const response = await fetch(`${API_BASE_URL}/api/products/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAllCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Failed to load all categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      // Clean up the payload
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        image: formData.image.trim() || undefined,
        parent_id: formData.parent_id || null,
        sort_order: formData.sort_order,
        is_active: formData.is_active
      };

      console.log('Submitting category with payload:', payload);

      const url = isEditMode 
        ? `${API_BASE_URL}/api/products/categories/${selectedCategory?.id}`
        : `${API_BASE_URL}/api/products/categories`;
      
      const method = isEditMode ? 'PUT' : 'POST';

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
        toast.success(`Category ${isEditMode ? 'updated' : 'created'} successfully`);
        setShowCategoryModal(false);
        resetForm();
        loadCategories();
        loadAllCategories();
      } else {
        toast.error(data.message || `Failed to ${isEditMode ? 'update' : 'create'} category`);
      }
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} category`);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      const response = await fetch(`${API_BASE_URL}/api/products/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Category deleted successfully');
        loadCategories();
        loadAllCategories();
      } else {
        toast.error(data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  const showAddCategoryModal = () => {
    setIsEditMode(false);
    setSelectedCategory(null);
    resetForm();
    setShowCategoryModal(true);
  };

  const showEditCategoryModal = (category: Category) => {
    setIsEditMode(true);
    setSelectedCategory(category);
    
    // Find the parent option for display
    let parentOption = { value: '', label: 'No Parent (Root Category)' };
    if (category.parent_id) {
      const parentCategory = allCategories.find(cat => cat.id === category.parent_id);
      if (parentCategory) {
        parentOption = { value: parentCategory.id, label: parentCategory.name };
      }
    }
    
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      parent_id: category.parent_id || '',
      sort_order: category.sort_order,
      is_active: category.is_active,
      meta_title: '',
      meta_description: ''
    });
    setSelectedParentOption(parentOption);
    setShowCategoryModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      parent_id: '',
      sort_order: 0,
      is_active: true,
      meta_title: '',
      meta_description: ''
    });
    setSelectedParentOption({ value: '', label: 'No Parent (Root Category)' });
  };

  const handleParentCategoryChange = (option: { value: string; label: string }) => {
    setSelectedParentOption(option);
    setFormData({ ...formData, parent_id: option.value });
  };

  // Get parent category options for the current category
  const getParentCategoryOptions = () => {
    const options = [{ value: '', label: 'No Parent (Root Category)' }];
    const eligibleCategories = allCategories.filter(cat => 
      !cat.parent_id && cat.id !== selectedCategory?.id
    );
    
    eligibleCategories.forEach(category => {
      options.push({ value: category.id, label: category.name });
    });
    
    return options;
  };

  const renderCategoryTree = (cats: Category[], depth = 0) => {
    return cats.map((category) => (
      <React.Fragment key={category.id}>
        <tr className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center" style={{ paddingLeft: `${depth * 20}px` }}>
              {depth > 0 && <span className="mr-2 text-gray-400">└─</span>}
              {category.image && (
                <img 
                  src={getProxiedImageUrl(category.image)}
                  alt={category.name}
                  className="w-8 h-8 rounded object-cover mr-3"
                  onError={(e) => {
                    console.error('Failed to load image:', category.image);
                    console.error('Proxied URL:', category.image ? getProxiedImageUrl(category.image) : 'No image');
                    console.error('Error:', e);
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', category.image);
                    console.log('Proxied URL:', category.image ? getProxiedImageUrl(category.image) : 'No image');
                  }}
                />
              )}
              <div>
                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                <div className="text-sm text-gray-500">{category.slug}</div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {category.description || '-'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {category.parent_name || '-'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {category.product_count}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {category.is_active ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
            <button
              onClick={() => showEditCategoryModal(category)}
              className="text-orange-600 hover:text-orange-900 mr-3"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => deleteCategory(category.id)}
              className="text-red-600 hover:text-red-900"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </td>
        </tr>
        {category.children && category.children.length > 0 && 
          renderCategoryTree(category.children, depth + 1)
        }
      </React.Fragment>
    ));
  };

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <button
            onClick={showAddCategoryModal}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Category
          </button>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!categories || categories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-0">
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
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              />
                            </svg>
                          }
                          title="No categories found"
                          description="You haven't created any categories yet. Start by adding categories to organize your products effectively."
                          action={{
                            label: "Add Category",
                            onClick: showAddCategoryModal
                          }}
                        />
                      </td>
                    </tr>
                  ) : (
                    renderCategoryTree(categories)
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {isEditMode ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Category
                    </label>
                    <Listbox value={selectedParentOption} onChange={handleParentCategoryChange}>
                      <div className="relative">
                        <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm">
                          <span className="block truncate">{selectedParentOption.label}</span>
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
                            {getParentCategoryOptions().map((option, optionIdx) => (
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Image
                  </label>
                  <ImageUpload
                    currentImage={formData.image}
                    uploadType="category"
                    onImageUploaded={(imageUrl) => setFormData({ ...formData, image: imageUrl })}
                    onImageRemoved={() => setFormData({ ...formData, image: '' })}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      min="0"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    {isEditMode ? 'Update Category' : 'Create Category'}
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