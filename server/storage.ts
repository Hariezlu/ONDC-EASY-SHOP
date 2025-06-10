import {
  users,
  brands,
  products,
  shops,
  orders,
  returns,
  cartItems,
} from "@shared/schema";
import type {
  User,
  InsertUser,
  Brand,
  InsertBrand,
  Product,
  InsertProduct,
  Shop,
  InsertShop,
  Order,
  InsertOrder,
  Return,
  InsertReturn,
  CartItem,
  InsertCartItem,
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
  updateProduct(
    id: number,
    productData: Partial<Product>
  ): Promise<Product | undefined>;

  // Shop methods
  getShops(): Promise<Shop[]>;
  getShop(id: number): Promise<Shop | undefined>;
  createShop(shop: InsertShop): Promise<Shop>;

  // Order methods
  getOrders(): Promise<Order[]>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(
    id: number,
    orderData: Partial<Order>
  ): Promise<Order | undefined>;
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
  updateCartItem(
    id: number,
    cartItemData: Partial<CartItem>
  ): Promise<CartItem | undefined>;
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
    // Create brands with logos
    const brandData = [
      {
        name: "Nike",
        description: "Nike is a popular athletic footwear and apparel brand.",
        logo: "/brand-logos/nike.svg",
      },
      {
        name: "Adidas",
        description:
          "Adidas is a global sportswear brand known for quality athletic products.",
        logo: "/brand-logos/adidas.svg",
      },
      {
        name: "Puma",
        description:
          "Puma designs and manufactures athletic and casual footwear, apparel and accessories.",
        logo: "/brand-logos/puma.svg",
      },
      {
        name: "H&M",
        description:
          "H&M is a Swedish multinational clothing retailer known for fast fashion.",
        logo: "/brand-logos/hm.svg",
      },
      {
        name: "Zara",
        description:
          "Zara is a Spanish clothing and accessories retailer with trendy fashion items.",
        logo: "/brand-logos/zara.svg",
      },
    ];

    for (const brand of brandData) {
      await this.createBrand({
        ...brand,
        productCount: 0,
      });
    }

    // Create shops
    const shopNames = [
      "Downtown Store",
      "Mall of America",
      "Sports Center",
      "Factory Outlet",
      "Online Shop",
    ];
    // Get all brand names from the brand data we defined above
    const brandNames = brandData.map((b) => b.name);

    for (const name of shopNames) {
      await this.createShop({
        name: `${
          brandNames[Math.floor(Math.random() * brandNames.length)]
        } ${name}`,
        location: "New York, NY",
        description: `Official ${name} shop`,
      });
    }

    // Create products
    const productDetails = [
      {
        name: "Air Max 270",
        brand: "Nike",
        price: 120,
        isNew: true,
        imageUrl:
          "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-VtH7Lr.png",
      },
      {
        name: "GEOMETRIC JACQUARD SHIRT",
        brand: "Nike",
        price: 3550,
        isNew: true,
        imageUrl:
          "https://static.zara.net/assets/public/098d/d5f2/54554dd1b3d4/c450482d23af/04149300502-e1/04149300502-e1.jpg?ts=1737018900567&w=1700",
      },
      {
        name: "Regular Fit Felted overshirt",
        brand: "Nike",
        price: 4567,
        isNew: true,
        imageUrl:
          "https://image.hm.com/assets/hm/a4/c0/a4c0a3b7ff2afbc8b298c099e9285462e1324e43.jpg?imwidth=1536",
      },
      {
        name: "Grey Aviator Sunglasses for Men",
        brand: "Nike",
        price:3490,
        isNew: true,
        imageUrl:
          "https://d3995ea24pmi7m.cloudfront.net/ft-media/catalog/product/M/8/M8046GY5PV_1_lar.jpg",
      },
      {
        name: "Air Max 240",
        brand: "Nike",
        price: 80,
        isNew: true,
        imageUrl:
          "https://media.istockphoto.com/id/1148678649/photo/female-sneakers-for-run-on-a-pink-background-fashion-stylish-sport-shoes-close-up.jpg?s=1024x1024&w=is&k=20&c=DvNNRy8FrxWyQM6mpN3Uz4XkAGkudwnTqA_EnHX1Wbk=",
      },
      {
        name: "Black Wayfarer Sunglasses for Men and Women",
        brand: "Adidas",
        price: 1456,
        regularPrice: 1800,
        imageUrl:
          "https://d3995ea24pmi7m.cloudfront.net/ft-media/catalog/product/P/5/P501BK4V_1_lar.jpg",
      },
      {
        name: "Ultraboost 22",
        brand: "Adidas",
        price: 180,
        regularPrice: 180,
        imageUrl:
          "https://media.istockphoto.com/id/1097435758/photo/gray-sneakers-with-red-laces-on-a-blue-background.jpg?s=1024x1024&w=is&k=20&c=7A7jZMDbXPvkEd8IMFRt1sGhx0p3x9hP4XA1-hG5zQo=",
      },
      {
        name: "Ultraboost 45",
        brand: "Adidas",
        price: 10,
        regularPrice: 180,
        imageUrl:
          "https://media.istockphoto.com/id/1459059995/photo/one-blue-football-shoe-levitates-on-a-green-background-concept.jpg?s=1024x1024&w=is&k=20&c=cq-gsLQd1T1_GmaEQLbZOYskh51r2xjAtVyyDpf5VNY=",
      },
      {
        name: "Ultraboost 55",
        brand: "Adidas",
        price: 90,
        regularPrice: 180,
        imageUrl:
          "https://media.istockphoto.com/id/471023531/photo/sneaker-sex.jpg?s=1024x1024&w=is&k=20&c=Gv4ko4N7R1RB2I81ruQjlv7q-pV0DPfRrNSP3qBXoNc=",
      },
      {
        name: "Casino Series Rose Gold European Roulette Automatic Watch",
        brand: "Adidas",
        price: 10000,
        regularPrice: 18000,
        imageUrl:
          "https://luckyharveywatch.in/cdn/shop/files/0.png?v=1731574917&width=800",
      },
      {
        name: "RS-X Toys",
        brand: "Puma",
        price: 105,
        imageUrl:
          "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/369449/24/sv01/fnd/PNA/fmt/png/RS-X-Toys-Men%27s-Sneakers",
      },
      {
        name: "RS-X 22",
        brand: "Puma",
        price: 15,
        imageUrl:
          "https://media.istockphoto.com/id/1212659973/photo/running-sports-shoes-on-pink-background-pair-of-fashion-stylish-sneakers.jpg?s=1024x1024&w=is&k=20&c=bS_l3p3oQ-PneIbTKj9lwC0h3vj7hUyhWajzfRXJMm0=",
      },
      {
        name: "Nebula",
        brand: "Puma",
        price: 8950,
        imageUrl:
          "https://static.helioswatchstore.com/media/catalog/product/n/s/ns5074dl01_1.jpg",
      },
      {
        name: "RS-X 99",
        brand: "Puma",
        price: 1078,
        imageUrl:
          "https://media.istockphoto.com/id/1320786673/photo/stability-and-cushion-running-shoes-new-unbranded-running-sneaker-or-trainer-on-orange.jpg?s=1024x1024&w=is&k=20&c=LomkUbBFhWX8RGIEQxHwZzxcc1TKKxIC8URVBDltL6w=",
      },
      {
        name: "RS-X 44",
        brand: "Puma",
        price: 89,
        imageUrl:
          "https://media.istockphoto.com/id/1171520423/photo/fashion-running-sneaker-shoes-isolated.jpg?s=1024x1024&w=is&k=20&c=jVn5edxofnEh46l-Q7x0oLsoZXRwbURSUmbVl0n5cCQ=",
      },
      {
        name: "Slim Fit Shirt",
        brand: "H&M",
        price: 29.99,
        imageUrl:
          "https://lp2.hm.com/hmgoepprod?set=quality%5B79%5D%2Csource%5B%2F00%2F77%2F0077747b4ae6c8539d2999e95b31e50a990c495b.jpg%5D%2Corigin%5Bdam%5D%2Ccategory%5Bmen_shirts_longsleeved%5D%2Ctype%5BDESCRIPTIVESTILLLIFE%5D%2Cres%5Bm%5D%2Chmver%5B2%5D&call=url[file:/product/main]",
      },
      {
        name: "Slim Fit Cotton chinos",
        brand: "H&M",
        price: 2999,
        imageUrl:
          "https://image.hm.com/assets/hm/79/6c/796cdecdc61d791a0aad0a52ad401cc0798be506.jpg?imwidth=1536",
      },
      {
        name: "Slim Fit4",
        brand: "H&M",
        price: 30.99,
        imageUrl:
          "http://media.istockphoto.com/id/1150254005/photo/black-sneakers-for-run-or-fitness-on-pink-background.jpg?s=1024x1024&w=is&k=20&c=bTwjWxH3h-Y7__JbHcaeeuLTAIlUxtmQrbiyS_Mnehg=",
      },
      {
        name: "Loose Jeans",
        brand: "H&M",
        price: 5577,
        imageUrl:
          "https://image.hm.com/assets/hm/41/d4/41d4333d220a88fa7c8bdab5e543b977771266f9.jpg?imwidth=1536",
      },
      {
        name: "Casual Pants",
        brand: "Zara",
        price: 49.99,
        imageUrl:
          "https://media.istockphoto.com/id/2209913997/photo/gray-womens-sneakers-close-up-on-a-pink-background.jpg?s=1024x1024&w=is&k=20&c=bw3vN018kDTp59Akhd0UXwgTTbKeOivadrZY1Kr61ek=",
      },
    ];

    for (const detail of productDetails) {
      const brand = Array.from(this.brands.values()).find(
        (b) => b.name === detail.brand
      );
      if (brand) {
        await this.createProduct({
          name: detail.name,
          brandId: brand.id,
          description: `The ${detail.name} delivers visible cushioning under the foot and breathable, lightweight design.`,
          price: detail.price,
          regularPrice: detail.regularPrice,
          stock: 100,
          category: "Fashion",
          isNew: detail.isNew || false,
          imageUrl: detail.imageUrl || "",
        });

        // Update product count in brand
        await this.updateBrand(brand.id, {
          productCount: (brand.productCount || 0) + 1,
        });
      }
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
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
      createdAt: timestamp,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(
    id: number,
    userData: Partial<User>
  ): Promise<User | undefined> {
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

  async updateBrand(
    id: number,
    brandData: Partial<Brand>
  ): Promise<Brand | undefined> {
    const brand = this.brands.get(id);
    if (!brand) return undefined;

    const updatedBrand = { ...brand, ...brandData };
    this.brands.set(id, updatedBrand);
    return updatedBrand;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).map((product) => {
      const brand = this.brands.get(product.brandId) as Brand;
      return { ...product, brand };
    });
  }

  async getProductsByBrand(brandId: number): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter((product) => product.brandId === brandId)
      .map((product) => {
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

  async updateProduct(
    id: number,
    productData: Partial<Product>
  ): Promise<Product | undefined> {
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
    return Array.from(this.orders.values()).map((order) => {
      const user = this.users.get(order.userId) as User;
      const product = this.getProduct(order.productId) as Product;
      const shop = this.shops.get(order.shopId) as Shop;
      return { ...order, user, product, shop };
    });
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.userId === userId)
      .map((order) => {
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
      createdAt: timestamp,
    } as Order;

    this.orders.set(id, order);

    const user = this.users.get(order.userId) as User;
    const product = this.getProduct(order.productId) as Product;
    const shop = this.shops.get(order.shopId) as Shop;
    return { ...order, user, product, shop };
  }

  async updateOrder(
    id: number,
    orderData: Partial<Order>
  ): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder = { ...order, ...orderData };
    this.orders.set(id, updatedOrder);

    const user = this.users.get(updatedOrder.userId) as User;
    const product = this.getProduct(updatedOrder.productId) as Product;
    const shop = this.shops.get(updatedOrder.shopId) as Shop;
    return { ...updatedOrder, user, product, shop };
  }

  async updateOrderStatus(
    id: number,
    status: string
  ): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);

    // If status is delivered, order is paid and funds released to seller
    if (status === "delivered") {
      updatedOrder.paid = true;
    }

    const user = this.users.get(updatedOrder.userId) as User;
    const product = this.getProduct(updatedOrder.productId) as Product;
    const shop = this.shops.get(updatedOrder.shopId) as Shop;
    return { ...updatedOrder, user, product, shop };
  }

  // Return methods
  async getReturns(): Promise<Return[]> {
    return Array.from(this.returns.values()).map((returnItem) => {
      const order = this.getOrder(returnItem.orderId) as Order;
      return { ...returnItem, order };
    });
  }

  async getReturnsByUser(userId: number): Promise<Return[]> {
    const userOrders = await this.getOrdersByUser(userId);
    const userOrderIds = userOrders.map((order) => order.id);

    return Array.from(this.returns.values())
      .filter((returnItem) => userOrderIds.includes(returnItem.orderId))
      .map((returnItem) => {
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
      createdAt: timestamp,
    } as Return;

    this.returns.set(id, returnItem);

    // Update order status to returned
    if (order) {
      await this.updateOrderStatus(order.id, "returned");
    }

    const updatedOrder = this.getOrder(returnItem.orderId) as Order;
    return { ...returnItem, order: updatedOrder };
  }

  async updateReturnStatus(
    id: number,
    status: string
  ): Promise<Return | undefined> {
    const returnItem = this.returns.get(id);
    if (!returnItem) return undefined;

    const updatedReturn = { ...returnItem, status };
    this.returns.set(id, updatedReturn);

    // If return is approved, refund the amount to user's wallet
    if (status === "approved") {
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
        .filter((item) => item.userId === userId)
        .map(async (item) => {
          // Get product with brand data
          const product = await this.getProduct(item.productId);
          const shop = this.shops.get(item.shopId || 1);
          return {
            ...item,
            product: product || {
              id: item.productId,
              name: "Product Unknown",
              price: "0.00",
            },
            shop: shop || {
              id: item.shopId || 1,
              name: "Shop Unknown",
              createdAt: new Date(),
              description: null,
              location: null,
            },
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
        name: "Product Unknown",
        price: "0.00",
      },
      shop: shop || {
        id: cartItem.shopId || 1,
        name: "Shop Unknown",
        createdAt: new Date(),
        description: null,
        location: null,
      },
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
        name: "Product Unknown",
        price: "0.00",
      },
      shop: shop || {
        id: cartItem.shopId || 1,
        name: "Shop Unknown",
        createdAt: new Date(),
        description: null,
        location: null,
      },
    };
  }

  async updateCartItem(
    id: number,
    cartItemData: Partial<CartItem>
  ): Promise<CartItem | undefined> {
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
        name: "Product Unknown",
        price: "0.00",
      },
      shop: shop || {
        id: updatedCartItem.shopId || 1,
        name: "Shop Unknown",
        createdAt: new Date(),
        description: null,
        location: null,
      },
    };
  }

  async deleteCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const userCartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );

    for (const item of userCartItems) {
      this.cartItems.delete(item.id);
    }

    return true;
  }

  // Wallet methods
  async addToWallet(
    userId: number,
    amount: number,
    type: string
  ): Promise<User | undefined> {
    console.log("Adding to wallet", userId, amount, type);
    const user = this.users.get(userId);
    if (!user) return undefined;

    const walletBalance = type === 'withdraw' ? amount : Number(user.walletBalance) + amount;
    return this.updateUser(userId, { walletBalance });
  }

  async deductFromWallet(
    userId: number,
    amount: number
  ): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;

    const currentBalance = Number(user.walletBalance);
    if (currentBalance < amount) {
      throw new Error("Insufficient wallet balance");
    }

    const walletBalance = currentBalance - amount;
    return this.updateUser(userId, { walletBalance });
  }
}

export const storage = new MemStorage();
