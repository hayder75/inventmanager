'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Eye, EyeOff, Upload, X, Image as ImageIcon, Sparkles } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  imageUrl: string | null;
  sellingPrice: number;
  category: string | null;
  stockQty: number;
  showOnWebsite: boolean;
  isNew: boolean;
  notes: string | null;
}

export default function WebsiteManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/website/admin/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (productId: string) => {
    try {
      const response = await api.patch(`/api/website/admin/products/${productId}/toggle-visibility`);
      setProducts(products.map(p => p.id === productId ? response.data : p));
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to toggle visibility');
    }
  };

  const handleToggleNewStatus = async (productId: string) => {
    try {
      const response = await api.patch(`/api/website/admin/products/${productId}/toggle-new`);
      setProducts(products.map(p => p.id === productId ? response.data : p));
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to toggle new status');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const formDataToSend = new FormData();
    formDataToSend.append('description', formData.description);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      await api.put(`/api/website/admin/products/${editingProduct.id}/website`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchProducts();
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update product');
    }
  };

  const handleDeleteImage = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product image?')) return;
    try {
      await api.delete(`/api/website/admin/products/${productId}/image`);
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete image');
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      description: product.description || '',
      image: null,
    });
    setImagePreview(product.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.imageUrl}` : null);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      description: '',
      image: null,
    });
    setImagePreview(null);
    setEditingProduct(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Website Management</h1>
          <p className="text-gray-600 mt-1">Manage which inventory products appear on your public website</p>
        </div>
      </div>

      {showForm && editingProduct && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Edit Product: {editingProduct.name}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Product description for website..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
              {imagePreview && (
                <div className="mt-4 relative">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({ ...formData, image: null });
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">New</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No products found in inventory.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.imageUrl ? (
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.imageUrl}`} 
                        alt={product.name} 
                        className="w-16 h-16 object-cover rounded" 
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    {product.code && (
                      <div className="text-sm text-gray-500">Code: {product.code}</div>
                    )}
                    {product.category && (
                      <div className="text-sm text-gray-500">Category: {product.category}</div>
                    )}
                    {product.description && (
                      <div className="text-sm text-gray-500 mt-1">{product.description.substring(0, 50)}...</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${parseFloat(product.sellingPrice.toString()).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.stockQty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleVisibility(product.id)}
                      className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${
                        product.showOnWebsite 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {product.showOnWebsite ? (
                        <>
                          <Eye className="w-4 h-4" />
                          Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Hidden
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleNewStatus(product.id)}
                      className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${
                        product.isNew 
                          ? 'bg-brand text-white hover:bg-brand-dark' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      <Sparkles className={`w-4 h-4 ${product.isNew ? 'text-white' : 'text-gray-600'}`} />
                      {product.isNew ? 'New' : 'Mark as New'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(product)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                      {product.imageUrl && (
                        <button
                          onClick={() => handleDeleteImage(product.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Image"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
