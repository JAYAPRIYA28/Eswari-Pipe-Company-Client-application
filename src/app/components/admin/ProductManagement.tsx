import { useEffect, useState } from 'react';
import { productApi } from '../../utils/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';

interface Props {
  onStatsUpdate: () => void;
}

export function ProductManagement({ onStatsUpdate }: Props) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    basePrice: '0',
    stock: '0',
    sizes: '',
    pricing: '',
    imageUrl: '',
    specifications: '',
  squareFeet: '0',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await productApi.getAll();
      console.log("data", data)
      setProducts(data || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'pipes',
      basePrice: '0',
      stock: '0',
      sizes: '',
      pricing: '',
      imageUrl: '',
      specifications: '',
       squareFeet: '0',
    });
    setDialogOpen(true);
  }

  function openEditDialog(product: any) {
    setEditProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || 'pipes',
      basePrice: product.basePrice || '0',
      stock: product.stock || '0',
      sizes: product.sizes?.join(', ') || '',
      pricing: product.pricing ? JSON.stringify(product.pricing, null, 2) : '',
      imageUrl: product.imageUrl || '',
      specifications: product.specifications || '',
       squareFeet: product.squareFeet || '0',
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const finalPrice =
  formData.category === "fencing"
    ? parseInt(formData.squareFeet) * parseFloat(formData.basePrice)
    : parseFloat(formData.basePrice);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        basePrice: parseFloat(finalPrice.toString()),
        stock: parseInt(formData.stock.toString()),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
        pricing: formData.pricing ? JSON.parse(formData.pricing) : {},
        imageUrl: formData.imageUrl,
        specifications: formData.specifications
      };

      if (editProduct) {
        await productApi.update(editProduct.id, productData);
        toast.success('Product updated successfully');
      } else {
        await productApi.create(productData);
        toast.success('Product created successfully');
      }

      setDialogOpen(false);
      loadProducts();
      onStatsUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productApi.delete(id);
      toast.success('Product deleted successfully');
      loadProducts();
      onStatsUpdate();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const fencingTotal =
  formData.category === "fencing"
    ? parseInt(formData.squareFeet) * parseFloat(formData.basePrice)
    : parseFloat(formData.basePrice);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Products</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {editProduct ? 'Update product details' : 'Create a new product listing'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                 <Select
  value={formData.category}
  onValueChange={(value) =>
    setFormData({ ...formData, category: value })
  }
>
  <SelectTrigger>
    <SelectValue placeholder="Select Category" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="pipe">Pipe</SelectItem>
    <SelectItem value="fencing">Fencing</SelectItem>
  </SelectContent>
</Select>
                </div>

                <div>
                  <Label htmlFor="basePrice">Base Price (Rs. ) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              {formData.category === "fencing" && (
  <div>
    <Label htmlFor="squareFeet">Square Feet</Label>
    <Input
      id="squareFeet"
      type="number"
      min="1"
      value={formData.squareFeet}
      onChange={(e) =>
        setFormData({
          ...formData,
          squareFeet: e.target.value ,
        })
      }
    />
  </div>
)}

{formData.category === "fencing" && (
  <div className="p-3 bg-gray-50 rounded-lg">
    <p className="font-medium">
      Total Price: Rs. 
      {(parseInt(formData.squareFeet) * parseFloat(formData.basePrice)).toFixed(2)}
    </p>

    <p className="text-sm text-gray-500">
      {formData.squareFeet} sq.ft × Rs. {formData.basePrice}
    </p>
  </div>
)}

              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="sizes">Available Sizes (comma-separated, in inches)</Label>
                <Input
                  id="sizes"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="e.g., 1, 1.5, 2, 3, 4"
                />
                <p className="text-xs text-gray-500 mt-1">Enter sizes separated by commas</p>
              </div>

              <div>
                <Label htmlFor="pricing">Size-wise Pricing (JSON format)</Label>
                <Textarea
                  id="pricing"
                  value={formData.pricing}
                  onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                  rows={4}
                  placeholder='{"1": 100, "1.5": 150, "2": 200}'
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Size-specific pricing in JSON format</p>
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="specifications">Specifications</Label>
                <Textarea
                  id="specifications"
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
                  {editProduct ? 'Update Product' : 'Create Product'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {console.log("products", products)}

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600">No products yet. Add your first product to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{product.name}</CardTitle>
                    <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                    <p className="text-sm text-gray-600">{product.description}</p>
                  </div>
                  {product.imageUrl && (
                    <div className="w-20 h-20 bg-gray-100 rounded ml-4 overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-semibold">Rs. {product.basePrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock:</span>
                    <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                      {product.stock} units
                    </Badge>
                  </div>
                  {product.sizes && product.sizes.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Sizes: </span>
                      <span className="text-sm">{product.sizes.join(', ')}"</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => openEditDialog(product)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(product.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
