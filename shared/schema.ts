import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const orderStatusEnum = pgEnum('order_status', [
  'pending', 'processing', 'shipped', 'delivered', 'returned', 'completed', 'cancelled'
]);

export const returnStatusEnum = pgEnum('return_status', [
  'requested', 'approved', 'rejected'
]);

// Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("0").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  productCount: integer("product_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brandId: integer("brand_id").references(() => brands.id),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  regularPrice: decimal("regular_price", { precision: 10, scale: 2 }),
  stock: integer("stock").default(0),
  category: text("category"),
  isNew: boolean("is_new").default(false),
  imageUrl: text("image_url"),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shops = pgTable("shops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  shopId: integer("shop_id").references(() => shops.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").default(1),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  size: text("size"),
  deliveryDate: timestamp("delivery_date").notNull(),
  returnExpiryDate: timestamp("return_expiry_date").notNull(),
  status: orderStatusEnum("status").default('pending').notNull(),
  paid: boolean("paid").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const returns = pgTable("returns", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  reason: text("reason").notNull(),
  status: returnStatusEnum("status").default('requested').notNull(),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  shopId: integer("shop_id").references(() => shops.id),
  quantity: integer("quantity").default(1),
  size: text("size"),
  deliveryDate: timestamp("delivery_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod Schemas
export const loginSchema = z.object({
  username: z.string().min(4),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  username: z.string().min(4),
  password: z.string().min(6),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertBrandSchema = createInsertSchema(brands).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertShopSchema = createInsertSchema(shops).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertReturnSchema = createInsertSchema(returns).omit({ id: true, createdAt: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;

export type Product = typeof products.$inferSelect & {
  brand: Brand;
};
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Shop = typeof shops.$inferSelect;
export type InsertShop = z.infer<typeof insertShopSchema>;

export type Order = typeof orders.$inferSelect & {
  user: User;
  product: Product;
  shop: Shop;
};
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Return = typeof returns.$inferSelect & {
  order: Order;
};
export type InsertReturn = z.infer<typeof insertReturnSchema>;

export type CartItem = typeof cartItems.$inferSelect & {
  product: Product;
  shop: Shop;
};
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
