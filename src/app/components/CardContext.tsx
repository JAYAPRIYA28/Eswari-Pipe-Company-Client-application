import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];

  addToCart: (product: any) => void;

  removeFromCart: (id: string) => void;

  clearCart: () => void;

  totalItems: number;
}

const CartContext =
  createContext<CartContextType | null>(
    null
  );

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [cart, setCart] =
    useState<CartItem[]>([]);

  // ADD TO CART
  function addToCart(product: any) {

    setCart((prev) => {

      const existing =
        prev.find(
          (item) =>
            item.id === product.id
        );

      if (existing) {

        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price:
            product.basePrice || 0,
          imageUrl:
            product.imageUrl,
          quantity: 1,
        },
      ];
    });
  }

  // REMOVE
  function removeFromCart(
    id: string
  ) {

    setCart((prev) =>
      prev.filter(
        (item) => item.id !== id
      )
    );
  }

  // CLEAR
  function clearCart() {
    setCart([]);
  }

  const totalItems =
    cart.reduce(
      (acc, item) =>
        acc + item.quantity,
      0
    );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {

  const context =
    useContext(CartContext);

  if (!context) {

    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}