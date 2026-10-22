import React, { useState, useMemo } from 'react';
import { 
  X, 
  Archive, 
  Search, 
  Download, 
  Eye, 
  FileText, 
  Printer, 
  Undo2 
} from 'lucide-react';
import { generateOrderPdf, printOrderDocument } from '../../utils/pdfGenerator';

const formatCur = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const BackupOrdersModal = ({
  isOpen,
  onClose,
  backupOrders = [],
  settings = {},
  onSelectOrder,
  onRestoreOrder
}) => {
  const [backupSearch, setBackupSearch] = useState('');

  const filteredBackupOrders = useMemo(() => {
    if (!backupSearch.trim()) return backupOrders;
    const q = backupSearch.toLowerCase().trim();
    return backupOrders.filter(o => 
      (o.orderId && o.orderId.toLowerCase().includes(q)) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
      (o.customer?.phone && o.customer.phone.includes(q))
    );
  }, [backupOrders, backupSearch]);

  const handleExportBackupJson = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupOrders, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `sharp_crackers_backup_archive_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Failed to export backup json', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1050px', maxHeight: '90vh' }}>
        <div className="modal-header-bar" style={{ background: 'linear-gradient(135deg, #0a1128 0%, #1c2541 100%)', color: '#fff' }}>
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 183, 3, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffb703' }}>
              <Archive size={22} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge badge-festive">PERMANENT BACKUP STORAGE</span>
                <span className="badge badge-green">{backupOrders.length} Bills Preserved</span>
              </div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#fff' }}>Customer Bills Backup Archive</h2>
              <div className="modal-time" style={{ color: '#cbd5e1' }}>
                All customer bills exceeding the 30-day active window are automatically backed up and safely stored here.
              </div>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Close" style={{ color: '#fff' }} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-scroll-body p-4">
          {/* Search & Export Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="search-box" style={{ maxWidth: '380px', flex: 1 }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search backup bills by Order ID, Name, Mobile..."
                value={backupSearch}
                onChange={(e) => setBackupSearch(e.target.value)}
                className="admin-search-input"
                style={{ fontSize: '13px' }}
              />
              {backupSearch && (
                <button onClick={() => setBackupSearch('')} className="clear-btn">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                onClick={handleExportBackupJson}
                className="btn btn-outline-dark btn-sm"
                disabled={backupOrders.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} />
                <span>Export All Backup (JSON)</span>
              </button>
            </div>
          </div>

          {filteredBackupOrders.length === 0 ? (
            <div className="empty-table-state" style={{ padding: '3rem 1rem' }}>
              <Archive size={42} className="text-amber" />
              <h4>No backup bills found</h4>
              <p className="text-muted">
                {backupSearch.trim() 
                  ? "No archived orders match your search criteria." 
                  : "Bills will automatically appear in this backup archive after reaching their 30-day active retention period."}
              </p>
            </div>
          ) : (
            <div className="table-responsive-wrapper border rounded">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="col-sno text-center">S.No</th>
                    <th>Order ID</th>
                    <th>Customer Details</th>
                    <th>Original Order Date</th>
                    <th>Archived Date</th>
                    <th className="text-center">Items</th>
                    <th className="text-right">Total Amount</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBackupOrders.map((ord, idx) => {
                    const totalQty = (ord.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
                    return (
                      <tr key={ord.orderId}>
                        <td className="text-center col-sno">{idx + 1}</td>
                        <td>
                          <span className="order-id-badge" onClick={() => onSelectOrder(ord)}>
                            {ord.orderId}
                          </span>
                        </td>
                        <td>
                          <div><strong>{ord.customer?.name || 'Customer'}</strong></div>
                          <small><a href={`tel:${ord.customer?.phone}`}>{ord.customer?.phone}</a></small>
                        </td>
                        <td>
                          <div>{new Date(ord.createdAt).toLocaleDateString('en-IN')}</div>
                          <small className="text-muted">{new Date(ord.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</small>
                        </td>
                        <td>
                          <span className="badge badge-festive" style={{ fontSize: '11px' }}>
                            {ord.archivedAt ? new Date(ord.archivedAt).toLocaleDateString('en-IN') : 'Auto-Archived'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="item-count-badge">
                            {(ord.items || []).length} items ({totalQty} pkts)
                          </span>
                        </td>
                        <td className="text-right font-bold text-red">
                          {formatCur(ord.grandTotal)}
                        </td>
                        <td className="text-center">
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            <button
                              onClick={() => onSelectOrder(ord)}
                              className="action-icon-btn-sm text-blue"
                              title="View Bill Details"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => generateOrderPdf(ord, settings, true)}
                              className="action-icon-btn-sm text-navy"
                              title="Download Invoice PDF"
                            >
                              <FileText size={15} />
                            </button>
                            <button
                              onClick={() => printOrderDocument(ord, settings)}
                              className="action-icon-btn-sm text-gold-dark"
                              title="Print Order Sheet"
                            >
                              <Printer size={15} />
                            </button>
                            <button
                              onClick={() => onRestoreOrder(ord.orderId)}
                              className="action-icon-btn-sm text-emerald"
                              title="Restore Bill to Active Orders (30 Days Active)"
                              style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', padding: '4px 6px', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}
                            >
                              <Undo2 size={13} />
                              <span>Restore</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupOrdersModal;
