import React from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';

const formatCur = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const DeleteOrderModal = ({
  order,
  onClose,
  onConfirmDelete
}) => {
  if (!order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-lg modal-danger-border" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar modal-header-danger">
          <div className="d-flex align-items-center gap-3">
            <div className="danger-badge-icon">
              <Trash2 size={22} className="text-white" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge badge-danger">CONFIRM DELETION</span>
                <span className="badge badge-festive">{order.status}</span>
              </div>
              <h2 className="modal-title-danger">Delete Order #{order.orderId}?</h2>
              <div className="modal-time">Order Placed: {new Date(order.createdAt).toLocaleString('en-IN')}</div>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Close" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-scroll-body">
          {/* Customer Information & Summary Cards */}
          <div className="order-details-grid mb-3">
            <div className="info-sub-box">
              <span className="sub-box-title text-red">CUSTOMER CONTACT DETAILS</span>
              <div><strong>Customer Name:</strong> {order.customer?.name}</div>
              <div><strong>Mobile Number:</strong> <a href={`tel:${order.customer?.phone}`}>{order.customer?.phone}</a></div>
              {order.customer?.email && <div><strong>Email:</strong> {order.customer.email}</div>}
              {order.customer?.notes && (
                <div><strong>Customer Notes:</strong> <em>"{order.customer.notes}"</em></div>
              )}
            </div>

            <div className="info-sub-box border-danger-subtle">
              <span className="sub-box-title text-red">ORDER SUMMARY TO BE DELETED</span>
              <div><strong>Total Varieties:</strong> {(order.items || []).length} items</div>
              <div><strong>Total Quantity:</strong> {(order.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0)} boxes/pkts</div>
              <div><strong>Order Amount:</strong> <strong className="text-red font-bold fs-5">{formatCur(order.grandTotal)}</strong></div>
            </div>
          </div>

          {/* Ordered Products Breakdown Table */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h4 className="m-0 font-bold">Ordered Products in this Order:</h4>
            <span className="badge badge-light text-muted">{(order.items || []).length} items</span>
          </div>
          <div className="table-responsive-wrapper border rounded mb-3">
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
              <tfoot>
                <tr className="bg-light-gray font-bold">
                  <td colSpan="6" className="text-right">Total:</td>
                  <td className="text-center">{(order.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0)} pkts</td>
                  <td className="text-right text-red font-bold">{formatCur(order.grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* High-visibility Warning Notice */}
          <div className="confirm-warning-box mb-4">
            <AlertCircle size={24} className="flex-shrink-0 text-red" />
            <div>
              <strong className="d-block mb-1 text-red">Warning: Permanent Removal</strong>
              <span>
                Clicking <strong>"OK, Delete"</strong> will permanently delete order #{order.orderId} and erase all items from the database. This action cannot be reversed.
              </span>
            </div>
          </div>

          {/* Action Buttons: Cancel or OK, Delete */}
          <div className="modal-action-bar-bottom d-flex justify-content-end gap-3 mt-3 pt-3 border-top">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-outline-dark"
            >
              Cancel / Keep Order
            </button>
            <button 
              type="button" 
              onClick={onConfirmDelete} 
              className="btn btn-danger"
              id="btn-ok-delete"
            >
              <Trash2 size={16} />
              <span>OK, Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteOrderModal;
