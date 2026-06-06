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

export function Checkout() {
  const navigate = useNavigate();

  const { cart, clearCart } = useCart();

  const [submitting, setSubmitting] =
    useState(false);

 const [formData, setFormData] = useState({
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerAddress: "",
  notes: ""
});

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
    quantity: item.quantity,
    size: item.size || "",
    price: item.price
  })),

  totalAmount,

  status: "pendingApproval",
  paymentStatus: "pending",
  deliveryStatus: "notAssigned"
};

      await orderApi.create(orderData);

      toast.success(
        "Order submitted successfully. Waiting for admin approval."
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <h1 className="text-3xl font-bold mb-6">
        Checkout
      </h1>

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
          placeholder="+91 99441-93276"
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

  </CardContent>
</Card>
        </div>

        {/* Order Summary */}

        <div>

          <Card>

            <CardHeader>
              <CardTitle>
                Order Summary
              </CardTitle>
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

                <div className="flex justify-between font-bold text-lg">

                  <span>Total</span>

                  <span>
                    Rs. 
                    {totalAmount}
                  </span>

                </div>

                <Button
                  onClick={
                    handleSubmit
                  }
                  disabled={
                    submitting
                  }
                  className="w-full mt-4 bg-orange-600"
                >
                  {submitting
                    ? "Submitting..."
                    : "Place Order"}
                </Button>

              </div>

            </CardContent>

          </Card>

        </div>

      </div>
    </div>
  );
}