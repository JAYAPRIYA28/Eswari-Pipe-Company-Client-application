import {
  useCart,
} from "./CardContext";

import {
  useNavigate,
} from "react-router";

import {
  authService,
} from "../utils/auth";

import {
  toast,
} from "sonner";

import { Button } from "./ui/button";

export function Cart() {

  const navigate =
    useNavigate();

  const {
    cart,
    removeFromCart,
    clearCart,
  } = useCart();



  const total =
    cart.reduce(
      (acc, item) =>
        acc +
        item.price *
          item.quantity,
      0
    );

  // ─────────────────────────────────────────────
  // CHECKOUT
  // ─────────────────────────────────────────────
  async function handleCheckout() {

    try {

      const user =
        await authService
          .getCurrentUser();

      // USER NOT LOGGED IN
      if (!user) {

        toast.error(
          "Please login to continue"
        );

        navigate("/login");

        return;
      }

      // EMPTY CART
      if (cart.length === 0) {

        toast.error(
          "Your cart is empty"
        );

        return;
      }


      // GO TO CHECKOUT PAGE
      // PASS FULL CART DATA
      navigate(
        "/cart-checkout",
        {
          state: {
            cartItems: cart,
            total,
          },
        }
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Checkout failed"
      );

    }
  }

  return (

    <div className="max-w-4xl mx-auto py-10 px-4">

      <h1 className="text-3xl font-bold mb-6">
        Shopping Cart
      </h1>

      {cart.length === 0 ? (

        <div className="text-center py-10">

          <p className="text-gray-600 text-lg">
            Your cart is empty
          </p>

          <Button
            className="mt-4 bg-orange-600 hover:bg-orange-700"
            onClick={() =>
              navigate("/products")
            }
          >
            Continue Shopping
          </Button>

        </div>

      ) : (

        <div className="space-y-4">

          {cart.map((item) => (

            <div
              key={item.id}
              className="border rounded-lg p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white"
            >

              {/* PRODUCT INFO */}
              <div>

                <h2 className="font-semibold text-lg">
                  {item.name}
                </h2>

                <p className="text-gray-600">
                  Price:
                  {" "}
                  Rs. {item.price}
                </p>

                <p className="text-gray-600">
                  Quantity:
                  {" "}
                  {item.quantity}
                </p>

                <p className="font-semibold text-orange-600 mt-1">
                  Subtotal:
                  {" "}
                  Rs. 
                  {item.price *
                    item.quantity}
                </p>

              </div>

              {/* ACTIONS */}
              <div className="flex gap-3">

                {/* SAME FUNCTIONALITY AS VIEW DETAILS */}
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(
                      `/products/${item.id}`
                    )
                  }
                >
                  View Details
                </Button>

                <Button
                  variant="destructive"
                  onClick={() =>
                    removeFromCart(
                      item.id
                    )
                  }
                >
                  Remove
                </Button>

              </div>

            </div>
          ))}

          {/* TOTAL */}
          <div className="border-t pt-6">

            <div className="flex items-center justify-between">

              <h2 className="text-2xl font-bold">
                Total:
              </h2>

              <span className="text-2xl font-bold text-orange-600">
                Rs. {total}
              </span>

            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">

              {/* CHECKOUT BUTTON */}
              <Button
                className="bg-orange-600 hover:bg-orange-700 flex-1"
                onClick={handleCheckout}
              >
                Checkout
              </Button>

              {/* CLEAR CART */}
              <Button
                variant="outline"
                onClick={clearCart}
                className="flex-1"
              >
                Clear Cart
              </Button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}