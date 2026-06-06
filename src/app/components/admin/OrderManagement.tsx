import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { orderApi } from '../../utils/api';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Eye, Check, X, Truck, FileText, Mail } from 'lucide-react';

interface Props {
  onStatsUpdate: () => void;
}

export function OrderManagement({ onStatsUpdate }: Props) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'assign' | null;
  }>({ open: false, type: null });

  // Action form state
  const [requirePayment, setRequirePayment] = useState(true);
  const [deliveryPersonName, setDeliveryPersonName] = useState('');
  const [deliveryPersonEmail, setDeliveryPersonEmail] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const data = await orderApi.getAll();
      // Sort by newest first
      const sortedOrders = (data || []).sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const statusConfig: Record<string, { variant: any; label: string }> = {
  pending_approval: { variant: 'default', label: 'Pending Approval' },
  approved_payment_pending: { variant: 'default', label: 'Payment Pending' },
  admin_approved: { variant: 'default', label: 'Admin Approved' },
  paid: { variant: 'default', label: 'Paid' },
  partial_paid: { variant: 'secondary', label: 'Partial Paid' },
  assigned_for_delivery: { variant: 'default', label: 'Assigned for Delivery' },
  delivered: { variant: 'default', label: 'Delivered' },
  delivery_cancelled: { variant: 'destructive', label: 'Delivery Cancelled' },
  refunded: { variant: 'secondary', label: 'Refunded' },
  completed: { variant: 'default', label: 'Completed' },
};

    const config = statusConfig[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  function openApproveDialog(order: any) {
    setSelectedOrder(order);
    setRequirePayment(true);
    setActionDialog({ open: true, type: 'approve' });
  }

  function openAssignDialog(order: any) {
    setSelectedOrder(order);
    setDeliveryPersonName('');
    setDeliveryPersonEmail('');
    setActionDialog({ open: true, type: 'assign' });
  }

  async function handleApprove() {
    if (!selectedOrder) return;

    try {
      await orderApi.approve(selectedOrder.id, requirePayment);
      toast.success(`Order ${requirePayment ? 'approved - awaiting payment' : 'approved without payment'}`);
      setActionDialog({ open: false, type: null });
      loadOrders();
      onStatsUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve order');
    }
  }

  async function handleAssignDelivery() {
    if (!selectedOrder || !deliveryPersonName || !deliveryPersonEmail) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await orderApi.assignDelivery(selectedOrder.id, deliveryPersonEmail, deliveryPersonName);
      toast.success('Delivery person assigned. Email notification sent.');
      setActionDialog({ open: false, type: null });
      loadOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign delivery');
    }
  }

  async function handleGenerateInvoice(order: any) {
    console.log("order test", order)
    generateInvoicePDF({...order, gstPercentage: order.gst_percentage || 0, sgstPercentage: order.sgst_percentage || 0, paidAmount: order.paid_amount || 0, pendingAmount: order.pending_amount || 0})
  
    toast.success('Invoice downloaded');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
  if (statusFilter === 'all') return true;
  return order.status === statusFilter;
});

  return (
    <div className="space-y-6">
     <div className="flex items-center justify-between">
  <h2 className="text-2xl font-bold">Orders</h2>

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="border rounded px-3 py-2"
  >
    <option value="all">All Orders</option>
    <option value="paid">Paid</option>
    <option value="partial_paid">Partial Paid</option>
  </select>
</div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-600">No orders yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-1">
                      Order #{order.id.slice(0, 12)}
                    </CardTitle>
                    <div className="flex gap-2 items-center flex-wrap">
                      {getStatusBadge(order.status)}
                      <Badge variant="outline">{order.orderType || 'online'}</Badge>
                      <span className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      Rs {order.total_amount?.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Customer: </span>
                      <span className="font-medium">{order.customer_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone: </span>
                      <span className="font-medium">{order.customer_phone}</span>
                    </div>
                    {order.customer_email && (
                      <div>
                        <span className="text-gray-600">Email: </span>
                        <span className="font-medium">{order.customer_email}</span>
                      </div>
                    )}
                  </div>

                  <div>
  <span className="text-gray-600">Order Date: </span>
  <span className="font-medium">
    {new Date(
      order.created_at || order.createdAt
    ).toLocaleString()}
  </span>
</div>

{order.paid_amount !== undefined && (
  <div>
    <span className="text-gray-600">Paid Amount: </span>
    <span className="font-medium text-green-600">
      Rs. {Number(order.paid_amount).toFixed(2)}
    </span>
  </div>
)}

{order.pending_amount !== undefined && (
  <div>
    <span className="text-gray-600">Pending Amount: </span>
    <span className="font-medium text-red-600">
      Rs. {Number(order.pending_amount).toFixed(2)}
    </span>
  </div>
)}

                  {/* Items */}
                  <div>
                    <span className="text-sm font-semibold">Items:</span>
                    <div className="mt-1 space-y-1">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {item.product_name} - {item.size}" × {item.quantity} @ Rs. {item.price}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t">
                    {/* <Link to={`/orders/${order.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </Link> */}

                    {order.status === 'pending_approval' && (
                      <Button
                        size="sm"
                        onClick={() => openApproveDialog(order)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}

                    {(order.status === 'paid' || order.status === 'admin_approved') && order.orderType === 'online' && (
                      <Button
                        size="sm"
                        onClick={() => openAssignDialog(order)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Truck className="h-4 w-4 mr-1" />
                        Assign Delivery
                      </Button>
                    )}

                    {/* {(order.status === 'paid' || order.status === 'admin_approved' || order.status === 'delivered' || order.status === 'completed') && ( */}
                      <Button
                        size="sm"
                        onClick={() => handleGenerateInvoice(order)}
                        variant="outline"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Invoice
                      </Button>
                    {/* )} */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog
        open={actionDialog.open && actionDialog.type === 'approve'}
        onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Order</DialogTitle>
            <DialogDescription>
              Choose how to approve this order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requirePayment"
                checked={requirePayment}
                onChange={(e) => setRequirePayment(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="requirePayment">Require payment from customer</Label>
            </div>
            <p className="text-sm text-gray-600">
              {requirePayment
                ? 'Customer will need to complete payment before order is processed.'
                : 'Order will be marked as "Admin Approved" without payment requirement.'}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve Order
              </Button>
              <Button
                onClick={() => setActionDialog({ open: false, type: null })}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Delivery Dialog */}
      <Dialog
        open={actionDialog.open && actionDialog.type === 'assign'}
        onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Delivery Person</DialogTitle>
            <DialogDescription>
              Enter delivery person details. They will receive an email notification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="deliveryName">Delivery Person Name</Label>
              <Input
                id="deliveryName"
                value={deliveryPersonName}
                onChange={(e) => setDeliveryPersonName(e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label htmlFor="deliveryEmail">Email Address</Label>
              <Input
                id="deliveryEmail"
                type="email"
                value={deliveryPersonEmail}
                onChange={(e) => setDeliveryPersonEmail(e.target.value)}
                placeholder="delivery@example.com"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleAssignDelivery}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                Assign & Send Email
              </Button>
              <Button
                onClick={() => setActionDialog({ open: false, type: null })}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
