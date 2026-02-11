'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import * as XLSX from 'xlsx';
import {
    Package,
    TrendingUp,
    TrendingDown,
    ArrowLeft,
    Printer,
    ChevronRight,
    Search,
    LayoutGrid,
    List,
    FileSpreadsheet,
    CheckSquare,
    Square,
    Filter,
    ArrowDownToLine,
    X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface CategoryMetric {
    name: string;
    count: number;
    stockLevel: number;
    totalCost: number;
    totalSelling: number;
}

interface Product {
    id: string;
    name: string;
    code: string | null;
    category: string | null;
    costPrice: string;
    sellingPrice: string;
    stockQty: number;
}

interface Metrics {
    categories: CategoryMetric[];
    grandTotalCost: number;
    grandTotalSelling: number;
    totalProducts: number;
    totalStockItems: number;
}

export default function ProductsMetricsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Reporting state
    const [reportCategories, setReportCategories] = useState<string[]>([]);
    const [showReportCenter, setShowReportCenter] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [allReportProducts, setAllReportProducts] = useState<Product[]>([]);
    const [isPreparingPrint, setIsPreparingPrint] = useState(false);

    useEffect(() => {
        fetchMetrics();
    }, []);

    // Set initial report categories to all when metrics load
    useEffect(() => {
        if (metrics?.categories) {
            setReportCategories(metrics.categories.map(c => c.name));
        }
    }, [metrics]);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/products/metrics');
            setMetrics(response.data);
        } catch (error) {
            console.error('Failed to fetch product metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryProducts = async (categoryName: string) => {
        try {
            setLoadingProducts(true);
            const response = await api.get(`/api/products?category=${encodeURIComponent(categoryName)}`);
            setCategoryProducts(response.data);
            setSelectedCategory(categoryName);
        } catch (error) {
            console.error('Failed to fetch category products:', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ET', {
            style: 'currency',
            currency: 'ETB',
        }).format(amount).replace('ETB', 'Birr');
    };

    const handleAdvancedPrint = async () => {
        if (!metrics) return;
        setIsPreparingPrint(true);
        try {
            const allProducts: Product[] = [];
            for (const catName of reportCategories) {
                const res = await api.get(`/api/products?category=${encodeURIComponent(catName)}`);
                allProducts.push(...res.data);
            }
            setAllReportProducts(allProducts);
            // Small delay to allow state update to render
            setTimeout(() => {
                window.print();
                setIsPreparingPrint(false);
            }, 500);
        } catch (error) {
            console.error('Failed to prepare print:', error);
            setIsPreparingPrint(false);
        }
    };

    const toggleReportCategory = (category: string) => {
        setReportCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const toggleAllCategories = () => {
        if (metrics) {
            if (reportCategories.length === metrics.categories.length) {
                setReportCategories([]);
            } else {
                setReportCategories(metrics.categories.map(c => c.name));
            }
        }
    };

    const exportToExcel = async () => {
        if (!metrics) return;
        setIsExporting(true);
        try {
            const allReportProductsData: any[] = [];

            for (const catName of reportCategories) {
                const res = await api.get(`/api/products?category=${encodeURIComponent(catName)}`);
                const products = res.data.map((p: Product) => ({
                    'Category': catName,
                    'Product Name': p.name,
                    'SKU / Code': p.code || 'N/A',
                    'Stock Qty': p.stockQty || 0,
                    'Cost Price': parseFloat(p.costPrice) || 0,
                    'Selling Price': parseFloat(p.sellingPrice) || 0,
                    'Total Cost Value': (parseFloat(p.costPrice) || 0) * (p.stockQty || 0),
                    'Total Retail Value': (parseFloat(p.sellingPrice) || 0) * (p.stockQty || 0),
                    'Potential Profit': ((parseFloat(p.sellingPrice) || 0) - (parseFloat(p.costPrice) || 0)) * (p.stockQty || 0)
                }));
                allReportProductsData.push(...products);
            }

            // Summary Sheet
            const summaryData = metrics.categories
                .filter(c => reportCategories.includes(c.name))
                .map(c => ({
                    'Category': c.name,
                    'Variety Count': c.count,
                    'Total Units': c.stockLevel,
                    'Total Purchase Cost': c.totalCost,
                    'Total Selling Value': c.totalSelling,
                    'Expected Profit': c.totalSelling - c.totalCost
                }));

            const wb = XLSX.utils.book_new();

            // Add Detailed Sheet
            const wsDetailed = XLSX.utils.json_to_sheet(allReportProductsData);
            XLSX.utils.book_append_sheet(wb, wsDetailed, 'Detailed Inventory');

            // Add Summary Sheet
            const wsSummary = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, wsSummary, 'Category Summary');

            // Save File
            XLSX.writeFile(wb, `Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-dashboard border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 print:p-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div className="flex items-start">
                    <button
                        onClick={() => router.back()}
                        className="mr-5 p-3.5 bg-dashboard text-white rounded-2xl shadow-lg shadow-blue-200 hover:bg-dashboard-dark hover:shadow-blue-300 transition-all active:scale-95 group"
                        title="Go Back"
                    >
                        <ArrowLeft className="h-7 w-7 transition-transform group-hover:-translate-x-1" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Inventory Analysis</h1>
                        <p className="text-gray-500 font-medium">Stock distribution and financial metrics</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowReportCenter(!showReportCenter)}
                        className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all shadow-sm border ${showReportCenter ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <Filter className="h-5 w-5" />
                        <span>{showReportCenter ? 'Hide Options' : 'Report Options'}</span>
                    </button>
                </div>
            </div>

            {/* Report Selection Center (Print: Hidden) */}
            {showReportCenter && (
                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-md space-y-4 animate-in fade-in slide-in-from-top-4 print:hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Advanced Inventory Report</h3>
                            <p className="text-sm text-gray-600">Select categories to include in your print or Excel export</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={exportToExcel}
                                disabled={isExporting || reportCategories.length === 0}
                                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-colors"
                            >
                                {isExporting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : <FileSpreadsheet className="h-5 w-5 mr-2" />}
                                Export Excel
                            </button>
                            <button
                                onClick={handleAdvancedPrint}
                                disabled={isPreparingPrint || reportCategories.length === 0}
                                className="flex items-center px-4 py-2 bg-dashboard text-white rounded-lg hover:bg-dashboard-dark disabled:opacity-50 shadow-sm transition-colors"
                            >
                                {isPreparingPrint ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : <Printer className="h-5 w-5 mr-2" />}
                                Print Selected
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700">Select Categories:</span>
                            <button
                                onClick={toggleAllCategories}
                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                {reportCategories.length === metrics?.categories.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {metrics?.categories.map(cat => (
                                <button
                                    key={cat.name}
                                    onClick={() => toggleReportCategory(cat.name)}
                                    className={`flex items-center p-2 rounded-lg border text-xs font-medium transition-all ${reportCategories.includes(cat.name)
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                                        }`}
                                >
                                    {reportCategories.includes(cat.name) ? <CheckSquare className="h-4 w-4 mr-2" /> : <Square className="h-4 w-4 mr-2" />}
                                    <span className="truncate">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Stats */}
            {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-2">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ring-1 ring-gray-200/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Purchase Cost</span>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <TrendingDown className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.grandTotalCost)}</div>
                        <p className="text-xs text-gray-400 mt-1">What you spent to buy this stock</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ring-1 ring-gray-200/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Selling Value</span>
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.grandTotalSelling)}</div>
                        <p className="text-xs text-gray-400 mt-1">Total money if you sell everything</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ring-1 ring-gray-200/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Expected Profit</span>
                            <div className="p-2 bg-dashboard-light/10 rounded-lg">
                                <Package className="h-5 w-5 text-dashboard" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-dashboard ">
                            {formatCurrency(metrics.grandTotalSelling - metrics.grandTotalCost)}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Profit left after removing costs</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ring-1 ring-gray-200/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Product Types</span>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <LayoutGrid className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{metrics.totalProducts} Items</div>
                        <p className="text-xs text-gray-400 mt-1">{metrics.totalStockItems} total pieces in store</p>
                    </div>
                </div>
            )}

            {/* Category Grid */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <LayoutGrid className="h-5 w-5 mr-2 text-dashboard" />
                    Browse by Category
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 print:grid-cols-2">
                    {metrics?.categories?.map((cat) => (
                        <button
                            key={cat.name}
                            onClick={() => fetchCategoryProducts(cat.name)}
                            className={`text-left p-5 rounded-xl border transition-all duration-200 group relative overflow-hidden ${selectedCategory === cat.name
                                ? 'bg-dashboard border-dashboard text-white shadow-lg ring-2 ring-blue-300'
                                : 'bg-white border-gray-200 hover:border-dashboard-light hover:shadow-md'
                                }`}
                        >
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${selectedCategory === cat.name ? 'text-dashboard-light/20' : 'text-dashboard'}`}>
                                        {cat.name}
                                    </div>
                                    <div className="text-lg font-black">{cat.count} Products</div>
                                    <div className={`text-sm mt-1 mb-4 ${selectedCategory === cat.name ? 'text-dashboard-light/20' : 'text-gray-500'}`}>
                                        {cat.stockLevel} units in stock
                                    </div>
                                </div>

                                <div className="space-y-1 pt-4 border-t border-white/20">
                                    <div className="flex justify-between text-xs">
                                        <span className="opacity-70">Cost:</span>
                                        <span className="font-bold">{formatCurrency(cat.totalCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="opacity-70">Retail:</span>
                                        <span className="font-bold">{formatCurrency(cat.totalSelling)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`absolute top-4 right-4 transition-transform duration-300 ${selectedCategory === cat.name ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}>
                                <ChevronRight className="h-5 w-5" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Category Details Table */}
            {selectedCategory && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <List className="h-6 w-6 mr-2 text-indigo-600" />
                            Products in {selectedCategory}
                        </h2>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="h-6 w-6 text-gray-400" />
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        {loadingProducts ? (
                            <div className="p-20 flex flex-col items-center justify-center space-y-4">
                                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-gray-500 animate-pulse">Loading product details...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Product Name</th>
                                            <th className="px-6 py-4 font-semibold">SKU / Code</th>
                                            <th className="px-6 py-4 font-semibold text-right">Cost Price</th>
                                            <th className="px-6 py-4 font-semibold text-right">Selling Price</th>
                                            <th className="px-6 py-4 font-semibold text-center">In Stock</th>
                                            <th className="px-6 py-4 font-semibold text-right">Total Cost</th>
                                            <th className="px-6 py-4 font-semibold text-right">Total Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {categoryProducts.map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{p.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">
                                                        {p.code || 'NO-CODE'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(parseFloat(p.costPrice))}</td>
                                                <td className="px-6 py-4 text-right text-gray-900 font-medium">{formatCurrency(parseFloat(p.sellingPrice))}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stockQty > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.stockQty}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-600">
                                                    {formatCurrency(parseFloat(p.costPrice) * p.stockQty)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-dashboard">
                                                    {formatCurrency(parseFloat(p.sellingPrice) * p.stockQty)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-dashboard-light/10/50 font-bold border-t-2 border-dashboard-light/20 text-blue-900">
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-right uppercase tracking-wider">Subtotal for {selectedCategory}</td>
                                            <td className="px-6 py-4 text-right bg-dashboard-light/20/50">
                                                {formatCurrency(categoryProducts.reduce((acc, p) => acc + (parseFloat(p.costPrice) * p.stockQty), 0))}
                                            </td>
                                            <td className="px-6 py-4 text-right bg-dashboard-light/20/50">
                                                {formatCurrency(categoryProducts.reduce((acc, p) => acc + (parseFloat(p.sellingPrice) * p.stockQty), 0))}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Advanced Multi-Category Print View (Hidden on screen) */}
            <div className="hidden print:block bg-white p-4 text-black w-full">
                <div className="flex justify-between items-start mb-8 border-b-2 border-gray-100 pb-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Inventory Status Report</h1>
                        <p className="text-gray-500 font-medium">Detailed breakdown of stock and valuation</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg">Real Bright Trading</p>
                        <p className="text-sm text-gray-500 font-bold">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Print Summary */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="p-3 border rounded-lg bg-gray-50 text-center">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Total Purchase Cost</p>
                        <p className="text-lg font-black">{formatCurrency(metrics?.categories.filter(c => reportCategories.includes(c.name)).reduce((sum, c) => sum + c.totalCost, 0) || 0)}</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-gray-50 text-center">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Total Selling Value</p>
                        <p className="text-lg font-black">{formatCurrency(metrics?.categories.filter(c => reportCategories.includes(c.name)).reduce((sum, c) => sum + c.totalSelling, 0) || 0)}</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-gray-50 text-center">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Expected Profit</p>
                        <p className="text-lg font-black text-dashboard">
                            {formatCurrency((metrics?.categories.filter(c => reportCategories.includes(c.name)).reduce((sum, c) => sum + c.totalSelling, 0) || 0) - (metrics?.categories.filter(c => reportCategories.includes(c.name)).reduce((sum, c) => sum + c.totalCost, 0) || 0))}
                        </p>
                    </div>
                    <div className="p-3 border rounded-lg bg-gray-50 text-center">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Included Categories</p>
                        <p className="text-lg font-black">{reportCategories.length}</p>
                    </div>
                </div>

                {/* Product List by Category */}
                {reportCategories.map(catName => {
                    const productsInCat = allReportProducts.filter(p => {
                        const pCat = p.category || 'Uncategorized';
                        return pCat === catName;
                    });

                    if (productsInCat.length === 0) return null;

                    return (
                        <div key={catName} className="mb-8 break-inside-avoid">
                            <h3 className="text-lg font-bold bg-gray-100 p-2 mb-2 border-l-4 border-indigo-600 uppercase tracking-widest text-[14px]">
                                {catName} ({productsInCat.length} Items)
                            </h3>
                            <table className="w-full text-[12px] border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50/50">
                                        <th className="py-2 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px] w-1/3">Product Name</th>
                                        <th className="py-2 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">Code</th>
                                        <th className="py-2 text-right font-bold text-gray-500 uppercase tracking-wider text-[10px]">Qty</th>
                                        <th className="py-2 text-right font-bold text-gray-500 uppercase tracking-wider text-[10px]">Cost</th>
                                        <th className="py-2 text-right font-bold text-gray-500 uppercase tracking-wider text-[10px]">Selling</th>
                                        <th className="py-2 text-right font-bold text-gray-500 uppercase tracking-wider text-[10px]">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productsInCat.map(p => (
                                        <tr key={p.id} className="border-b border-gray-50">
                                            <td className="py-2 font-medium">{p.name}</td>
                                            <td className="py-2 text-gray-500 font-mono text-[10px]">{p.code || '-'}</td>
                                            <td className="py-2 text-right font-bold">{p.stockQty}</td>
                                            <td className="py-2 text-right text-gray-600">{formatCurrency(parseFloat(p.costPrice))}</td>
                                            <td className="py-2 text-right font-medium">{formatCurrency(parseFloat(p.sellingPrice))}</td>
                                            <td className="py-2 text-right font-bold whitespace-nowrap">
                                                {formatCurrency(parseFloat(p.sellingPrice) * p.stockQty)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50/30">
                                        <td colSpan={2} className="py-2 text-right font-bold text-[10px] uppercase">Category Totals:</td>
                                        <td className="py-2 text-right font-black border-t-2 border-gray-200">
                                            {productsInCat.reduce((sum, p) => sum + p.stockQty, 0)}
                                        </td>
                                        <td className="py-2 text-right font-black border-t-2 border-gray-200">
                                            {formatCurrency(productsInCat.reduce((sum, p) => sum + (parseFloat(p.costPrice) * p.stockQty), 0))}
                                        </td>
                                        <td className="py-2 text-right font-black border-t-2 border-gray-200 text-gray-400">
                                            -
                                        </td>
                                        <td className="py-2 text-right font-black border-t-2 border-gray-200 text-dashboard">
                                            {formatCurrency(productsInCat.reduce((sum, p) => sum + (parseFloat(p.sellingPrice) * p.stockQty), 0))}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    );
                })}

                <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                    <p>Report authorized by {user?.name}</p>
                    <p>Generated via InventManager API on {new Date().toLocaleString()}</p>
                </div>
            </div>

            {/* Styling for print */}
            <style jsx global>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          aside, nav, header, .navbar, [role="navigation"] {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>

        </div>
    );
}
