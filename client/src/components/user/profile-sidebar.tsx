import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { 
  UserRound, 
  ShoppingBag, 
  Wallet, 
  ArrowLeftRight, 
  Settings,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface ProfileSidebarProps {
  activeTab: string;
}

export default function ProfileSidebar({ activeTab }: ProfileSidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/");
  };

  const navItems = [
    { id: "account", label: "Account Information", icon: <UserRound className="h-5 w-5 mr-2" /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag className="h-5 w-5 mr-2" /> },
    { id: "wallet", label: "Wallet", icon: <Wallet className="h-5 w-5 mr-2" /> },
    { id: "returns", label: "Returns", icon: <ArrowLeftRight className="h-5 w-5 mr-2" /> },
    { id: "preferences", label: "Preferences", icon: <Settings className="h-5 w-5 mr-2" /> },
  ];

  return (
    <Card className="border-b md:border-b-0 md:border-r border-gray-200">
      <div className="p-6">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-4 bg-primary text-white text-2xl font-bold">
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-gray-500 mb-4">{user.email}</p>
          <div className="flex space-x-2 mb-4">
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
              Member since {new Date(user.createdAt).getFullYear()}
            </Badge>
            <Badge variant="secondary" className="bg-primary bg-opacity-10 text-primary">
              Premium
            </Badge>
          </div>
          <Button className="w-full bg-primary text-white mb-2">
            Edit Profile
          </Button>
          <Button variant="outline" className="w-full">
            Change Password
          </Button>
        </div>
      </div>
      <nav className="px-6 pb-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.id} className="mb-2">
              <Link href={`/profile?tab=${item.id}`}>
                <a 
                  className={`flex items-center font-medium py-2 px-4 rounded-md ${
                    activeTab === item.id
                      ? "text-primary bg-blue-50" 
                      : "text-gray-600 hover:text-primary hover:bg-blue-50"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </a>
              </Link>
            </li>
          ))}
          <li className="mb-2">
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-start text-gray-600 hover:text-red-500 font-medium py-2 px-4"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Log Out
            </Button>
          </li>
        </ul>
      </nav>
    </Card>
  );
}
