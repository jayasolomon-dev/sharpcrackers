// ==========================================================================
// SHARP CRACKERS - POS THERMAL RECEIPT & INVOICE GENERATOR (80MM ROLL)
// Generates standard 80mm (3-inch) POS thermal receipts with official Logo,
// items table, customer details, guidelines, and authorized digital signature.
// Optimized for zero overflow & responsive alignment on mobile and POS printers.
// ==========================================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SHARP_LOGO_INVOICE_BASE64 } from './logoInvoiceBase64.js';
import { SHARP_SIGNATURE_BASE64 } from './signatureBase64.js';

/**
 * Generates and downloads a thermal receipt (80mm width POS format) as PDF.
 * Uses dynamic height with ample margin to guarantee zero overflow/cutoff on mobile devices.
 */
export const generateOrderPdf = (order, settings, shouldDownload = true) => {
  const jsPDFClass = typeof jsPDF === 'function' ? jsPDF : (jsPDF.jsPDF || jsPDF);

  const receiptWidth = 80; // Standard 80mm POS thermal receipt width
  const totalItems = (order.items || []).length;
  const totalQuantity = (order.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0);
  const grandTotal = order.grandTotal || (order.items || []).reduce((sum, it) => sum + ((it.unitPrice || 0) * (it.quantity || 0)), 0);

  // Dynamic height calculation with generous vertical headroom
  // Header (~55mm) + Meta (~32mm) + Table (~12 + items*8.5mm) + Totals (~30mm) + Safety (~26mm) + Signatures (~32mm) + Footer (~25mm)
  const baseThermalHeight = 225;
  const itemsHeight = totalItems * 9;
  const notesHeight = order.customer?.notes ? 14 : 0;
  const calculatedHeight = Math.max(235, Math.ceil(baseThermalHeight + itemsHeight + notesHeight));

  const doc = new jsPDFClass({
    orientation: 'portrait',
    unit: 'mm',
    format: [receiptWidth, calculatedHeight]
  });

  const formatCur = (num) => `Rs. ${Number(num || 0).toLocaleString('en-IN')}`;

  // Helper for dashed receipt dividers (spans width 4mm to 76mm)
  const drawDashedLine = (y) => {
    doc.setDrawColor(130, 130, 130);
    doc.setLineWidth(0.2);
    if (typeof doc.setLineDashPattern === 'function') {
      doc.setLineDashPattern([1.2, 1], 0);
    } else if (typeof doc.setLineDash === 'function') {
      doc.setLineDash([1.2, 1], 0);
    }
    doc.line(4, y, 76, y);
    if (typeof doc.setLineDashPattern === 'function') {
      doc.setLineDashPattern([], 0);
    } else if (typeof doc.setLineDash === 'function') {
      doc.setLineDash([], 0);
    }
  };

  let currentY = 5;

  // 1. Official Brand Logo (Centered)
  if (SHARP_LOGO_INVOICE_BASE64) {
    try {
      const logoWidth = 15;
      const logoHeight = 15;
      const logoX = 40 - (logoWidth / 2);
      doc.addImage(SHARP_LOGO_INVOICE_BASE64, 'JPEG', logoX, currentY, logoWidth, logoHeight);
      currentY += logoHeight + 2;
    } catch (e) {
      console.warn("Thermal receipt logo render fallback:", e);
    }
  }

  // 2. Shop Name & Details (Centered POS Header)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(15, 23, 42);
  doc.text(settings.shopName || "SHARP CRACKERS", 40, currentY, { align: 'center' });
  currentY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);
  doc.text(settings.tagline || "Light Up Your Celebrations!", 40, currentY, { align: 'center' });
  currentY += 3.5;

  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text("100% Genuine Sivakasi Green Crackers", 40, currentY, { align: 'center' });
  currentY += 3.5;

  const shopAddress = settings.address || "89, Sivasakthy Layout, Chettipalayam Rd, Echanari, Coimbatore - 641021";
  const addressLines = doc.splitTextToSize(shopAddress, 70);
  doc.text(addressLines, 40, currentY, { align: 'center' });
  currentY += (addressLines.length * 3) + 0.5;

  const phoneText = `Ph: ${settings.phone || '+91 95668 86785'}`;
  const emailText = settings.email || 'sharpcrackars@gmail.com';
  doc.text(`${phoneText} | ${emailText}`, 40, currentY, { align: 'center' });
  currentY += 4;

  // Divider
  drawDashedLine(currentY);
  currentY += 3.5;

  // 3. Receipt Title & Order Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text("RETAIL INVOICE / ORDER RECEIPT", 40, currentY, { align: 'center' });
  currentY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Invoice ID:`, 4, currentY);
  doc.text(`#${order.orderId || 'NEW-ORDER'}`, 76, currentY, { align: 'right' });
  currentY += 3.8;

  const orderDateStr = new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text(`Date & Time:`, 4, currentY);
  doc.text(orderDateStr, 76, currentY, { align: 'right' });
  currentY += 3.8;

  // Customer Details (Responsive font sizing for long names/emails)
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`Customer:`, 4, currentY);
  doc.setFont('helvetica', 'normal');
  const custName = String(order.customer?.name || 'Walk-in Customer').trim();
  if (custName.length > 25) doc.setFontSize(6.2);
  else doc.setFontSize(7);
  doc.text(custName, 76, currentY, { align: 'right' });
  doc.setFontSize(7);
  currentY += 3.8;

  doc.setFont('helvetica', 'bold');
  doc.text(`Mobile:`, 4, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${order.customer?.phone || 'N/A'}`, 76, currentY, { align: 'right' });
  currentY += 3.8;

  if (order.customer?.email) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Email:`, 4, currentY);
    doc.setFont('helvetica', 'normal');
    const custEmail = String(order.customer.email).trim();
    if (custEmail.length > 23) doc.setFontSize(6.2);
    else doc.setFontSize(7);
    doc.text(custEmail, 76, currentY, { align: 'right' });
    doc.setFontSize(7);
    currentY += 3.8;
  }

  if (order.customer?.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Notes:`, 4, currentY);
    doc.setFont('helvetica', 'italic');
    const noteLines = doc.splitTextToSize(order.customer.notes, 50);
    doc.text(noteLines, 76, currentY, { align: 'right' });
    currentY += (noteLines.length * 3.5);
  }

  // Divider
  drawDashedLine(currentY);
  currentY += 2;

  // 4. Products Table (Clean POS Thermal Format - 72mm Width)
  const tableData = (order.items || []).map((item, index) => {
    const sno = item.sno ? String(parseInt(item.sno, 10)).padStart(2, '0') : String(index + 1).padStart(2, '0');
    const nameWithPack = item.packDetails ? `${item.name || '-'}\n[${item.packDetails}]` : (item.name || '-');
    return [
      sno,
      nameWithPack,
      String(item.quantity || 0),
      formatCur(item.unitPrice),
      formatCur(item.totalPrice || ((item.unitPrice || 0) * (item.quantity || 0)))
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Item / Pack Details', 'Qty', 'Rate', 'Total']],
    body: tableData,
    theme: 'plain',
    styles: {
      fontSize: 6.8,
      cellPadding: 1.4,
      font: 'helvetica',
      textColor: [20, 20, 20],
      overflow: 'linebreak',
      valign: 'middle'
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.15,
      lineColor: [140, 140, 140]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 7 },
      1: { cellWidth: 31 },
      2: { halign: 'center', cellWidth: 8, fontStyle: 'bold' },
      3: { halign: 'right', cellWidth: 12 },
      4: { halign: 'right', cellWidth: 14, fontStyle: 'bold' }
    },
    margin: { left: 4, right: 4 },
    tableWidth: 72,
    didDrawCell: (data) => {
      // Dotted horizontal border under each row for authentic receipt look
      if (data.section === 'body' && data.row.index !== undefined) {
        doc.setDrawColor(225, 225, 225);
        doc.setLineWidth(0.1);
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
      }
    }
  });

  currentY = (doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY : currentY + 20) + 3;

  // 5. Order Totals Section
  drawDashedLine(currentY);
  currentY += 3.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(50, 50, 50);
  doc.text(`Total Varieties:`, 5, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${totalItems} items`, 75, currentY, { align: 'right' });
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Units / Pkts:`, 5, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${totalQuantity} boxes/pkts`, 75, currentY, { align: 'right' });
  currentY += 5;

  // Grand Total Highlight Box (Centered 72mm Width)
  doc.setFillColor(242, 242, 242);
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.35);
  doc.roundedRect(4, currentY, 72, 8.5, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text("TOTAL AMOUNT:", 6, currentY + 5.5);
  doc.text(formatCur(grandTotal), 74, currentY + 5.5, { align: 'right' });
  currentY += 12;

  // 6. Safety Guidelines & Terms
  drawDashedLine(currentY);
  currentY += 3.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(0, 0, 0);
  doc.text("SAFETY GUIDELINES & TERMS:", 40, currentY, { align: 'center' });
  currentY += 3.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(70, 70, 70);
  const terms = [
    "• 100% Sivakasi Green Crackers (Scan QR for safety).",
    "• Always ignite outdoors under adult supervision.",
    "• Keep a bucket of water or sand nearby for safety.",
    "• Please verify all packages before signoff."
  ];
  terms.forEach(term => {
    doc.text(term, 4, currentY);
    currentY += 3.2;
  });
  currentY += 2;

  // 7. Signature Section (Dual: Customer & Authorized Digital Signature)
  drawDashedLine(currentY);
  currentY += 2.5;

  const sigBlockY = currentY;

  // Left: Customer Signature
  doc.setDrawColor(140, 140, 140);
  doc.setLineWidth(0.25);
  doc.line(5, sigBlockY + 12, 35, sigBlockY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(80, 80, 80);
  doc.text("Customer Signature", 20, sigBlockY + 15.5, { align: 'center' });

  // Right: Authorized Signatory with base64 signature
  if (SHARP_SIGNATURE_BASE64) {
    try {
      const sigWidth = 26;
      const sigHeight = 7.5;
      const sigX = 60 - (sigWidth / 2);
      const sigImgY = sigBlockY + 12 - sigHeight - 0.5;
      doc.addImage(SHARP_SIGNATURE_BASE64, 'PNG', sigX, sigImgY, sigWidth, sigHeight);
    } catch (e) {
      console.warn("Invoice signature render fallback:", e);
    }
  }

  doc.line(45, sigBlockY + 12, 75, sigBlockY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(0, 0, 0);
  doc.text("Authorized Signatory", 60, sigBlockY + 15.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(70, 70, 70);
  doc.text("For SHARP CRACKERS", 60, sigBlockY + 19, { align: 'center' });

  currentY = sigBlockY + 23;

  // 8. Footer Salutation (Full visibility guaranteed with proper padding)
  drawDashedLine(currentY);
  currentY += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text("THANK YOU FOR YOUR ORDER!", 40, currentY, { align: 'center' });
  currentY += 3.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(80, 80, 80);
  doc.text("Light Up Your Celebrations Safely!", 40, currentY, { align: 'center' });
  currentY += 3.2;
  doc.text("*** Computer Generated Thermal Invoice ***", 40, currentY, { align: 'center' });

  if (shouldDownload) {
    const filename = `Sharp_Crackers_Receipt_${order.orderId || 'New'}.pdf`;
    doc.save(filename);
  }

  return doc;
};

/**
 * Opens browser print dialog with dedicated 80mm thermal receipt template.
 * Fully responsive on mobile screens with zero horizontal/vertical overflow.
 */
export const printOrderDocument = (order, settings) => {
  const printWindow = window.open('', '_blank', 'width=450,height=750');
  if (!printWindow) {
    alert("Please allow popups to print the thermal order invoice.");
    return;
  }

  const formatCur = (num) => `₹${Number(num || 0).toLocaleString('en-IN')}`;
  const totalQuantity = (order.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0);
  const grandTotal = order.grandTotal || (order.items || []).reduce((sum, it) => sum + ((it.unitPrice || 0) * (it.quantity || 0)), 0);

  const orderDateStr = new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>SHARP CRACKERS - Thermal Receipt #${order.orderId || 'Draft'}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          html, body {
            width: 100%;
            max-width: 80mm;
            margin: 0 auto;
            padding: 5mm 3.5mm;
            font-family: 'Courier New', Courier, monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #000;
            background: #fff;
            font-size: 11px;
            line-height: 1.35;
            overflow-x: hidden;
            word-break: break-word;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .bold { font-weight: 700; }

          .header {
            text-align: center;
            margin-bottom: 6px;
          }
          .logo-img {
            width: 48px;
            height: 48px;
            object-fit: contain;
            margin: 0 auto 5px;
            display: block;
            border-radius: 6px;
            border: 1px solid #ccc;
          }
          .shop-title {
            font-size: 16px;
            font-weight: 900;
            letter-spacing: 0.5px;
            margin: 0;
            text-transform: uppercase;
          }
          .shop-tagline {
            font-size: 10px;
            color: #333;
            margin: 2px 0;
          }
          .shop-desc {
            font-size: 9.5px;
            color: #555;
            margin: 2px 0;
          }
          .shop-addr {
            font-size: 9.5px;
            color: #444;
            margin: 2px 0;
          }
          .shop-contact {
            font-size: 9.5px;
            color: #333;
            margin: 2px 0;
            font-weight: 600;
          }

          .dashed-divider {
            border-top: 1px dashed #444;
            margin: 6px 0;
          }
          .double-divider {
            border-top: 2px solid #000;
            margin: 6px 0;
          }

          .receipt-title {
            text-align: center;
            font-weight: 800;
            font-size: 11.5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 4px 0;
          }

          .meta-table {
            width: 100%;
            font-size: 10.5px;
            margin-bottom: 4px;
            border-collapse: collapse;
            table-layout: fixed;
          }
          .meta-table td {
            padding: 1.5px 0;
            vertical-align: top;
            word-break: break-word;
          }

          .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin: 4px 0;
            table-layout: fixed;
          }
          .items-table th {
            border-top: 1px dashed #444;
            border-bottom: 1px dashed #444;
            padding: 4px 1px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .items-table td {
            padding: 3.5px 1px;
            border-bottom: 1px dotted #ccc;
            vertical-align: top;
            word-break: break-word;
          }
          .pack-badge {
            font-size: 9px;
            color: #555;
            display: block;
          }

          .summary-block {
            margin: 6px 0;
            font-size: 11px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
          }
          .grand-total-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1.5px solid #000;
            background: #f7f7f7;
            padding: 5px 8px;
            font-size: 13px;
            font-weight: 900;
            margin-top: 5px;
            border-radius: 4px;
          }

          .safety-block {
            font-size: 9px;
            color: #444;
            line-height: 1.35;
            margin: 6px 0;
          }
          .safety-title {
            font-weight: 800;
            text-align: center;
            margin-bottom: 3px;
            text-transform: uppercase;
            font-size: 9.5px;
          }

          .signatures-wrap {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 24px;
            margin-bottom: 8px;
          }
          .sig-col {
            width: 48%;
            text-align: center;
          }
          .sig-line {
            border-top: 1px solid #555;
            padding-top: 4px;
            font-size: 9px;
            color: #333;
          }
          .sig-img {
            max-height: 34px;
            max-width: 105px;
            display: block;
            margin: 0 auto 3px;
            object-fit: contain;
          }

          .footer-note {
            text-align: center;
            font-size: 9.5px;
            color: #555;
            margin-top: 6px;
          }
          .footer-salute {
            font-weight: 800;
            font-size: 10.5px;
            color: #000;
          }

          @media print {
            body {
              margin: 0;
              padding: 3mm 2mm;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <img src="${SHARP_LOGO_INVOICE_BASE64 || '/images/sharp_crackers_brand_logo.jpg'}" alt="Sharp Crackers Official Logo" class="logo-img" />
          <h1 class="shop-title">${settings.shopName || 'SHARP CRACKERS'}</h1>
          <div class="shop-tagline">${settings.tagline || 'Light Up Your Celebrations!'}</div>
          <div class="shop-desc">100% Genuine Sivakasi Green Crackers</div>
          <div class="shop-addr">${settings.address || '89, Sivasakthy Layout, Chettipalayam Rd, Echanari, Coimbatore - 641021'}</div>
          <div class="shop-contact">Ph: ${settings.phone || '+91 95668 86785'} | ${settings.email || 'sharpcrackars@gmail.com'}</div>
        </div>

        <div class="dashed-divider"></div>
        <div class="receipt-title">Retail Invoice / Order Receipt</div>
        <div class="dashed-divider"></div>

        <!-- Meta Table -->
        <table class="meta-table">
          <tr>
            <td class="bold" style="width: 32%;">Invoice ID:</td>
            <td class="text-right bold">#${order.orderId || 'NEW-ORDER'}</td>
          </tr>
          <tr>
            <td class="bold">Date & Time:</td>
            <td class="text-right">${orderDateStr}</td>
          </tr>
          <tr>
            <td class="bold">Customer:</td>
            <td class="text-right">${order.customer?.name || 'Walk-in Customer'}</td>
          </tr>
          <tr>
            <td class="bold">Mobile:</td>
            <td class="text-right">${order.customer?.phone || 'N/A'}</td>
          </tr>
          ${order.customer?.email ? `
          <tr>
            <td class="bold">Email:</td>
            <td class="text-right" style="font-size: 9.5px;">${order.customer.email}</td>
          </tr>` : ''}
          ${order.customer?.notes ? `
          <tr>
            <td class="bold">Notes:</td>
            <td class="text-right"><em>${order.customer.notes}</em></td>
          </tr>` : ''}
        </table>

        <!-- Products Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th class="text-center" style="width: 20px;">#</th>
              <th class="text-left">Item</th>
              <th class="text-center" style="width: 30px;">Qty</th>
              <th class="text-right" style="width: 48px;">Rate</th>
              <th class="text-right" style="width: 58px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map((it, idx) => `
              <tr>
                <td class="text-center bold">${it.sno ? String(parseInt(it.sno, 10)).padStart(2, '0') : String(idx + 1).padStart(2, '0')}</td>
                <td class="text-left">
                  <div class="bold">${it.name}</div>
                  ${it.packDetails ? `<span class="pack-badge">${it.packDetails}</span>` : ''}
                </td>
                <td class="text-center bold">${it.quantity}</td>
                <td class="text-right">${formatCur(it.unitPrice)}</td>
                <td class="text-right bold">${formatCur(it.totalPrice || (it.unitPrice * it.quantity))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Order Summary -->
        <div class="summary-block">
          <div class="summary-row">
            <span>Total Varieties:</span>
            <span class="bold">${(order.items || []).length} items</span>
          </div>
          <div class="summary-row">
            <span>Total Units / Quantity:</span>
            <span class="bold">${totalQuantity} boxes/pkts</span>
          </div>
          <div class="grand-total-box">
            <span>TOTAL AMOUNT:</span>
            <span>${formatCur(grandTotal)}</span>
          </div>
        </div>

        <div class="dashed-divider"></div>

        <!-- Safety Guidelines -->
        <div class="safety-block">
          <div class="safety-title">Safety Guidelines & Terms:</div>
          <div>• 100% Genuine Sivakasi Green Crackers with authorized safety seal.</div>
          <div>• Always light crackers outdoors under adult supervision.</div>
          <div>• Keep a bucket of water or sand nearby for emergency safety.</div>
          <div>• Please inspect and verify all cracker packages before signoff.</div>
        </div>

        <div class="dashed-divider"></div>

        <!-- Signatures (Customer & Digital Sign) -->
        <div class="signatures-wrap">
          <div class="sig-col">
            <div style="height: 34px;"></div>
            <div class="sig-line">Customer Signature</div>
          </div>
          <div class="sig-col">
            ${SHARP_SIGNATURE_BASE64 ? `<img src="${SHARP_SIGNATURE_BASE64}" class="sig-img" alt="Digital Signature" />` : '<div style="height: 34px;"></div>'}
            <div class="sig-line">
              <span class="bold">Authorized Signatory</span><br/>
              <span style="font-size: 8.5px; color: #666;">For SHARP CRACKERS</span>
            </div>
          </div>
        </div>

        <div class="dashed-divider"></div>

        <!-- Footer -->
        <div class="footer-note">
          <div class="footer-salute">THANK YOU FOR YOUR ORDER!</div>
          <div>Wish You A Joyous & Safe Celebration! 🎆</div>
          <div style="margin-top: 3px; font-size: 8.5px; color: #777;">*** Computer Generated Thermal Slip ***</div>
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
