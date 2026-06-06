import { Link } from 'react-router';
import { Button } from './ui/button';
import { ShoppingCart, Package, Truck, Award } from 'lucide-react';
import logo from '../../assets/2d0686e9bc65118c1e56f6363677d2ee0abeb02f.png';
import { useEffect } from 'react';
import { authService } from '../utils/auth';
import {
  useNavigate
} from 'react-router';

export function Home() {
   const navigate = useNavigate();
   useEffect(() => {

  async function checkOAuth() {

    try {

      const user =
        await authService
          .handleOAuthLogin();



      if (!user) {
        return;
      }

      // ROLE BASED REDIRECT
      if (
        user.user_metadata?.role ===
        "admin"
      ) {

        navigate(
          "/admin/dashboard"
        );

      } else {

        navigate(
          "/user/dashboard"
        );

      }

    } catch (err) {

      console.error(err);

    }
  }

  checkOAuth();

}, []);
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Welcome to
                <span className="block text-orange-600 mt-2">Eswari Pipe & Fencing</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8">
                Your trusted manufacturing partner for quality pipes, fencing, bending items, and fittings. 
                Experience seamless online and on-site purchasing with real-time order tracking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Browse Products
                  </Button>
                </Link>
                <Link to="/getting-started">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Getting Started Guide
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <img
               src={logo}
               alt="Eswari Pipe and Fencing" className="max-w-md w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quality Products</h3>
              <p className="text-gray-600">
                Wide range of pipes, fencing, and fittings in various sizes
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Ordering</h3>
              <p className="text-gray-600">
                Online and on-site purchase options for your convenience
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Tracking</h3>
              <p className="text-gray-600">
                Track your orders from placement to delivery
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Trusted Service</h3>
              <p className="text-gray-600">
                Reliable manufacturing with quality assurance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Purchase Options */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Purchase Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-orange-600 mb-4">Online Purchase</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">✓</span>
                  <span>Browse products and select specifications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">✓</span>
                  <span>Submit request for admin approval</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">✓</span>
                  <span>Secure online payment or admin-approved orders</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">✓</span>
                  <span>Track delivery status in real-time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">✓</span>
                  <span>Download PDF invoices and quotations</span>
                </li>
              </ul>
              <Link to="/products">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Start Shopping Online
                </Button>
              </Link>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-green-600 mb-4">On-site Purchase</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Quick order placement at our facility</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Instant invoice generation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Direct payment and collection</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>No delivery tracking needed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Perfect for immediate requirements</span>
                </li>
              </ul>
              <p className="text-gray-600 text-sm">
                * On-site purchase requires admin access. Visit our facility for direct purchases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-700 py-16 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of satisfied customers who trust Eswari Pipe and Fencing for their manufacturing needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Create an Account
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white hover:text-orange-600">
                View Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}