import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import CustomerDashboard from "./pages/CustomerDashboard";
import Wishlist from "./pages/Wishlist";
import OrderHistory from "./pages/OrderHistory";
import Addresses from "./pages/Addresses";
import Notifications from "./pages/Notifications";
import AccountSettings from "./pages/AccountSettings";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

import AboutUs from "./pages/AboutUs";
import Careers from "./pages/Careers";
import Press from "./pages/Press";
import Stories from "./pages/Stories";
import CorporateInfo from "./pages/CorporateInfo";
import Investors from "./pages/Investors";
import HelpCenter from "./pages/HelpCenter";
import PolicyPage from "./pages/PolicyPage";

const queryClient = new QueryClient();

const HIDE_NAV_PATHS = ['/seller', '/admin', '/login', '/signup'];
const NO_FOOTER_PATHS = ['/seller', '/admin', '/login', '/signup'];

// Customer panel paths — handled by CustomerLayout internally
const CUSTOMER_PANEL_PATHS = ['/dashboard', '/orders', '/wishlist', '/addresses', '/notifications', '/settings'];

function AppLayout() {
  const { pathname } = useLocation();
  const hideFooter = NO_FOOTER_PATHS.some(p => pathname.startsWith(p))
    || CUSTOMER_PANEL_PATHS.some(p => pathname.startsWith(p));
  const showNavbar = !HIDE_NAV_PATHS.some(p => pathname.startsWith(p))
    && !CUSTOMER_PANEL_PATHS.some(p => pathname.startsWith(p));

  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />

          {/* Footer Informational Pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/press" element={<Press />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/corporate-info" element={<CorporateInfo />} />
          <Route path="/investors" element={<Investors />} />

          {/* Help Center Sub-pages */}
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/help/:section" element={<HelpCenter />} />

          {/* Consumer Policy Sub-pages */}
          <Route path="/policy" element={<PolicyPage />} />
          <Route path="/policy/:section" element={<PolicyPage />} />

          {/* Customer panel */}
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<AccountSettings />} />

          {/* Dashboards */}
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <AppLayout />
              </BrowserRouter>
            </TooltipProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
