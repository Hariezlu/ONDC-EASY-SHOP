import { useEffect } from "react";
import CheckoutFlow from "@/components/checkout/checkout-flow";
import TabNavigation from "@/components/layout/tab-navigation";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function CheckoutPage() {
  const [location, navigate] = useLocation();
  
  const tabs = [
    { id: "home", label: "Home", path: "/" },
    { id: "cart", label: "Cart", path: "/cart" },
    { id: "checkout", label: "Checkout", path: "/checkout" },
  ];

  // Check if cart is empty
  const { data: cartItems, isLoading } = useQuery({
    queryKey: ["/api/cart"],
  });

  useEffect(() => {
    // Redirect to home if cart is empty and not coming from a direct order
    if (!isLoading && (!cartItems || cartItems.length === 0) && !location.includes('orderId')) {
      navigate("/");
    }
  }, [cartItems, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <div>
        <TabNavigation tabs={tabs} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cartItems || (cartItems.length === 0 && !location.includes('orderId'))) {
    return (
      <div>
        <TabNavigation tabs={tabs} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card className="p-6 text-center">
            <p className="mb-4">Your cart is empty. Add some products to checkout.</p>
            <button 
              className="bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TabNavigation tabs={tabs} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CheckoutFlow />
      </div>
    </div>
  );
}
