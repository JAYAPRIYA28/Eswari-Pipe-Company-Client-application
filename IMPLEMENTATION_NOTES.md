# Eswari Pipe and Fencing - Billing Platform

## Overview
A comprehensive web-based billing platform for a manufacturing business specializing in pipes, fencing, bending items, and fittings. The system supports both online and on-site purchases with complete order tracking, delivery management, and invoice generation.

## Key Features

### 🔐 Authentication System
- **Role-based Access Control**: Admin and User roles
- **Supabase Authentication**: Secure user management
- Automatic email confirmation for new users

### 📦 Product Management (Admin)
- Add, edit, and delete products
- Support for multiple sizes (in inches)
- Size-specific pricing configuration
- Stock quantity tracking
- Product images and specifications
- Categories: Pipes, Fencing, Bending Items, Fittings

### 🛒 Purchase Flows

#### Online Purchase
1. Customer browses products and selects specifications
2. Customer submits order for admin approval
3. Admin reviews and approves (with or without payment requirement)
4. Customer completes payment (if required)
5. Admin assigns delivery person
6. Delivery person marks as delivered/cancelled
7. PDF invoice generation

#### On-site Purchase (Admin Only)
1. Admin enters customer details (name, phone)
2. Admin adds products and quantities
3. Order completed instantly
4. PDF invoice auto-generated

### 📊 Admin Dashboard Features
- Product Management panel
- Order Management panel
- Real-time statistics
- Pending orders tracking
- Revenue analytics
- Sample data initialization

### 👤 User Dashboard Features
- View all orders
- Track order status
- Download invoices
- Quick access to product catalog

### 🚚 Order Tracking & Delivery
- Real-time order status updates
- Email notifications (simulated)
- Delivery assignment system
- Delivery confirmation/cancellation with reason
- Refund processing capability

### 📄 Document Generation
- **PDF Invoices**: Professional invoices with company branding
- **PDF Quotations**: Pre-order quotations
- Order type identification (Online/On-site/Admin Approved)

### 📈 Monthly History (Admin)
- Filter orders by month and year
- Order type breakdown (Online/On-site/Admin Approved)
- Status statistics (Completed/Pending/Cancelled)
- Revenue totals and averages
- Detailed order list with export capability

## Technical Architecture

### Frontend
- **React 18** with TypeScript
- **React Router 7** for navigation
- **Tailwind CSS v4** for styling
- **Radix UI** components
- **Lucide React** icons
- **Sonner** for toast notifications
- **jsPDF** for invoice generation

### Backend
- **Supabase** for:
  - User authentication
  - Database (KV Store)
  - Edge functions (Hono web server)
- **Deno** runtime for server

### Key API Endpoints
```
POST   /auth/signup              - Create new user
GET    /auth/user                - Get current user
GET    /products                 - List all products
POST   /products                 - Create product (Admin)
PUT    /products/:id             - Update product (Admin)
DELETE /products/:id             - Delete product (Admin)
GET    /orders                   - List orders (filtered by user)
POST   /orders                   - Create order
PUT    /orders/:id/status        - Update order status (Admin)
POST   /orders/:id/approve       - Approve order (Admin)
POST   /orders/:id/payment       - Process payment
POST   /orders/:id/assign-delivery - Assign delivery person (Admin)
POST   /orders/:id/delivery-status - Update delivery status
POST   /orders/:id/refund        - Process refund (Admin)
GET    /orders/history/:month/:year - Monthly history (Admin)
```

## Database Schema (KV Store)

### Products
```typescript
{
  id: string,
  name: string,
  description: string,
  category: string,
  basePrice: number,
  stock: number,
  sizes: string[],
  pricing: { [size: string]: number },
  imageUrl: string,
  specifications: string,
  createdAt: string,
  updatedAt: string
}
```

### Orders
```typescript
{
  id: string,
  productId: string,
  userId: string | null,
  orderType: 'online' | 'onsite',
  customerName: string,
  customerPhone: string,
  customerEmail: string,
  customerAddress: string,
  items: Array<{
    productName: string,
    size: string,
    quantity: number,
    price: number
  }>,
  totalAmount: number,
  status: string,
  requirePayment: boolean,
  paymentMethod: string,
  deliveryPersonName: string,
  deliveryPersonEmail: string,
  deliveryCancelReason: string,
  notes: string,
  createdAt: string,
  updatedAt: string
}
```

## Order Status Flow

### Online Orders
1. `pending_approval` - Order submitted, awaiting admin review
2. `approved_payment_pending` - Admin approved, payment required
3. `admin_approved` - Admin approved without payment
4. `paid` - Payment completed
5. `assigned_for_delivery` - Delivery person assigned
6. `delivered` - Order delivered successfully
7. `delivery_cancelled` - Delivery failed/cancelled
8. `refunded` - Refund processed

### On-site Orders
- `completed` - Order completed at facility

## Email Notifications (Simulated)
The system logs email notifications for:
- New order creation
- Admin approval/rejection
- Payment confirmation
- Delivery assignment
- Delivery status updates
- Refund processing

## Sample Data
The system includes a Sample Data Initializer that creates:
- GI Pipes (Galvanized Iron) - 9 sizes
- Steel Pipes - 6 sizes
- Chain Link Fencing - 5 sizes
- Pipe Fittings & Elbows - 6 sizes

## Getting Started

### For Admins
1. Create an account with role: "Admin/Staff"
2. Access Admin Dashboard
3. Initialize sample products (optional)
4. Add/manage products
5. Process orders and manage deliveries

### For Customers
1. Create an account with role: "Customer"
2. Browse products catalog
3. Select product and specifications
4. Generate quotation (optional)
5. Submit order for approval
6. Track order status
7. Complete payment when approved
8. Download invoice

## Security Considerations
- Admin-only routes protected with role verification
- Service role key kept server-side only
- User authentication via Supabase
- CORS enabled for API access

## Responsive Design
- Mobile-first approach
- Responsive navigation with mobile menu
- Optimized layouts for all screen sizes
- Touch-friendly interface

## Future Enhancements
- Real email integration (SMTP/SendGrid)
- SMS notifications
- Online payment gateway integration
- Advanced analytics and reporting
- Product inventory alerts
- Customer loyalty program
- Multi-language support

## Company Branding
- Logo: Eswari Pipe and Fencing (provided)
- Primary Color: Orange (#ea580c)
- Secondary Color: Green
- Professional PDF templates with company details

---

**Note**: This is a prototype/demo application. For production use, implement:
- Real payment processing
- Email server configuration
- Enhanced security measures
- Data backup and recovery
- Performance optimization
- Compliance with data protection regulations
