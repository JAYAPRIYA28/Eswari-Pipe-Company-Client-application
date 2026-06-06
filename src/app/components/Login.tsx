import { useState } from 'react';
import {
  useNavigate,
  Link,
} from 'react-router';

import { authService } from '../utils/auth';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useEffect } from 'react';


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

import { toast } from 'sonner';

import {
  LogIn,
  Chrome,
} from 'lucide-react';

export function Login() {

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  // ─────────────────────────────────────────────
  // EMAIL LOGIN
  // ─────────────────────────────────────────────
  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {

      const data =
        await authService.login(
          email,
          password
        );

      const user = data.user;

      toast.success(
        'Logged in successfully!'
      );

      // redirect by role
      if (
        user.user_metadata?.role ===
        'admin'
      ) {
        navigate(
          '/admin/dashboard'
        );
      } else {
        navigate(
          '/user/dashboard'
        );
      }

    } catch (error: any) {

      toast.error(
        error.message ||
        'Login failed'
      );

    } finally {

      setLoading(false);

    }
  }

  useEffect(() => {

  async function checkOAuth() {

    const session =
      await authService
        .handleOAuthLogin();

    if (session) {

      navigate(
        '/user/dashboard'
      );

    }
  }

  checkOAuth();

}, []);

  // ─────────────────────────────────────────────
  // GOOGLE LOGIN
  // ─────────────────────────────────────────────
  async function handleGoogleLogin() {

    try {

      await authService
        .loginWithGoogle();

    } catch (error: any) {

      toast.error(
        error.message ||
        'Google login failed'
      );

    }
  }

  return (
    <div className="min-h-[calc(100vh-20rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      <Card className="w-full max-w-md">

        <CardHeader className="space-y-1">

          <CardTitle className="text-2xl font-bold text-center">
            Login
          </CardTitle>

          {/* <CardDescription className="text-center">
            Enter your credentials
          </CardDescription> */}

        </CardHeader>

        <CardContent>

          {/* LOGIN FORM */}
{/* 
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <div className="space-y-2">

              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                required
              />

            </div>

            <div className="space-y-2">

              <Label htmlFor="password">
                Password
              </Label>

              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
              />

            </div>

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >

              {loading ? (

                <span className="flex items-center">

                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />

                  Logging in...

                </span>

              ) : (

                <span className="flex items-center justify-center">

                  <LogIn className="h-4 w-4 mr-2" />

                  Login

                </span>

              )}

            </Button>

          </form> */}

          {/* DIVIDER */}

          {/* <div className="relative my-6">

            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>

            <div className="relative flex justify-center text-xs uppercase">

              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>

            </div>

          </div> */}

          {/* GOOGLE LOGIN */}

          <Button
  type="button"
  variant="outline"
  className="w-full"
  onClick={handleGoogleLogin}
>

  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="w-5 h-5 mr-2"
  >
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.4 5.4-6.5 6.8l6.2 5.2C39.6 36.5 44 30.8 44 24c0-1.3-.1-2.3-.4-3.5z"
    />
  </svg>

  Continue with Google

       </Button>

          {/* SIGNUP LINK */}

          <div className="mt-6 text-center text-sm">

            <span className="text-gray-600">
              Don't have an account?
            </span>

            <Link
              to="/signup"
              className="ml-1 text-orange-600 hover:text-orange-700 font-medium"
            >
              Sign up
            </Link>

          </div>

        </CardContent>

      </Card>

    </div>
  );
}