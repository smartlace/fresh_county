'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface VariationType {
  id: number;
  name: string;
  display_name: string;
  slug: string;
}

interface VariationOption {
  id: number;
  name: string;
  display_name: string;
  color_hex?: string;
  variation_type_id: number;
}

interface ProductVariation {
  id: string;
  sku: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  stock_status: string;
  is_default: boolean;
  combinations: Array<{
    id: number;
    name: string;
    display_name: string;
    color_hex?: string;
    type_name: string;
    type_display_name: string;
  }>;
}

interface ProductVariationsProps {
  productId: string;
  onClose?: () => void;
}

export default function ProductVariations({ productId, onClose }: ProductVariationsProps) {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [variationTypes, setVariationTypes] = useState<VariationType[]>([]);
  const [variationOptions, setVariationOptions] = useState<{ [typeId: number]: VariationOption[] }>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVariation, setEditingVariation] = useState<ProductVariation | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    price: '',
    sale_price: '',
    stock_quantity: '0',
    is_default: false,
    selected_options: {} as { [typeId: number]: number }
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    loadVariationTypes();
    loadProductVariations();
  }, [productId]); // Functions are stable, only productId changes

  const loadVariationTypes = async () => {
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/api/product-variations/types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVariationTypes(data.data);
        
        // Load options for each type
        for (const type of data.data) {
          loadVariationOptions(type.id);
        }
      }
    } catch (error) {
      console.error('Failed to load variation types:', error);
      toast.error('Failed to load variation types');
    }
  };

  const loadVariationOptions = async (typeId: number) => {
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/api/product-variations/types/${typeId}/options`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVariationOptions(prev => ({
          ...prev,
          [typeId]: data.data
        }));
      }
    } catch (error) {
      console.error(`Failed to load options for type ${typeId}:`, error);
    }
  };

  const loadProductVariations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/api/product-variations/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVariations(data.data);
      } else if (response.status === 404) {
        setVariations([]);
      }
    } catch (error) {
      console.error('Failed to load product variations:', error);
      toast.error('Failed to load product variations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const variation_options = Object.values(formData.selected_options).filter(Boolean);
    if (variation_options.length === 0) {
      toast.error('Please select at least one variation option');
      return;
    }

    const payload = {
      product_id: productId,
      price: parseFloat(formData.price),
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      stock_quantity: parseInt(formData.stock_quantity),
      is_default: formData.is_default,
      variation_options
    };

    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      const url = editingVariation 
        ? `${API_BASE_URL}/api/product-variations/variations/${editingVariation.id}`
        : `${API_BASE_URL}/api/product-variations/products/${productId}/variations`;
      
      const response = await fetch(url, {
        method: editingVariation ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(`Variation ${editingVariation ? 'updated' : 'created'} successfully`);
        setShowForm(false);
        setEditingVariation(null);
        setFormData({
          price: '',
          sale_price: '',
          stock_quantity: '0',
          is_default: false,
          selected_options: {}
        });
        loadProductVariations();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save variation');
      }
    } catch (error) {
      console.error('Failed to save variation:', error);
      toast.error('Failed to save variation');
    }
  };

  const handleEdit = (variation: ProductVariation) => {
    setEditingVariation(variation);
    setFormData({
      price: variation.price.toString(),
      sale_price: variation.sale_price?.toString() || '',
      stock_quantity: variation.stock_quantity.toString(),
      is_default: variation.is_default,
      selected_options: variation.combinations.reduce((acc, combo) => {
        const typeId = variationTypes.find(type => type.name === combo.type_name)?.id;
        if (typeId) {
          acc[typeId] = combo.id;
        }
        return acc;
      }, {} as { [typeId: number]: number })
    });
    setShowForm(true);
  };

  const handleDelete = async (variationId: string) => {
    if (!confirm('Are you sure you want to delete this variation?')) return;

    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/api/product-variations/variations/${variationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Variation deleted successfully');
        loadProductVariations();
      } else {
        toast.error('Failed to delete variation');
      }
    } catch (error) {
      console.error('Failed to delete variation:', error);
      toast.error('Failed to delete variation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Product Variations</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setShowForm(true);
              setEditingVariation(null);
              setFormData({
                price: '',
                sale_price: '',
                stock_quantity: '0',
                is_default: false,
                selected_options: {}
              });
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Variation
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Variations List */}
      {variations.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {variations.map((variation) => (
              <li key={variation.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800" title="Auto-generated SKU">
                          {variation.sku}
                        </span>
                        {variation.is_default && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex space-x-2">
                          {variation.combinations.map((combo, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {combo.type_display_name}: {combo.display_name}
                              {combo.color_hex && (
                                <span
                                  className="ml-1 w-3 h-3 rounded-full border border-gray-300"
                                  style={{ backgroundColor: combo.color_hex }}
                                ></span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>Price: ₦{variation.price.toLocaleString()}</span>
                      {variation.sale_price && (
                        <span className="ml-4">Sale: ₦{variation.sale_price.toLocaleString()}</span>
                      )}
                      <span className="ml-4">Stock: {variation.stock_quantity}</span>
                      <span className={`ml-4 px-2 py-1 text-xs rounded-full ${
                        variation.stock_status === 'in_stock' ? 'bg-green-100 text-green-800' :
                        variation.stock_status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {variation.stock_status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(variation)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(variation.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No variations found for this product.</p>
          <p className="text-sm text-gray-400 mt-1">Click &quot;Add Variation&quot; to create the first variation.</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-gray-900">
                  {editingVariation ? 'Edit Variation' : 'Add New Variation'}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingVariation(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Variation Options */}
              <div className="space-y-4">
                <h5 className="text-sm font-medium text-gray-700">Variation Options</h5>
                {variationTypes.map((type) => (
                  <div key={type.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {type.display_name}
                    </label>
                    <select
                      value={formData.selected_options[type.id] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        selected_options: {
                          ...prev.selected_options,
                          [type.id]: parseInt(e.target.value) || 0
                        }
                      }))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select {type.display_name}</option>
                      {variationOptions[type.id]?.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.display_name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Basic Fields */}
              <div className="space-y-4">
                {editingVariation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU (Auto-generated)</label>
                    <input
                      type="text"
                      value={editingVariation.sku}
                      disabled
                      className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">SKU is automatically generated when creating variations</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sale_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, sale_price: e.target.value }))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                  Set as default variation
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingVariation(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {editingVariation ? 'Update' : 'Create'} Variation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}