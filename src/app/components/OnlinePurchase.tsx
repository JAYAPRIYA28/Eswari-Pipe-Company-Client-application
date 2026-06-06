import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { productApi, orderApi, quotationApi } from '../utils/api';
import { authService } from '../utils/auth';
import { generateInvoicePDF, generateQuotationPDF } from '../utils/pdfGenerator';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { ShoppingCart, FileText, Send } from 'lucide-react';

export function OnlinePurchase() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [productId]);

  async function loadData() {
    try {
      const [productData, userData] = await Promise.all([
        productApi.getById(productId!),
        authService.getCurrentUser(),
      ]);

      setProduct(productData);
      setUser(userData);
      
      if (userData) {
        setCustomerName(userData.user_metadata.name || '');
        setCustomerEmail(userData.email || '');
      }

      if (productData.sizes && productData.sizes.length > 0) {
        setSelectedSize(productData.sizes[0]);
      }
    } catch (error) {
      toast.error('Failed to load product details');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }

  function calculateTotal() {
    if (!product) return 0;
    
    let price = product.basePrice || 0;
    
    if (product.pricing && selectedSize && product.pricing[selectedSize]) {
      price = product.pricing[selectedSize];
    }
    
    return price * quantity;
  }

  async function handleGenerateQuotation() {
    if (!validateForm()) return;

    const quotation = {
      productId: product.id,
      productName: product.name,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      items: [{
        productName: product.name,
        size: selectedSize,
        quantity,
        price: product.pricing?.[selectedSize] || product.basePrice,
      }],
      totalAmount: calculateTotal(),
      notes,
    };

    try {
      const data = await quotationApi.create(quotation);
      generateQuotationPDF(data.quotation);
      toast.success('Quotation generated successfully!');
    } catch (error) {
      toast.error('Failed to generate quotation');
    }
  }

  async function handleRequestApproval() {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const orderData = {
        productId: product.id,
        userId: user?.id,
        orderType: 'online',
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        items: [{
          productName: product.name,
          size: selectedSize,
          quantity,
          price: product.pricing?.[selectedSize] || product.basePrice,
        }],
        totalAmount: calculateTotal(),
        status: 'pending_approval',
        notes,
      };

      const data = await orderApi.create(orderData);
      await orderApi.requestApproval(data.order.id);
      
      toast.success('Order request sent to admin for approval!');
      navigate(`/orders/${data.order.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit order request');
    } finally {
      setSubmitting(false);
    }
  }

  function validateForm() {
    if (!selectedSize) {
      toast.error('Please select a size');
      return false;
    }
    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return false;
    }
    if (!customerName || !customerPhone) {
      toast.error('Please fill in all required fields');
      return false;
    }
    return true;
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Online Purchase</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Product</Label>
                <Input value={product.name} disabled />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size">Size (inches) *</Label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger id="size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes?.map((size: string) => (
                        <SelectItem key={size} value={size}>
                          {size}"
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 99441-93276"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Delivery Address</Label>
                <Textarea
                  id="address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter complete delivery address"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requirements or instructions"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{selectedSize}"</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per unit:</span>
                  <span className="font-medium">
                    Rs. {product.pricing?.[selectedSize] || product.basePrice}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    Rs. {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleRequestApproval}
                  disabled={submitting}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Submitting...
                    </span>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Request Admin Approval
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleGenerateQuotation}
                  variant="outline"
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Quotation
                </Button>
              </div>

              <div className="text-xs text-gray-500 pt-4 border-t">
                <p className="mb-2">
                  • After submission, admin will review your request
                </p>
                <p className="mb-2">
                  • Admin may approve with or without payment requirement
                </p>
                <p>
                  • You'll be notified via email about the approval status
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
