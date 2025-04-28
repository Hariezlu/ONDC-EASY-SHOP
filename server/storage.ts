import { users, brands, products, shops, orders, returns, cartItems } from "@shared/schema";
import type { 
  User, InsertUser, 
  Brand, InsertBrand, 
  Product, InsertProduct, 
  Shop, InsertShop,
  Order, InsertOrder,
  Return, InsertReturn,
  CartItem, InsertCartItem 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface with CRUD methods for all entities
export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Brand methods
  getBrands(): Promise<Brand[]>;
  getBrand(id: number): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProductsByBrand(brandId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined>;
  
  // Shop methods
  getShops(): Promise<Shop[]>;
  getShop(id: number): Promise<Shop | undefined>;
  createShop(shop: InsertShop): Promise<Shop>;
  
  // Order methods
  getOrders(): Promise<Order[]>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, orderData: Partial<Order>): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Return methods
  getReturns(): Promise<Return[]>;
  getReturnsByUser(userId: number): Promise<Return[]>;
  getReturn(id: number): Promise<Return | undefined>;
  createReturn(returnData: InsertReturn): Promise<Return>;
  updateReturnStatus(id: number, status: string): Promise<Return | undefined>;
  
  // Cart methods
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItem(id: number): Promise<CartItem | undefined>;
  createCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, cartItemData: Partial<CartItem>): Promise<CartItem | undefined>;
  deleteCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Wallet methods
  addToWallet(userId: number, amount: number): Promise<User | undefined>;
  deductFromWallet(userId: number, amount: number): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private brands: Map<number, Brand>;
  private products: Map<number, Product>;
  private shops: Map<number, Shop>;
  private orders: Map<number, Order>;
  private returns: Map<number, Return>;
  private cartItems: Map<number, CartItem>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number = 1;
  private brandIdCounter: number = 1;
  private productIdCounter: number = 1;
  private shopIdCounter: number = 1;
  private orderIdCounter: number = 1;
  private returnIdCounter: number = 1;
  private cartItemIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.brands = new Map();
    this.products = new Map();
    this.shops = new Map();
    this.orders = new Map();
    this.returns = new Map();
    this.cartItems = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Clear expired sessions every 24h
    });
    
    // Initialize with sample data
    this.initSampleData();
  }

  // Initialize sample data for development
  private async initSampleData() {
    // Create brands
    const brandNames = ['Nike', 'Adidas', 'Puma', 'H&M', 'Zara'];
    for (const name of brandNames) {
      await this.createBrand({
        name,
        description: `${name} is a popular brand offering quality products.`,
        logo: '',
        productCount: 0
      });
    }
    
    // Create shops
    const shopNames = ['Downtown Store', 'Mall of America', 'Sports Center', 'Factory Outlet', 'Online Shop'];
    for (const name of shopNames) {
      await this.createShop({
        name: `${brandNames[Math.floor(Math.random() * brandNames.length)]} ${name}`,
        location: 'New York, NY',
        description: `Official ${name} shop`
      });
    }
    
    // Create products
    const productDetails = [
      { 
        name: 'Air Max 270', 
        brand: 'Nike', 
        price: 120, 
        isNew: true,
        imageUrl: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-VtH7Lr.png'
      },
      { 
        name: 'Ultraboost', 
        brand: 'Adidas', 
        price: 140, 
        regularPrice: 180,
        imageUrl: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/cde9362069924146aca6ad130114a6c6_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg'
      },
      { 
        name: 'RS-X Toys', 
        brand: 'Puma', 
        price: 105,
        imageUrl: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/369449/24/sv01/fnd/PNA/fmt/png/RS-X-Toys-Men%27s-Sneakers'
      },
      { 
        name: 'Slim Fit Shirt', 
        brand: 'H&M', 
        price: 29.99,
        imageUrl: 'https://lp2.hm.com/hmgoepprod?set=quality%5B79%5D%2Csource%5B%2F00%2F77%2F0077747b4ae6c8539d2999e95b31e50a990c495b.jpg%5D%2Corigin%5Bdam%5D%2Ccategory%5Bmen_shirts_longsleeved%5D%2Ctype%5BDESCRIPTIVESTILLLIFE%5D%2Cres%5Bm%5D%2Chmver%5B2%5D&call=url[file:/product/main]'
      },
      { 
        name: 'Casual Pants', 
        brand: 'Zara', 
        price: 49.99,
        imageUrl: 'https://static.zara.net/photos///2023/I/0/2/p/6861/333/802/2/w/560/6861333802_2_1_1.jpg?ts=1689251634732'
      }
    ];
    
    for (const detail of productDetails) {
      const brand = Array.from(this.brands.values()).find(b => b.name === detail.brand);
      if (brand) {
        await this.createProduct({
          name: detail.name,
          brandId: brand.id,
          description: `The ${detail.name} delivers visible cushioning under the foot and breathable, lightweight design.`,
          price: detail.price,
          regularPrice: detail.regularPrice,
          stock: 100,
          category: 'Fashion',
          isNew: detail.isNew || false,
          imageUrl: detail.imageUrl || ''
        });
        
        // Update product count in brand
        await this.updateBrand(brand.id, {
          productCount: (brand.productCount || 0) + 1
        });
      }
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    // Since we're using email as username in our app
    return this.getUserByEmail(username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const timestamp = new Date();
    const user: User = { 
      ...userData, 
      id, 
      walletBalance: 0,
      createdAt: timestamp 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Brand methods
  async getBrands(): Promise<Brand[]> {
    return Array.from(this.brands.values());
  }
  
  async getBrand(id: number): Promise<Brand | undefined> {
    return this.brands.get(id);
  }
  
  async createBrand(brandData: InsertBrand): Promise<Brand> {
    const id = this.brandIdCounter++;
    const timestamp = new Date();
    const brand: Brand = { ...brandData, id, createdAt: timestamp };
    this.brands.set(id, brand);
    return brand;
  }
  
  async updateBrand(id: number, brandData: Partial<Brand>): Promise<Brand | undefined> {
    const brand = this.brands.get(id);
    if (!brand) return undefined;
    
    const updatedBrand = { ...brand, ...brandData };
    this.brands.set(id, updatedBrand);
    return updatedBrand;
  }
  
  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).map(product => {
      const brand = this.brands.get(product.brandId) as Brand;
      return { ...product, brand };
    });
  }
  
  async getProductsByBrand(brandId: number): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.brandId === brandId)
      .map(product => {
        const brand = this.brands.get(product.brandId) as Brand;
        return { ...product, brand };
      });
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const brand = this.brands.get(product.brandId) as Brand;
    return { ...product, brand };
  }
  
  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const timestamp = new Date();
    const product = { ...productData, id, createdAt: timestamp } as Product;
    this.products.set(id, product);
    
    // Add brand to product
    const brand = this.brands.get(productData.brandId) as Brand;
    return { ...product, brand };
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    
    const brand = this.brands.get(updatedProduct.brandId) as Brand;
    return { ...updatedProduct, brand };
  }
  
  // Shop methods
  async getShops(): Promise<Shop[]> {
    return Array.from(this.shops.values());
  }
  
  async getShop(id: number): Promise<Shop | undefined> {
    return this.shops.get(id);
  }
  
  async createShop(shopData: InsertShop): Promise<Shop> {
    const id = this.shopIdCounter++;
    const timestamp = new Date();
    const shop: Shop = { ...shopData, id, createdAt: timestamp };
    this.shops.set(id, shop);
    return shop;
  }
  
  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).map(order => {
      const user = this.users.get(order.userId) as User;
      const product = this.getProduct(order.productId) as Product;
      const shop = this.shops.get(order.shopId) as Shop;
      return { ...order, user, product, shop };
    });
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .map(order => {
        const user = this.users.get(order.userId) as User;
        const product = this.getProduct(order.productId) as Product;
        const shop = this.shops.get(order.shopId) as Shop;
        return { ...order, user, product, shop };
      });
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const user = this.users.get(order.userId) as User;
    const product = this.getProduct(order.productId) as Product;
    const shop = this.shops.get(order.shopId) as Shop;
    return { ...order, user, product, shop };
  }
  
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const timestamp = new Date();
    
    // Calculate return expiry date (7 days after delivery)
    const deliveryDate = new Date(orderData.deliveryDate);
    const returnExpiryDate = new Date(deliveryDate);
    returnExpiryDate.setDate(returnExpiryDate.getDate() + 7);
    
    const order = { 
      ...orderData, 
      id, 
      returnExpiryDate, 
      createdAt: timestamp 
    } as Order;
    
    this.orders.set(id, order);
    
    const user = this.users.get(order.userId) as User;
    const product = this.getProduct(order.productId) as Product;
    const shop = this.shops.get(order.shopId) as Shop;
    return { ...order, user, product, shop };
  }
  
  async updateOrder(id: number, orderData: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...orderData };
    this.orders.set(id, updatedOrder);
    
    const user = this.users.get(updatedOrder.userId) as User;
    const product = this.getProduct(updatedOrder.productId) as Product;
    const shop = this.shops.get(updatedOrder.shopId) as Shop;
    return { ...updatedOrder, user, product, shop };
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    
    // If status is delivered, order is paid and funds released to seller
    if (status === 'delivered') {
      updatedOrder.paid = true;
    }
    
    const user = this.users.get(updatedOrder.userId) as User;
    const product = this.getProduct(updatedOrder.productId) as Product;
    const shop = this.shops.get(updatedOrder.shopId) as Shop;
    return { ...updatedOrder, user, product, shop };
  }
  
  // Return methods
  async getReturns(): Promise<Return[]> {
    return Array.from(this.returns.values()).map(returnItem => {
      const order = this.getOrder(returnItem.orderId) as Order;
      return { ...returnItem, order };
    });
  }
  
  async getReturnsByUser(userId: number): Promise<Return[]> {
    const userOrders = await this.getOrdersByUser(userId);
    const userOrderIds = userOrders.map(order => order.id);
    
    return Array.from(this.returns.values())
      .filter(returnItem => userOrderIds.includes(returnItem.orderId))
      .map(returnItem => {
        const order = this.getOrder(returnItem.orderId) as Order;
        return { ...returnItem, order };
      });
  }
  
  async getReturn(id: number): Promise<Return | undefined> {
    const returnItem = this.returns.get(id);
    if (!returnItem) return undefined;
    
    const order = this.getOrder(returnItem.orderId) as Order;
    return { ...returnItem, order };
  }
  
  async createReturn(returnData: InsertReturn): Promise<Return> {
    const id = this.returnIdCounter++;
    const timestamp = new Date();
    
    // Get order details to set refund amount
    const order = await this.getOrder(returnData.orderId);
    const refundAmount = order?.price || 0;
    
    const returnItem = { 
      ...returnData, 
      id, 
      refundAmount, 
      createdAt: timestamp 
    } as Return;
    
    this.returns.set(id, returnItem);
    
    // Update order status to returned
    if (order) {
      await this.updateOrderStatus(order.id, 'returned');
    }
    
    const updatedOrder = this.getOrder(returnItem.orderId) as Order;
    return { ...returnItem, order: updatedOrder };
  }
  
  async updateReturnStatus(id: number, status: string): Promise<Return | undefined> {
    const returnItem = this.returns.get(id);
    if (!returnItem) return undefined;
    
    const updatedReturn = { ...returnItem, status };
    this.returns.set(id, updatedReturn);
    
    // If return is approved, refund the amount to user's wallet
    if (status === 'approved') {
      const order = await this.getOrder(returnItem.orderId);
      if (order && order.userId) {
        await this.addToWallet(order.userId, Number(returnItem.refundAmount));
      }
    }
    
    const order = this.getOrder(updatedReturn.orderId) as Order;
    return { ...updatedReturn, order };
  }
  
  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Promise.all(
      Array.from(this.cartItems.values())
        .filter(item => item.userId === userId)
        .map(async (item) => {
          // Get product with brand data
          const product = await this.getProduct(item.productId);
          const shop = this.shops.get(item.shopId || 1);
          return { 
            ...item, 
            product: product || { 
              id: item.productId, 
              name: 'Product Unknown',
              price: '0.00'
            }, 
            shop: shop || { 
              id: item.shopId || 1, 
              name: 'Shop Unknown',
              createdAt: new Date(),
              description: null,
              location: null
            } 
          };
        })
    );
  }
  
  async getCartItem(id: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    // Get product with brand data
    const product = await this.getProduct(cartItem.productId);
    const shop = this.shops.get(cartItem.shopId || 1);
    return { 
      ...cartItem, 
      product: product || { 
        id: cartItem.productId, 
        name: 'Product Unknown',
        price: '0.00'
      }, 
      shop: shop || { 
        id: cartItem.shopId || 1, 
        name: 'Shop Unknown',
        createdAt: new Date(),
        description: null,
        location: null
      } 
    };
  }
  
  async createCartItem(cartItemData: InsertCartItem): Promise<CartItem> {
    const id = this.cartItemIdCounter++;
    const timestamp = new Date();
    const cartItem = { ...cartItemData, id, createdAt: timestamp } as CartItem;
    this.cartItems.set(id, cartItem);
    
    // Get product with brand data
    const product = await this.getProduct(cartItem.productId);
    const shop = this.shops.get(cartItem.shopId || 1);
    return { 
      ...cartItem, 
      product: product || { 
        id: cartItem.productId, 
        name: 'Product Unknown',
        price: '0.00'
      }, 
      shop: shop || { 
        id: cartItem.shopId || 1, 
        name: 'Shop Unknown',
        createdAt: new Date(),
        description: null,
        location: null
      } 
    };
  }
  
  async updateCartItem(id: number, cartItemData: Partial<CartItem>): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem = { ...cartItem, ...cartItemData };
    this.cartItems.set(id, updatedCartItem);
    
    // Get product with brand data
    const product = await this.getProduct(updatedCartItem.productId);
    const shop = this.shops.get(updatedCartItem.shopId || 1);
    return { 
      ...updatedCartItem, 
      product: product || { 
        id: updatedCartItem.productId, 
        name: 'Product Unknown',
        price: '0.00'
      }, 
      shop: shop || { 
        id: updatedCartItem.shopId || 1, 
        name: 'Shop Unknown',
        createdAt: new Date(),
        description: null,
        location: null
      } 
    };
  }
  
  async deleteCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(userId: number): Promise<boolean> {
    const userCartItems = Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
      
    for (const item of userCartItems) {
      this.cartItems.delete(item.id);
    }
    
    return true;
  }
  
  // Wallet methods
  async addToWallet(userId: number, amount: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const walletBalance = Number(user.walletBalance) + amount;
    return this.updateUser(userId, { walletBalance });
  }
  
  async deductFromWallet(userId: number, amount: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const currentBalance = Number(user.walletBalance);
    if (currentBalance < amount) {
      throw new Error('Insufficient wallet balance');
    }
    
    const walletBalance = currentBalance - amount;
    return this.updateUser(userId, { walletBalance });
  }
}

export const storage = new MemStorage();
