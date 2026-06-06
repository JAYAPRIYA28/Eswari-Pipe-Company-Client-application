import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { orderApi } from '../utils/api';
import { authService } from '../utils/auth';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, XCircle, Clock, Truck, CreditCard, FileText, Package } from 'lucide-react';

export function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [deliveryDialog, setDeliveryDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<'delivered' | 'cancelled'>('delivered');
  const [cancelReason, setCancelReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadOrder();
    checkAuth();
  }, [id]);

  async function checkAuth() {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth error:', error);
    }
  }

  async function loadOrder() {
    try {
      const data = await orderApi.getById(id!);
      setOrder(data.order);
    } catch (error: any) {
      toast.error('Failed to load order');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment() {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setProcessing(true);
    try {
      await orderApi.processPayment(order.id, paymentMethod);
      toast.success('Payment processed successfully!');
      setPaymentDialog(false);
      loadOrder();
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeliveryUpdate() {
    if (deliveryStatus === 'cancelled' && !cancelReason) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    setProcessing(true);
    try {
      await orderApi.updateDeliveryStatus(
        order.id,
        deliveryStatus === 'delivered',
        cancelReason
      );
      toast.success(
        deliveryStatus === 'delivered'
          ? 'Order marked as delivered!'
          : 'Delivery cancelled. Admin has been notified.'
      );
      setDeliveryDialog(false);
      loadOrder();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update delivery status');
    } finally {
      setProcessing(false);
    }
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      'pending_approval': 'bg-yellow-500',
      'approved_payment_pending': 'bg-blue-500',
      'admin_approved': 'bg-green-500',
      'paid': 'bg-green-500',
      'assigned_for_delivery': 'bg-purple-500',
      'delivered': 'bg-green-600',
      'delivery_cancelled': 'bg-red-500',
      'refunded': 'bg-gray-500',
      'completed': 'bg-green-600',
    };
    return colors[status] || 'bg-gray-400';
  }

  function getProgressSteps() {
    const steps = [
      { key: 'pending_approval', label: 'Order Placed', icon: Package },
      { key: 'admin_approved', label: 'Approved', icon: CheckCircle },
    ];

    if (order?.requirePayment !== false) {
      steps.push({ key: 'paid', label: 'Payment', icon: CreditCard });
    }

    if (order?.orderType === 'online') {
      steps.push(
        { key: 'assigned_for_delivery', label: 'Out for Delivery', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle }
      );
    } else {
      steps.push({ key: 'completed', label: 'Completed', icon: CheckCircle });
    }

    return steps;
  }

  function isStepCompleted(stepKey: string) {
    if (!order) return false;
    
    const statusOrder = [
      'pending_approval',
      'approved_payment_pending',
      'admin_approved',
      'paid',
      'assigned_for_delivery',
      'delivered',
      'completed'
    ];

    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(stepKey);
    
    return stepIndex <= currentIndex;
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const isAdmin = user?.user_metadata?.role === 'admin';
  const canProcessPayment = order.status === 'approved_payment_pending' && !isAdmin;
  const canUpdateDelivery = order.status === 'assigned_for_delivery';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to={isAdmin ? '/admin/dashboard' : '/user/dashboard'}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Tracking</h1>

      {/* Order Summary */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl mb-2">Order #{order.id.slice(0, 12)}</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Badge className={getStatusColor(order.status)}>
                  {order.status.replace(/_/g, ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline">{order.orderType || 'online'}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Amount</div>
              <div className="text-2xl font-bold text-orange-600">
                Rs. {order.totalAmount?.toFixed(2)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-semibold">Customer:</span>
              <p className="text-gray-700">{order.customerName}</p>
              <p className="text-gray-600 text-sm">{order.customerPhone}</p>
              {order.customerEmail && (
                <p className="text-gray-600 text-sm">{order.customerEmail}</p>
              )}
            </div>
            <div>
              <span className="text-sm font-semibold">Order Date:</span>
              <p className="text-gray-700">{new Date(order.createdAt).toLocaleString()}</p>
              {order.deliveryPersonName && (
                <>
                  <span className="text-sm font-semibold mt-2 block">Delivery Person:</span>
                  <p className="text-gray-700">{order.deliveryPersonName}</p>
                </>
              )}
            </div>
          </div>

          <div>
            <span className="text-sm font-semibold">Items:</span>
            <div className="mt-2 space-y-2">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <div>
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-sm text-gray-600">
                      Size: {item.size}" | Quantity: {item.quantity}
                    </div>
                  </div>
                  <div className="font-semibold">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.notes && (
            <div>
              <span className="text-sm font-semibold">Notes:</span>
              <p className="text-gray-700 text-sm mt-1">{order.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Tracker (Online Orders Only) */}
      {order.orderType === 'online' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {getProgressSteps().map((step, index) => {
                const Icon = step.icon;
                const completed = isStepCompleted(step.key);
                
                return (
                  <div key={step.key} className="flex items-center mb-6 last:mb-0">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className={`font-semibold ${completed ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.label}
                      </div>
                    </div>
                    {completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                );
              })}
            </div>

            {order.deliveryCancelReason && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-red-900">Delivery Cancelled</div>
                    <div className="text-sm text-red-800 mt-1">{order.deliveryCancelReason}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {canProcessPayment && (
            <Button
              onClick={() => setPaymentDialog(true)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Complete Payment
            </Button>
          )}

          {canUpdateDelivery && (
            <Button
              onClick={() => setDeliveryDialog(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Truck className="h-4 w-4 mr-2" />
              Update Delivery Status
            </Button>
          )}

          {(order.status === 'paid' || order.status === 'admin_approved' || order.status === 'delivered' || order.status === 'completed') && (
            <Button
              onClick={() => generateInvoicePDF(order)}
              variant="outline"
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Select your payment method to complete this order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Input
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="e.g., Credit Card, UPI, Cash"
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="flex justify-between text-sm mb-2">
                <span>Amount to pay:</span>
                <span className="font-semibold">Rs. {order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {processing ? 'Processing...' : 'Confirm Payment'}
              </Button>
              <Button variant="outline" onClick={() => setPaymentDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivery Status Dialog */}
      <Dialog open={deliveryDialog} onOpenChange={setDeliveryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Delivery Status</DialogTitle>
            <DialogDescription>
              Mark this order as delivered or cancelled
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-3">
                <Button
                  onClick={() => setDeliveryStatus('delivered')}
                  variant={deliveryStatus === 'delivered' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Delivered
                </Button>
                <Button
                  onClick={() => setDeliveryStatus('cancelled')}
                  variant={deliveryStatus === 'cancelled' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>

            {deliveryStatus === 'cancelled' && (
              <div>
                <Label htmlFor="cancelReason">Cancellation Reason *</Label>
                <Textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Provide reason for delivery cancellation"
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleDeliveryUpdate}
                disabled={processing}
                className={`flex-1 ${
                  deliveryStatus === 'delivered'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing ? 'Updating...' : 'Confirm'}
              </Button>
              <Button variant="outline" onClick={() => setDeliveryDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
