import jsPDF from 'jspdf';

const COMPANY_NAME = 'Eswari Pipe and Fencing';
const COMPANY_ADDRESS = 'Manufacturing & Supply Center';
const COMPANY_PHONE = '+91 99441-93276';
const COMPANY_EMAIL = 'info@eswaripipeandfencing.com';

export function generateInvoicePDF(order: any) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_NAME, 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_ADDRESS, 105, 28, { align: 'center' });
  doc.text(`${COMPANY_PHONE} | ${COMPANY_EMAIL}`, 105, 34, { align: 'center' });
  
  // Invoice title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 105, 50, { align: 'center' });
  
  // Invoice details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${order.id}`, 20, 65);
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, 72);
  doc.text(`Type: ${order.order_type || 'Online'}`, 20, 79);
  
  if (order.status === 'admin_approved') {
    doc.setFont('helvetica', 'bold');
    doc.text('ADMIN APPROVED', 150, 65);
    doc.setFont('helvetica', 'normal');
  }
  
  // Customer details
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, 95);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customer_name, 20, 102);
  doc.text(`Phone: ${order.customer_phone}`, 20, 109);
  if (order.customerEmail) {
    doc.text(`Email: ${order.customerEmail}`, 20, 116);
  }
  if (order.customer_address) {
    doc.text(`Address: ${order.customer_address}`, 20, 123);
  }
  
  // Table header
  const tableTop = 145;
doc.setFont('helvetica', 'bold');

doc.text('Product', 20, tableTop);
doc.text('Category', 70, tableTop);
doc.text('Size', 100, tableTop);
doc.text('Qty', 120, tableTop);
doc.text('Price', 140, tableTop);
doc.text('Amount', 170, tableTop);
  
  // Line under header
  doc.line(20, tableTop + 3, 190, tableTop + 3);
  
  // Table rows
  let yPos = tableTop + 12;
  doc.setFont('helvetica', 'normal');
  
 order.items.forEach((item: any) => {
  doc.text(item.productName || '', 20, yPos);

  doc.text(
    (item.category || '-').toUpperCase(),
    70,
    yPos
  );

  doc.text(item.size || '-', 100, yPos);

  doc.text(
    item.quantity.toString(),
    120,
    yPos
  );

  doc.text(
    `Rs. ${Number(item.price).toFixed(2)}`,
    140,
    yPos
  );

  doc.text(
    `Rs. ${(item.quantity * item.price).toFixed(2)}`,
    170,
    yPos
  );

  yPos += 8;
});
  
  // Line before total
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  
  // Total
// Tax Summary
const subtotal =
  order.subtotal ??
  order.items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

const gstPercentage = order.gstPercentage ?? 0;
const sgstPercentage = order.sgstPercentage ?? 0;

const cgst =
  order.gstAmount ??
  order.gst_amount ??
  (subtotal * gstPercentage) / 100;

const sgst =
  order.sgstAmount ??
  order.sgst_amount ??
  (subtotal * sgstPercentage) / 100;
  
const labelX = 140;
const valueX = 170;

doc.setFont('helvetica', 'normal');

doc.text('Subtotal:', labelX, yPos);
doc.text(`Rs. ${subtotal.toFixed(2)}`, valueX, yPos);

yPos += 8;

doc.text(
  `CGST (${order.gstPercentage}%):`,
  labelX,
  yPos
);
doc.text(
  `Rs. ${cgst.toFixed(2)}`,
  valueX,
  yPos
);

yPos += 8;

doc.text(
  `SGST (${order.sgstPercentage}%):`,
  labelX,
  yPos
);
doc.text( `Rs. ${sgst.toFixed(2)}`,
  valueX,
  yPos);

// Line before Grand Total

yPos += 10;

doc.line(labelX, yPos, 190, yPos);

yPos += 8;

doc.setFont('helvetica', 'bold');
doc.setFontSize(11);

doc.text('Grand Total:', labelX, yPos);
doc.text(
  `Rs. ${(subtotal + cgst + sgst).toFixed(2)}`,
  valueX,
  yPos
);



  // Payment status

  yPos += 8;

doc.setFont('helvetica', 'normal');

doc.text('Paid Amount:', labelX, yPos);
doc.text(
  `Rs. ${Number(order.paidAmount || order.paid_amount || 0).toFixed(2)}`,
  valueX,
  yPos
);

yPos += 8;

doc.text('Pending Amount:', labelX, yPos);
doc.text(
  `Rs. ${Number(order.pendingAmount || order.pending_amount || 0).toFixed(2)}`,
  valueX,
  yPos
);

  yPos += 15;
  doc.setFont('helvetica', 'normal');
  if (order.status === 'paid') {
  doc.text('Payment Status: PAID', 20, yPos);
}
else if (order.status === 'partial_paid') {
  doc.text('Payment Status: PARTIAL PAID', 20, yPos);

  doc.text(
    `Paid: Rs. ${Number(order.paidAmount || order.paid_amount || 0).toFixed(2)}`,
    20,
    yPos + 7
  );

  doc.text(
    `Pending: Rs. ${Number(order.pendingAmount || order.pending_amount || 0).toFixed(2)}`,
    20,
    yPos + 14
  );
}
else if (order.status === 'admin_approved') {
  doc.text(
    'Payment Status: Admin Approved - No Payment Required',
    20,
    yPos
  );
}
else {
  doc.text('Payment Status: Pending', 20, yPos);
}
  
  // Footer
  doc.setFontSize(8);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });
  
  // Download
  doc.save(`Invoice_${order.user_id}.pdf`);
}

export function generateQuotationPDF(quotation: any) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_NAME, 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_ADDRESS, 105, 28, { align: 'center' });
  doc.text(`${COMPANY_PHONE} | ${COMPANY_EMAIL}`, 105, 34, { align: 'center' });
  
  // Quotation title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', 105, 50, { align: 'center' });
  
  // Quotation details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quotation No: ${quotation.id}`, 20, 65);
  doc.text(`Date: ${new Date(quotation.created_at).toLocaleDateString()}`, 20, 72);
  doc.text('Valid for: 30 days', 20, 79);
  
  // Customer details
  doc.setFont('helvetica', 'bold');
  doc.text('Prepared For:', 20, 95);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.customer_name, 20, 102);
  doc.text(`Phone: ${quotation.customer_phone}`, 20, 109);
  if (quotation.customer_email) {
    doc.text(`Email: ${quotation.customer_email}`, 20, 116);
  }
  const tableTop = 135;
// Table header
// Header
doc.text('Product', 20, tableTop);
doc.text('Category', 80, tableTop);
doc.text('Size', 110, tableTop);
doc.text('Qty', 130, tableTop);
doc.text('Rate', 150, tableTop);
doc.text('Amount', 175, tableTop);
  
  // Line under header
  doc.line(20, tableTop + 3, 190, tableTop + 3);
  
  // Table rows
  let yPos = tableTop + 12;
  doc.setFont('helvetica', 'normal');
  
quotation.items.forEach((item: any) => {
  doc.text(item.productName || '', 20, yPos);

  doc.text(
    (item.category || '-').toUpperCase(),
    70,
    yPos
  );

  doc.text(item.size || '-', 100, yPos);

  doc.text(
    item.quantity.toString(),
    120,
    yPos
  );

  doc.text(
    `Rs. ${Number(item.price).toFixed(2)}`,
    140,
    yPos
  );

  doc.text(
    `Rs. ${(item.quantity * item.price).toFixed(2)}`,
    170,
    yPos
  );

  yPos += 8;
});
  
  // Line before total
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.text('Total Estimated Amount:', 120, yPos);
 doc.text(
  `Rs. ${quotation.total_amount.toFixed(2)}`,
  165,
  yPos
);
  // Terms
  yPos += 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  doc.text('1. Prices are subject to change without prior notice', 20, yPos);
  yPos += 5;
  doc.text('2. This quotation is valid for 30 days from the date of issue', 20, yPos);
  yPos += 5;
  doc.text('3. Delivery charges may apply based on location', 20, yPos);
  
  // Footer
  doc.setFontSize(8);
  doc.text('Thank you for considering Eswari Pipe and Fencing!', 105, 280, { align: 'center' });
  
  // Download
  doc.save(`Quotation_${quotation.id}.pdf`);
}
