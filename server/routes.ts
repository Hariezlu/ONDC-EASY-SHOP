import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import {
  insertCartItemSchema,
  insertOrderSchema,
  insertReturnSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Check authentication for protected routes
  const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ message: "Authentication required" });
  };

  // API routes
  // Brands
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/brands/:id", async (req, res) => {
    try {
      const brand = await storage.getBrand(parseInt(req.params.id));
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }
      res.json(brand);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { brandId } = req.query;
      let products;

      if (brandId) {
        products = await storage.getProductsByBrand(
          parseInt(brandId as string)
        );
      } else {
        products = await storage.getProducts();
      }

      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Shops
  app.get("/api/shops", async (req, res) => {
    try {
      const shops = await storage.getShops();
      res.json(shops);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Cart
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      console.log("flag-1");
      const cartItems = await storage.getCartItems(req.user.id);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const { productId, quantity, size, shopId } = req.body;
      const payload = req.body;
      const product = await storage.getProduct(payload.productId);
      if (!product) {
        return res.status(400).json({ message: "Product not found" });
      }
      const cartItemData = {
        ...payload,
        userId: req.user.id,
        shopId: payload.shopId || 1,
      };

      const cartItem = await storage.createCartItem(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      console.log("flag-3");
      const cartItem = await storage.getCartItem(parseInt(req.params.id));

      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      if (cartItem.userId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this item" });
      }

      const updatedCartItem = await storage.updateCartItem(
        cartItem.id,
        req.body
      );
      res.json(updatedCartItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      console.log("flag-4");
      const cartItem = await storage.getCartItem(parseInt(req.params.id));

      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      if (cartItem.userId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Not authorized to remove this item" });
      }

      await storage.deleteCartItem(cartItem.id);
      res.json({ message: "Cart item removed" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/cart", isAuthenticated, async (req, res) => {
    try {
      console.log("flag-5");
      await storage.clearCart(req.user.id);
      res.json({ message: "Cart cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Orders
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getOrdersByUser(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Not authorized to view this order" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      // Get cart items to create order
      const cartItems = await storage.getCartItems(req.user.id);

      if (!cartItems.length) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Check wallet balance
      const user = await storage.getUser(req.user.id);
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );

      if (Number(user.walletBalance) < totalAmount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }

      // Deduct from wallet
      await storage.deductFromWallet(req.user.id, totalAmount);

      // Create orders for each cart item
      const orders = [];
      for (const item of cartItems) {
        // Delivery date is 7 days from now
        const deliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        // Return expiry date is 30 days from delivery
        const returnExpiryDate = new Date(
          deliveryDate.getTime() + 30 * 24 * 60 * 60 * 1000
        );

        const orderData = {
          userId: req.user.id,
          productId: item.productId,
          shopId: item.shopId,
          quantity: item.quantity,
          // Ensure price is a string
          price: String(item.product.price),
          size: item.size || null,
          deliveryDate: deliveryDate,
          returnExpiryDate: returnExpiryDate,
          status: "pending",
          paid: false,
        };

        const validation = insertOrderSchema.safeParse(orderData);
        if (!validation.success) {
          // Refund the wallet and return error
          await storage.addToWallet(req.user.id, totalAmount);
          return res.status(400).json({
            message: "Invalid order data",
            errors: validation.error.format(),
          });
        }

        const order = await storage.createOrder(orderData);
        orders.push(order);
      }

      // Clear the cart
      await storage.clearCart(req.user.id);

      res.status(201).json({ orders });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/orders/:id/cancel", isAuthenticated, async (req, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Not authorized to cancel this order" });
      }

      if (order.status !== "pending") {
        return res
          .status(400)
          .json({ message: "Only pending orders can be cancelled" });
      }

      // Update order status
      const updatedOrder = await storage.updateOrderStatus(
        order.id,
        "cancelled"
      );

      // Refund the amount to wallet
      await storage.addToWallet(
        req.user.id,
        Number(order.price) * order.quantity
      );

      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // New endpoint for admin to update order status
  app.patch("/api/orders/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      const orderId = parseInt(req.params.id);

      if (
        !status ||
        ![
          "pending",
          "processing",
          "shipped",
          "delivered",
          "completed",
          "cancelled",
        ].includes(status)
      ) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const order = await storage.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // In a real application, you would check if the user is an admin here
      // For this demo, we'll allow any authenticated user to update order status

      // Update order status
      const updatedOrder = await storage.updateOrderStatus(orderId, status);

      // If order is being delivered, mark it as paid
      if (status === "delivered" && !order.paid) {
        // In a real app, you would release payment to the seller here
        await storage.updateOrder(orderId, { paid: true });
      }

      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Returns
  app.get("/api/returns", isAuthenticated, async (req, res) => {
    try {
      const returns = await storage.getReturnsByUser(req.user.id);
      res.json(returns);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/returns", isAuthenticated, async (req, res) => {
    try {
      const validation = insertReturnSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid return data",
          errors: validation.error.format(),
        });
      }

      const { orderId, reason } = validation.data;

      // Check if order exists and belongs to the user
      const order = await storage.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Not authorized to return this order" });
      }

      // Check if order is delivered and within return period
      if (order.status !== "delivered") {
        return res
          .status(400)
          .json({ message: "Only delivered orders can be returned" });
      }

      const now = new Date();
      const returnExpiryDate = new Date(order.returnExpiryDate);

      if (now > returnExpiryDate) {
        return res.status(400).json({ message: "Return period has expired" });
      }

      // Create return
      const returnData = {
        orderId,
        reason,
        status: "requested",
        refundAmount: order.price,
      };

      const returnItem = await storage.createReturn(returnData);
      res.status(201).json(returnItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Wallet
  app.get("/api/wallet/transactions", isAuthenticated, async (req, res) => {
    try {
      // For this demo, we'll return an empty array
      // In a real app, we would store and retrieve transactions
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wallet/add", isAuthenticated, async (req, res) => {
    try {
      console.log("Adding to wallet:", req.body);
      const { amount, type } = req.body;

      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const user = await storage.addToWallet(req.user.id, Number(amount), type);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // For addresses (mock)
  app.get("/api/addresses", isAuthenticated, async (req, res) => {
    // Return a mock address for this demo
    res.json([
      {
        id: 1,
        name: "Home",
        isDefault: true,
        fullName: req.user.name,
        street: "123 Main Street",
        apartment: "Apt 4B",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "United States",
        phone: "+1 (123) 456-7890",
      },
    ]);
  });

  const httpServer = createServer(app);
  return httpServer;
}
