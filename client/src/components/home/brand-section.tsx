import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Brand } from "@shared/schema";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrandSection() {
  const { data: brands, isLoading, error } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Brand</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="h-24 bg-gray-100 flex items-center justify-center">
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
              <CardContent className="p-4 text-center">
                <Skeleton className="h-4 w-20 mx-auto mb-2" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Brand</h2>
        <Card className="p-6 text-center text-red-500">
          Failed to load brands. Please try again later.
        </Card>
      </div>
    );
  }

  if (!brands || brands.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Brand</h2>
        <Card className="p-6 text-center">
          No brands available at the moment.
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Shop by Brand</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {brands.map((brand) => (
          <Link key={brand.id} href={`/brands/${brand.id}`}>
            <Card className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition duration-200 cursor-pointer">
              <div className="h-24 bg-gray-100 flex items-center justify-center">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-16"
                  />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center bg-primary text-white rounded-full font-bold text-xl">
                    {brand.name.substring(0, 1)}
                  </div>
                )}
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-medium">{brand.name}</h3>
                <p className="text-xs text-gray-500">{brand.productCount}+ products</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
