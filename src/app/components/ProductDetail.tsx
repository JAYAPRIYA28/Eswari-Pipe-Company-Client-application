import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { productApi } from '../utils/api';
import { authService } from '../utils/auth';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    loadProduct();
    checkAuth();
  }, [id]);

  async function checkAuth() {
    try {
      const user = await authService.getCurrentUser();
      setIsLoggedIn(!!user);
    } catch (error) {
      setIsLoggedIn(false);
    }
  }

  async function loadProduct() {
    try {
      const data = await productApi.getById(id!);
      console.log("data", data)
      setProduct(data);
    } catch (error: any) {
      toast.error('Failed to load product');
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  }

  function handlePurchase() {
    if (!isLoggedIn) {
      toast.error('Please login to make a purchase');
      navigate('/login');
      return;
    }

    navigate(`/purchase/online/${id}`);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <Link to="/products">
            <Button variant="outline">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/products">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div>
          {product.imageUrl ? (
            <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-24 w-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-4">
            <Badge variant="secondary" className="mb-2">{product.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-lg text-gray-600">{product.description}</p>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <span className="text-lg font-semibold">Base Price:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    Rs. {product.basePrice || 0}
                  </span>
                </div>

                <div>
                  <span className="font-semibold mb-2 block">Available Sizes (inches):</span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes && product.sizes.length > 0 ? (
                      product.sizes.map((size: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          {size}"
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No sizes specified</p>
                    )}
                  </div>
                </div>

                {product.pricing && Object.keys(product.pricing).length > 0 && (
                  <div>
                    <span className="font-semibold mb-2 block">Size-wise Pricing:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(product.pricing).map(([size, price]: [string, any]) => (
                        <div key={size} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{size}"</span>
                          <span className="text-sm font-semibold">Rs. {price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="font-semibold">Stock Available:</span>
                  <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                    {product.stock > 0 ? `${product.stock} units` : 'Out of Stock'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 py-6 text-lg"
              onClick={handlePurchase}
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {product.stock > 0 ? 'Purchase Online' : 'Out of Stock'}
            </Button>

            {!isLoggedIn && (
              <p className="text-sm text-center text-gray-600">
                Please <Link to="/login" className="text-orange-600 hover:underline">login</Link> to make a purchase
              </p>
            )}
          </div>

          {product.specifications && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Specifications</h3>
              <div className="prose text-gray-600">
                {product.specifications}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
