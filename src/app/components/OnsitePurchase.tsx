import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { productApi, orderApi } from '../utils/api';
import { authService } from '../utils/auth';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Receipt } from 'lucide-react';

const COMPANY_ADDRESS = 'Eswari Pipe and Fencing Manufacturing Center, Main Road, City';

export function OnsitePurchase() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [gstPercentage, setGstPercentage] = useState("9");
const [sgstPercentage, setSgstPercentage] = useState("9");

const [pendingAmount, setPendingAmount] = useState("0");



const defaultItem = {
  category: 'all',
  productId: '',
  productName: '',
  size: '',
  quantity: 1,
  price: 0,
};
  const [items, setItems] = useState([defaultItem]);

  useEffect(() => {
    checkAdminAccess();
    loadProducts();
  }, []);



  async function checkAdminAccess() {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || currentUser.user_metadata?.role !== 'admin') {
        toast.error('Unauthorized: Admin access required');
        navigate('/');
        return;
      }
      setUser(currentUser);
    } catch (error) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const data = await productApi.getAll();
      setProducts(data || []);
    } catch (error) {
      toast.error('Failed to load products');
    }
  }

 function addItem() {
  setItems([
    ...items,
   { ...defaultItem }
  ]);
}

  function removeItem(index: number) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  }

  function updateItem(index: number, field: string, value: any) {
    const newItems = [...items];
    newItems[index][field] = value;

    // Auto-fill product details when product is selected
    if (field === 'productId') {
  const product = products.find(
    p => p.id === value
  );

  if (product) {
    newItems[index].productName = product.name;
    newItems[index].category = product.category;
    newItems[index].size =
      product.sizes?.[0] || '';
    newItems[index].price =
      product.basePrice || 0;

    if (
      product.pricing &&
      newItems[index].size
    ) {
      newItems[index].price =
        product.pricing[
          newItems[index].size
        ] || product.basePrice;
    }
  }
}

    // Update price when size changes
    if (field === 'size') {
      const product = products.find(p => p.id === newItems[index].productId);
      if (product?.pricing && value) {
        newItems[index].price = product.pricing[value] || product.basePrice || 0;
      }
    }

    setItems(newItems);
  }

  function calculateTotal() {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  const GST_PERCENTAGE = 9;
const SGST_PERCENTAGE = 9;

function calculateSubtotal() {
  return items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );
}

function calculateGST() {
  return (
    calculateSubtotal() *
    (parseFloat(gstPercentage) || 0)
  ) / 100;
}

function calculateSGST() {
  return (
    calculateSubtotal() *
    (parseFloat(sgstPercentage) || 0)
  ) / 100;
}

function calculateGrandTotal() {
  return (
    calculateSubtotal() +
    calculateGST() +
    calculateSGST()
  );
}

  async function handleSubmit() {
    // Validation
    if (!customerName || !customerPhone) {
      toast.error('Please enter customer name and phone number');
      return;
    }

    const validItems = items.filter(item => item.productId  && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Please add at least one valid item');
      return;
    }

    console.log("user", user);

    setSubmitting(true);
    try {
      const grandTotal = calculateGrandTotal();

if (Number(pendingAmount) > grandTotal) {
  toast.error("Pending amount cannot be greater than Grand Total");
  return;
}
     const orderData = {
  orderType: 'onsite',
  customerName,
  customerPhone,
  customerAddress: customerAddress || COMPANY_ADDRESS,

  items: validItems.map(item => ({
    ...item,
    category: item.category
  })),

  gstPercentage: parseFloat(gstPercentage),
  sgstPercentage: parseFloat(sgstPercentage),

  subtotal: calculateSubtotal(),
  gstAmount: calculateGST(),
  sgstAmount: calculateSGST(),
  totalAmount: calculateGrandTotal(),

  paidAmount: calculatePaidAmount(),
  pendingAmount: parseFloat(pendingAmount) || 0,

  status:
    (parseFloat(pendingAmount) || 0) > 0
      ? 'partial_paid'
      : 'paid',

  createdBy: user.id,
};

      const data = await orderApi.create(orderData);

      console.log("data", data)
      
      // Generate and download invoice
    generateInvoicePDF({
  ...data,
  id: data.id,
  createdAt: data.created_at,
  customerEmail: user.email,
  gstPercentage,
  sgstPercentage,

  subtotal: calculateSubtotal(),
  gstAmount: calculateGST(),
  sgstAmount: calculateSGST(),
  totalAmount: calculateGrandTotal(),
  pendingAmount: parseFloat(pendingAmount) || 0,
  paidAmount: calculatePaidAmount(),
});

      toast.success('On-site order completed! Invoice downloaded.');
      
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setItems([{ ...defaultItem }]);
      setPendingAmount("0");
    } catch (error: any) {
      toast.error(error.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  function calculatePaidAmount() {
  return (
    calculateGrandTotal() -
    (parseFloat(pendingAmount) || 0)
  );
}

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">On-site Purchase</h1>
      <p className="text-gray-600 mb-8">Create instant orders for walk-in customers</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Mobile Number *</Label>
                <Input
                  id="phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 99441-93276"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Customer Address (Optional)</Label>
                <Textarea
                  id="address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Leave blank to use company default address"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default: {COMPANY_ADDRESS}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
  <div>
    <Label>CGST %</Label>
    <Input
      type="number"
      min="0"
      step="0.01"
      value={gstPercentage}
      onChange={(e) =>
        setGstPercentage(e.target.value)
      }
    />
  </div>

  <div>
    <Label>SGST %</Label>
    <Input
      type="number"
      min="0"
      step="0.01"
      value={sgstPercentage}
      onChange={(e) =>
        setSgstPercentage(e.target.value )
      }
    />
  </div>
</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Items</CardTitle>
                <Button onClick={addItem} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="font-medium text-sm">Item {index + 1}</span>
                    {items.length > 1 && (
                      <Button
                        onClick={() => removeItem(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
  <Label>Category</Label>
   {console.log("items", items)}
  <Select
    value={item.category}
    onValueChange={(value) => {
      const newItems = [...items];

      newItems[index].category = value;

      // reset product when category changes
      newItems[index].productId = '';
      newItems[index].productName = '';
      newItems[index].size = '';
      newItems[index].price = 0;

      setItems(newItems);
    }}
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
                      <Label>Product</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(value) => updateItem(index, 'productId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                       <SelectContent>
  {products
    .filter((product) => {
      const selectedCategory = item.category || 'all';
      if (selectedCategory === 'all') return true;

       return (
    (product.category || '').toLowerCase() ===
    selectedCategory.toLowerCase()
  );
    })
    .map((product) => (
      <SelectItem
        key={product.id}
        value={product.id}
      >
        {product.name}
      </SelectItem>
    ))}
</SelectContent>
                      </Select>
                    </div>

                    {item.category === "pipes" && (
  <div>
    <Label>Size (inches)</Label>

    <Select
      value={item.size}
      onValueChange={(value) =>
        updateItem(index, "size", value)
      }
      disabled={!item.productId}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select size" />
      </SelectTrigger>

      <SelectContent>
        {item.productId &&
          products
            .find(
              p => p.id === item.productId
            )
            ?.sizes?.map(
              (size: string) => (
                <SelectItem
                  key={size}
                  value={size}
                >
                  {size}"
                </SelectItem>
              )
            )}
      </SelectContent>
    </Select>
  </div>
)}

                    <div>
                      <Label>Quantity</Label>
                     <Input
  type="number"
  min="1"
  value={item.quantity}
  onChange={(e) => {
    const value = e.target.value;

    updateItem(
      index,
      'quantity',
      value === '' ? '' : parseInt(value)
    );
  }}
/>
                    </div>

                    <div>
                      <Label>Price per Unit</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm text-gray-600">Subtotal: </span>
                    <span className="font-semibold">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
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
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{items.filter(i => i.productId).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="font-medium">
                    {items.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">

  <div className="flex justify-between">
    <span>Subtotal</span>
    <span>Rs. {calculateSubtotal().toFixed(2)}</span>
  </div>

  <div className="flex justify-between">
   <span>CGST ({gstPercentage}%)</span>
    <span>Rs.{calculateGST().toFixed(2)}</span>
  </div>

  <div className="flex justify-between">
    <span>SGST ({sgstPercentage}%)</span>
    <span>Rs. {calculateSGST().toFixed(2)}</span>
  </div>

  <div>
  <Label>Pending Amount</Label>
  <Input
    type="number"
    min="0"
    step="0.01"
    value={pendingAmount}
    onChange={(e) =>
      setPendingAmount(e.target.value)
    }
    placeholder="Enter unpaid amount"
  />
</div>

<div className="flex justify-between">
  <span>Paid Amount</span>
  <span>
    Rs. {calculatePaidAmount().toFixed(2)}
  </span>
</div>

<div className="flex justify-between">
  <span>Pending Amount</span>
  <span>
    Rs. {(parseFloat(pendingAmount) || 0).toFixed(2)}
  </span>
</div>

  <div className="border-t pt-3 flex justify-between text-lg font-bold">
    <span>Grand Total</span>
    <span className="text-orange-600">
      Rs.{calculateGrandTotal().toFixed(2)}
    </span>
  </div>

</div>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <Receipt className="h-4 w-4 mr-2" />
                      Complete Order & Print Invoice
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-gray-500 pt-4 border-t">
                <p className="mb-2">
                  • Order will be marked as completed immediately
                </p>
                <p className="mb-2">
                  • Invoice will be auto-generated and downloaded
                </p>
                <p>
                  • No delivery tracking for on-site purchases
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
