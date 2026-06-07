import {
  Outlet,
  Link,
  useNavigate,
  useLocation,
} from 'react-router';

import {
  useEffect,
  useState,
} from 'react';

import {
  authService,
  User,
} from '../utils/auth';

import {
  Button,
} from './ui/button';

import {
  LogOut,
  Menu,
  X,
  ShoppingCart,
} from 'lucide-react';

import { toast } from 'sonner';

import logo from '../../assets/2d0686e9bc65118c1e56f6363677d2ee0abeb02f.png';

import {
  useCart,
} from './CardContext';

export function RootLayout() {

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    totalItems,
  } = useCart();

  // ─────────────────────────────────────────────
  // CHECK USER
  // ─────────────────────────────────────────────
  useEffect(() => {

    checkUser();

  }, [location.pathname]);

  async function checkUser() {

    try {

      const currentUser =
        await authService
          .getCurrentUser();

      setUser(currentUser);

    } catch (error) {

      console.error(
        'Error checking user:',
        error
      );

    } finally {

      setLoading(false);

    }
  }

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────
  async function handleLogout() {

    try {

      await authService.logout();

      setUser(null);

      toast.success(
        'Logged out successfully'
      );

      navigate('/');

    } catch (error) {

      toast.error(
        'Logout failed'
      );
    }
  }

  // ─────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────
  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <header className="bg-white shadow-sm sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-center h-20">

            {/* LOGO */}

            <Link
              to="/"
              className="flex items-center space-x-3"
            >

              <img
                src={logo}
                alt="Eswari Pipe and Fencing"
                className="h-14 w-auto"
              />

            </Link>

            {/* DESKTOP NAVIGATION */}

            <nav className="hidden md:flex items-center space-x-6">

              <Link
                to="/products"
                className="text-gray-700 hover:text-orange-600 font-medium transition"
              >
                Products
              </Link>

              <Link
                to="/getting-started"
                className="text-gray-700 hover:text-orange-600 font-medium transition"
              >
                Guide
              </Link>

              {/* USER NAVIGATION */}

              {user ? (

                <>

                  {/* ADMIN */}

                  {user.user_metadata.role === 'admin' ? (

                    <>

                      <Link
                        to="/admin/dashboard"
                        className="text-gray-700 hover:text-orange-600 font-medium transition"
                      >
                        Dashboard
                      </Link>

                      <Link
                        to="/purchase/onsite"
                        className="text-gray-700 hover:text-orange-600 font-medium transition"
                      >
                        On-site Purchase
                      </Link>

                      <Link
                        to="/admin/history"
                        className="text-gray-700 hover:text-orange-600 font-medium transition"
                      >
                        History
                      </Link>

                    </>

                  ) : (

                    <Link
                      to="/user/dashboard"
                      className="text-gray-700 hover:text-orange-600 font-medium transition"
                    >
                      My Orders
                    </Link>

                  )}

                  {/* CART */}

                  <Link to="/cart">

                    <Button
                      variant="outline"
                      size="sm"
                      className="relative"
                    >

                      <ShoppingCart className="h-5 w-5" />

                      {totalItems > 0 && (

                        <span
                          className="
                            absolute
                            -top-2
                            -right-2
                            bg-orange-600
                            text-white
                            text-xs
                            rounded-full
                            min-w-[20px]
                            h-5
                            flex
                            items-center
                            justify-center
                            px-1
                          "
                        >

                          {totalItems}

                        </span>
                      )}

                    </Button>

                  </Link>

                  {/* USER INFO */}

                  <div className="flex items-center space-x-3">

                    <span className="text-sm text-gray-600">

                      {user.user_metadata.name}

                    </span>

                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                    >

                      <LogOut className="h-4 w-4 mr-2" />

                      Logout

                    </Button>

                  </div>

                </>

              ) : (

                <>

                  <Link to="/login">

                    <Button variant="outline">
                      Login
                    </Button>

                  </Link>

                  <Link to="/signup">

                    <Button className="bg-orange-600 hover:bg-orange-700">
                      Sign Up
                    </Button>

                  </Link>

                </>

              )}

            </nav>

            {/* MOBILE MENU BUTTON */}

           <div className="md:hidden flex items-center gap-2">

  {/* Mobile Cart */}

  <Link to="/cart">

    <Button
      variant="outline"
      size="sm"
      className="relative"
    >
      <ShoppingCart className="h-5 w-5" />

      {totalItems > 0 && (
        <span
          className="
            absolute
            -top-2
            -right-2
            bg-orange-600
            text-white
            text-xs
            rounded-full
            min-w-[20px]
            h-5
            flex
            items-center
            justify-center
          "
        >
          {totalItems}
        </span>
      )}
    </Button>

  </Link>

  {/* Menu Button */}

  <button
    onClick={() =>
      setMobileMenuOpen(!mobileMenuOpen)
    }
    className="p-2"
  >
    {mobileMenuOpen ? (
      <X className="h-6 w-6" />
    ) : (
      <Menu className="h-6 w-6" />
    )}
  </button>

</div>

          </div>

        </div>

        {/* MOBILE NAVIGATION */}

        {mobileMenuOpen && (

          <div className="md:hidden border-t bg-white">

            <div className="px-4 py-4 space-y-3">

              <Link
                to="/products"
                className="block text-gray-700 hover:text-orange-600 font-medium"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
              >
                Products
              </Link>

              <Link
                to="/getting-started"
                className="block text-gray-700 hover:text-orange-600 font-medium"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
              >
                Guide
              </Link>

              {/* MOBILE CART */}

              {/* <Link
                to="/cart"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="block"
              >

                <Button
                  variant="outline"
                  className="w-full relative"
                >

                  <ShoppingCart className="h-5 w-5 mr-2" />

                  Cart

                  {totalItems > 0 && (

                    <span
                      className="
                        ml-2
                        bg-orange-600
                        text-white
                        text-xs
                        rounded-full
                        min-w-[20px]
                        h-5
                        flex
                        items-center
                        justify-center
                        px-1
                      "
                    >

                      {totalItems}

                    </span>
                  )}

                </Button>

              </Link> */}

              {/* USER */}

              {user ? (

                <>

                  {user.user_metadata.role === 'admin' ? (

                    <>

                      <Link
                        to="/admin/dashboard"
                        className="block text-gray-700 hover:text-orange-600 font-medium"
                        onClick={() =>
                          setMobileMenuOpen(false)
                        }
                      >
                        Dashboard
                      </Link>

                      <Link
                        to="/purchase/onsite"
                        className="block text-gray-700 hover:text-orange-600 font-medium"
                        onClick={() =>
                          setMobileMenuOpen(false)
                        }
                      >
                        On-site Purchase
                      </Link>

                      <Link
                        to="/admin/history"
                        className="block text-gray-700 hover:text-orange-600 font-medium"
                        onClick={() =>
                          setMobileMenuOpen(false)
                        }
                      >
                        History
                      </Link>

                    </>

                  ) : (

                    <Link
                      to="/user/dashboard"
                      className="block text-gray-700 hover:text-orange-600 font-medium"
                      onClick={() =>
                        setMobileMenuOpen(false)
                      }
                    >
                      My Orders
                    </Link>

                  )}

                  <div className="pt-3 border-t">

                    <p className="text-sm text-gray-600 mb-2">

                      {user.user_metadata.name}

                    </p>

                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >

                      <LogOut className="h-4 w-4 mr-2" />

                      Logout

                    </Button>

                  </div>

                </>

              ) : (

                <div className="space-y-2">

                  <Link
                    to="/login"
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                  >

                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      Login
                    </Button>

                  </Link>

                  <Link
                    to="/signup"
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                  >

                    <Button className="w-full bg-orange-600 hover:bg-orange-700">

                      Sign Up

                    </Button>

                  </Link>

                </div>

              )}

            </div>

          </div>
        )}

      </header>

      {/* MAIN */}

      <main>

        <Outlet />

      </main>

      {/* FOOTER */}

      <footer className="bg-gray-900 text-white mt-16">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div>

              <h3 className="text-lg font-bold mb-4">
                Eswari Pipe and Fencing
              </h3>

              <p className="text-gray-400 text-sm">

                Your trusted partner for quality pipes,
                fencing, and fittings.

              </p>

            </div>

            <div>

              <h3 className="text-lg font-bold mb-4">
                Contact
              </h3>

              <p className="text-gray-400 text-sm">
                Phone: +91 99441-93276
              </p>

              <p className="text-gray-400 text-sm">
                Email:
                info@eswaripipeandfencing.com
              </p>

            </div>

            <div>

              <h3 className="text-lg font-bold mb-4">
                Quick Links
              </h3>

              <div className="space-y-2">

                <Link
                  to="/products"
                  className="block text-gray-400 hover:text-white text-sm"
                >
                  Products
                </Link>

                <Link
                  to="/login"
                  className="block text-gray-400 hover:text-white text-sm"
                >
                  Login
                </Link>

              </div>

            </div>

          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">

            © 2026 Eswari Pipe and Fencing.
            All rights reserved.

          </div>

        </div>

      </footer>

    </div>
  );
}