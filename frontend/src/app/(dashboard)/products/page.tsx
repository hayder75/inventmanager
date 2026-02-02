'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Search, Edit, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  costPrice: string;
  sellingPrice: string;
  stockQty: number;
  lowStockAlert: number;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      const response = await api.get(`/api/products?${params.toString()}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/products/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLowStock = (product: Product) => product.stockQty <= product.lowStockAlert;

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">View all products and stock levels</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
                placeholder="Search products by name or code..."
              />
            </div>
            <div className="w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selling Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                {(user?.role === 'ADMIN' || user?.role === 'SALES') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4">{product.code || 'N/A'}</td>
                  <td className="px-6 py-4">{product.category || 'N/A'}</td>
                  <td className="px-6 py-4">${parseFloat(product.costPrice).toFixed(2)}</td>
                  <td className="px-6 py-4">${parseFloat(product.sellingPrice).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={isLowStock(product) ? 'text-yellow-600 font-medium' : ''}>
                      {product.stockQty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {isLowStock(product) ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                        Low Stock
                      </span>
                    ) : product.stockQty === 0 ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        In Stock
                      </span>
                    )}
                  </td>
                  {(user?.role === 'ADMIN' || user?.role === 'SALES') && (
                    <td className="px-6 py-4">
                      <Link
                        href={`/products/${product.id}`}
                        className="text-primary-600 hover:text-primary-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden p-4 space-y-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500">{product.code || 'No code'}</p>
                </div>
                {(user?.role === 'ADMIN' || user?.role === 'SALES') && (
                  <Link
                    href={`/products/${product.id}`}
                    className="text-primary-600 hover:text-primary-800 min-h-[44px] min-w-[44px] flex items-center justify-center ml-2 flex-shrink-0"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="font-medium">{product.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Stock</p>
                  <p className={`font-semibold ${isLowStock(product) ? 'text-yellow-600' : ''}`}>
                    {product.stockQty}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cost Price</p>
                  <p className="font-medium">${parseFloat(product.costPrice).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Selling Price</p>
                  <p className="font-semibold">${parseFloat(product.sellingPrice).toFixed(2)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Status</p>
                  {isLowStock(product) ? (
                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs mt-1">
                      Low Stock
                    </span>
                  ) : product.stockQty === 0 ? (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded text-xs mt-1">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs mt-1">
                      In Stock
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

