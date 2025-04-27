import { useQuery, useMutation } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderDetailsProps {
  orderId: number;
}

export default function OrderDetails({ orderId }: OrderDetailsProps) {
  const { toast } = useToast();
  const [returnReason, setReturnReason] = useState("");
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);

  const { data: order, isLoading, error, refetch } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/orders/${orderId}/cancel`, {});
    },
    onSuccess: () => {
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to cancel order: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const returnOrderMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/returns`, {
        orderId,
        reason: returnReason,
      });
    },
    onSuccess: () => {
      toast({
        title: "Return requested",
        description: "Your return request has been submitted successfully.",
      });
      setReturnDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to request return: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="relative">
            <Skeleton className="h-2 w-full mb-8" />
            <div className="grid grid-cols-4 gap-3">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="w-8 h-8 rounded-full mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            <div className="flex border rounded-lg p-4">
              <Skeleton className="w-20 h-20 flex-shrink-0 rounded" />
              <div className="ml-4 flex-grow">
                <div className="flex justify-between">
                  <div>
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-4 w-32 mb-2" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !order) {
    return (
      <Card className="p-6 text-center text-red-500">
        Failed to load order details. Please try again later.
      </Card>
    );
  }

  const isReturnEligible = 
    order.status === "delivered" && 
    new Date() <= new Date(order.returnExpiryDate);

  const statusSteps = [
    { label: "Order Placed", date: new Date(order.createdAt).toLocaleDateString() },
    { label: "Processing", date: "In progress" },
    { label: "Shipped", date: "Expected soon" },
    { label: "Delivered", date: new Date(order.deliveryDate).toLocaleDateString() }
  ];

  const statusIndex = {
    "pending": 0,
    "processing": 1,
    "shipped": 2,
    "delivered": 3,
    "returned": 3,
    "completed": 3,
    "cancelled": 0
  }[order.status];

  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <div className="flex justify-between items-center border-b border-gray-200 p-6">
        <div>
          <h2 className="text-xl font-bold">Order #{order.id}</h2>
          <p className="text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </p>
        </div>
        <div>
          <Badge 
            className={`
              ${order.status === "delivered" ? "bg-green-100 text-green-800" : ""}
              ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
              ${order.status === "cancelled" ? "bg-red-100 text-red-800" : ""}
              ${order.status === "returned" ? "bg-blue-100 text-blue-800" : ""}
            `}
          >
            {order.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Order Status</h3>
        </div>
        <div className="relative">
          <div className="flex items-center mb-8">
            {/* Status Line */}
            <div className="relative flex-grow">
              <div className="h-1 bg-gray-200 w-full absolute top-1/2 transform -translate-y-1/2"></div>
              <div 
                className="h-1 bg-primary absolute top-1/2 transform -translate-y-1/2"
                style={{ width: `${(statusIndex / 3) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {statusSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div 
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2
                    ${index <= statusIndex ? "bg-primary text-white" : "bg-gray-200 text-gray-400"}
                  `}
                >
                  {index <= statusIndex ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>
                <p className={`text-sm font-medium ${index <= statusIndex ? "" : "text-gray-400"}`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-500">{step.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-gray-200">
        <h3 className="font-medium mb-4">Order Items</h3>
        <div className="space-y-4">
          <div className="flex border rounded-lg p-4">
            <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded">
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
            <div className="ml-4 flex-grow">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium">
                    <Link href={`/product/${order.product.id}`} className="hover:text-primary">
                      {order.product.name}
                    </Link>
                  </h4>
                  <p className="text-gray-500 text-sm">Size: {order.size} | Quantity: {order.quantity}</p>
                </div>
                <p className="font-medium">${order.price.toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-gray-600 text-sm">Shop: {order.shop.name}</p>
                  <p className="text-gray-600 text-sm">
                    Delivery{order.status === "delivered" ? "ed" : ""}: {new Date(order.deliveryDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  {isReturnEligible && (
                    <>
                      <p className="text-sm text-green-600">
                        Return eligible until {new Date(order.returnExpiryDate).toLocaleDateString()}
                      </p>
                      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="link" className="text-primary text-sm p-0">
                            Request Return
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Return</DialogTitle>
                            <DialogDescription>
                              Please provide a reason for your return request.
                            </DialogDescription>
                          </DialogHeader>
                          <Textarea
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            placeholder="Tell us why you want to return this item..."
                            className="min-h-[100px]"
                          />
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setReturnDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => returnOrderMutation.mutate()}
                              disabled={!returnReason || returnOrderMutation.isPending}
                            >
                              Submit Return Request
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-gray-200 grid md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-medium mb-2">Shipping Address</h3>
          <div className="text-gray-600">
            <p>{order.user.name}</p>
            <p>123 Main Street</p>
            <p>Apt 4B</p>
            <p>New York, NY 10001</p>
            <p>United States</p>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Payment Information</h3>
          <div className="text-gray-600">
            <p>Wallet Payment</p>
            <p>Amount: ${order.price.toFixed(2)}</p>
            <p className={order.status === "delivered" ? "text-green-600" : "text-yellow-600"}>
              Payment Status: {order.paid ? "Released to seller" : "Held (pending delivery)"}
            </p>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Order Summary</h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>${order.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span>${(order.price * 0.08).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-gray-200 mt-2">
              <span>Total</span>
              <span>${(order.price * 1.08).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <Button className="bg-primary text-white hover:bg-blue-600 mr-3">
            Track Order
          </Button>
          {order.status === "pending" && (
            <Button 
              variant="outline" 
              onClick={() => cancelOrderMutation.mutate()}
              disabled={cancelOrderMutation.isPending}
            >
              Cancel Order
            </Button>
          )}
        </div>
        <div>
          <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
            <Printer className="h-5 w-5 mr-1" />
            Print Order
          </Button>
        </div>
      </div>
    </Card>
  );
}
