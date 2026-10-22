import React from 'react';
import { X, Plus, Save } from 'lucide-react';

export const ProductFormModal = ({
  isOpen,
  isEdit = false,
  formData,
  setFormData,
  categories = [],
  onClose,
  onSubmit
}) => {
  if (!isOpen || !formData) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div>
            <span className="badge badge-festive mb-1">
              {isEdit ? 'EDIT PRODUCT' : 'CATALOG MANAGEMENT'}
            </span>
            <h2>
              {isEdit 
                ? `${formData.name || 'Edit Product'} (${formData.code || ''})` 
                : 'Add New Cracker Product'}
            </h2>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="modal-scroll-body p-4">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Product Name (English) *</label>
              <input
                type="text"
                required
                placeholder="e.g. 50 cm Tri-Color Mega Sparklers"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tamil Name (தமிழ்)</label>
              <input
                type="text"
                placeholder="e.g. 50 செ.மீ முவர்ண மெகா மத்தாப்பு"
                value={formData.tamilName || ''}
                onChange={(e) => setFormData({ ...formData, tamilName: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-grid-2 mt-3">
            <div className="form-group">
              <label className="form-label">Product Code (SKU)</label>
              <input
                type="text"
                placeholder="e.g. SC-SP05 (auto-generated if empty)"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                value={formData.category || 'sparklers'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="form-input"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2 mt-3">
            <div className="form-group">
              <label className="form-label">Pack Details</label>
              <input
                type="text"
                placeholder="e.g. 10 pcs / box, 1 Mega Box"
                value={formData.packDetails || ''}
                onChange={(e) => setFormData({ ...formData, packDetails: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit Price (₹) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 150"
                value={formData.unitPrice || ''}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-grid-2 mt-3">
            <div className="form-group">
              <label className="form-label">MRP (₹)</label>
              <input
                type="number"
                placeholder="e.g. 450"
                value={formData.mrp || ''}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                type="text"
                placeholder="/images/product_sparkler_1791567639029.jpg"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group mt-3">
            <label className="form-label">Description</label>
            <textarea
              rows="2"
              placeholder="Short description of cracker effects and bursts..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea"
            />
          </div>

          <div className="form-group mt-3 d-flex align-items-center gap-2">
            <input
              type="checkbox"
              id="productFormStock"
              checked={formData.inStock !== false}
              onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
            />
            <label htmlFor="productFormStock" style={{ cursor: 'pointer', margin: 0 }}>Available In Stock</label>
          </div>

          <div className="modal-action-bar-bottom d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
            <button type="button" onClick={onClose} className="btn btn-outline-dark">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? <Save size={16} /> : <Plus size={16} />}
              <span>{isEdit ? 'Save Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
