'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Check, X, MessageCircleQuestion, RefreshCw, History } from 'lucide-react';

interface Audit {
  id: string;
  action: string;
  actorName: string | null;
  decision: string | null;
  createdAt: string;
  originalValues: any;
  updatedValues: any;
  ipAddress: string | null;
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
  product: { stockQty: number; unit: string | null } | null;
  audits: Audit[];
}

const statusBadge: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  MORE_INFO: 'bg-blue-100 text-blue-800',
};

const actionLabel: Record<string, string> = {
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  MORE_INFO_REQUESTED: 'More Information Requested',
};

export default function AdjustmentApprovalsPage() {
  const [requests, setRequests] = useState<AdjustmentRequest[]>([]);
  const [filter, setFilter] = useState<'PENDING' | 'ALL' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/sales-adjustments', {
        params: filter === 'ALL' ? {} : { status: filter },
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch adjustment requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const review = async (id: string, action: 'APPROVE' | 'REJECT' | 'MORE_INFO') => {
    let remarks = '';
    if (action === 'REJECT') {
      remarks = window.prompt('Reason for rejection:') || '';
      if (remarks === null) return;
    } else if (action === 'MORE_INFO') {
      remarks = window.prompt('What additional information is needed?') || '';
      if (remarks === null) return;
    }

    setReviewingId(id);
    try {
      await api.post(`/api/sales-adjustments/${id}/review`, { action, remarks });
      await fetchRequests();
    } catch (error: any) {
      window.alert(error.response?.data?.error || 'Failed to process request');
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Adjustment Approvals</h1>
          <p className="text-gray-600 mt-1">
            Review and approve sales adjustment requests. Approvals update the sale, inventory and reports.
          </p>
        </div>
        <button
          onClick={() => fetchRequests()}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['PENDING', 'ALL', 'APPROVED', 'REJECTED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No {filter === 'ALL' ? '' : filter.toLowerCase() + ' '}adjustment requests.
        </div>
      ) : (
        requests.map((req) => (
          <div key={req.id} className="bg-white rounded-lg shadow p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{req.requestNumber}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[req.status] || 'bg-gray-100 text-gray-700'}`}>
                  {req.status.replace(/_/g, ' ')}
                </span>
                {req.status === 'PENDING' && (
                  <span className="text-xs text-yellow-600 rounded border border-yellow-300 px-2 py-0.5">Awaiting approval</span>
                )}
              </div>
              <span className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Product</p>
                <p className="font-medium">{req.productName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Invoice</p>
                <p>{req.invoiceNumber || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Voucher / Ref</p>
                <p>{req.voucherNumber || req.referenceNumber || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Quantity Change</p>
                <p>
                  <span className="line-through text-gray-400">{req.originalQuantity}</span>
                  <span className="mx-1 text-gray-400">→</span>
                  <span className="font-semibold">{req.correctQuantity}</span>
                  <span className={`ml-2 text-xs font-semibold ${req.adjustmentDifference < 0 ? 'text-green-600' : req.adjustmentDifference > 0 ? 'text-red-600' : ''}`}>
                    ({req.adjustmentDifference > 0 ? '+' : ''}{req.adjustmentDifference})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Current Stock</p>
                <p>{req.product ? `${req.product.stockQty} ${req.product.unit || ''}` : '—'}</p>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              <p><span className="text-xs text-gray-500">Reason: </span>{req.reason}</p>
              {req.supportingNotes && (
                <p className="mt-1"><span className="text-xs text-gray-500">Notes: </span>{req.supportingNotes}</p>
              )}
              <p className="mt-1"><span className="text-xs text-gray-500">Requested by: </span>{req.requestedBy.name}</p>
              {req.remarks && (
                <p className="mt-1"><span className="text-xs text-gray-500">Admin remarks: </span>{req.remarks}</p>
              )}
            </div>

            {req.status === 'PENDING' && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                <button
                  onClick={() => review(req.id, 'APPROVE')}
                  disabled={reviewingId === req.id}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => review(req.id, 'REJECT')}
                  disabled={reviewingId === req.id}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => review(req.id, 'MORE_INFO')}
                  disabled={reviewingId === req.id}
                  className="flex items-center px-4 py-2 border border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                >
                  <MessageCircleQuestion className="h-4 w-4 mr-2" />
                  Request More Info
                </button>
              </div>
            )}

            {/* Audit trail */}
            {req.audits && req.audits.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="flex items-center text-xs font-semibold text-gray-500 uppercase mb-2">
                  <History className="h-3.5 w-3.5 mr-1" /> Audit Trail
                </p>
                <div className="space-y-1">
                  {req.audits.map((audit) => (
                    <div key={audit.id} className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      <span className="text-gray-400">{new Date(audit.createdAt).toLocaleString()}</span>
                      <span className="font-medium text-gray-800">{actionLabel[audit.action] || audit.action}</span>
                      <span>by {audit.actorName || '—'}</span>
                      {audit.decision && <span className="text-gray-500">· “{audit.decision}”</span>}
                      {audit.updatedValues && audit.updatedValues.difference !== undefined && (
                        <span className="text-gray-500">
                          · stock {audit.updatedValues.previousStock !== undefined ? `${audit.updatedValues.previousStock} → ` : ''}{audit.updatedValues.updatedStock}
                        </span>
                      )}
                      {audit.ipAddress && <span className="text-gray-400">· IP {audit.ipAddress}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}