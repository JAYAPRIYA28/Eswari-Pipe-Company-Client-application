import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { orderApi } from '../utils/api';
import { authService } from '../utils/auth';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Calendar, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

export function MonthlyHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
const [isAuthorized, setIsAuthorized] = useState(false);

const [orders, setOrders] = useState<any[]>([]);
const [totalAmount, setTotalAmount] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [selectedCategory, setSelectedCategory] = useState("all");

  const [selectedStatus, setSelectedStatus] = useState("all");

  
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

useEffect(() => {
  checkAdminAccess();
}, []);

useEffect(() => {
  if (isAuthorized) {
    loadMonthlyHistory();
  }
}, [isAuthorized, selectedMonth, selectedYear]);

async function checkAdminAccess() {
  try {
    const currentUser = await authService.getCurrentUser();

    if (
      !currentUser ||
      currentUser.user_metadata?.role !== "admin"
    ) {
      toast.error("Unauthorized: Admin access required");
      navigate("/");
      return;
    }

    setIsAuthorized(true);
  } catch (error) {
    navigate("/login");
  }
}

  console.log("loading out", loading)

 async function loadMonthlyHistory() {
  try {
    setLoading(true);

    const data = await orderApi.getMonthlyHistory(
      selectedMonth,
      selectedYear
    );

    console.log("Monthly History Response:", data);

    if (Array.isArray(data)) {
      setOrders(data);

      const total = data.reduce(
        (sum: number, order: any) =>
          sum + Number(order.paid_amount || order.total_amount || 0),
        0
      );

      setTotalAmount(total);
    } else {
      setOrders(data.orders || []);
      setTotalAmount(data.totalAmount || 0);
    }
  } catch (error) {
    console.error(error);
    toast.error("Failed to load monthly history");
  } finally {
    setLoading(false);
  }
}

  function getOrderTypeStats() {
    const online = orders.filter(o => o.order_type === 'online').length;
    const onsite = orders.filter(o => o.order_type === 'onsite').length;
    const adminApproved = orders.filter(o => o.status === 'admin_approved').length;
    
    return { online, onsite, adminApproved };
  }

  function getStatusStats() {
    const completed = orders.filter(o => 
      o.status === 'delivered' || o.status === 'completed' || o.status === 'paid'||  o.status === 'partial_paid'
    ).length;
    const pending = orders.filter(o => 
      o.status === 'pending_approval' || o.status === 'approved_payment_pending'
    ).length;
    const cancelled = orders.filter(o => 
      o.status === 'delivery_cancelled' || o.status === 'refunded'
    ).length;
    
    return { completed, pending, cancelled };
  }

 const filteredOrders = orders.filter((order) => {
  const categoryMatch =
    selectedCategory === "all" ||
    order.items?.some(
      (item: any) =>
        item.category?.toLowerCase() ===
        selectedCategory.toLowerCase()
    );

  const statusMatch =
    selectedStatus === "all" ||
    order.status === selectedStatus;

  return categoryMatch && statusMatch;
});

  const typeStats = getOrderTypeStats();
  const statusStats = getStatusStats();

  const filteredTotalAmount = filteredOrders.reduce(
  (sum, order) =>
    sum + Number(order.paid_amount || order.total_amount || 0),
  0
);

const totalPaidAmount = filteredOrders.reduce(
  (sum, order) => sum + Number(order.paid_amount || order.paidAmount || 0),
  0
);

const totalPendingAmount = filteredOrders.reduce(
  (sum, order) => sum + Number(order.pending_amount || order.pendingAmount || 0),
  0
);

const paidOrdersCount = filteredOrders.filter(
  (order) =>
    Number(order.pending_amount || order.pendingAmount || 0) === 0
).length;

const pendingOrdersCount = filteredOrders.filter(
  (order) =>
    Number(order.pending_amount || order.pendingAmount || 0) > 0
).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Monthly Order History</h1>
        <p className="text-gray-600">View detailed monthly reports and analytics</p>
      </div>

      {/* Date Selector */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div>
  <Select
    value={selectedCategory}
    onValueChange={setSelectedCategory}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select Category" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="all">All</SelectItem>
      <SelectItem value="pipes">Pipe</SelectItem>
      <SelectItem value="fencing">Fencing</SelectItem>
    </SelectContent>
  </Select>

 
</div>
          <div>
  <Select
    value={selectedStatus}
    onValueChange={setSelectedStatus}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select Status" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="all">All Status</SelectItem>
      <SelectItem value="paid">Paid</SelectItem>
      <SelectItem value="partial_paid">Partial Paid</SelectItem>
    </SelectContent>
  </Select>
</div>
          </div>
        </CardContent>
      </Card>

     

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredOrders.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rs. {filteredTotalAmount.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completed
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusStats.completed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Avg Order Value
                </CardTitle>
                <Calendar className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                Rs. {filteredOrders.length > 0 ? (totalAmount / filteredOrders.length).toFixed(2) : '0.00'}
                </div>
              </CardContent>
            </Card>
          </div>
   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  <Card>
    <CardHeader>
      <CardTitle className="text-sm">Total Paid</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-green-600">
        Rs. {totalPaidAmount.toFixed(2)}
      </div>
      <p className="text-sm text-gray-500 mt-1">
        {paidOrdersCount} order{paidOrdersCount !== 1 ? "s" : ""}
      </p>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle className="text-sm">Total Pending</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-red-600">
        Rs. {totalPendingAmount.toFixed(2)}
      </div>
      <p className="text-sm text-gray-500 mt-1">
        {pendingOrdersCount} order{pendingOrdersCount !== 1 ? "s" : ""}
      </p>
    </CardContent>
  </Card>
</div>

          {/* Order Type Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Order Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Online Purchases</span>
                  <Badge variant="secondary">{typeStats.online}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">On-site Purchases</span>
                  <Badge variant="secondary">{typeStats.onsite}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Admin Approved (No Payment)</span>
                  <Badge variant="secondary">{typeStats.adminApproved}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Completed/Delivered</span>
                  <Badge className="bg-green-100 text-green-800">{statusStats.completed}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Pending/In Progress</span>
                  <Badge className="bg-yellow-100 text-yellow-800">{statusStats.pending}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Cancelled/Refunded</span>
                  <Badge className="bg-red-100 text-red-800">{statusStats.cancelled}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  No orders found for {months[selectedMonth - 1].label} {selectedYear}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Order ID</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Customer</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Type</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
  Amount
</th>
<th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
  Paid
</th>
<th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
  Pending
</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2 text-sm">#{order.id.slice(0, 8)}</td>
                          <td className="py-3 px-2 text-sm">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 text-sm">{order.customer_name}</td>
                          <td className="py-3 px-2 text-sm">
                            <Badge variant="outline" className="text-xs">
                              {order.order_type || 'online'}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-sm">
                            {order.status === 'admin_approved' && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Admin Approved
                              </Badge>
                            )}
                            {(order.status === 'delivered' || order.status === 'completed') && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Completed
                              </Badge>
                            )}
                            {order.status === 'pending_approval' && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                Pending
                              </Badge>
                            )}
                             {order.status === 'paid' && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                paid
                              </Badge>
                            )}
                            {order.status === 'partial_paid' && (
  <Badge className="bg-orange-100 text-orange-800 text-xs">
    Partial Paid
  </Badge>
)}
                            {order.status === 'refunded' && (
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                Refunded
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-2 text-sm text-right font-semibold">
  Rs. {Number(order.total_amount || 0).toFixed(2)}
</td>

<td className="py-3 px-2 text-sm text-right text-green-600 font-medium">
  Rs. {Number(order.paid_amount || order.paidAmount || 0).toFixed(2)}
</td>

<td className="py-3 px-2 text-sm text-right text-red-600 font-medium">
  Rs. {Number(order.pending_amount || order.pendingAmount || 0).toFixed(2)}
</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
