import { Route, Switch } from "wouter";
import Protected from "./_core/Protected";
import { StoreLayout } from "./components/Layout";
import { AdminLayout } from "./components/AdminLayout";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import PaymentStatus from "./pages/PaymentStatus";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminSignup from "./pages/AdminSignup";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminPayments from "./pages/admin/Payments";
import AdminCategories from "./pages/admin/Categories";
import AdminUsers from "./pages/admin/Users";
import AdminNotifications from "./pages/admin/Notifications";
import AdminSettings from "./pages/admin/Settings";

/** Storefront pages share the header/footer shell. */
function Store({ children }: { children: React.ReactNode }) {
  return <StoreLayout>{children}</StoreLayout>;
}

/** Admin pages share the dashboard shell (which enforces the admin role). */
function Admin({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <Switch>
      {/* storefront */}
      <Route path="/"><Store><Home /></Store></Route>
      <Route path="/products"><Store><Products /></Store></Route>
      <Route path="/products/:slug"><Store><ProductDetail /></Store></Route>
      <Route path="/categories"><Store><Categories /></Store></Route>
      <Route path="/cart"><Store><Cart /></Store></Route>
      <Route path="/checkout"><Store><Checkout /></Store></Route>
      <Route path="/order/:orderNumber"><Store><OrderConfirmation /></Store></Route>
      <Route path="/payment-status/:orderNumber"><Store><PaymentStatus /></Store></Route>
      <Route path="/wishlist"><Store><Wishlist /></Store></Route>
      <Route path="/account">
        <Store>
          <Protected>
            <Account />
          </Protected>
        </Store>
      </Route>

      {/* auth (standalone, no store chrome) */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Signup} />
      {/* Admin sign-up is standalone too: it must be reachable while signed out. */}
      <Route path="/admin/register" component={AdminSignup} />

      {/* admin */}
      <Route path="/admin"><Admin><AdminDashboard /></Admin></Route>
      <Route path="/admin/products"><Admin><AdminProducts /></Admin></Route>
      <Route path="/admin/orders"><Admin><AdminOrders /></Admin></Route>
      <Route path="/admin/payments"><Admin><AdminPayments /></Admin></Route>
      <Route path="/admin/categories"><Admin><AdminCategories /></Admin></Route>
      <Route path="/admin/users"><Admin><AdminUsers /></Admin></Route>
      <Route path="/admin/notifications"><Admin><AdminNotifications /></Admin></Route>
      <Route path="/admin/settings"><Admin><AdminSettings /></Admin></Route>

      <Route><Store><NotFound /></Store></Route>
    </Switch>
  );
}
