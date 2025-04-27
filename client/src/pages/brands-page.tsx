import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Brand } from "@shared/schema";

export default function BrandsPage() {
  useEffect(() => {
    document.title = "ShopEase - Brands";
  }, []);

  const { data: brands, isLoading } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shop by Brand</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <Skeleton className="h-12 w-32 mb-4 rounded-md" />
                  <Skeleton className="h-4 w-full mb-2 rounded-md" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !brands?.length ? (
        <p className="text-gray-500 text-center">No brands found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/products?brandId=${brand.id}`}>
              <Card className="overflow-hidden hover:shadow-md cursor-pointer transition-shadow">
                <CardContent className="p-0">
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-2">{brand.name}</h2>
                    <p className="text-gray-600 text-sm">{brand.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-gray-500">{brand.productCount || 0} products</span>
                      <span className="text-primary text-sm font-medium">View all →</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}