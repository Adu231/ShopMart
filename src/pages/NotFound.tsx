import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: Non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="text-8xl font-black text-[#2874F0] mb-2">404</div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Oops! Page not found</h1>
      <p className="text-muted-foreground text-sm mb-8 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex gap-3">
        <Link to="/" className="flex items-center gap-2 bg-[#2874F0] hover:bg-[#1D5FD1] text-white px-6 py-2.5 rounded-lg font-semibold transition-colors">
          <Home size={16} /> Go Home
        </Link>
        <Link to="/products" className="flex items-center gap-2 bg-[#FB641B] hover:bg-[#e55a18] text-white px-6 py-2.5 rounded-lg font-semibold transition-colors">
          <Search size={16} /> Browse Products
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
