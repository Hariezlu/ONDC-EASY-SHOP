import FeatureBanner from "@/components/home/feature-banner";
import BrandSection from "@/components/home/brand-section";
import ProductList from "@/components/home/product-list";
import { useTitle } from "@/hooks/use-title";

export default function HomePage() {
  // Set page title
  useTitle("ShopEase - Home");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <FeatureBanner />
      <BrandSection />
      <ProductList title="Featured Products" />
    </div>
  );
}
