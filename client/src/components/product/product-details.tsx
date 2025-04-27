import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Shop } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, Star, Check, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductDetailsProps {
  productId: number;
}

export default function ProductDetails({ productId }: ProductDetailsProps) {
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<number | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { data: product, isLoading: productLoading, error: productError } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
  });

  // Fetch shops
  const { data: shops, isLoading: shopsLoading } = useQuery<Shop[]>({
    queryKey: ["/api/shops"],
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!selectedShop || !selectedSize) {
        throw new Error("Please select a shop and size");
      }
      
      await apiRequest("POST", "/api/cart", {
        productId,
        shopId: selectedShop,
        quantity,
        size: selectedSize,
        deliveryDate
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add to cart: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Buy now mutation
  const buyNowMutation = useMutation({
    mutationFn: async () => {
      if (!selectedShop || !selectedSize) {
        throw new Error("Please select a shop and size");
      }
      
      await apiRequest("POST", "/api/orders/direct", {
        productId,
        shopId: selectedShop,
        quantity,
        size: selectedSize,
        deliveryDate
      });
    },
    onSuccess: (data) => {
      if (data && data.orderId) {
        window.location.href = "/checkout?orderId=" + data.orderId;
      } else {
        // Just go to checkout page if order ID isn't returned
        window.location.href = "/checkout";
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to process order: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  // Calculate return date (7 days after delivery)
  const calculateReturnDate = () => {
    if (!deliveryDate) return "";
    const returnDate = new Date(deliveryDate);
    returnDate.setDate(returnDate.getDate() + 7);
    return returnDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (productLoading || shopsLoading) {
    return (
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-2/5">
            <Skeleton className="h-96 md:h-full w-full" />
          </div>
          <div className="md:w-3/5 p-6">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-8 w-2/3 mb-4" />
            <Skeleton className="h-4 w-28 mb-4" />
            <Skeleton className="h-10 w-40 mb-4" />
            <Skeleton className="h-24 w-full mb-6" />
            <Skeleton className="h-8 w-32 mb-2" />
            <div className="grid grid-cols-4 gap-2 mb-6">
              {Array(8).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-6" />
            <div className="flex space-x-4">
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (productError || !product) {
    return (
      <Card className="p-6 text-center text-red-500">
        Failed to load product details. Please try again later.
      </Card>
    );
  }

  // Calculate discount percentage if there's a sale price
  const discountPercentage = product.regularPrice && parseFloat(product.price) < parseFloat(product.regularPrice)
    ? Math.round(((parseFloat(product.regularPrice) - parseFloat(product.price)) / parseFloat(product.regularPrice)) * 100)
    : null;

  // Available sizes (this would come from the product data in a real app)
  const sizes = ["US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 10.5", "US 11", "US 11.5"];

  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <div className="md:flex">
        <div className="md:w-2/5">
          <div className="relative h-96 md:h-full">
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
            <div className="absolute top-4 right-4">
              <Button variant="outline" size="icon" className="rounded-full bg-white text-gray-600 hover:text-primary shadow-sm">
                <Heart className="h-6 w-6" />
              </Button>
            </div>
          </div>
          <div className="p-4 md:hidden">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {/* Product thumbnails would go here in a real app */}
              <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0"></div>
              <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0"></div>
              <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0"></div>
            </div>
          </div>
        </div>
        <div className="md:w-3/5 p-6">
          <div className="flex items-center mb-2">
            <Link to="/products" className="text-primary text-sm font-medium">
              {product.category || "Products"}
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link to={`/brands/${product.brand.id}`} className="text-primary text-sm font-medium">
              {product.brand.name}
            </Link>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-1">{product.name}</h1>
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 mr-2">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="h-5 w-5" fill="currentColor" />
                  ))}
                </div>
                <span className="text-gray-600 text-sm">4.8 (120 reviews)</span>
              </div>
            </div>
            <div>
              {(product.stock || 0) > 0 ? (
                <Badge className="bg-primary text-white">IN STOCK</Badge>
              ) : (
                <Badge variant="destructive">OUT OF STOCK</Badge>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-4">
              <span className="text-3xl font-bold mr-2">${(parseFloat(product.price) || 0).toFixed(2)}</span>
              {product.regularPrice && parseFloat(product.price) < parseFloat(product.regularPrice) && (
                <>
                  <span className="text-sm text-gray-500 line-through">
                    ${(parseFloat(product.regularPrice) || 0).toFixed(2)}
                  </span>
                  <Badge className="ml-2 bg-green-100 text-green-800">
                    {discountPercentage}% OFF
                  </Badge>
                </>
              )}
            </div>
            <p className="text-gray-600 mb-4">{product.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Select Size</h3>
            <div className="grid grid-cols-4 gap-2">
              {sizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  className={selectedSize === size ? "text-primary border-primary" : ""}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Select Shop</h3>
            <Select value={selectedShop?.toString()} onValueChange={(value) => setSelectedShop(parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a shop" />
              </SelectTrigger>
              <SelectContent>
                {shops?.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id.toString()}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Select Delivery Date</h3>
            <Input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full"
            />
            <p className="text-gray-500 text-sm mt-1">
              Free returns until {calculateReturnDate()}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center border border-gray-300 rounded-md">
              <Button 
                variant="ghost" 
                className="px-3 py-1 h-auto border-r border-gray-300"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-12 text-center border-0 focus:ring-0"
              />
              <Button 
                variant="ghost" 
                className="px-3 py-1 h-auto border-l border-gray-300"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                +
              </Button>
            </div>
            <Button
              className="flex-1 bg-primary text-white"
              onClick={() => addToCartMutation.mutate()}
              disabled={addToCartMutation.isPending || !selectedSize || !selectedShop}
            >
              Add to Cart
            </Button>
            <Button
              variant="outline"
              className="border border-gray-300 text-gray-700"
              onClick={() => buyNowMutation.mutate()}
              disabled={buyNowMutation.isPending || !selectedSize || !selectedShop}
            >
              Buy Now
            </Button>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                  {product.brand.name.substring(0, 1)}
                </div>
                <div>
                  <h3 className="font-medium">{product.brand.name}</h3>
                  <div className="flex text-yellow-400 text-sm">
                    <Star className="h-4 w-4" fill="currentColor" />
                    <span className="text-gray-600 ml-1">4.9 Seller Rating</span>
                  </div>
                </div>
              </div>
              <Button variant="link" className="text-primary">
                View Store
              </Button>
            </div>
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-1" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-1" />
                <span>Authentic Products</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-1" />
                <span>Free Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
