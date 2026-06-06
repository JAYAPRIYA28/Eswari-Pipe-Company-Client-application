import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { productApi, orderApi } from '../utils/api';
import { authService } from '../utils/auth';
import { ProductManagement } from './admin/ProductManagement';
import { OrderManagement } from './admin/OrderManagement';
import { SampleDataInitializer } from './SampleDataInitializer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Package, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    checkAdminAccess();
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
      await loadStats();
    } catch (error) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const [productsData, ordersData] = await Promise.all([
        productApi.getAll(),
        orderApi.getAll(),
      ]);

      const products = productsData || [];
      const orders = ordersData || [];

      const pendingOrders = orders.filter((o: any) => 
        o.status === 'pending_approval' || o.status === 'approved_payment_pending'
      ).length;

      const totalRevenue = orders
        .filter((o: any) => o.status === 'paid' || o.status === 'delivered' || o.status === 'completed')
        .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);


      console.log("orders", orders, ordersData, totalRevenue);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.user_metadata?.name}</p>
      </div>

      {/* Sample Data Initializer - Show if no products */}
      {stats.totalProducts === 0 && (
        <div className="mb-8">
          <SampleDataInitializer onComplete={loadStats} />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Products
            </CardTitle>
            <Package className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Orders
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Orders
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="orders">Order Management</TabsTrigger>
          <TabsTrigger value="products">Product Management</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OrderManagement onStatsUpdate={loadStats} />
        </TabsContent>

        <TabsContent value="products">
          <ProductManagement onStatsUpdate={loadStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}