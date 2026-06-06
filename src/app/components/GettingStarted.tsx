import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, Users, Package, ShoppingCart, Settings } from 'lucide-react';

export function GettingStarted() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Getting Started</h1>
        <p className="text-gray-600">Learn how to use the Eswari Pipe and Fencing billing platform</p>
      </div>

      {/* Quick Start */}
      <Card className="mb-8 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
          <CardDescription>Follow these steps to get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">1. Create an Account</h3>
              <p className="text-sm text-gray-700">Sign up as a Customer or Admin/Staff</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">2. Browse Products (Customers)</h3>
              <p className="text-sm text-gray-700">View available pipes, fencing, and fittings</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">3. Add Products (Admin)</h3>
              <p className="text-sm text-gray-700">Use the Product Management tab to add inventory</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">4. Place Orders</h3>
              <p className="text-sm text-gray-700">Choose online or on-site purchase options</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-based Guides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Admin Guide */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-5 w-5 text-orange-600" />
              <CardTitle>For Admins</CardTitle>
            </div>
            <CardDescription>Manage products, orders, and view reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-1">Product Management</h4>
              <p className="text-sm text-gray-600">
                Add, edit, or delete products with sizes, pricing, and stock levels
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Order Approval</h4>
              <p className="text-sm text-gray-600">
                Review and approve online orders with or without payment requirement
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">On-site Purchase</h4>
              <p className="text-sm text-gray-600">
                Create instant orders for walk-in customers
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Delivery Management</h4>
              <p className="text-sm text-gray-600">
                Assign delivery personnel and track order status
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Monthly Reports</h4>
              <p className="text-sm text-gray-600">
                View detailed monthly history and analytics
              </p>
            </div>
            <Link to="/signup">
              <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
                Create Admin Account
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Customer Guide */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle>For Customers</CardTitle>
            </div>
            <CardDescription>Browse products and place orders online</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-1">Browse Products</h4>
              <p className="text-sm text-gray-600">
                View all available products with sizes and pricing
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Generate Quotations</h4>
              <p className="text-sm text-gray-600">
                Get PDF quotations before placing orders
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Request Approval</h4>
              <p className="text-sm text-gray-600">
                Submit orders for admin review and approval
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Track Orders</h4>
              <p className="text-sm text-gray-600">
                Monitor your order status from approval to delivery
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Download Invoices</h4>
              <p className="text-sm text-gray-600">
                Get PDF invoices for completed orders
              </p>
            </div>
            <Link to="/signup">
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                Create Customer Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Flow */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Understanding Purchase Flows</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Online Purchase Flow</h3>
            </div>
            <div className="ml-7 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold">1</div>
                <p className="text-sm">Customer selects product and specifications</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold">2</div>
                <p className="text-sm">Customer enters complete details and submits for approval</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold">3</div>
                <p className="text-sm">Admin reviews and approves (with or without payment)</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold">4</div>
                <p className="text-sm">Customer completes payment (if required)</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold">5</div>
                <p className="text-sm">Admin assigns delivery person</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold">6</div>
                <p className="text-sm">Delivery person marks as delivered or cancelled</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">On-site Purchase Flow (Admin Only)</h3>
            </div>
            <div className="ml-7 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">1</div>
                <p className="text-sm">Admin enters customer name and mobile number</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">2</div>
                <p className="text-sm">Admin adds products and quantities</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">3</div>
                <p className="text-sm">Order is completed and invoice is generated instantly</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Credentials */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Credentials</CardTitle>
          <CardDescription>Use these credentials to explore the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-blue-50 p-4 rounded">
            <p className="font-semibold text-sm text-blue-900 mb-2">Admin Account</p>
            <p className="text-sm text-blue-800">Email: admin@eswari.com</p>
            <p className="text-sm text-blue-800">Password: admin123</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="font-semibold text-sm text-green-900 mb-2">Customer Account</p>
            <p className="text-sm text-green-800">Email: user@example.com</p>
            <p className="text-sm text-green-800">Password: user123</p>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Note: Create these accounts via signup if they don't exist yet
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
