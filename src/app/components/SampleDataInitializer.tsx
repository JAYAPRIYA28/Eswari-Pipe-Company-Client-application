import { useState } from 'react';
import { productApi } from '../utils/api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Database } from 'lucide-react';

const SAMPLE_PRODUCTS = [
  {
    name: 'GI Pipes (Galvanized Iron)',
    description: 'High-quality galvanized iron pipes for water supply and construction',
    category: 'pipes',
    basePrice: 250,
    stock: 500,
    sizes: ['0.5', '0.75', '1', '1.25', '1.5', '2', '2.5', '3', '4'],
    pricing: {
      '0.5': 180,
      '0.75': 220,
      '1': 250,
      '1.25': 300,
      '1.5': 350,
      '2': 450,
      '2.5': 550,
      '3': 650,
      '4': 850,
    },
    imageUrl: 'https://images.unsplash.com/photo-1623008632983-a4548728fe2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYWx2YW5pemVkJTIwcGlwZXxlbnwxfHx8fDE3NzQxNzYxMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    specifications: 'ISI certified, corrosion resistant, suitable for underground and overhead applications',
  },
  {
    name: 'Steel Pipes',
    description: 'Heavy-duty steel pipes for industrial and commercial use',
    category: 'pipes',
    basePrice: 300,
    stock: 350,
    sizes: ['1', '1.5', '2', '3', '4', '6'],
    pricing: {
      '1': 280,
      '1.5': 380,
      '2': 480,
      '3': 680,
      '4': 950,
      '6': 1500,
    },
    imageUrl: 'https://images.unsplash.com/photo-1673201159772-a3b7fa2ecc5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVlbCUyMHBpcGUlMjBtYW51ZmFjdHVyaW5nfGVufDF8fHx8MTc3NDE3NjEzMXww&ixlib=rb-4.1.0&q=80&w=1080',
    specifications: 'High tensile strength, suitable for plumbing and structural applications',
  },
  {
    name: 'Chain Link Fencing',
    description: 'Durable chain link fencing for perimeter security',
    category: 'fencing',
    basePrice: 120,
    stock: 1000,
    sizes: ['4', '5', '6', '8', '10'],
    pricing: {
      '4': 100,
      '5': 120,
      '6': 140,
      '8': 180,
      '10': 220,
    },
    imageUrl: 'https://images.unsplash.com/photo-1615129628457-17ff3d9386c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFpbiUyMGxpbmslMjBmZW5jZXxlbnwxfHx8fDE3NzQxMzI5NTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    specifications: 'Galvanized wire, weather resistant, easy installation',
  },
  {
    name: 'Pipe Fittings & Elbows',
    description: 'Complete range of pipe fittings, elbows, and connectors',
    category: 'fittings',
    basePrice: 50,
    stock: 800,
    sizes: ['0.5', '0.75', '1', '1.25', '1.5', '2'],
    pricing: {
      '0.5': 35,
      '0.75': 45,
      '1': 50,
      '1.25': 65,
      '1.5': 80,
      '2': 100,
    },
    imageUrl: 'https://images.unsplash.com/photo-1769012334805-eb47a65b5d54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXRhbCUyMHBpcGUlMjBmaXR0aW5nc3xlbnwxfHx8fDE3NzQxNzYxMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    specifications: 'Includes elbows, tees, reducers, and couplings',
  },
];

interface Props {
  onComplete?: () => void;
}

export function SampleDataInitializer({ onComplete }: Props) {
  const [loading, setLoading] = useState(false);

  async function initializeSampleData() {
    setLoading(true);
    try {
      let successCount = 0;
      
      for (const product of SAMPLE_PRODUCTS) {
        try {
          await productApi.create(product);
          successCount++;
        } catch (error) {
          console.error(`Failed to create product: ${product.name}`, error);
        }
      }

      toast.success(`Successfully created ${successCount} sample products!`);
      onComplete?.();
    } catch (error) {
      toast.error('Failed to initialize sample data');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initialize Sample Data</CardTitle>
        <CardDescription>
          Add sample products to get started quickly. This is useful for demo and testing purposes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={initializeSampleData}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <span className="flex items-center">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Creating sample products...
            </span>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Add Sample Products
            </>
          )}
        </Button>
        <p className="text-xs text-gray-500 mt-3">
          This will create 4 sample products: GI Pipes, Steel Pipes, Chain Link Fencing, and Pipe Fittings
        </p>
      </CardContent>
    </Card>
  );
}
