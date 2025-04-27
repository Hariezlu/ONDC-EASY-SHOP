import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WalletCard from "./wallet-card";
import { useQuery } from "@tanstack/react-query";
import { Order, User } from "@shared/schema";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileDetailsProps {
  activeTab: string;
  user: User;
}

export default function ProfileDetails({ activeTab, user }: ProfileDetailsProps) {

  // Fetch user's orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Fetch user's returns
  const { data: returns, isLoading: returnsLoading } = useQuery({
    queryKey: ["/api/returns"],
    queryFn: async () => {
      return [];
    },
  });

  if (!user) return null;

  return (
    <div className="p-6">
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        {/* Account Information Tab */}
        <TabsContent value="account">
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">Account Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  defaultValue={user.name.split(" ")[0]}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  defaultValue={user.name.split(" ")[1] || ""}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user.email}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  defaultValue={user.phone || "+1 (123) 456-7890"}
                  className="w-full"
                />
              </div>
            </div>
            <Button className="mt-6 bg-primary text-white">Save Changes</Button>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Shipping Addresses</h3>
            <Card className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">Home</h4>
                  <p className="text-gray-600 text-sm">Default Address</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="link" className="text-primary hover:text-blue-700 text-sm p-0">
                    Edit
                  </Button>
                  <Button variant="link" className="text-gray-600 hover:text-gray-800 text-sm p-0">
                    Delete
                  </Button>
                </div>
              </div>
              <div className="text-gray-600">
                <p>123 Main Street</p>
                <p>Apt 4B</p>
                <p>New York, NY 10001</p>
                <p>United States</p>
              </div>
            </Card>
            <Button variant="link" className="flex items-center text-primary font-medium p-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Address
            </Button>
          </div>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders">
          <h3 className="text-lg font-bold mb-4">Your Orders</h3>
          
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
        </TabsContent>
        
        {/* Wallet Tab */}
        <TabsContent value="wallet">
          <h3 className="text-lg font-bold mb-4">Your Wallet</h3>
          <WalletCard user={user} />
        </TabsContent>
        
        {/* Returns Tab */}
        <TabsContent value="returns">
          <h3 className="text-lg font-bold mb-4">Your Returns</h3>
          
          {returnsLoading ? (
            <div className="space-y-4">
              {Array(2).fill(0).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <div className="flex">
                      <Skeleton className="h-16 w-16 rounded mr-4" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-48 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !returns || returns.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">You don't have any return requests.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {returns.map((returnItem) => (
                <Card key={returnItem.id}>
                  <CardContent className="p-6">
                    {/* Return item details would go here */}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <h3 className="text-lg font-bold mb-4">Your Preferences</h3>
          {/* Preferences content would go here */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
