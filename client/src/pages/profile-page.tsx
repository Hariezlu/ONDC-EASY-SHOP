import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import ProfileSidebar from "@/components/user/profile-sidebar";
import ProfileDetails from "@/components/user/profile-details";
import TabNavigation from "@/components/layout/tab-navigation";

export default function ProfilePage() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("account");

  const tabs = [
    { id: "home", label: "Home", path: "/" },
    { id: "user-profile", label: "User Profile", path: "/profile" },
    { id: "orders", label: "Orders", path: "/profile?tab=orders" },
    { id: "wallet", label: "Wallet", path: "/profile?tab=wallet" },
  ];

  useEffect(() => {
    // Get tab from URL query parameter if present
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['account', 'orders', 'wallet', 'returns', 'preferences'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  if (!user) return null;

  return (
    <div>
      <TabNavigation tabs={tabs} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200">
              <ProfileSidebar activeTab={activeTab} />
            </div>
            <div className="md:w-2/3">
              <ProfileDetails activeTab={activeTab} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
