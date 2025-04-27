import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Product } from "@shared/schema";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();

  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("POST", "/api/cart", { productId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add item to cart: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    addToCartMutation.mutate(product.id);
  };

  // Calculate discount percentage if there's a sale price
  const discountPercentage = product.regularPrice && parseFloat(product.price) < parseFloat(product.regularPrice)
    ? Math.round(((parseFloat(product.regularPrice) - parseFloat(product.price)) / parseFloat(product.regularPrice)) * 100)
    : null;

  return (
    <Card className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition duration-200">
      <div className="relative">
        <Link to={`/product/${product.id}`}>
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                No image available
              </div>
            )}
          </div>
        </Link>
        <div className="absolute top-0 right-0 m-2">
          <Button variant="ghost" size="icon" className="bg-white rounded-full text-gray-600 hover:text-primary">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/product/${product.id}`}>
              <h3 className="font-medium text-lg mb-1 hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="text-gray-500 text-sm mb-2">{product.brand.name}</p>
          </div>
          {product.isNew && (
            <Badge className="bg-primary text-white">NEW</Badge>
          )}
          {discountPercentage && (
            <Badge className="bg-secondary text-white">SALE</Badge>
          )}
        </div>
        <div className="flex justify-between items-center mt-3">
          <div>
            <span className="font-bold text-lg">${(parseFloat(product.price) || 0).toFixed(2)}</span>
            {product.regularPrice && parseFloat(product.price) < parseFloat(product.regularPrice) && (
              <span className="text-gray-500 text-sm line-through ml-2">
                ${(parseFloat(product.regularPrice) || 0).toFixed(2)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            className="bg-primary text-white hover:bg-blue-600"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
