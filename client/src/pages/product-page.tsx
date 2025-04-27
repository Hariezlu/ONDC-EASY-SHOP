import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import ProductDetails from "@/components/product/product-details";
import ProductList from "@/components/home/product-list";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id);

  if (isNaN(productId)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="p-6 text-center text-red-500">
          Invalid product ID
        </Card>
      </div>
    );
  }

  // Fetch product to get the brand ID
  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/products/${productId}`],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <ProductDetails productId={productId} />
      
      <div className="mt-12">
        {isLoading ? (
          <Skeleton className="h-8 w-64 mb-6" />
        ) : error ? (
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        ) : (
          <ProductList 
            title={`More from ${product?.brand?.name || 'This Brand'}`} 
            brandId={product?.brand?.id} 
          />
        )}
      </div>
    </div>
  );
}
