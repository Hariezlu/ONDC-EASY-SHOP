import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { Product, Brand } from "@shared/schema";
import { Link } from "wouter";

export default function ProductsPage() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const brandId = urlParams.get('brandId');
  
  useEffect(() => {
    document.title = "ShopEase - Products";
  }, []);

  // Fetch all products or products by brand
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: brandId 
      ? [`/api/products?brandId=${brandId}`] 
      : ["/api/products"],
  });

  // Fetch brand details if brandId is provided
  const { data: brand } = useQuery<Brand>({
    queryKey: [`/api/brands/${brandId}`],
    enabled: !!brandId,
  });

  // Add product to cart mock function 
  const addToCart = (productId: number) => {
    console.log("Adding product to cart:", productId);
    // In a real app, this would make an API call to add to cart
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {brandId && brand ? `${brand.name} Products` : "All Products"}
        </h1>
        {brandId && (
          <Link href="/brands">
            <Badge variant="outline" className="cursor-pointer">
              All Brands
            </Badge>
          </Link>
        )}
      </div>
      
      {isLoadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !products?.length ? (
        <p className="text-gray-500 text-center">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <Link href={`/product/${product.id}`}>
                <div className="h-48 bg-gray-100 hover:opacity-90 cursor-pointer flex items-center justify-center">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="text-gray-400">[Product Image]</div>
                  )}
                </div>
              </Link>
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-medium text-lg hover:text-primary cursor-pointer">{product.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-2">{product.brand?.name}</p>
                  </div>
                  {product.isNew && (
                    <Badge className="bg-green-500 text-white">New</Badge>
                  )}
                </div>
                <div className="flex items-baseline mt-2">
                  <span className="text-xl font-bold">${Number(product.price).toFixed(2)}</span>
                  {product.regularPrice && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      ${Number(product.regularPrice).toFixed(2)}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button 
                  variant="default" 
                  size="sm"
                  className="w-full"
                  onClick={() => addToCart(product.id)}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}