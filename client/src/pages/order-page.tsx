import { useParams } from "wouter";
import OrderDetails from "@/components/order/order-details";
import { Card } from "@/components/ui/card";
import TabNavigation from "@/components/layout/tab-navigation";

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id);
  
  const tabs = [
    { id: "home", label: "Home", path: "/" },
    { id: "profile", label: "Profile", path: "/profile" },
    { id: "orders", label: "Orders", path: "/profile?tab=orders" },
    { id: "order-details", label: "Order Details", path: `/order/${id}` },
  ];

  if (isNaN(orderId)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="p-6 text-center text-red-500">
          Invalid order ID
        </Card>
      </div>
    );
  }

  return (
    <div>
      <TabNavigation tabs={tabs} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <OrderDetails orderId={orderId} />
      </div>
    </div>
  );
}
