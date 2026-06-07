import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { CheckCircle, ShoppingCart, Receipt } from "lucide-react";

export function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">

        <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Order Completed Successfully
        </h1>

        <p className="text-gray-600 mb-3">
          Your order has been created successfully.
        </p>

        <p className="text-gray-600 mb-6">
          The invoice has been generated and downloaded automatically.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left mb-6">
          <h3 className="font-semibold text-green-800 mb-2">
            What happened?
          </h3>

          <ul className="space-y-2 text-sm text-green-700">
            <li>
              ✓ Order created successfully
            </li>

            <li>
              ✓ GST & SGST calculated
            </li>

            <li>
              ✓ Invoice generated and downloaded
            </li>

            <li>
              ✓ Payment status recorded
            </li>

            <li>
              ✓ Pending amount tracked (if applicable)
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">

          <Button
            onClick={() => navigate("/products")}
            variant="outline"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>

          <Button
            onClick={() => navigate("/")}
            className="bg-green-600 hover:bg-green-700"
          >
            <Receipt className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

        </div>
      </div>
    </div>
  );
}