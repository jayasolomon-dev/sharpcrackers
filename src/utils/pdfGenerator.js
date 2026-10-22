// ==========================================================================
// SHARP CRACKERS - PDF INVOICE & ORDER SHEET GENERATOR
// Uses jsPDF & jspdf-autotable to produce crisp, publication-ready A4 invoices
// ==========================================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SHARP_LOGO_INVOICE_BASE64 } from './logoInvoiceBase64';

export const generateOrderPdf = (order, settings, shouldDownload = true) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [10, 19, 41]; // Deep navy
  const accentColor = [217, 4, 41]; // Festive red
  const grayBorder = [200, 205, 215];

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper format currency
  const formatCur = (num) => `Rs. ${Number(num || 0).toLocaleString('en-IN')}`;

  // 1. Header Banner & Business Info
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent gold line
  doc.setFillColor(255, 183, 3);
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  // Official Brand Logo (Website Genuine Asset)
  try {
    doc.addImage(SHARP_LOGO_INVOICE_BASE64, 'JPEG', 14, 4, 20, 20);
  } catch (e) {
    console.warn("Invoice logo render fallback:", e);
  }

  // Company Name & Taglines beside Logo
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(settings.shopName || "SHARP CRACKERS", 38, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 215, 110);
  doc.text(settings.tagline || "Light Up Your Celebrations! • Direct From Sivakasi", 38, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(220, 225, 235);
  doc.text("Direct Sivakasi Fireworks Showroom & Wholesale Order Desk", 38, 22);

  // Document Title Pill on Top Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("CUSTOMER ORDER SHEET", pageWidth - 14, 11, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 215, 110);
  doc.text(`Invoice ID: ${order.orderId || 'NEW-ORDER'}`, pageWidth - 14, 17, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setTextColor(220, 225, 235);
  doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}`, pageWidth - 14, 22, { align: 'right' });

  // 2. Business & Customer Info Grid
  let startY = 36;

  // Left Column: Business Contact
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("SHOWROOM & FACTORY DISPATCH:", 14, startY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const shopAddr = doc.splitTextToSize(settings.address || "89, Sivasakthy Layout, Chettipalayam Rd, Echanari, Coimbatore - 641021", 85);
  doc.text(shopAddr, 14, startY + 4);
  const nextShopY = startY + 4 + (shopAddr.length * 3.5);
  doc.text(`Phone: ${settings.phone || '+91 95668 86795'} | Email: ${settings.email || 'sharpcrackars@gmail.com'}`, 14, nextShopY);

  // Right Column: Customer Details Box
  const boxX = 110;
  const boxWidth = pageWidth - boxX - 14;
  
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...grayBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(boxX, startY - 2, boxWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("CUSTOMER CONTACT DETAILS:", boxX + 4, startY + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Name: ${order.customer?.name || 'Customer'}`, boxX + 4, startY + 8);
  doc.text(`Mobile: ${order.customer?.phone || 'N/A'}`, boxX + 4, startY + 12.5);
  if (order.customer?.email) {
    doc.text(`Email: ${order.customer.email}`, boxX + 4, startY + 17);
  }

  let tableStartY = Math.max(nextShopY + 8, startY + 28);

  // 3. Tabular Product Rows
  const tableData = (order.items || []).map((item, index) => [
    (item.sno ? String(parseInt(item.sno, 10)).padStart(3, '0') : String(index + 1).padStart(3, '0')),
    item.code || '-',
    item.name || '-',
    item.packDetails || '1 pack',
    formatCur(item.unitPrice),
    item.quantity || 0,
    formatCur(item.totalPrice || ((item.unitPrice || 0) * (item.quantity || 0)))
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['S.No', 'Code', 'Product Description', 'Packing Details', 'Unit Price', 'Qty', 'Total']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      font: 'helvetica',
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'center', cellWidth: 20 },
      2: { cellWidth: 'auto' },
      3: { halign: 'center', cellWidth: 28 },
      4: { halign: 'right', cellWidth: 24 },
      5: { halign: 'center', cellWidth: 16, fontStyle: 'bold' },
      6: { halign: 'right', cellWidth: 26, fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14, bottom: 42 },
    didDrawPage: (data) => {
      // Running Page Footer
      const totalPagesExp = "{total_pages_count_string}";
      let str = "Page " + doc.internal.getNumberOfPages();
      if (typeof doc.putTotalPages === 'function') {
        str = str + " of " + totalPagesExp;
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(str, pageWidth / 2, pageHeight - 8, { align: 'center' });
      doc.text("SHARP CRACKERS • Official Order Sheet • Computer Generated", 14, pageHeight - 8);
    }
  });

  // Calculate Totals Section
  const finalY = doc.lastAutoTable.finalY + 4;
  const totalItemsCount = (order.items || []).length;
  const totalQuantity = (order.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0);
  const grandTotal = order.grandTotal || (order.items || []).reduce((sum, it) => sum + (it.totalPrice || (it.unitPrice * it.quantity)), 0);

  // Check if we need a new page for totals & signatures
  let summaryY = finalY;
  if (finalY > pageHeight - 48) {
    doc.addPage();
    summaryY = 20;
  }

  // Summary Box on Right (Total Varieties, Total Units, Total Amount - No Delivery/Pickup)
  const summaryX = pageWidth - 80;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...grayBorder);
  doc.roundedRect(summaryX, summaryY, 66, 21, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Varieties: ${totalItemsCount} items`, summaryX + 4, summaryY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Units: ${totalQuantity} pkts`, summaryX + 4, summaryY + 10.5);

  // Total Amount Highlight
  doc.setFillColor(...accentColor);
  doc.rect(summaryX, summaryY + 14, 66, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL AMOUNT:", summaryX + 4, summaryY + 18.5);
  doc.text(formatCur(grandTotal), summaryX + 62, summaryY + 18.5, { align: 'right' });

  // Left side notes & instructions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("TERMS & SPECIAL INSTRUCTIONS:", 14, summaryY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const terms = [
    "• 100% Genuine Sivakasi Green Crackers with authorized safety labels.",
    "• Please ignite outdoors under adult supervision and keep a bucket of water handy.",
    "• Please inspect and verify all packages before signoff."
  ];
  terms.forEach((t, i) => {
    doc.text(t, 14, summaryY + 9 + (i * 4));
  });

  if (order.customer?.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Customer Notes: "${order.customer.notes}"`, 14, summaryY + 23);
  }

  // Signature Blocks
  const sigY = summaryY + 34;
  if (sigY <= pageHeight - 16) {
    doc.setDrawColor(180, 190, 205);
    doc.setLineWidth(0.3);
    doc.line(14, sigY + 8, 64, sigY + 8);
    doc.line(pageWidth - 64, sigY + 8, pageWidth - 14, sigY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Customer Signature", 39, sigY + 12, { align: 'center' });
    doc.text("For SHARP CRACKERS (Auth. Signatory)", pageWidth - 39, sigY + 12, { align: 'center' });
  }

  // Replace total pages placeholder if supported
  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages("{total_pages_count_string}");
  }

  if (shouldDownload) {
    const filename = `Sharp_Crackers_Order_${order.orderId || 'New'}.pdf`;
    doc.save(filename);
  }

  return doc;
};

// Print dialog helper
export const printOrderDocument = (order, settings) => {
  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) {
    alert("Please allow popups to print the order invoice.");
    return;
  }

  const formatCur = (num) => `₹${Number(num || 0).toLocaleString('en-IN')}`;
  const totalQuantity = (order.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0);
  const grandTotal = order.grandTotal || (order.items || []).reduce((sum, it) => sum + ((it.unitPrice || 0) * (it.quantity || 0)), 0);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>SHARP CRACKERS - Order Sheet #${order.orderId || 'Draft'}</title>
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; margin: 0; padding: 15px; font-size: 13px; line-height: 1.4; }
          .header { border-bottom: 3px solid #ff6f00; padding-bottom: 12px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo-title { font-size: 24px; font-weight: 800; color: #0a1329; text-transform: uppercase; letter-spacing: 0.5px; }
          .tagline { font-size: 12px; color: #ff6f00; font-weight: 600; }
          .doc-title { text-align: right; }
          .doc-title h2 { margin: 0; font-size: 18px; color: #d90429; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px; }
          th { background: #0a1329; color: #ffffff; padding: 8px 6px; text-align: left; font-weight: 600; border: 1px solid #0a1329; }
          td { padding: 6px 6px; border: 1px solid #cbd5e1; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .summary-box { float: right; width: 280px; margin-bottom: 20px; border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 4px; overflow: hidden; }
          .summary-row { display: flex; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid #e2e8f0; }
          .grand-total { background: #d90429; color: #ffffff; font-weight: 700; font-size: 15px; }
          .clearfix::after { content: ""; clear: both; display: table; }
          .signatures { margin-top: 40px; display: flex; justify-content: space-between; }
          .sig-box { width: 200px; text-align: center; border-top: 1px solid #94a3b8; padding-top: 6px; font-size: 11px; color: #64748b; }
          .safety { font-size: 11px; color: #64748b; border-left: 3px solid #ffb703; padding-left: 8px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="/images/sharp_crackers_brand_logo.jpg" alt="Sharp Crackers Official Logo" style="width: 58px; height: 58px; object-fit: contain; border-radius: 8px; border: 2px solid #ff6f00; box-shadow: 0 2px 8px rgba(0,0,0,0.12); flex-shrink: 0;" />
            <div>
              <div class="logo-title">${settings.shopName || 'SHARP CRACKERS'}</div>
              <div class="tagline">${settings.tagline || 'Direct Sivakasi Fireworks Sales'}</div>
              <div style="font-size: 11px; color: #475569; margin-top: 4px;">
                ${settings.address || '89, Sivasakthy Layout, Chettipalayam Rd, Echanari, Coimbatore - 641021'}<br/>
                Phone: ${settings.phone || '+91 95668 86795'} | Email: ${settings.email || 'sharpcrackars@gmail.com'}
              </div>
            </div>
          </div>
          <div class="doc-title">
            <h2>Customer Order Sheet</h2>
            <div style="font-size: 13px; font-weight: bold; margin-top: 4px; color: #ff6f00;">Invoice ID: ${order.orderId || 'DRAFT'}</div>
            <div style="font-size: 11px; color: #64748b;">Date: ${new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div class="grid">
          <div>
            <strong>CUSTOMER CONTACT DETAILS:</strong><br/>
            <strong>Name:</strong> ${order.customer?.name || 'Customer'}<br/>
            <strong>Mobile:</strong> ${order.customer?.phone || 'N/A'}<br/>
            ${order.customer?.email ? `<strong>Email:</strong> ${order.customer.email}<br/>` : ''}
          </div>
          <div>
            <strong>ORDER SUMMARY:</strong><br/>
            <strong>Total Varieties:</strong> ${(order.items || []).length} items<br/>
            <strong>Total Quantity:</strong> ${totalQuantity} boxes/pkts<br/>
            ${order.customer?.notes ? `<strong>Notes:</strong> <em>${order.customer.notes}</em>` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="text-center" style="width: 35px;">S.No</th>
              <th class="text-center" style="width: 70px;">Code</th>
              <th>Product Name</th>
              <th class="text-center" style="width: 100px;">Pack Details</th>
              <th class="text-right" style="width: 80px;">Unit Price</th>
              <th class="text-center" style="width: 45px;">Qty</th>
              <th class="text-right" style="width: 90px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map((it, idx) => `
              <tr>
                <td class="text-center" style="font-family: monospace; font-weight: 700;">${it.sno ? String(parseInt(it.sno, 10)).padStart(3, '0') : String(idx + 1).padStart(3, '0')}</td>
                <td class="text-center" style="font-weight: 600;">${it.code || '-'}</td>
                <td><strong>${it.name}</strong></td>
                <td class="text-center">${it.packDetails || '1 pack'}</td>
                <td class="text-right">${formatCur(it.unitPrice)}</td>
                <td class="text-center" style="font-weight: 700;">${it.quantity}</td>
                <td class="text-right" style="font-weight: 700;">${formatCur(it.totalPrice || (it.unitPrice * it.quantity))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="clearfix">
          <div class="summary-box">
            <div class="summary-row">
              <span>Total Varieties:</span>
              <strong>${(order.items || []).length} items</strong>
            </div>
            <div class="summary-row">
              <span>Total Units / Quantity:</span>
              <strong>${totalQuantity} boxes/pkts</strong>
            </div>
            <div class="summary-row grand-total">
              <span>Total Order Amount:</span>
              <span>${formatCur(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div class="safety">
          <strong>Safe Handling Guidelines:</strong> Always light crackers in open outdoor grounds. Maintain safe distance. Keep water or sand nearby. Strictly follow Sivakasi Green Crackers precautions.
        </div>

        <div class="signatures">
          <div class="sig-box">Customer Signature</div>
          <div class="sig-box">Authorized Signatory<br/><strong>SHARP CRACKERS</strong></div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
