'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Sparkles, Filter, Search } from 'lucide-react';
import api from '@/lib/api';

interface Product {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    price: number | null;
    category: string | null;
    stockQty: number;
    createdAt: string;
}

export default function NewProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/api/website/products/new');
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch new products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get unique categories from products
    const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[]];

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-background font-sans">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-light/10 text-brand-dark mb-4">
                            <Sparkles className="w-5 h-5 text-brand" />
                            <span className="font-semibold">New Arrivals</span>
                        </div>
                        <h1 className="text-4xl font-bold text-primary-900 mb-4">Latest Products</h1>
                        <p className="text-primary-500 max-w-2xl mx-auto">
                            Discover our newest additions to the inventory. Fresh products just added to our collection.
                        </p>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 bg-white p-6 rounded-2xl shadow-sm border border-primary-100">
                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                                            ? 'bg-brand text-white shadow-md'
                                            : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-72">
                            <input
                                type="text"
                                placeholder="Search new products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-primary-50 border border-primary-200 rounded-xl focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 w-4 h-4" />
                        </div>
                    </div>

                    {/* Product Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <Sparkles className="w-16 h-16 text-primary-300 mx-auto mb-4" />
                            <p className="text-xl text-primary-500 font-medium">No new products at the moment.</p>
                            <p className="text-primary-400 mt-2">Check back soon for our latest arrivals!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="relative">
                                    {/* New Badge */}
                                    <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-brand text-white rounded-full text-xs font-bold shadow-lg">
                                        NEW
                                    </div>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

