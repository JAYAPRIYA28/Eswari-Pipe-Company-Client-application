import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { orderApi } from '../utils/api';
import { authService } from '../utils/auth';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Package, Eye, FileText, ShoppingCart } from 'lucide-react';

export function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadOrders();
  }, []);

  const [statusFilter, setStatusFilter] = useState("all");

  const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");

  const statusConfig: Record<
  string,
  { variant: any; label: string; color: string }
> = {
  pending_approval: {
    variant: "default",
    label: "Pending Approval",
    color: "bg-yellow-100 text-yellow-800",
  },

  partial_paid: {
    variant: "default",
    label: "Partial Paid",
    color: "bg-orange-100 text-orange-800",
  },

  paid: {
    variant: "default",
    label: "Paid",
    color: "bg-green-100 text-green-800",
  },

  approved_payment_pending: {
    variant: "default",
    label: "Payment Pending",
    color: "bg-blue-100 text-blue-800",
  },

  admin_approved: {
    variant: "default",
    label: "Approved",
    color: "bg-green-100 text-green-800",
  },

  assigned_for_delivery: {
    variant: "default",
    label: "Out for Delivery",
    color: "bg-purple-100 text-purple-800",
  },

  delivered: {
    variant: "default",
    label: "Delivered",
    color: "bg-green-100 text-green-800",
  },

  completed: {
    variant: "default",
    label: "Completed",
    color: "bg-green-100 text-green-800",
  },

  delivery_cancelled: {
    variant: "destructive",
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
  },
};

const filteredOrders = orders.filter((order) => {
  const orderDate = new Date(order.created_at);

  const statusMatch =
    statusFilter === "all"
      ? true
      : order.status === statusFilter;

  const fromMatch = fromDate
    ? orderDate >= new Date(fromDate)
    : true;

  const toMatch = toDate
    ? orderDate <= new Date(
        `${toDate}T23:59:59`
      )
    : true;

  return statusMatch && fromMatch && toMatch;
});

  async function checkAuth() {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
    } catch (error) {
      navigate('/login');
    }
  }

  async function loadOrders() {
    try {
      const data = await orderApi.getAll();
      // Sort by newest first
      const sortedOrders = (data || []).sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setOrders(sortedOrders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  

 function getStatusBadge(status: string) {
  const config =
    statusConfig[status] || {
      variant: "secondary",
      label: status,
      color: "bg-gray-100 text-gray-800",
    };

  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
}


  function handleGenerateInvoice(order: any) {
      generateInvoicePDF({...order, gstPercentage: order.gst_percentage || 0, sgstPercentage: order.sgst_percentage || 0, paidAmount: order.paid_amount || 0, pendingAmount: order.pending_amount || 0, user_id: order.user_id || order.user_id || order.id})
  
    toast.success('Invoice downloaded');
  }

  

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Welcome back, {user?.user_metadata?.name}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Partial Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'partial_paid').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'paid' || o.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Browse Products CTA */}
      <Card className="mb-8 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Looking for more products?</h3>
              <p className="text-gray-600">Browse our catalog and place new orders</p>
            </div>
            <Link to="/products">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 mb-6 flex-wrap">
  <Button
    variant={statusFilter === "all" ? "default" : "outline"}
    onClick={() => setStatusFilter("all")}
  >
    All ({orders.length})
  </Button>

  <Button
    variant={statusFilter === "paid" ? "default" : "outline"}
    onClick={() => setStatusFilter("paid")}
  >
    Paid (
    {orders.filter(
      (o) => o.status === "paid"
    ).length}
    )
  </Button>

  <Button
    variant={
      statusFilter === "partial_paid"
        ? "default"
        : "outline"
    }
    onClick={() =>
      setStatusFilter("partial_paid")
    }
  >
    Partial Paid (
    {orders.filter(
      (o) => o.status === "partial_paid"
    ).length}
    )
  </Button>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">

  <div>
    <label className="text-sm font-medium">
      From Date
    </label>

    <input
      type="date"
      value={fromDate}
      onChange={(e) =>
        setFromDate(e.target.value)
      }
      className="w-full border rounded-md px-3 py-2"
    />
  </div>

  <div>
    <label className="text-sm font-medium">
      To Date
    </label>

    <input
      type="date"
      value={toDate}
      onChange={(e) =>
        setToDate(e.target.value)
      }
      className="w-full border rounded-md px-3 py-2"
    />
  </div>

  <div className="flex items-end">
    <Button
      variant="outline"
      onClick={() => {
        setFromDate("");
        setToDate("");
        setStatusFilter("all");
      }}
    >
      Clear Filters
    </Button>
  </div>

</div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 mb-4">Start shopping to see your orders here</p>
            <Link to="/products">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">
                      Order #{order.id.slice(0, 12)}
                    </CardTitle>
                    <div className="flex gap-2 items-center flex-wrap">
                      {getStatusBadge(order.status)}
                      <span className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                 
                  <div className="text-sm text-gray-600">
  Paid: Rs. {(order.paid_amount || 0).toFixed(2)}
</div>

<div className="text-sm text-red-600">
  Pending: Rs. {(order.pending_amount || 0).toFixed(2)}
</div>
 <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      Rs. {order.total_amount?.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Items Summary */}
                  {/* Customer Information */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm border-b pb-3">
  <div>
    <span className="font-semibold text-gray-600">
      Customer Name:
    </span>{" "}
    {order.customer_name || order.customerName}
  </div>

  <div>
    <span className="font-semibold text-gray-600">
      Phone:
    </span>{" "}
    {order.customer_phone || order.customerPhone}
  </div>

 {/* {order.customer_email && <div>
    <span className="font-semibold text-gray-600">
      Email:
    </span>{" "}
    {order.customer_email || order.customerEmail}
  </div>} */}

  <div className="md:col-span-2">
    <span className="font-semibold text-gray-600">
      Address:
    </span>{" "}
    {order.customer_address || order.customerAddress}
  </div>
</div>
                  <div>
                    <span className="text-sm font-semibold">Items:</span>
                    <div className="mt-1 space-y-1">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                         {item.productName}

{item.category && (
  <span>
    {" "}
    | {item.category}
  </span>
)}

{item.size && (
  <span>
    {" "}
    | {item.size}"
  </span>
)}

{" × "}
{item.quantity}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Message */}
                  {order.status === 'pending_approval' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                      <p className="text-yellow-800">
                        Your order is awaiting admin approval. You'll be notified once reviewed.
                      </p>
                    </div>
                  )}

                  {order.status === 'approved_payment_pending' && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                      <p className="text-blue-800">
                        Order approved! Please complete payment to proceed.
                      </p>
                    </div>
                  )}

                  {order.status === 'assigned_for_delivery' && (
                    <div className="bg-purple-50 border border-purple-200 rounded p-3 text-sm">
                      <p className="text-purple-800">
                        Your order is out for delivery!
                        {order.deliveryPersonName && ` Delivery by: ${order.deliveryPersonName}`}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t">
                    {/* <Link to={`/orders/${order.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Track Order
                      </Button>
                    </Link> */}

                    {(order.status === 'paid' || order.status === 'admin_approved' || order.status === 'delivered' || order.status === 'completed' || order.status === 'partial_paid') && (
                      <Button
                        size="sm"
                        onClick={() => handleGenerateInvoice(order)}
                        variant="outline"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Download Invoice
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
