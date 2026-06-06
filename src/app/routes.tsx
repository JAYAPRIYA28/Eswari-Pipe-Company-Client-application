import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Home } from "./components/Home";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { Products } from "./components/Products";
import { ProductDetail } from "./components/ProductDetail";
import { AdminDashboard } from "./components/AdminDashboard";
import { UserDashboard } from "./components/UserDashboard";
import { OnlinePurchase } from "./components/OnlinePurchase";
import { OnsitePurchase } from "./components/OnsitePurchase";
import { OrderTracking } from "./components/OrderTracking";
import { MonthlyHistory } from "./components/MonthlyHistory";
import { GettingStarted } from "./components/GettingStarted";
import { NotFound } from "./components/NotFound";
import { AuthCallback } from "./components/AuthCallback";
import {Cart} from "./components/Cart"
import {Checkout} from "./components/Checkout"

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "getting-started", Component: GettingStarted },
      { path: "products", Component: Products },
      { path: "products/:id", Component: ProductDetail },
      { path: "purchase/online/:productId", Component: OnlinePurchase },
      { path: "purchase/onsite", Component: OnsitePurchase },
      { path: "admin/dashboard", Component: AdminDashboard },
      { path: "user/dashboard", Component: UserDashboard },
      { path: "orders/:id", Component: OrderTracking },
      { path: "admin/history", Component: MonthlyHistory },
      { path: "*", Component: NotFound },
      { path: "auth/callback", Component: AuthCallback },
       { path: "cart", Component: Cart },
        { path: "cart-checkout", Component: Checkout }
    ],
  },
]);