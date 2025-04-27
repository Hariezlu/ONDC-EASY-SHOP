import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";

export default function NavbarBasic() {
  const [location] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user info and cart count
  useEffect(() => {
    async function fetchUserAndCart() {
      try {
        // Try to get current user
        const userResponse = await fetch('/api/user');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          
          // If user is logged in, get cart count
          const cartResponse = await fetch('/api/cart');
          if (cartResponse.ok) {
            const cartItems = await cartResponse.json();
            setCartCount(cartItems.length);
          }
        }
      } catch (error) {
        console.error("Error fetching user or cart:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserAndCart();
  }, [location]); // Refetch when location changes, e.g., after adding to cart

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/logout');
      setUser(null);
      setCartCount(0);
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-primary text-2xl font-bold">ShopEase</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location === "/"
                    ? "border-primary text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Home
              </Link>
              <Link
                to="/brands"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location === "/brands"
                    ? "border-primary text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Brands
              </Link>
              <Link
                to="/products"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location === "/products"
                    ? "border-primary text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Products
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative mx-4">
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <Input 
                type="text" 
                className="w-64 pl-10 pr-4 py-2 rounded-full" 
                placeholder="Search products..." 
              />
            </div>
            
            <Link to="/cart">
              <Button variant="outline" size="icon" className="rounded-full text-gray-500 relative">
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-primary text-white px-1.5 py-0.5 rounded-full text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-3 rounded-full bg-gray-100">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="font-medium text-sm">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.email}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="ml-3" variant="default">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <Button variant="ghost" size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}