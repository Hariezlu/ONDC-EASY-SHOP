import { useParams, useLocation, Link } from "wouter";
import OrderDetails from "@/components/order/order-details";
import { Card, CardContent } from "@/components/ui/card";
import TabNavigation from "@/components/layout/tab-navigation";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Order } from "@shared/schema";

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = id ? parseInt(id) : null;
  const [location] = useLocation();
  
  // Determine if we're on the /orders page or the /order/:id page
  const isOrdersListPage = location === "/orders";
  
  // Generate tabs for navigation
  const tabs = [
    { id: "home", label: "Home", path: "/" },
    { id: "profile", label: "Profile", path: "/profile" },
    { id: "orders", label: "Orders", path: "/orders" },
  ];
  
  // Add order details tab only if we're viewing a specific order
  if (orderId) {
    tabs.push({ id: "order-details", label: "Order Details", path: `/order/${id}` });
  }

  // Fetch all orders for the orders list page
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
    enabled: isOrdersListPage,
  });

  // If we're on the orders list page, show the list of orders
  if (isOrdersListPage) {
    return (
      <div>
        <TabNavigation tabs={tabs} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
          
          {ordersLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <div className="flex">
                      <Skeleton className="h-16 w-16 rounded mr-4" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-48 mb-2" />
                        <Skeleton className="h-4 w-32 mb-2" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-28 rounded" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !orders || orders.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
              <Button asChild className="bg-primary text-white">
                <Link to="/">Start Shopping</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-medium">Order #{order.id}</h4>
                        <p className="text-gray-500 text-sm">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        className={`
                          ${order.status === "delivered" ? "bg-green-100 text-green-800" : ""}
                          ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                          ${order.status === "cancelled" ? "bg-red-100 text-red-800" : ""}
                        `}
                      >
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex">
                      <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded">
                        {order.product.imageUrl ? (
                          <img 
                            src={order.product.imageUrl} 
                            alt={order.product.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h5 className="font-medium">{order.product.name}</h5>
                        <p className="text-gray-500 text-sm">
                          ${(parseFloat(order.price) || 0).toFixed(2)} • Qty: {order.quantity}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-gray-500 text-sm">
                            {order.status === "delivered" 
                              ? `Delivered on ${new Date(order.deliveryDate).toLocaleDateString()}` 
                              : `Expected delivery: ${new Date(order.deliveryDate).toLocaleDateString()}`
                            }
                          </p>
                          <Button asChild className="bg-primary text-white text-sm py-1 px-3 h-auto">
                            <Link to={`/order/${order.id}`}>View Order</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // If we're on the order details page but have invalid ID
  if (orderId === null || isNaN(orderId)) {
    return (
      <div>
        <TabNavigation tabs={tabs} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card className="p-6 text-center text-red-500">
            Invalid order ID. <Link to="/orders" className="text-primary hover:underline">View all orders</Link>
          </Card>
        </div>
      </div>
    );
  }

  // Show details for a specific order
  return (
    <div>
      <TabNavigation tabs={tabs} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <OrderDetails orderId={orderId} />
      </div>
    </div>
  );
}
