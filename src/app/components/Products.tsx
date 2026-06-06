import { useEffect, useState } from 'react';
import { productApi } from '../utils/api';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Package, ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useCart } from './CardContext';
import { useNavigate } from 'react-router';
import { authService } from '../utils/auth';

export function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] =
  useState("all");

  const navigate = useNavigate();

  const filteredProducts =
  selectedCategory === "all"
    ? products
    : products.filter(
        p => p.category === selectedCategory
      );

  const { addToCart, cart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await productApi.getAll();
      setProducts(data);
    } catch (error: any) {
      toast.error('Failed to load products');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Our Products
        </h1>

        <p className="text-gray-600">
          Browse our wide range of quality pipes,
          fencing, and fittings
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Products Available
          </h3>

          <p className="text-gray-500">
            Products will be displayed here once
            added by the admin.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex gap-2 mb-6">
  <Button
    variant={selectedCategory === "all"
      ? "default"
      : "outline"}
    onClick={() => setSelectedCategory("all")}
  >
    All
  </Button>

  <Button
    variant={selectedCategory === "pipe"
      ? "default"
      : "outline"}
    onClick={() => setSelectedCategory("pipe")}
  >
    Pipes
  </Button>

  <Button
    variant={selectedCategory === "fencing"
      ? "default"
      : "outline"}
    onClick={() => setSelectedCategory("fencing")}
  >
    Fencing
  </Button>
</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredProducts.map((product) => {
            const cartItem = cart.find(
              (item: any) => item.id === product.id
            );

            const quantity = cartItem?.quantity || 0;

            return (
              <Card
                key={product.id}
                className="hover:shadow-lg transition"
              >
                <CardHeader>
                  {product.imageUrl && (
                    <div className="w-full h-48 bg-gray-100 rounded-md mb-4 overflow-hidden">
                      <ImageWithFallback
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">
                      {product.name}
                    </CardTitle>

                    {quantity > 0 && (
                      <Badge
                        className="bg-green-100 text-green-700"
                      >
                        Qty: {quantity}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">
                    {product.description}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Category:
                      </span>

                      <Badge
  variant={
    product.category === "fencing"
      ? "default"
      : "secondary"
  }
>
  {product.category === "fencing"
    ? "Fencing"
    : "Pipe"}
</Badge>
                    </div>

                   {product.category === "pipe" &&
 product.sizes?.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">
                          Available Sizes:
                        </span>

                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.sizes
                            .slice(0, 4)
                            .map(
                              (
                                size: string,
                                idx: number
                              ) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {size}"
                                </Badge>
                              )
                            )}

                          {product.sizes.length > 4 && (
                            <Badge
                              variant="outline"
                              className="text-xs"
                            >
                              +
                              {product.sizes.length - 4}
                              {" "}more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {product.category === "fencing" && (
  <div className="flex justify-between">
    <span className="text-sm text-gray-600">
      Pricing Type:
    </span>

    <Badge variant="outline">
      Per Sq.Ft
    </Badge>
  </div>
)}

                    <div className="flex justify-between pt-2">
  <span className="text-sm text-gray-600">
    {product.category === "fencing"
      ? "Price / Sq.Ft:"
      : "Base Price:"}
  </span>

  <span className="text-lg font-bold text-orange-600">
    Rs. {product.basePrice || 0}
  </span>
</div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Stock:
                      </span>

                      <Badge
                        variant={
                          product.stock > 0
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {product.stock > 0
                          ? `${product.stock} units`
                          : 'Out of Stock'}
                      </Badge>
                    </div>

                    {/* Cart quantity display */}

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Added to Cart:
                      </span>

                      <Badge
                        variant={
                          quantity > 0
                            ? 'default'
                            : 'outline'
                        }
                      >
                        {quantity > 0
                          ? `${quantity} item${
                              quantity > 1 ? 's' : ''
                            }`
                          : 'Not Added'}
                      </Badge>
                    </div>

                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={product.stock <= 0}
                   onClick={async () => {
  const currentUser =
    await authService.getCurrentUser();

  if (!currentUser) {
    toast.error(
      'Please sign up or login to add items to cart'
    );

    navigate('/signup');
    return;
  }

  addToCart(product);

  toast.success(
    `${product.name} added to cart`
  );
}}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />

                    {quantity > 0
                      ? `Add More (${quantity})`
                      : 'Add to Cart'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}

        </div>
        </div>
      )}
    </div>
  );
}