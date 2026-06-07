import { useState } from "react";
import { useNavigate } from "react-router";
import { orderApi } from "../utils/api";
import { toast } from "sonner";
import { useCart } from "./CardContext";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "./ui/card";
import { Plus } from "lucide-react";
import { generateInvoicePDF } from "../utils/pdfGenerator";
import { Receipt } from "lucide-react";

export function Checkout() {
  const navigate = useNavigate();

  const { cart, clearCart } = useCart();

  console.log("Checkout Cart:", cart);

  const [submitting, setSubmitting] =
    useState(false);

 const [formData, setFormData] = useState({
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerAddress: "",
  notes: ""
});

const [gstPercentage, setGstPercentage] = useState("9");
const [sgstPercentage, setSgstPercentage] = useState("9");
const [pendingAmount, setPendingAmount] = useState("0");

  const totalAmount = cart.reduce(
    (sum: number, item: any) =>
      sum + item.price * item.quantity,
    0
  );

  async function handleSubmit() {
    if (
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.customerAddress
    ) {
      toast.error(
        "Please fill all required fields"
      );
      return;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const grandTotal = calculateGrandTotal();

if (Number(pendingAmount) > grandTotal) {
  toast.error(
    "Pending amount cannot be greater than Grand Total"
  );
  return;
}

    setSubmitting(true);

    try {
     const orderData = {
  orderType: "online",

  customerName: formData.customerName,
  customerPhone: formData.customerPhone,
  customerEmail: formData.customerEmail,
  customerAddress: formData.customerAddress,
  notes: formData.notes,

  items: cart.map((item: any) => ({
    productId: item.id,
    productName: item.name,
     category: item.category,
    quantity: item.quantity,
    size: item.size || "",
    price: item.price
  })),

  subtotal: calculateSubtotal(),
gstAmount: calculateGST(),
sgstAmount: calculateSGST(),
totalAmount: calculateGrandTotal(),

paidAmount: calculatePaidAmount(),
pendingAmount:
  parseFloat(pendingAmount) || 0,

  status:
  (parseFloat(pendingAmount) || 0) > 0
    ? "partial_paid"
    : "paid",

paymentStatus:
  (parseFloat(pendingAmount) || 0) > 0
    ? "partial_paid"
    : "paid",

deliveryStatus: "notAssigned",
};

     const data = await orderApi.create(orderData);

     console.log("Order API Response:", data);

generateInvoicePDF({
  ...data,
  id: data.id,
  createdAt: data.created_at,
  user_id: data.id,

  customerName: formData.customerName,
  customerPhone: formData.customerPhone,
  customerEmail: formData.customerEmail,
  customerAddress: formData.customerAddress,

  gstPercentage,
  sgstPercentage,

  subtotal: calculateSubtotal(),
  gstAmount: calculateGST(),
  sgstAmount: calculateSGST(),

  totalAmount: calculateGrandTotal(),

  paidAmount: calculatePaidAmount(),
  pendingAmount:
    parseFloat(pendingAmount) || 0,
});

toast.success(
  "Order completed successfully! Invoice downloaded."
);

clearCart();

navigate("/order-success");

    } catch (error: any) {
      toast.error(
        error.message ||
          "Failed to submit order"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function calculateSubtotal() {
  return cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
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

function calculatePaidAmount() {
  return (
    calculateGrandTotal() -
    (parseFloat(pendingAmount) || 0)
  );
}

console.log("Cart Data:", cart);
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <h1 className="text-3xl font-bold mb-6">
        Checkout
      </h1>

      <div className="mb-6 rounded-lg border border-blue-300 bg-blue-50 p-4">

  <h3 className="font-semibold text-blue-800">
    Place Order Functionality
  </h3>

  <p className="text-sm text-blue-700 mt-1">
    This page follows the same purchase flow as our On-site Purchase system,
    including GST, SGST and order summary calculations.
  </p>

  <p className="text-sm text-blue-700 mt-2">
    Online ordering, payment processing, invoice generation and delivery
    tracking are currently under development and will be available soon.
  </p>

  <p className="text-sm text-blue-700 mt-2">
    At present, customers can use this page to place orders and submit
    purchase details. Additional online purchase features will be released
    in upcoming updates.
  </p>

</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Customer form */}

        <div className="lg:col-span-2">

          <Card>
  <CardHeader>
    <CardTitle>
      Customer Details
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-4">

    <div>
      <Label htmlFor="name">
        Full Name *
      </Label>

      <Input
        id="name"
        value={formData.customerName}
        onChange={(e) =>
          setFormData({
            ...formData,
            customerName: e.target.value
          })
        }
        placeholder="Enter your name"
        required
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      <div>
        <Label htmlFor="phone">
          Phone Number *
        </Label>

        <Input
          id="phone"
          value={formData.customerPhone}
          onChange={(e) =>
            setFormData({
              ...formData,
              customerPhone: e.target.value
            })
          }
          placeholder="+91 XXXXX-XXXXX"
          required
        />
      </div>

      <div>
        <Label htmlFor="email">
          Email
        </Label>

        <Input
          id="email"
          type="email"
          value={formData.customerEmail}
          onChange={(e) =>
            setFormData({
              ...formData,
              customerEmail: e.target.value
            })
          }
          placeholder="you@example.com"
        />
      </div>

    </div>

    <div>
      <Label htmlFor="address">
        Delivery Address *
      </Label>

      <Textarea
        id="address"
        value={formData.customerAddress}
        onChange={(e) =>
          setFormData({
            ...formData,
            customerAddress: e.target.value
          })
        }
        placeholder="Enter complete delivery address"
        rows={3}
        required
      />
    </div>

    <div>
      <Label htmlFor="notes">
        Additional Notes
      </Label>

      <Textarea
        id="notes"
        value={formData.notes}
        onChange={(e) =>
          setFormData({
            ...formData,
            notes: e.target.value
          })
        }
        placeholder="Any special requirements or instructions"
        rows={3}
      />
    </div>

    <div className="grid grid-cols-2 gap-4">

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
        setSgstPercentage(e.target.value)
      }
    />
  </div>

</div>

  </CardContent>
</Card>

        </div>

      

        {/* Order Summary */}

        <div>

          <Card>

           <CardHeader>
  <div className="flex flex-col gap-3">
    <CardTitle>
      Order Summary
    </CardTitle>

    <Button
      variant="outline"
      onClick={() => navigate("/products")}
      className="w-full"
    >
      <Plus className="h-4 w-4 mr-2" />
      Add More Products
    </Button>
  </div>
</CardHeader>

            <CardContent>

              <div className="space-y-3">
            

                {cart.map(
                  (
                    item: any
                  ) => (
                    <div
                      key={item.id}
                      className="flex justify-between"
                    >
                      <div>
                        <p>
                          {item.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          Qty:
                          {item.quantity}
                        </p>
                      </div>

                      <p>
                        Rs. 
                        {item.price *
                          item.quantity}
                      </p>
                    </div>
                  )
                )}

              </div>



              <div className="border-t mt-4 pt-4">

                <div className="space-y-2">

  <div className="flex justify-between">
    <span>Subtotal</span>
    <span>
      Rs. {calculateSubtotal().toFixed(2)}
    </span>
  </div>

  <div className="flex justify-between">
    <span>
      CGST ({gstPercentage}%)
    </span>
    <span>
      Rs. {calculateGST().toFixed(2)}
    </span>
  </div>

  <div className="flex justify-between">
    <span>
      SGST ({sgstPercentage}%)
    </span>
    <span>
      Rs. {calculateSGST().toFixed(2)}
    </span>
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

  <div className="border-t pt-2 flex justify-between font-bold text-lg">
    <span>Grand Total</span>
    <span>
      Rs. {calculateGrandTotal().toFixed(2)}
    </span>
  </div>

</div>

               <Button
  onClick={handleSubmit}
  disabled={submitting}
  className="w-full mt-4 bg-green-600 hover:bg-green-700"
>
  {submitting ? (
    <span className="flex items-center justify-center">
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

<div className="text-xs text-gray-500 pt-4 border-t mt-4">
  <p className="mb-2">
    • Order will be marked as Paid or Partial Paid immediately
  </p>

  <p className="mb-2">
    • Invoice will be auto-generated and downloaded
  </p>

  <p>
    • Pending amount will be tracked automatically
  </p>
</div>

              </div>

            </CardContent>

          </Card>

        </div>

      </div>
    </div>
  );
}