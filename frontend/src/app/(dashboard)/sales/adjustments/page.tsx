'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { Plus, Search, X, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Product {
  id: string;
  name: string;
  code: string | null;
  stockQty: number;
  unit: string | null;
}

interface Audit {
  id: string;
  action: string;
  actorName: string | null;
  createdAt: string;
  decision: string | null;
  originalValues: any;
  updatedValues: any;
}

interface AdjustmentRequest {
  id: string;
  requestNumber: string;
  invoiceNumber: string | null;
  voucherNumber: string | null;
  referenceNumber: string | null;
  productName: string;
  originalQuantity: number;
  correctQuantity: number;
  adjustmentDifference: number;
  reason: string;
  supportingNotes: string | null;
  status: string;
  remarks: string | null;
  createdAt: string;
  requestedBy: { name: string };
  approvedBy: { name: string } | null;
  audits: Audit[];
}

const statusBadge: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  MORE_INFO: 'bg-blue-100 text-blue-800',
};

export default function SalesAdjustmentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [requests, setRequests] = useState<AdjustmentRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [voucherNumber, setVoucherNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productId, setProductId] = useState<string | undefined>();
  const [productName, setProductName] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [originalQuantity, setOriginalQuantity] = useState<number | ''>('');
  const [correctQuantity, setCorrectQuantity] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [supportingNotes, setSupportingNotes] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const productRef = useRef<HTMLDivElement | null>(null);

  const difference =
    originalQuantity === '' || correctQuantity === ''
      ? 0
      : Number(correctQuantity) - Number(originalQuantity);

  useEffect(() => {
    fetchRequests();
    fetchProducts();
    const handler = (e: MouseEvent) => {
      if (productRef.current && !productRef.current.contains(e.target as Node)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/api/sales-adjustments');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch adjustment requests:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.code?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectProduct = (product: Product) => {
    setProductId(product.id);
    setProductName(product.name);
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const clearProduct = () => {
    setProductId(undefined);
    setProductName('');
    setProductSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!productName.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (originalQuantity === '' || correctQuantity === '') {
      setFormError('Original and correct quantity are required.');
      return;
    }
    if (Number(correctQuantity) < 0 || Number(originalQuantity) <= 0) {
      setFormError('Please enter valid quantities.');
      return;
    }
    if (!reason.trim()) {
      setFormError('Reason for adjustment is required.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/sales-adjustments', {
        invoiceNumber: invoiceNumber.trim() || undefined,
        voucherNumber: voucherNumber.trim() || undefined,
        referenceNumber: referenceNumber.trim() || undefined,
        productId: productId || undefined,
        productName: productName.trim(),
        originalQuantity: Number(originalQuantity),
        correctQuantity: Number(correctQuantity),
        reason: reason.trim(),
        supportingNotes: supportingNotes.trim() || undefined,
      });
      // Reset form
      setInvoiceNumber('');
      setVoucherNumber('');
      setReferenceNumber('');
      clearProduct();
      setOriginalQuantity('');
      setCorrectQuantity('');
      setReason('');
      setSupportingNotes('');
      await fetchRequests();
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Failed to submit adjustment request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Adjustments</h1>
        <p className="text-gray-600 mt-1">
          Request corrections for completed sales. Adjustments require admin approval before applying.
        </p>
      </div>

      {/* Submit form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6" noValidate>
        <div className="flex items-center mb-4">
          <Plus className="h-5 w-5 mr-2 text-primary-600" />
          <h2 className="text-lg font-semibold">New Adjustment Request</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g. INV-20260805-0001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sales Voucher Number</label>
            <input
              type="text"
              value={voucherNumber}
              onChange={(e) => setVoucherNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sales Reference Number</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Optional"
            />
          </div>

          <div className="relative" ref={productRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
            {productName ? (
              <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg">
                <span className="text-sm">{productName}</span>
                <button type="button" onClick={clearProduct} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                    onFocus={() => setShowProductDropdown(true)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Search product"
                  />
                </div>
                {showProductDropdown && productSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredProducts.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">No matching products</div>
                    )}
                    {filteredProducts.slice(0, 15).map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => selectProduct(product)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="text-sm font-medium">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          {product.code} | Stock: {product.stockQty} {product.unit || ''}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Original Quantity *</label>
            <input
              type="number"
              min="1"
              value={originalQuantity}
              onChange={(e) => setOriginalQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Recorded quantity"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correct Quantity *</label>
            <input
              type="number"
              min="0"
              value={correctQuantity}
              onChange={(e) => setCorrectQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="What it should have been"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <span>Adjustment Difference:</span>
          <span className={`font-semibold ${difference < 0 ? 'text-green-600' : difference > 0 ? 'text-red-600' : 'text-gray-700'}`}>
            {difference > 0 ? '+' : ''}{difference}
          </span>
          {difference < 0 && <span className="text-xs text-gray-500">(sale over-counted — stock to be returned)</span>}
          {difference > 0 && <span className="text-xs text-gray-500">(sale under-counted — extra stock to be deducted)</span>}
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Adjustment *</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g. Incorrect quantity entered during sale"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Notes</label>
            <textarea
              value={supportingNotes}
              onChange={(e) => setSupportingNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Additional details (optional)"
              rows={2}
            />
          </div>
        </div>

        {formError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {formError}
          </div>
        )}

        <div className="mt-5">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {isAdmin ? 'All Adjustment Requests' : 'My Adjustment Requests'}
        </h2>
        {loading && <p className="text-gray-500">Loading...</p>}
        {requests.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No adjustment requests yet.
          </div>
        )}
        {requests.map((req) => {
          const lastAudit = req.audits?.[0];
          return (
            <div key={req.id} className="bg-white rounded-lg shadow p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">{req.requestNumber}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[req.status] || 'bg-gray-100 text-gray-700'}`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                  {req.status === 'PENDING' && <Check className="h-4 w-4 text-yellow-500" />}
                </div>
                <span className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Product</p>
                  <p className="font-medium">{req.productName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Invoice</p>
                  <p>{req.invoiceNumber || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Quantity</p>
                  <p>
                    <span className="line-through text-gray-400">{req.originalQuantity}</span>
                    <span className="mx-1 text-gray-400">→</span>
                    <span className="font-semibold">{req.correctQuantity}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Difference</p>
                  <p className={
                    req.adjustmentDifference < 0
                      ? 'text-green-600 font-semibold'
                      : req.adjustmentDifference > 0
                        ? 'text-red-600 font-semibold'
                        : 'font-semibold'
                  }>
                    {req.adjustmentDifference > 0 ? '+' : ''}{req.adjustmentDifference}
                  </p>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600">
                <p><span className="text-xs text-gray-500">Reason: </span>{req.reason}</p>
                {req.supportingNotes && (
                  <p className="mt-1"><span className="text-xs text-gray-500">Notes: </span>{req.supportingNotes}</p>
                )}
                <p className="mt-1">
                  <span className="text-xs text-gray-500">Requested by: </span>{req.requestedBy.name}
                  {req.approvedBy && (
                    <span> · Approved by {req.approvedBy.name}</span>
                  )}
                </p>
                {req.remarks && (
                  <p className="mt-1"><span className="text-xs text-gray-500">Admin remarks: </span>{req.remarks}</p>
                )}
              </div>

              {lastAudit && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span className="text-gray-400">Last action: </span>
                  {lastAudit.action.replace(/_/g, ' ')} by {lastAudit.actorName || '—'}
                  <span className="ml-2">({new Date(lastAudit.createdAt).toLocaleString()})</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}