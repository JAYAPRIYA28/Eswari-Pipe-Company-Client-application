import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-a728d0ce/health", (c) => {
  return c.json({ status: "ok" });
});

// ============================================
// AUTH ROUTES
// ============================================

// Sign up endpoint
app.post("/make-server-a728d0ce/auth/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: role || 'user' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Error during signup process: ${error}`);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Get current user
app.get("/make-server-a728d0ce/auth/user", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    return c.json({ user });
  } catch (error) {
    console.log(`Error getting user: ${error}`);
    return c.json({ error: 'Failed to get user' }, 500);
  }
});

// ============================================
// PRODUCT ROUTES
// ============================================

// Get all products
app.get("/make-server-a728d0ce/products", async (c) => {
  try {
    const products = await kv.getByPrefix('product_');
    return c.json({ products });
  } catch (error) {
    console.log(`Error fetching products: ${error}`);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// Get single product
app.get("/make-server-a728d0ce/products/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const product = await kv.get(`product_${id}`);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    return c.json({ product });
  } catch (error) {
    console.log(`Error fetching product: ${error}`);
    return c.json({ error: 'Failed to fetch product' }, 500);
  }
});

// Create product (Admin only)
app.post("/make-server-a728d0ce/products", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const productData = await c.req.json();
    const productId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const product = {
      id: productId,
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`product_${productId}`, product);
    return c.json({ product });
  } catch (error) {
    console.log(`Error creating product: ${error}`);
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

// Update product (Admin only)
app.put("/make-server-a728d0ce/products/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`product_${id}`);

    if (!existing) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const product = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`product_${id}`, product);
    return c.json({ product });
  } catch (error) {
    console.log(`Error updating product: ${error}`);
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

// Delete product (Admin only)
app.delete("/make-server-a728d0ce/products/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const id = c.req.param('id');
    await kv.del(`product_${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting product: ${error}`);
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});

// ============================================
// ORDER ROUTES
// ============================================

// Get all orders
app.get("/make-server-a728d0ce/orders", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allOrders = await kv.getByPrefix('order_');
    
    // If user is admin, return all orders; otherwise, return only user's orders
    if (user.user_metadata?.role === 'admin') {
      return c.json({ orders: allOrders });
    } else {
      const userOrders = allOrders.filter((order: any) => order.userId === user.id);
      return c.json({ orders: userOrders });
    }
  } catch (error) {
    console.log(`Error fetching orders: ${error}`);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// Get single order
app.get("/make-server-a728d0ce/orders/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const order = await kv.get(`order_${id}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Check if user has access to this order
    if (user.user_metadata?.role !== 'admin' && order.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    return c.json({ order });
  } catch (error) {
    console.log(`Error fetching order: ${error}`);
    return c.json({ error: 'Failed to fetch order' }, 500);
  }
});

// Create order
app.post("/make-server-a728d0ce/orders", async (c) => {
  try {
    const orderData = await c.req.json();
    const orderId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const order = {
      id: orderId,
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`order_${orderId}`, order);
    
    // Send email notification to admin (simulated)
    console.log(`Email notification: New order ${orderId} created`);
    
    return c.json({ order });
  } catch (error) {
    console.log(`Error creating order: ${error}`);
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

// Update order status
app.put("/make-server-a728d0ce/orders/:id/status", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const id = c.req.param('id');
    const { status, reason } = await c.req.json();
    const existing = await kv.get(`order_${id}`);

    if (!existing) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const order = {
      ...existing,
      status,
      reason: reason || existing.reason,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`order_${id}`, order);
    
    // Send email notification (simulated)
    console.log(`Email notification: Order ${id} status updated to ${status}`);
    
    return c.json({ order });
  } catch (error) {
    console.log(`Error updating order status: ${error}`);
    return c.json({ error: 'Failed to update order status' }, 500);
  }
});

// Request admin approval (for online orders)
app.post("/make-server-a728d0ce/orders/:id/request-approval", async (c) => {
  try {
    const id = c.req.param('id');
    const existing = await kv.get(`order_${id}`);

    if (!existing) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const order = {
      ...existing,
      status: 'pending_approval',
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`order_${id}`, order);
    
    // Send email notification to admin (simulated)
    console.log(`Email notification: Order ${id} awaiting admin approval`);
    
    return c.json({ order });
  } catch (error) {
    console.log(`Error requesting approval: ${error}`);
    return c.json({ error: 'Failed to request approval' }, 500);
  }
});

// Admin approve order
app.post("/make-server-a728d0ce/orders/:id/approve", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const id = c.req.param('id');
    const { requirePayment } = await c.req.json();
    const existing = await kv.get(`order_${id}`);

    if (!existing) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const order = {
      ...existing,
      status: requirePayment ? 'approved_payment_pending' : 'admin_approved',
      requirePayment,
      approvedBy: user.id,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`order_${id}`, order);
    
    // Send email notification to user (simulated)
    console.log(`Email notification: Order ${id} approved by admin`);
    
    return c.json({ order });
  } catch (error) {
    console.log(`Error approving order: ${error}`);
    return c.json({ error: 'Failed to approve order' }, 500);
  }
});

// Process payment
app.post("/make-server-a728d0ce/orders/:id/payment", async (c) => {
  try {
    const id = c.req.param('id');
    const { paymentMethod } = await c.req.json();
    const existing = await kv.get(`order_${id}`);

    if (!existing) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const order = {
      ...existing,
      status: 'paid',
      paymentMethod,
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`order_${id}`, order);
    
    // Send email notification (simulated)
    console.log(`Email notification: Payment received for order ${id}`);
    
    return c.json({ order });
  } catch (error) {
    console.log(`Error processing payment: ${error}`);
    return c.json({ error: 'Failed to process payment' }, 500);
  }
});

// Assign delivery person
app.post("/make-server-a728d0ce/orders/:id/assign-delivery", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const id = c.req.param('id');
    const { deliveryPersonEmail, deliveryPersonName } = await c.req.json();
    const existing = await kv.get(`order_${id}`);

    if (!existing) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const order = {
      ...existing,
      status: 'assigned_for_delivery',
      deliveryPersonEmail,
      deliveryPersonName,
      assignedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`order_${id}`, order);
    
    // Send email notification to delivery person (simulated)
    console.log(`Email notification: Delivery assigned to ${deliveryPersonEmail} for order ${id}`);
    
    return c.json({ order });
  } catch (error) {
    console.log(`Error assigning delivery: ${error}`);
    return c.json({ error: 'Failed to assign delivery' }, 500);
  }
});

// Mark as delivered/cancel delivery
app.post("/make-server-a728d0ce/orders/:id/delivery-status", async (c) => {
  try {
    const id = c.req.param('id');
    const { delivered, reason } = await c.req.json();
    const existing = await kv.get(`order_${id}`);

    if (!existing) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const order = {
      ...existing,
      status: delivered ? 'delivered' : 'delivery_cancelled',
      deliveryCancelReason: reason,
      deliveredAt: delivered ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`order_${id}`, order);
    
    // Send email notification (simulated)
    if (delivered) {
      console.log(`Email notification: Order ${id} marked as delivered`);
    } else {
      console.log(`Email notification: Delivery cancelled for order ${id}. Reason: ${reason}`);
    }
    
    return c.json({ order });
  } catch (error) {
    console.log(`Error updating delivery status: ${error}`);
    return c.json({ error: 'Failed to update delivery status' }, 500);
  }
});

// Process refund
app.post("/make-server-a728d0ce/orders/:id/refund", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const id = c.req.param('id');
    const existing = await kv.get(`order_${id}`);

    if (!existing) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const order = {
      ...existing,
      status: 'refunded',
      refundedAt: new Date().toISOString(),
      refundedBy: user.id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`order_${id}`, order);
    
    // Send email notification (simulated)
    console.log(`Email notification: Refund processed for order ${id}`);
    
    return c.json({ order });
  } catch (error) {
    console.log(`Error processing refund: ${error}`);
    return c.json({ error: 'Failed to process refund' }, 500);
  }
});

// Get monthly order history
app.get("/make-server-a728d0ce/orders/history/:month/:year", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const month = parseInt(c.req.param('month'));
    const year = parseInt(c.req.param('year'));
    
    const allOrders = await kv.getByPrefix('order_');
    
    const monthlyOrders = allOrders.filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() + 1 === month && orderDate.getFullYear() === year;
    });

    const totalAmount = monthlyOrders.reduce((sum: number, order: any) => {
      return sum + (order.totalAmount || 0);
    }, 0);

    return c.json({ orders: monthlyOrders, totalAmount, month, year });
  } catch (error) {
    console.log(`Error fetching monthly history: ${error}`);
    return c.json({ error: 'Failed to fetch monthly history' }, 500);
  }
});

// ============================================
// QUOTATION ROUTES
// ============================================

// Create quotation
app.post("/make-server-a728d0ce/quotations", async (c) => {
  try {
    const quotationData = await c.req.json();
    const quotationId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const quotation = {
      id: quotationId,
      ...quotationData,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`quotation_${quotationId}`, quotation);
    return c.json({ quotation });
  } catch (error) {
    console.log(`Error creating quotation: ${error}`);
    return c.json({ error: 'Failed to create quotation' }, 500);
  }
});

// Get quotation
app.get("/make-server-a728d0ce/quotations/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const quotation = await kv.get(`quotation_${id}`);
    
    if (!quotation) {
      return c.json({ error: 'Quotation not found' }, 404);
    }

    return c.json({ quotation });
  } catch (error) {
    console.log(`Error fetching quotation: ${error}`);
    return c.json({ error: 'Failed to fetch quotation' }, 500);
  }
});

Deno.serve(app.fetch);
