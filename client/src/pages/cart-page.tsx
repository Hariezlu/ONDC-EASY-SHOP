import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { CartItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";

export default function CartPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Redirect to login if not authenticated
          navigate('/auth');
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Fetch cart items
  const { data: cartItems, isLoading: isLoadingCart, error: cartError } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  // Calculate total
  const cartTotal = cartItems?.reduce((total, item) => {
    return total + (parseFloat(item.product?.price || "0") * (item.quantity || 0));
  }, 0) || 0;

  // Remove from cart mutation
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest('DELETE', `/api/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number, quantity: number }) => {
      await apiRequest('PATCH', `/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update quantity",
        variant: "destructive",
      });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/cart');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  // Handle quantity change
  const handleQuantityChange = (itemId: number, currentQuantity: number | null, change: number) => {
    const newQuantity = (currentQuantity || 0) + change;
    
    if (newQuantity < 1) {
      // Remove item if quantity would be less than 1
      removeItemMutation.mutate(itemId);
    } else {
      // Update quantity
      updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
    }
  };

  // Proceed to checkout
  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Shopping Cart</h1>
      
      {isLoadingCart ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="flex p-4">
                <Skeleton className="h-24 w-24 mr-4" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/4 mb-2" />
                  <Skeleton className="h-4 w-1/5 mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : cartError ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Failed to load cart items</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/cart'] })}>
            Try Again
          </Button>
        </div>
      ) : !cartItems?.length ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-lg text-gray-500 mb-6">Your cart is empty</p>
          <Button asChild>
            <Link to="/products">
              Continue Shopping
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="flex p-4">
                    <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0 mr-4">
                      {item.product?.imageUrl ? (
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <Link to={`/product/${item.product?.id || 0}`}>
                            <h3 className="font-medium hover:text-primary transition-colors">
                              {item.product?.name || 'Product Unknown'}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500">{item.product?.brand?.name || 'Brand Unknown'}</p>
                          {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => removeItemMutation.mutate(item.id)}
                          disabled={removeItemMutation.isPending}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center border border-gray-300 rounded">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            disabled={updateQuantityMutation.isPending}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <div className="w-10 text-center">{item.quantity}</div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            disabled={updateQuantityMutation.isPending}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="font-medium">
                          ${(parseFloat(item.product?.price || "0") * (item.quantity || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="mt-4 text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearCartMutation.mutate()}
                disabled={clearCartMutation.isPending}
                className="text-gray-500"
              >
                Clear Cart
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>${(cartTotal * 0.10).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 border-gray-200">
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span>${(cartTotal + (cartTotal * 0.10)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={!cartItems?.length}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}