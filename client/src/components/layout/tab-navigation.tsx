import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

type Tab = {
  id: string;
  label: string;
  path: string;
};

interface TabNavigationProps {
  tabs: Tab[];
}

export default function TabNavigation({ tabs }: TabNavigationProps) {
  const [location] = useLocation();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <div className="tabs flex space-x-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={location === tab.path ? "default" : "outline"}
            className={location === tab.path 
              ? "bg-primary text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
            }
            asChild
          >
            <Link href={tab.path}>
              {tab.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
