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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLowStock = (product: Product) => product.stockQty <= product.lowStockAlert;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600 mt-1">View all products and stock levels</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Search products by name or code..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
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
                {user?.role === 'ADMIN' && (
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
                  {user?.role === 'ADMIN' && (
                    <td className="px-6 py-4">
                      <Link
                        href={`/products/${product.id}`}
                        className="text-primary-600 hover:text-primary-800"
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
      </div>
    </div>
  );
}

