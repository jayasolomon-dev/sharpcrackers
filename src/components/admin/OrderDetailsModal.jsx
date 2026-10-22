import React from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Printer, 
  Trash2 
} from 'lucide-react';
import { getOrderRetentionDetails } from '../../services/dataService';
import { generateOrderPdf, printOrderDocument } from '../../utils/pdfGenerator';

const formatCur = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const OrderDetailsModal = ({
  order,
  settings,
  onClose,
  onUpdateStatus,
  onDeleteRequest
}) => {
  if (!order) return null;

  const retention = getOrderRetentionDetails(order);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div>
            <span className="badge badge-festive mb-1">OFFICIAL ORDER SHEET</span>
            <h2>Order #{order.orderId}</h2>
            <div className="modal-time">Submitted: {new Date(order.createdAt).toLocaleString('en-IN')}</div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-scroll-body">
          {/* Customer Contact Information */}
          <div className="order-details-grid">
            <div className="info-sub-box">
              <span className="sub-box-title">CUSTOMER CONTACT INFORMATION</span>
              <div><strong>Customer Name:</strong> {order.customer?.name}</div>
              <div><strong>Mobile Number:</strong> <a href={`tel:${order.customer?.phone}`}>{order.customer?.phone}</a></div>
              {order.customer?.email && <div><strong>Email:</strong> {order.customer.email}</div>}
              {order.customer?.notes && (
                <div><strong>Customer Notes:</strong> <em>"{order.customer.notes}"</em></div>
              )}
            </div>

            <div className="info-sub-box">
              <span className="sub-box-title">ORDER TOTALS</span>
              <div><strong>Total Varieties:</strong> {(order.items || []).length} items</div>
              <div><strong>Total Quantity:</strong> {(order.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0)} boxes/pkts</div>
              <div><strong>Total Amount:</strong> <strong className="text-red font-bold">{formatCur(order.grandTotal)}</strong></div>
            </div>
          </div>

          {/* 30-Day Storage Retention Notice */}
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '8px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} className="text-blue" />
              <span>
                <strong>Storage Retention:</strong> Retained under 30-Day Policy. 
                {retention.expiresAt && <span> Auto-deletes on <strong>{new Date(retention.expiresAt).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</strong>.</span>}
              </span>
            </div>
            <span className={`badge ${retention.daysRemaining <= 5 ? 'badge-amber' : 'badge-green'}`}>
              ⏱️ {retention.daysRemaining} days remaining
            </span>
          </div>

          {/* Ordered Products Table */}
          <h4 className="mt-4 mb-2">Ordered Products Breakdown:</h4>
          <div className="table-responsive-wrapper border rounded">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="col-sno text-center">S.No</th>
                  <th className="text-center">Image</th>
                  <th>Code</th>
                  <th>Product Name</th>
                  <th>Packing Details</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((it, idx) => (
                  <tr key={idx}>
                    <td className="text-center col-sno">{idx + 1}</td>
                    <td className="text-center">
                      <img src={it.image} alt={it.name} className="table-row-thumb" />
                    </td>
                    <td><span className="code-badge">{it.code}</span></td>
                    <td><strong>{it.name}</strong></td>
                    <td>{it.packDetails}</td>
                    <td className="text-right">{formatCur(it.unitPrice)}</td>
                    <td className="text-center font-bold">{it.quantity}</td>
                    <td className="text-right font-bold text-red">
                      {formatCur(it.totalPrice || (it.unitPrice * it.quantity))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Status Update & Document Actions */}
          <div className="modal-action-bar-bottom">
            <div className="status-update-action">
              <span>Update Order Status:</span>
              <select 
                value={order.status}
                onChange={(e) => onUpdateStatus(order.orderId, e.target.value)}
                className={`status-dropdown status-${order.status?.toLowerCase()}`}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="document-buttons-row">
              <button 
                onClick={() => generateOrderPdf(order, settings, true)}
                className="btn btn-primary"
              >
                <FileText size={16} />
                <span>Download Order PDF</span>
              </button>
              <button 
                onClick={() => printOrderDocument(order, settings)}
                className="btn btn-outline-dark"
              >
                <Printer size={16} />
                <span>Print Order Sheet</span>
              </button>
              <button 
                onClick={() => onDeleteRequest(order)}
                className="btn btn-danger-outline"
                title="Delete this order"
              >
                <Trash2 size={16} />
                <span>Delete Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
