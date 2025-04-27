import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function FeatureBanner() {
  return (
    <div className="bg-gradient-to-r from-primary to-blue-700 rounded-lg overflow-hidden shadow-lg mb-8">
      <div className="px-6 py-12 md:px-12 text-white md:flex items-center">
        <div className="md:w-2/3">
          <h2 className="text-3xl font-bold mb-2">Summer Sale - Up to 50% Off</h2>
          <p className="mb-6">Discover amazing deals on all your favorite brands. Limited time offer!</p>
          <Button
            className="bg-white text-primary font-medium py-2 px-6 rounded-full shadow-md hover:bg-gray-100 transition duration-200"
            asChild
          >
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
        <div className="md:w-1/3 mt-8 md:mt-0 flex justify-center">
          {/* Using SVG to avoid external image requirement */}
          <div className="w-64 h-64 bg-blue-600 bg-opacity-50 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="7"></circle>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
